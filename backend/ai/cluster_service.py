#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
Recolecta+ | Módulo de Inteligencia Artificial & Clustering Geoespacial
Script: cluster_service.py
Versión: Python 3.11+
Descripción: Microservicio autónomo para la agrupación espacial de incidentes
             reportados en estado 'pending'. Utiliza Scikit-Learn (K-Means/DBSCAN)
             sobre coordenadas decimales extraídas de PostGIS y persiste los
             centroides optimizados de vuelta en PostgreSQL.
==============================================================================
"""

import os
import sys
import argparse
import logging
from pathlib import Path
from typing import Tuple, List, Optional

import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans, DBSCAN
from dotenv import load_dotenv

# ==============================================================================
# 1. Configuración de Logging y Variables de Entorno
# ==============================================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("RecolectaClusterService")

# Cargar variables desde .env (revisa en la carpeta actual o en backend/)
env_path = Path(__file__).resolve().parent / ".env"
parent_env = Path(__file__).resolve().parent.parent / ".env"

if env_path.exists():
    load_dotenv(dotenv_path=env_path)
elif parent_env.exists():
    load_dotenv(dotenv_path=parent_env)
else:
    load_dotenv()


# ==============================================================================
# 2. Conexión a la Base de Datos PostgreSQL con PostGIS
# ==============================================================================
def get_db_connection():
    """
    Establece y retorna una conexión activa a la base de datos PostgreSQL.
    Prioriza DATABASE_URL si está definida, o usa parámetros individuales.
    """
    database_url = os.getenv("DATABASE_URL")
    try:
        if database_url:
            conn = psycopg2.connect(database_url)
        else:
            conn = psycopg2.connect(
                host=os.getenv("DB_HOST", "localhost"),
                port=int(os.getenv("DB_PORT", 5432)),
                dbname=os.getenv("DB_NAME", "recolecta_plus"),
                user=os.getenv("DB_USER", "postgres"),
                password=os.getenv("DB_PASSWORD", "")
            )
        conn.autocommit = False  # Manejamos transacciones manualmente
        logger.info(" Conexión establecida exitosamente con PostgreSQL/PostGIS.")
        return conn
    except Exception as err:
        logger.error(f"❌ Error al conectar con PostgreSQL: {err}")
        raise


# ==============================================================================
# 3. Extracción de Puntos Geográficos Pendientes
# ==============================================================================
def fetch_pending_incidents(conn) -> pd.DataFrame:
    """
    Extrae los incidentes con estado 'pending' y obtiene sus coordenadas
    decimales nativas (X: longitud, Y: latitud) a través de PostGIS.
    """
    query = """
        SELECT 
            id,
            ST_X(location::geometry) AS lng,
            ST_Y(location::geometry) AS lat
        FROM incidents
        WHERE status = 'pending'
        ORDER BY id ASC;
    """
    try:
        logger.info("Consultando incidentes pendientes en la base de datos...")
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()

        df = pd.DataFrame(rows)
        logger.info(f"Se obtuvieron {len(df)} incidentes con estado 'pending'.")
        return df
    except Exception as err:
        logger.error(f"Error al consultar incidentes pendientes: {err}")
        raise


# ==============================================================================
# 4. Procesamiento de Machine Learning / Agrupamiento Espacial
# ==============================================================================
def compute_clusters(df: pd.DataFrame, target_k: int = 3) -> Tuple[pd.DataFrame, np.ndarray]:
    """
    Ejecuta el algoritmo KMeans sobre las coordenadas [lng, lat].
    Maneja exhaustivamente casos de borde:
      - 0 puntos: retorna vacío.
      - 1 punto: 1 clúster directo.
      - N puntos < K: reduce dinámicamente K al número de puntos disponibles.
    
    Retorna:
      - df_labeled: DataFrame con columna 'cluster_label' asignada.
      - centroids: Matriz numpy de forma (K, 2) con [lng, lat] de cada centroide.
    """
    num_samples = len(df)

    if num_samples == 0:
        logger.warning("No hay incidentes pendientes para procesar.")
        return df, np.empty((0, 2))

    # Coordenadas como matriz de características [lng, lat]
    coords = df[["lng", "lat"]].to_numpy(dtype=float)

    # Caso borde: Menos puntos que el K solicitado
    actual_k = min(target_k, num_samples)
    if actual_k < target_k:
        logger.warning(
            f"Casos de borde detectado: Total de incidentes ({num_samples}) es menor que K={target_k}. "
            f"Ajustando número de clústeres a K={actual_k}."
        )

    # Ejecución de K-Means
    logger.info(f"Ejecutando algoritmo KMeans con K={actual_k} y n_init='auto'...")
    kmeans = KMeans(n_clusters=actual_k, random_state=42, n_init="auto")
    labels = kmeans.fit_predict(coords)
    centroids = kmeans.cluster_centers_  # Formato [[lng, lat], ...]

    df_labeled = df.copy()
    df_labeled["cluster_label"] = labels

    logger.info(f"Clustering completado. {actual_k} centroides calculados exitosamente.")
    return df_labeled, centroids


# ==============================================================================
# 5. Persistencia y Actualización en PostGIS
# ==============================================================================
def persist_clusters(conn, df_labeled: pd.DataFrame, centroids: np.ndarray, dry_run: bool = False):
    """
    Inserta los centroides calculados en la tabla `clusters` usando PostGIS
    ST_SetSRID(ST_MakePoint(lng, lat), 4326), y asocia cada incidente
    a su respectivo `cluster_id`.
    """
    if len(centroids) == 0:
        logger.info("Nada que persistir en base de datos.")
        return

    if dry_run:
        logger.info("⚠️ Modo DRY-RUN activado. No se realizarán cambios en la base de datos.")
        for idx, (lng, lat) in enumerate(centroids):
            incident_count = int((df_labeled["cluster_label"] == idx).sum())
            logger.info(f"  [Simulación] Clúster #{idx+1}: Centroide ({lng:.6f}, {lat:.6f}) - {incident_count} incidentes")
        return

    try:
        with conn.cursor() as cursor:
            # 1. Limpiar o archivar clústeres activos previos (opcional para mantener frescura de rutas)
            logger.info("Desactivando clústeres activos anteriores...")
            cursor.execute("UPDATE clusters SET status = 'cleared', updated_at = NOW() WHERE status = 'active';")

            # 2. Insertar cada centroide generado
            insert_cluster_sql = """
                INSERT INTO clusters (
                    centroid,
                    incident_count,
                    status,
                    created_at,
                    updated_at
                )
                VALUES (
                    ST_SetSRID(ST_MakePoint(%s, %s), 4326),
                    %s,
                    'active',
                    NOW(),
                    NOW()
                )
                RETURNING id;
            """

            update_incident_sql = """
                UPDATE incidents
                SET cluster_id = %s, updated_at = NOW()
                WHERE id = %s;
            """

            logger.info("Insertando nuevos centroides y asociando incidentes...")
            for cluster_idx, (lng, lat) in enumerate(centroids):
                # Filtrar incidentes asignados a este clúster
                cluster_incidents = df_labeled[df_labeled["cluster_label"] == cluster_idx]
                incident_count = len(cluster_incidents)

                # Insertar registro de clúster con punto PostGIS (X: lng, Y: lat)
                cursor.execute(insert_cluster_sql, (float(lng), float(lat), incident_count))
                cluster_id = cursor.fetchone()[0]

                logger.info(
                    f"  ✔ Clúster #{cluster_id} registrado en ({lng:.6f}, {lat:.6f}) "
                    f"con {incident_count} incidentes."
                )

                # Asociar los incidentes a este cluster_id
                for _, row in cluster_incidents.iterrows():
                    cursor.execute(update_incident_sql, (cluster_id, int(row["id"])))

        # Confirmar la transacción
        conn.commit()
        logger.info(" Transacción completada con éxito. Clústeres e incidentes actualizados.")
    except Exception as err:
        conn.rollback()
        logger.error(f"❌ Error durante la persistencia de clústeres. Rollback ejecutado: {err}")
        raise


# ==============================================================================
# 6. Función Principal y Punto de Entrada CLI
# ==============================================================================
def main():
    parser = argparse.ArgumentParser(
        description="Módulo de Clustering Geoespacial para Recolecta+ (K-Means sobre PostGIS)"
    )
    parser.add_argument(
        "-k", "--clusters",
        type=int,
        default=int(os.getenv("DEFAULT_CLUSTERS_K", 3)),
        help="Número objetivo de clústeres (K). Por defecto 3 o valor en .env."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Ejecuta el clustering sin modificar la base de datos (modo simulación)."
    )

    args = parser.parse_args()

    conn = None
    try:
        logger.info("==========================================================")
        logger.info("Iniciando Módulo de IA: Clustering de Incidentes")
        logger.info(f"Configuración: K objetivo = {args.clusters}, Dry-run = {args.dry_run}")
        logger.info("==========================================================")

        # Paso 1: Conectar a PostgreSQL
        conn = get_db_connection()

        # Paso 2: Extraer incidentes pendientes
        df_incidents = fetch_pending_incidents(conn)

        if df_incidents.empty:
            logger.info("No existen incidentes pendientes. Finalizando tarea sin cambios.")
            return

        # Paso 3: Aplicar K-Means espacial y obtener centroides
        df_labeled, centroids = compute_clusters(df_incidents, target_k=args.clusters)

        # Paso 4: Persistir resultados en PostGIS
        persist_clusters(conn, df_labeled, centroids, dry_run=args.dry_run)

        logger.info(" Proceso de clustering finalizado con éxito.")

    except Exception as exc:
        logger.critical(f"El proceso falló con error: {exc}", exc_info=True)
        sys.exit(1)
    finally:
        if conn:
            conn.close()
            logger.info("Conexión con PostgreSQL cerrada.")


if __name__ == "__main__":
    main()
