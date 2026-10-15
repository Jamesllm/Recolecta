/**
 * Servicio Centralizado de API REST para Recolecta+
 * Archivo: services/api.ts
 *
 * El panel solo muestra datos de la API; si no responde, informa el error (no usa datos de ejemplo).
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Estado de la conexión con la API, que muestran la cabecera y el menú lateral.
export type DataSource = 'api' | 'offline';
export const DATA_SOURCE_EVENT = 'recolecta:data-source';
let currentSource: DataSource = 'offline';
export const getDataSource = (): DataSource => currentSource;
const setDataSource = (source: DataSource) => {
  currentSource = source;
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(DATA_SOURCE_EVENT, { detail: source }));
};

/** Ejecuta la petición y registra si la API respondió. */
async function call<T>(fn: () => Promise<T>): Promise<T> {
  try {
    const result = await fn();
    setDataSource('api');
    return result;
  } catch (error) {
    if (!axios.isAxiosError(error) || !error.response) setDataSource('offline');
    throw error;
  }
}

/** Mensaje legible de un error de la API. */
export const errorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) return `No se pudo conectar con la API (${API_BASE_URL}). Verifique que el backend esté en ejecución.`;
    return error.response.data?.message || `Error ${error.response.status} de la API.`;
  }
  return 'Ocurrió un error inesperado.';
};

export type IncidentStatus = 'pending' | 'assigned' | 'resolved';
export type Urgency = 'high' | 'medium' | 'low';

export interface Incident {
  id: number;
  code: string;
  title: string;
  user_id: number | null; // null: reporte enviado como invitado
  reporter_name: string;
  photo_url: string | null;
  category: string;
  estimated_size: 'small' | 'medium' | 'large';
  description: string | null;
  address: string | null;
  reference: string | null;
  status: IncidentStatus;
  cluster_id: number | null;
  confirmations: number;
  critical: boolean; // pendiente y de urgencia alta
  estimated_tons: number;
  resolved_at: string | null;
  longitude: number;
  latitude: number;
  created_at: string;
  updated_at?: string;
  urgency: Urgency;
}

export interface ClusterIncident {
  id: number;
  code: string;
  status: IncidentStatus;
  category: string;
  estimated_size: Incident['estimated_size'];
  address: string | null;
  latitude: number;
  longitude: number;
  urgency: Urgency;
  estimated_tons: number;
}

export interface Cluster {
  id: number;
  code: string;
  zone: string | null; // dirección del reporte más cercano al centroide
  estimated_tons: number;
  incident_count: number;
  latitude: number;
  longitude: number;
  created_at: string;
  incidents: ClusterIncident[];
}

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  pending: 'Pendiente',
  assigned: 'Asignado',
  resolved: 'Resuelto',
};

export const SIZE_LABELS: Record<Incident['estimated_size'], string> = {
  small: 'Bolsa pequeña',
  medium: 'Pila grande',
  large: 'Camión completo',
};

// Categorías que registra la app del vecino
export const CATEGORIES = ['Orgánico', 'Inorgánico', 'Escombros', 'Peligroso'] as const;

/** Indicadores del día del panel general (GET /api/incidents/summary) */
export interface DaySummary {
  open: number;
  pending: number;
  assigned: number;
  critical_unassigned: number;
  active_routes: number;
  resolved_today: number;
  tons_collected_today: number;
  tons_open: number;
  tons_by_size: Record<Incident['estimated_size'], number>;
}

/** Toneladas con formato peruano: 2,35 t */
export const formatTons = (t: number) => `${String(Math.round(t * 100) / 100).replace('.', ',')} t`;

/** Prioridad de un clúster según su cantidad de reportes frente al mayor */
export const clusterPriority = (count: number, maxCount: number): 'Alta' | 'Media' | 'Baja' => {
  const pct = (count / Math.max(1, maxCount)) * 100;
  return pct >= 66 ? 'Alta' : pct >= 33 ? 'Media' : 'Baja';
};

export const incidentService = {
  /** Obtiene los incidentes desde la API Node.js / PostGIS */
  async getIncidents(params?: { status?: string; category?: string }): Promise<Incident[]> {
    const response = await call(() => apiClient.get('/incidents', { params }));
    return response.data.data;
  },

  /** Indicadores del día: abiertos, críticos sin asignar, rutas activas y toneladas recolectadas */
  async getSummary(): Promise<DaySummary> {
    const response = await call(() => apiClient.get('/incidents/summary'));
    return response.data.data;
  },

  /** Actualiza el estado de un incidente */
  async updateStatus(id: number, status: IncidentStatus): Promise<Incident> {
    const response = await call(() => apiClient.patch(`/incidents/${id}/status`, { status }));
    return response.data.data;
  },
};

export const clusterService = {
  /** Clústeres activos calculados por K-Means */
  async getClusters(): Promise<Cluster[]> {
    const response = await call(() => apiClient.get('/clusters'));
    return response.data.data;
  },

  /** Ejecuta K-Means (backend/ai/cluster_service.py) sobre los reportes pendientes */
  async run(k: number): Promise<string> {
    const response = await call(() => apiClient.post('/clusters/run', { k }, { timeout: 130000 }));
    return response.data.message;
  },
};

/** Distancia en metros entre dos puntos (fórmula del semiverseno) */
export const distanceM = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/**
 * Orden de visita sugerido para los reportes de un clúster: empieza en el más cercano al centroide
 * y sigue siempre al reporte más cercano (heurística del vecino más cercano).
 */
export const suggestedRoute = (cluster: Cluster) => {
  const pending = [...cluster.incidents];
  const stops: ClusterIncident[] = [];
  let from = { latitude: cluster.latitude, longitude: cluster.longitude };
  while (pending.length) {
    let best = 0;
    for (let i = 1; i < pending.length; i++) if (distanceM(from, pending[i]) < distanceM(from, pending[best])) best = i;
    const [next] = pending.splice(best, 1);
    stops.push(next);
    from = next;
  }
  const totalM = stops.reduce((sum, s, i) => (i ? sum + distanceM(stops[i - 1], s) : 0), 0);
  return { stops, totalM };
};

/** Radio del círculo de un clúster: distancia al reporte más lejano (mínimo 120 m) */
export const clusterRadiusM = (c: Cluster) =>
  Math.max(120, ...c.incidents.map((i) => distanceM(c, i)));
