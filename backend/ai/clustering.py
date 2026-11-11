"""
Recolecta+ | Funciones de agrupamiento K-Means (US-04, Sprint 2)

Las usan el servicio que corre en el backend (cluster_service.py) y el notebook de
evaluación (notebooks/evaluacion_kmeans.ipynb), para que el modelo evaluado sea el mismo
que se ejecuta en el panel.

Pasos del modelo:
  1. Convertir latitud y longitud a metros (las distancias en grados no son iguales en
     latitud y longitud).
  2. Ponderar cada reporte por su carga estimada en toneladas, para que el centroide
     se acerque a donde hay más residuo que recoger.
  3. Probar varios K y quedarse con el de mayor coeficiente de silueta.
"""

import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import davies_bouldin_score, silhouette_score

# Carga estimada por tamaño, en toneladas. Debe coincidir con TONS_BY_SIZE de
# backend/src/services/incidentRules.js.
TONS_BY_SIZE = {"small": 0.01, "medium": 0.1, "large": 2.0}

EARTH_RADIUS_M = 6_371_000
RANDOM_STATE = 42


def to_meters(lat, lng, ref_lat=None, ref_lng=None):
    """
    Proyección equirectangular local: convierte grados a metros (x hacia el este,
    y hacia el norte) respecto de un punto de referencia. A escala de un distrito
    (pocos kilómetros) el error es despreciable.
    """
    lat = np.asarray(lat, dtype=float)
    lng = np.asarray(lng, dtype=float)
    ref_lat = lat.mean() if ref_lat is None else ref_lat
    ref_lng = lng.mean() if ref_lng is None else ref_lng
    x = np.radians(lng - ref_lng) * EARTH_RADIUS_M * np.cos(np.radians(ref_lat))
    y = np.radians(lat - ref_lat) * EARTH_RADIUS_M
    return np.column_stack([x, y]), (ref_lat, ref_lng)


def to_degrees(xy, ref):
    """Inversa de to_meters: devuelve columnas [lat, lng]."""
    ref_lat, ref_lng = ref
    lat = ref_lat + np.degrees(xy[:, 1] / EARTH_RADIUS_M)
    lng = ref_lng + np.degrees(xy[:, 0] / (EARTH_RADIUS_M * np.cos(np.radians(ref_lat))))
    return np.column_stack([lat, lng])


def weights_from_sizes(sizes):
    """Peso de cada reporte = toneladas estimadas según su tamaño."""
    return np.array([TONS_BY_SIZE.get(s, TONS_BY_SIZE["small"]) for s in sizes], dtype=float)


def fit_kmeans(X, k, weights=None):
    """Entrena K-Means con k grupos. weights=None trata todos los reportes igual."""
    model = KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init=10)
    model.fit(X, sample_weight=weights)
    return model


def scores(X, labels):
    """Silueta (de -1 a 1, más alto es mejor) y Davies-Bouldin (más bajo es mejor)."""
    k = len(set(labels))
    if k < 2 or k >= len(X):
        return None, None
    return float(silhouette_score(X, labels)), float(davies_bouldin_score(X, labels))


def evaluate_k(X, weights=None, k_min=2, k_max=10):
    """Entrena un modelo por cada K del rango y devuelve sus métricas (para el codo y la silueta)."""
    rows = []
    for k in range(k_min, min(k_max, len(X) - 1) + 1):
        model = fit_kmeans(X, k, weights)
        sil, db = scores(X, model.labels_)
        rows.append({"k": k, "inertia": float(model.inertia_), "silhouette": sil, "davies_bouldin": db})
    return rows


def choose_k(X, weights=None, k_min=2, k_max=10):
    """K con la mayor silueta. Con menos de 3 reportes no se puede medir: un grupo por reporte."""
    if len(X) < 3:
        return len(X), []
    rows = evaluate_k(X, weights, k_min, k_max)
    best = max(rows, key=lambda r: r["silhouette"])
    return best["k"], rows
