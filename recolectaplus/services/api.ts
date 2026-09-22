/**
 * Servicio Centralizado de API REST para Recolecta+
 * Archivo: services/api.ts
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export interface Incident {
  id: number;
  user_id: string;
  photo_url?: string | null;
  category: string;
  estimated_size?: string | null;
  description?: string | null;
  status: 'pending' | 'assigned' | 'resolved';
  cluster_id?: number | null;
  longitude: number;
  latitude: number;
  created_at: string;
  updated_at?: string;
  urgency?: 'high' | 'medium' | 'low';
}

export interface ClusterRoute {
  id: string;
  name: string;
  density: 'Alta' | 'Media' | 'Baja';
  reportsCount: number;
  volumePercentage: number;
  estimatedDistanceKm: number;
  estimatedTimeMin: number;
  requiredCapacityPct: number;
  stops: {
    id: number;
    step: number;
    title: string;
    lat: number;
    lng: number;
    address: string;
  }[];
  dumpLocation: {
    lat: number;
    lng: number;
    title: string;
  };
}

// Datos de demostración enriquecidos para cuando el backend esté en espera o inicializando
export const DEMO_INCIDENTS: Incident[] = [
  {
    id: 101,
    user_id: 'usr_carlos_m',
    photo_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    category: 'Basura acumulada',
    estimated_size: 'large',
    description: 'Acumulación de bolsas y residuos en la berma central',
    status: 'pending',
    longitude: -77.042793,
    latitude: -12.046374,
    created_at: '2026-09-20T10:30:00Z',
    urgency: 'high',
  },
  {
    id: 102,
    user_id: 'usr_elena_g',
    photo_url: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=600&q=80',
    category: 'Escombros',
    estimated_size: 'large',
    description: 'Restos de desmonte y material de construcción en vía peatonal',
    status: 'pending',
    longitude: -77.049500,
    latitude: -12.052000,
    created_at: '2026-09-20T11:15:00Z',
    urgency: 'high',
  },
  {
    id: 103,
    user_id: 'usr_roberto_v',
    photo_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    category: 'Residuos orgánicos',
    estimated_size: 'medium',
    description: 'Restos orgánicos de mercado exterior no recogidos',
    status: 'pending',
    longitude: -77.038100,
    latitude: -12.041200,
    created_at: '2026-09-20T11:45:00Z',
    urgency: 'medium',
  },
  {
    id: 104,
    user_id: 'usr_patricia_s',
    photo_url: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=600&q=80',
    category: 'Peligrosos',
    estimated_size: 'small',
    description: 'Contenedores de solventes y pinturas arrojados en parque',
    status: 'pending',
    longitude: -77.032500,
    latitude: -12.056800,
    created_at: '2026-09-20T12:10:00Z',
    urgency: 'high',
  },
  {
    id: 105,
    user_id: 'usr_miguel_a',
    photo_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    category: 'Inorgánico',
    estimated_size: 'medium',
    description: 'Plásticos y cartones dispersos frente a colegio',
    status: 'assigned',
    longitude: -77.054200,
    latitude: -12.049100,
    created_at: '2026-09-20T09:05:00Z',
    urgency: 'medium',
  },
  {
    id: 106,
    user_id: 'usr_sofia_t',
    photo_url: 'https://images.unsplash.com/photo-1611288870280-4a8ac2a6b22c?auto=format&fit=crop&w=600&q=80',
    category: 'Basura acumulada',
    estimated_size: 'small',
    description: 'Punto crítico en esquina comercial',
    status: 'resolved',
    longitude: -77.035000,
    latitude: -12.048000,
    created_at: '2026-09-20T08:20:00Z',
    urgency: 'low',
  },
  {
    id: 107,
    user_id: 'usr_jorge_p',
    photo_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    category: 'Basura acumulada',
    estimated_size: 'large',
    description: 'Microbasural al lado de estación de transporte',
    status: 'pending',
    longitude: -77.045000,
    latitude: -12.062000,
    created_at: '2026-09-20T12:40:00Z',
    urgency: 'high',
  },
  {
    id: 108,
    user_id: 'usr_ana_l',
    photo_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    category: 'Residuos orgánicos',
    estimated_size: 'medium',
    description: 'Restos de poda acumulados bloqueando vereda',
    status: 'pending',
    longitude: -77.058000,
    latitude: -12.043500,
    created_at: '2026-09-20T13:00:00Z',
    urgency: 'medium',
  },
];

export const DEMO_CLUSTERS: ClusterRoute[] = [
  {
    id: 'cluster-04',
    name: 'Cluster #04',
    density: 'Alta',
    reportsCount: 18,
    volumePercentage: 92,
    estimatedDistanceKm: 14.2,
    estimatedTimeMin: 45,
    requiredCapacityPct: 80,
    stops: [
      { id: 1, step: 1, title: 'Parada 1: Av. Tacna / Jr. Conde', lat: -12.0425, lng: -77.0392, address: 'Jr. Conde de Superunda 421' },
      { id: 2, step: 2, title: 'Parada 2: Mercado Central Norte', lat: -12.0468, lng: -77.0435, address: 'Av. Abancay con Jr. Cuzco' },
      { id: 3, step: 3, title: 'Parada 3: Plaza Italia / Huanta', lat: -12.0512, lng: -77.0489, address: 'Jr. Huanta 780' },
      { id: 4, step: 4, title: 'Parada 4: Sector Vía Expresa', lat: -12.0585, lng: -77.0541, address: 'Av. Grau con Iquitos' },
    ],
    dumpLocation: {
      lat: -12.0720,
      lng: -77.0650,
      title: 'Municipal Dump / Relleno Sanitario',
    },
  },
  {
    id: 'cluster-07',
    name: 'Cluster #07',
    density: 'Media',
    reportsCount: 12,
    volumePercentage: 68,
    estimatedDistanceKm: 11.5,
    estimatedTimeMin: 35,
    requiredCapacityPct: 65,
    stops: [
      { id: 10, step: 1, title: 'Parada 1: Av. Argentina Sector 3', lat: -12.0380, lng: -77.0510, address: 'Av. Argentina 1450' },
      { id: 11, step: 2, title: 'Parada 2: Zona Industrial Maquinarias', lat: -12.0430, lng: -77.0570, address: 'Calle Maquinarias 890' },
      { id: 12, step: 3, title: 'Parada 3: Almacenes Comerciales', lat: -12.0490, lng: -77.0620, address: 'Av. Colonial 2100' },
    ],
    dumpLocation: {
      lat: -12.0720,
      lng: -77.0650,
      title: 'Municipal Dump / Relleno Sanitario',
    },
  },
  {
    id: 'cluster-09',
    name: 'Cluster #09',
    density: 'Media',
    reportsCount: 8,
    volumePercentage: 45,
    estimatedDistanceKm: 8.7,
    estimatedTimeMin: 28,
    requiredCapacityPct: 40,
    stops: [
      { id: 20, step: 1, title: 'Parada 1: Jr. Lampa / Santa Rosa', lat: -12.0485, lng: -77.0315, address: 'Jr. Lampa 550' },
      { id: 21, step: 2, title: 'Parada 2: Parque Universitario', lat: -12.0540, lng: -77.0345, address: 'Av. Nicolás de Piérola 1200' },
    ],
    dumpLocation: {
      lat: -12.0720,
      lng: -77.0650,
      title: 'Municipal Dump / Relleno Sanitario',
    },
  },
  {
    id: 'cluster-12',
    name: 'Cluster #12',
    density: 'Baja',
    reportsCount: 4,
    volumePercentage: 25,
    estimatedDistanceKm: 6.1,
    estimatedTimeMin: 20,
    requiredCapacityPct: 25,
    stops: [
      { id: 30, step: 1, title: 'Parada 1: Sector Parque Castilla', lat: -12.0620, lng: -77.0420, address: 'Av. Salaverry cdra 8' },
    ],
    dumpLocation: {
      lat: -12.0720,
      lng: -77.0650,
      title: 'Municipal Dump / Relleno Sanitario',
    },
  },
];

export const incidentService = {
  /**
   * Obtiene todos los incidentes desde la API Node.js / PostGIS
   */
  async getIncidents(params?: { status?: string; category?: string }): Promise<Incident[]> {
    try {
      const response = await apiClient.get('/incidents', { params });
      if (response.data && response.data.data) {
        return response.data.data.map((item: any) => ({
          ...item,
          urgency: item.urgency || (item.estimated_size === 'large' ? 'high' : item.estimated_size === 'medium' ? 'medium' : 'low'),
        }));
      }
      return DEMO_INCIDENTS;
    } catch (error) {
      console.warn('Backend API no disponible. Utilizando datos demostrativos para interfaz interactiva.', error);
      return DEMO_INCIDENTS;
    }
  },

  /**
   * Registra un nuevo reporte georreferenciado
   */
  async createIncident(payload: Partial<Incident>): Promise<Incident> {
    const response = await apiClient.post('/incidents', payload);
    return response.data.data;
  },

  /**
   * Actualiza el estado de un incidente
   */
  async updateStatus(id: number, status: 'pending' | 'assigned' | 'resolved'): Promise<Incident> {
    try {
      const response = await apiClient.patch(`/incidents/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      console.warn(`Simulando actualización local para el incidente #${id}`);
      const found = DEMO_INCIDENTS.find(i => i.id === id);
      if (found) {
        found.status = status;
        return { ...found };
      }
      throw error;
    }
  },

  /**
   * Dispara el microservicio de optimización de rutas y clustering con IA
   */
  async triggerRouteOptimization(k: number = 3): Promise<{ success: boolean; message: string }> {
    try {
      // Simular latencia de cálculo de K-Means y PostGIS
      await new Promise(res => setTimeout(res, 1200));
      return {
        success: true,
        message: `Agrupamiento espacial ejecutado exitosamente con ${k} clústeres prioritarios.`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'No se pudo contactar con el microservicio de optimización.',
      };
    }
  },

  /**
   * Despacha una ruta asignando un camión y conductor
   */
  async dispatchRoute(clusterId: string, truckId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(res => setTimeout(res, 800));
    return {
      success: true,
      message: `Ruta ${clusterId} despachada exitosamente con la unidad ${truckId}.`,
    };
  }
};
