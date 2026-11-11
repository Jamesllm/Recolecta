#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
Recolecta+ | Módulo de Inteligencia Artificial & Clustering Geoespacial
Script: cluster_service.py
Versión: Python 3.11+
Descripción: Microservicio autónomo para la agrupación espacial de incidentes
             reportados en estado 'pending'. Utiliza Scikit-Learn (K-Means)
             sobre las coordenadas en metros, ponderadas por la carga estimada
             de cada reporte, elige K con el coeficiente de silueta y persiste
             los centroides y las métricas de la ejecución en PostgreSQL.
             El modelo está en clustering.py y se evalúa en
             notebooks/evaluacion_kmeans.ipynb.
==============================================================================
"""

import os
import sys
import argparse
import logging
from pathlib import Path
from typing import Optional, Tuple

import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd
import numpy as np
from dotenv import load_dotenv

from clustering import choose_k, fit_kmeans, scores, to_degrees, to_meters, weights_from_sizes

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
            ST_Y(location::geometry) AS lat,
            estimated_size
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
def compute_clusters(
    df: pd.DataFrame, target_k: Optional[int] = None, k_max: int = 8, weighted: bool = True
) -> Tuple[pd.DataFrame, np.ndarray, dict]:
    """
    Ejecuta K-Means sobre las coordenadas de los reportes convertidas a metros.
      - target_k=None: prueba K de 2 a k_max y usa el de mayor coeficiente de silueta.
      - target_k=N: usa N grupos (o menos, si hay menos reportes que N).
      - weighted=True: cada reporte pesa sus toneladas estimadas (bolsa, pila o camión).

    Retorna:
      - df_labeled: DataFrame con columna 'cluster_label' asignada.
      - centroids: matriz (K, 2) con [lng, lat] de cada centroide.
      - info: K usado, modo de elección, pesos y métricas (silueta y Davies-Bouldin).
    """
    num_samples = len(df)

    if num_samples == 0:
        logger.warning("No hay incidentes pendientes para procesar.")
        return df, np.empty((0, 2)), {}

    X, ref = to_meters(df["lat"], df["lng"])
    weights = weights_from_sizes(df["estimated_size"]) if weighted else None

    if target_k is None:
        k, _ = choose_k(X, weights, k_max=k_max)
        k_mode = "auto"
        logger.info(f"K elegido automáticamente por silueta (2 a {k_max}): K={k}")
    else:
        k = min(target_k, num_samples)
        k_mode = "manual"
        if k < target_k:
            logger.warning(f"Hay {num_samples} incidentes, menos que K={target_k}. Se usa K={k}.")

    model = fit_kmeans(X, k, weights)
    silhouette, davies_bouldin = scores(X, model.labels_)
    centroids = to_degrees(model.cluster_centers_, ref)[:, ::-1]  # [lat, lng] -> [lng, lat]

    df_labeled = df.copy()
    df_labeled["cluster_label"] = model.labels_

    info = {
        "k": int(k), "k_mode": k_mode, "weighted": weighted, "incident_count": num_samples,
        "silhouette": silhouette, "davies_bouldin": davies_bouldin,
    }
    fmt = lambda v: "n/d" if v is None else f"{v:.3f}"
    logger.info(f"Clustering completado: K={k}, silueta={fmt(silhouette)}, Davies-Bouldin={fmt(davies_bouldin)}.")
    return df_labeled, centroids, info


# ==============================================================================
# 5. Persistencia y Actualización en PostGIS
# ==============================================================================
def persist_clusters(conn, df_labeled: pd.DataFrame, centroids: np.ndarray, info: dict, dry_run: bool = False):
    """
    Registra la ejecución y sus métricas en `cluster_runs`, inserta los centroides
    en `clusters` usando PostGIS ST_SetSRID(ST_MakePoint(lng, lat), 4326) y asocia
    cada incidente a su respectivo `cluster_id`.
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

            # 2. Registrar la ejecución con el K usado y sus métricas
            cursor.execute(
                """
                INSERT INTO cluster_runs (k, k_mode, incident_count, weighted, silhouette, davies_bouldin)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id;
                """,
                (info["k"], info["k_mode"], info["incident_count"], info["weighted"],
                 info["silhouette"], info["davies_bouldin"]),
            )
            run_id = cursor.fetchone()[0]

            # 3. Insertar cada centroide generado
            insert_cluster_sql = """
                INSERT INTO clusters (
                    centroid,
                    incident_count,
                    status,
                    run_id,
                    created_at,
                    updated_at
                )
                VALUES (
                    ST_SetSRID(ST_MakePoint(%s, %s), 4326),
                    %s,
                    'active',
                    %s,
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
                cursor.execute(insert_cluster_sql, (float(lng), float(lat), incident_count, run_id))
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
        default=None,
        help="Número de clústeres (K). Si se omite, se elige automáticamente por silueta."
    )
    parser.add_argument(
        "--k-max",
        type=int,
        default=int(os.getenv("CLUSTERS_K_MAX", 8)),
        help="K máximo que se prueba en la elección automática. Por defecto 8 o valor en .env."
    )
    parser.add_argument(
        "--no-weights",
        action="store_true",
        help="Trata todos los reportes igual, sin ponderar por la carga estimada."
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
        k_text = args.clusters or f"automático (2 a {args.k_max})"
        logger.info(f"Configuración: K = {k_text}, pesos = {not args.no_weights}, Dry-run = {args.dry_run}")
        logger.info("==========================================================")

        # Paso 1: Conectar a PostgreSQL
        conn = get_db_connection()

        # Paso 2: Extraer incidentes pendientes
        df_incidents = fetch_pending_incidents(conn)

        if df_incidents.empty:
            logger.info("No existen incidentes pendientes. Finalizando tarea sin cambios.")
            return

        # Paso 3: Aplicar K-Means espacial y obtener centroides
        df_labeled, centroids, info = compute_clusters(
            df_incidents, target_k=args.clusters, k_max=args.k_max, weighted=not args.no_weights
        )

        # Paso 4: Persistir resultados en PostGIS
        persist_clusters(conn, df_labeled, centroids, info, dry_run=args.dry_run)

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
