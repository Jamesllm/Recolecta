#!/usr/bin/env python3
"""
Recolecta+ | Dataset simulado de reportes en el centro de Chiclayo (APF3, Sprint 2)

Todavía no hay suficientes reportes reales para evaluar el agrupamiento, así que este
script genera reportes sintéticos alrededor de focos de acumulación inventados en el
centro de Chiclayo. Como se conoce el foco que originó cada reporte (columna foco_real),
se puede medir si K-Means encuentra los focos correctos.

Los focos NO corresponden a puntos críticos reales: son posiciones elegidas para la
simulación alrededor de la Plaza de Armas.

Uso:
  python simulate_reports.py                 # escribe data/reportes_simulados_chiclayo.csv
  python simulate_reports.py --load          # además los carga como incidentes pendientes
  python simulate_reports.py --clear         # borra de la BD los reportes simulados
"""

import argparse
from datetime import datetime, timedelta, timezone
from pathlib import Path

import numpy as np
import pandas as pd

from clustering import to_degrees

# Plaza de Armas de Chiclayo (aproximado)
CENTER = (-6.7714, -79.8386)
DEVICE_ID = "simulado-apf3"  # marca los reportes simulados en la BD para poder borrarlos
OUT = Path(__file__).resolve().parent / "data" / "reportes_simulados_chiclayo.csv"

# Focos simulados: desplazamiento en metros desde la plaza (este, norte),
# dispersión (desviación estándar en metros) y proporción de reportes.
# Las dispersiones (110 a 180 m, una o dos cuadras) hacen que los focos vecinos se
# toquen en los bordes, como pasaría con reportes reales.
FOCOS = {
    "A": {"dx": 380, "dy": 260, "sigma": 130, "share": 0.26},
    "B": {"dx": -420, "dy": 300, "sigma": 150, "share": 0.20},
    "C": {"dx": -300, "dy": -480, "sigma": 120, "share": 0.18},
    "D": {"dx": 480, "dy": -380, "sigma": 180, "share": 0.14},
    "E": {"dx": 0, "dy": 720, "sigma": 110, "share": 0.12},
}
NOISE_SHARE = 0.15   # reportes sueltos, repartidos al azar en toda la zona
NOISE_HALF_SIDE = 1100  # los sueltos caen en un cuadrado de 2,2 km de lado

CATEGORIES = ["Orgánico", "Inorgánico", "Escombros", "Peligroso"]
CATEGORY_P = [0.45, 0.35, 0.15, 0.05]
SIZES = ["small", "medium", "large"]
SIZE_P = [0.55, 0.35, 0.10]


def generate(n=400, seed=42):
    rng = np.random.default_rng(seed)
    rows = []
    n_noise = round(n * NOISE_SHARE)
    counts = {f: round((n - n_noise) * c["share"] / sum(x["share"] for x in FOCOS.values())) for f, c in FOCOS.items()}
    for foco, cfg in FOCOS.items():
        xy = rng.normal([cfg["dx"], cfg["dy"]], cfg["sigma"], size=(counts[foco], 2))
        rows += [(x, y, foco) for x, y in xy]
    noise = rng.uniform(-NOISE_HALF_SIDE, NOISE_HALF_SIDE, size=(n - len(rows), 2))
    rows += [(x, y, "suelto") for x, y in noise]

    xy = np.array([(x, y) for x, y, _ in rows])
    latlng = to_degrees(xy, CENTER)
    now = datetime.now(timezone.utc).replace(microsecond=0)
    df = pd.DataFrame({
        "lat": latlng[:, 0].round(6),
        "lng": latlng[:, 1].round(6),
        "category": rng.choice(CATEGORIES, size=len(rows), p=CATEGORY_P),
        "estimated_size": rng.choice(SIZES, size=len(rows), p=SIZE_P),
        "created_at": [now - timedelta(minutes=int(m)) for m in rng.integers(0, 30 * 24 * 60, size=len(rows))],
        "foco_real": [f for _, _, f in rows],
    })
    df = df.sample(frac=1, random_state=seed).reset_index(drop=True)
    df.insert(0, "id", range(1, len(df) + 1))
    return df


def load_into_db(df):
    from cluster_service import get_db_connection

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            for r in df.itertuples():
                address = f"Foco simulado {r.foco_real}" if r.foco_real != "suelto" else "Reporte suelto simulado"
                cur.execute(
                    """
                    INSERT INTO incidents (device_id, photo_key, category, estimated_size, description, address,
                                           location, status, created_at, updated_at)
                    VALUES (%s, '', %s, %s, 'Reporte simulado para la evaluación de K-Means (APF3)', %s,
                            ST_SetSRID(ST_MakePoint(%s, %s), 4326), 'pending', %s, %s)
                    """,
                    (DEVICE_ID, r.category, r.estimated_size, f"{address} · centro de Chiclayo",
                     float(r.lng), float(r.lat), r.created_at, r.created_at),
                )
        conn.commit()
        print(f"{len(df)} reportes simulados cargados como pendientes (device_id = {DEVICE_ID}).")
    finally:
        conn.close()


def clear_db():
    from cluster_service import get_db_connection

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM incidents WHERE device_id = %s", (DEVICE_ID,))
            print(f"{cur.rowcount} reportes simulados eliminados.")
        conn.commit()
    finally:
        conn.close()


def main():
    parser = argparse.ArgumentParser(description="Genera reportes simulados en el centro de Chiclayo")
    parser.add_argument("-n", type=int, default=400, help="Cantidad de reportes (por defecto 400)")
    parser.add_argument("--seed", type=int, default=42, help="Semilla aleatoria (mismos datos en cada ejecución)")
    parser.add_argument("--load", action="store_true", help="Cargar los reportes en la BD como pendientes")
    parser.add_argument("--clear", action="store_true", help="Borrar de la BD los reportes simulados")
    args = parser.parse_args()

    if args.clear:
        clear_db()
        return
    df = generate(args.n, args.seed)
    OUT.parent.mkdir(exist_ok=True)
    df.to_csv(OUT, index=False)
    print(f"Dataset escrito en {OUT} ({len(df)} filas).")
    print(df["foco_real"].value_counts().sort_index().to_string())
    if args.load:
        load_into_db(df)


if __name__ == "__main__":
    main()
