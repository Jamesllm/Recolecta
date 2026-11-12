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

export type IncidentStatus = 'pending' | 'assigned' | 'resolved' | 'rejected';
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
  cluster_code: string | null; // clúster sugerido por K-Means (C-03)
  rejection_reason: string | null; // motivo, cuando el municipio rechazó el reporte
  timeline: TimelineStep[];
}

/** Paso de la línea de seguimiento: recibido → agrupado → en ruta → recolectado */
export interface TimelineStep {
  key: 'received' | 'grouped' | 'assigned' | 'resolved' | 'rejected';
  label: string;
  done: boolean;
  at: string | null;
  detail: string | null;
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

/** Ejecución de K-Means que generó los clústeres activos (tabla cluster_runs) */
export interface ClusterRun {
  id: number;
  k: number;
  k_mode: 'auto' | 'manual'; // auto: K elegido por silueta; manual: K indicado por el gestor
  incident_count: number;
  weighted: boolean; // reportes ponderados por su carga estimada
  silhouette: number | null; // -1 a 1, más alto es mejor
  davies_bouldin: number | null; // más bajo es mejor
  created_at: string;
}

/** Lectura de la silueta según Kaufman y Rousseeuw (1990) */
export const silhouetteLevel = (s: number | null): { label: string; tone: 'good' | 'ok' | 'weak' | 'none' } => {
  if (s == null) return { label: 'sin medir', tone: 'none' };
  if (s > 0.7) return { label: 'estructura fuerte', tone: 'good' };
  if (s > 0.5) return { label: 'estructura razonable', tone: 'ok' };
  if (s > 0.25) return { label: 'estructura débil', tone: 'weak' };
  return { label: 'sin estructura clara', tone: 'none' };
};

/** Número con coma decimal: 0,51 */
export const formatDecimal = (n: number, digits = 2) => n.toFixed(digits).replace('.', ',');

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  pending: 'Pendiente',
  assigned: 'En ruta',
  resolved: 'Resuelto',
  rejected: 'Rechazado',
};

/** Clases de la etiqueta de cada estado en tablas y paneles */
export const STATUS_BADGE: Record<IncidentStatus, string> = {
  pending: 'bg-rose-100 text-rose-700 border-rose-200',
  assigned: 'bg-amber-100 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-slate-200 text-slate-600 border-slate-300',
};

/** Motivos para rechazar un reporte (los mismos que valida backend/src/services/reportStatus.js) */
export const REJECTION_REASONS = [
  'Reporte duplicado',
  'La foto no muestra residuos',
  'Fuera del distrito',
  'El punto ya estaba limpio',
  'Contenido inapropiado',
] as const;

export const URGENCY_LABELS: Record<Urgency, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
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
  async updateStatus(id: number, status: IncidentStatus, reason?: string): Promise<Incident> {
    const response = await call(() => apiClient.patch(`/incidents/${id}/status`, { status, reason }));
    return response.data.data;
  },

  /** Cambia el estado de varios incidentes seleccionados; avisa a los vecinos con cuenta (US-06) */
  async updateStatusMany(ids: number[], status: IncidentStatus): Promise<{ message: string; data: Incident[] }> {
    const response = await call(() => apiClient.patch('/incidents/status', { ids, status }));
    return { message: response.data.message, data: response.data.data };
  },
};

export const clusterService = {
  /** Clústeres activos calculados por K-Means */
  async getClusters(): Promise<Cluster[]> {
    const response = await call(() => apiClient.get('/clusters'));
    return response.data.data;
  },

  /** Clústeres activos junto con la ejecución de K-Means que los generó */
  async getOverview(): Promise<{ clusters: Cluster[]; run: ClusterRun | null }> {
    const response = await call(() => apiClient.get('/clusters'));
    return { clusters: response.data.data, run: response.data.run ?? null };
  },

  /** Ruta por calles y avenidas (OSRM) de las paradas pendientes o en ruta del clúster */
  async getRoute(id: number): Promise<RoadRoute> {
    const response = await call(() => apiClient.get(`/clusters/${id}/route`, { timeout: 20000 }));
    return response.data.data;
  },

  /** Ejecuta K-Means (backend/ai/cluster_service.py) sobre los reportes pendientes; 'auto' elige K por silueta */
  async run(k: number | 'auto'): Promise<string> {
    const response = await call(() => apiClient.post('/clusters/run', { k }, { timeout: 130000 }));
    return response.data.message;
  },
};

/** Ruta de recolección calculada por el backend con OSRM (road: false si se usó línea recta) */
export interface RoadRoute {
  road: boolean;
  stops: ClusterIncident[]; // en orden de visita
  geometry: [number, number][]; // [lat, lng] del recorrido por calles
  distance_m: number;
  duration_s: number | null; // tiempo de manejo, sin contar las paradas
  warning?: string;
}

// ---------- Análisis (A7, US-09) ----------

export interface AnalyticsKpis {
  received: number;
  resolved: number;
  rejected: number;
  avg_resolution_hours: number | null;
  tons_collected: number;
  participants: number;
  compliance_pct: number | null;
}

export interface Analytics {
  days: number;
  sla_hours: number;
  kpis: AnalyticsKpis;
  previous: AnalyticsKpis;
  variation: Record<keyof AnalyticsKpis, number | null>;
  series: { label: string; date: string; received: number; resolved: number }[];
  by_category: { category: string; received: number; resolved: number; tons_collected: number }[];
  by_status: { status: IncidentStatus; count: number }[];
  zones: { id: number; code: string; zone: string | null; open_count: number; estimated_tons: number }[];
}

export const analyticsService = {
  async get(days: 7 | 30 | 90): Promise<Analytics> {
    const response = await call(() => apiClient.get('/analytics', { params: { days } }));
    return response.data.data;
  },
};

// ---------- Flota de recogida (A6) ----------

export type TruckStatus = 'available' | 'on_route' | 'maintenance';

export interface Truck {
  id: number;
  plate: string;
  driver_name: string | null;
  capacity_tons: number;
  status: TruckStatus;
  status_label: string;
  cluster_id: number | null;
  cluster_code: string | null;
  cluster_active: boolean;
  zone: string | null;
  stops: number;
  load_tons: number;
  capacity_used_pct: number;
  assigned_at: string | null;
}

export interface FleetSummary {
  total: number;
  available: number;
  on_route: number;
  maintenance: number;
  capacity_tons: number;
}

export interface TruckInput {
  plate?: string;
  driver_name?: string;
  capacity_tons?: number;
  status?: 'available' | 'maintenance';
}

export const fleetService = {
  async list(): Promise<{ summary: FleetSummary; data: Truck[] }> {
    const response = await call(() => apiClient.get('/fleet'));
    return { summary: response.data.summary, data: response.data.data };
  },
  async create(input: TruckInput): Promise<string> {
    const response = await call(() => apiClient.post('/fleet', input));
    return response.data.message;
  },
  async update(id: number, input: TruckInput): Promise<string> {
    const response = await call(() => apiClient.patch(`/fleet/${id}`, input));
    return response.data.message;
  },
  /** Asigna el camión a la ruta del clúster y pasa a «En ruta» sus reportes pendientes */
  async assign(id: number, clusterId: number): Promise<string> {
    const response = await call(() => apiClient.post(`/fleet/${id}/assign`, { cluster_id: clusterId }));
    return response.data.message;
  },
  async release(id: number): Promise<string> {
    const response = await call(() => apiClient.post(`/fleet/${id}/release`));
    return response.data.message;
  },
  async remove(id: number): Promise<string> {
    const response = await call(() => apiClient.delete(`/fleet/${id}`));
    return response.data.message;
  },
};

/** Errores por campo que devuelve la API (400) */
export const fieldErrors = (error: unknown): Record<string, string> =>
  (axios.isAxiosError(error) && error.response?.data?.errors) || {};

// ---------- Configuración (A8, US-10) ----------

export interface PanelSettings {
  clusters_k_max: number;
  clusters_weighted: boolean;
  notify_email_on_resolved: boolean;
  welcome_email: boolean;
}

export interface UsersSummary {
  team: { id: number; full_name: string; email: string; role: string; created_at: string }[];
  citizens: { total: number; last_30_days: number; with_reports: number };
  recent: { id: number; full_name: string; distrito: string; created_at: string; reports: number }[];
}

export const settingsService = {
  async get(): Promise<{ settings: PanelSettings; emailEnabled: boolean }> {
    const response = await call(() => apiClient.get('/settings'));
    return { settings: response.data.data, emailEnabled: response.data.email_enabled };
  },
  async update(patch: Partial<PanelSettings>): Promise<PanelSettings> {
    const response = await call(() => apiClient.patch('/settings', patch));
    return response.data.data;
  },
  async users(): Promise<UsersSummary> {
    const response = await call(() => apiClient.get('/users/summary'));
    return response.data.data;
  },
};

/** Duración legible: 1 h 13 min */
export const formatDuration = (s: number) => {
  const min = Math.round(s / 60);
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`;
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
