import { Platform } from 'react-native';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');

export type ReportStatus = 'pending' | 'assigned' | 'resolved';
export type Category = 'Orgánico' | 'Inorgánico' | 'Escombros' | 'Peligroso';
export type Size = 'small' | 'medium' | 'large';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'citizen' | 'manager';
  ubigeo: { code: string; distrito: string; provincia: string; departamento: string };
  created_at: string;
}

export interface UbigeoItem {
  id: string;
  nombre: string;
}

export interface Report {
  id: number;
  code: string;
  category: Category;
  estimated_size: Size;
  description: string | null;
  address: string | null;
  gps_accuracy_m: number | null;
  status: ReportStatus;
  latitude: number;
  longitude: number;
  distance_m?: number;
  photo_url: string | null;
  is_mine: boolean;
  created_at: string;
}

export interface NewReport {
  photo: { uri: string; mimeType: string; fileName: string };
  latitude: number;
  longitude: number;
  gps_accuracy_m: number | null;
  address: string | null;
  category: Category;
  estimated_size: Size;
  description: string;
}

/** Error de la API con los mensajes por campo que devuelve el backend. */
export class ApiError extends Error {
  constructor(message: string, public status: number, public fields: Record<string, string> = {}) {
    super(message);
  }
}

let authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new ApiError('Falta configurar EXPO_PUBLIC_API_URL en mobile/.env.', 0);
  const headers: Record<string, string> = { Accept: 'application/json', ...(init.headers as Record<string, string>) };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  if (init.body && !(init.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(`No se pudo conectar con el servidor (${API_URL}). Verifica que estés en la misma red Wi-Fi.`, 0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new ApiError(body.message || `Error ${res.status}`, res.status, body.errors || {});
  }
  return body as T;
}

export const api = {
  register: (data: { full_name: string; email: string; password: string; ubigeo: string; accept_terms: boolean }) =>
    request<{ message: string; data: { user: User; token: string } }>('/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
    request<{ data: { user: User; token: string } }>('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  me: () => request<{ data: User }>('/me'),

  departamentos: () => request<{ data: UbigeoItem[] }>('/ubigeo/departamentos'),
  provincias: (idDepartamento: string) => request<{ data: UbigeoItem[] }>(`/ubigeo/departamentos/${idDepartamento}/provincias`),
  distritos: (idProvincia: string) => request<{ data: UbigeoItem[] }>(`/ubigeo/provincias/${idProvincia}/distritos`),

  nearby: (lat: number, lng: number, radius: number, status?: ReportStatus) => {
    const q = `lat=${lat}&lng=${lng}&radius=${radius}${status ? `&status=${status}` : ''}`;
    return request<{ radius_m: number; data: Report[] }>(`/reports/nearby?${q}`);
  },

  myReports: () => request<{ data: Report[] }>('/reports/mine'),

  report: (id: number) => request<{ data: Report }>(`/reports/${id}`),

  createReport: async (r: NewReport) => {
    const fd = new FormData();
    if (Platform.OS === 'web') {
      const blobRes = await fetch(r.photo.uri);
      const blob = await blobRes.blob();
      fd.append('photo', blob, r.photo.fileName);
    } else {
      const { File: ExpoFile } = require('expo-file-system');
      // En SDK 57 el fetch global es expo/fetch: el archivo se adjunta como File (Blob) de expo-file-system
      fd.append('photo', new ExpoFile(r.photo.uri), r.photo.fileName);
    }
    fd.append('latitude', String(r.latitude));
    fd.append('longitude', String(r.longitude));
    if (r.gps_accuracy_m !== null) fd.append('gps_accuracy_m', String(r.gps_accuracy_m));
    if (r.address) fd.append('address', r.address);
    fd.append('category', r.category);
    fd.append('estimated_size', r.estimated_size);
    if (r.description.trim()) fd.append('description', r.description.trim());
    return request<{ message: string; data: Report }>('/reports', { method: 'POST', body: fd });
  },
};

export const STATUS_LABEL: Record<ReportStatus, string> = {
  pending: 'Pendiente',
  assigned: 'En ruta',
  resolved: 'Resuelto',
};

export const SIZE_LABEL: Record<Size, string> = {
  small: 'Bolsa pequeña',
  medium: 'Pila grande',
  large: 'Camión completo',
};

const LOWER_WORDS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'el']);
/** «JOSE LEONARDO ORTIZ» → «Jose Leonardo Ortiz» (los nombres del ubigeo vienen en mayúsculas) */
export const titleCase = (s: string) =>
  s.toLowerCase().split(' ').map((w, i) => (i > 0 && LOWER_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
