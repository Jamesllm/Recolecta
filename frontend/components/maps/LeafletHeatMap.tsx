'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Cluster, Incident, STATUS_LABELS, SIZE_LABELS, clusterRadiusM } from '@/services/api';
import { AlertCircle, Clock, MapPin, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface LeafletHeatMapProps {
  incidents: Incident[];
  clusters: Cluster[];
  isLoading?: boolean;
}

// Centro por defecto: Chiclayo (sector piloto)
const DEFAULT_CENTER: [number, number] = [-6.7714, -79.8409];

// Ajusta la vista para que se vean todos los reportes cargados
const FitToIncidents: React.FC<{ incidents: Incident[] }> = ({ incidents }) => {
  const map = useMap();
  const key = incidents.map((i) => i.id).join(',');
  useEffect(() => {
    if (!incidents.length) return;
    const bounds = L.latLngBounds(incidents.map((i) => [i.latitude, i.longitude] as [number, number]));
    map.fitBounds(bounds.pad(0.25), { maxZoom: 16 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
};

// Color del clúster según su cantidad de reportes frente al clúster más grande
const clusterColor = (count: number, max: number) =>
  count >= max * 0.66 ? '#ef4444' : count >= max * 0.33 ? '#f59e0b' : '#10b981';

// Generador de DivIcon personalizado para marcadores de incidentes
const createCustomIcon = (urgency: 'high' | 'medium' | 'low' = 'medium') => {
  const colorClass =
    urgency === 'high'
      ? 'bg-rose-500 ring-rose-300'
      : urgency === 'medium'
      ? 'bg-amber-500 ring-amber-300'
      : 'bg-emerald-500 ring-emerald-300';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="w-6 h-6 rounded-full ${colorClass} ring-4 ring-opacity-40 text-white flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [0, 0],
    popupAnchor: [0, -14],
  });
};

export const LeafletHeatMap: React.FC<LeafletHeatMapProps> = ({ incidents, clusters }) => {
  const maxCount = Math.max(1, ...clusters.map((c) => c.incident_count));
  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-slate-100">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        {/* Capa de mosaico moderna y limpia */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitToIncidents incidents={incidents} />

        {/* Clústeres calculados por K-Means (backend/ai/cluster_service.py) */}
        {clusters.map((cluster) => {
          const color = clusterColor(cluster.incident_count, maxCount);
          return (
            <React.Fragment key={`cluster-${cluster.id}`}>
              <Circle
                center={[cluster.latitude, cluster.longitude]}
                radius={clusterRadiusM(cluster)}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.18, weight: 2 }}
              >
                <Popup>
                  <div className="p-1">
                    <span className="font-bold text-slate-800 text-sm">Clúster {cluster.code}</span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold text-white" style={{ backgroundColor: color }}>
                        {cluster.incident_count} reportes
                      </span>
                      <span className="text-xs text-slate-500">Centroide K-Means</span>
                    </div>
                  </div>
                </Popup>
              </Circle>
              <Circle
                center={[cluster.latitude, cluster.longitude]}
                radius={18}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.9, weight: 1 }}
              />
            </React.Fragment>
          );
        })}

        {/* Marcadores individuales de incidentes reportados */}
        {incidents.map((incident) => {
          const lat = incident.latitude;
          const lng = incident.longitude;

          return (
            <Marker
              key={incident.id}
              position={[lat, lng]}
              icon={createCustomIcon(incident.urgency)}
            >
              <Popup className="custom-popup">
                <div className="p-2 max-w-xs space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      Reporte #{incident.code}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        incident.status === 'pending'
                          ? 'bg-rose-100 text-rose-700'
                          : incident.status === 'assigned'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {STATUS_LABELS[incident.status]}
                    </span>
                  </div>

                  {incident.photo_url && (
                    <img
                      src={incident.photo_url}
                      alt={incident.category}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  )}

                  <p className="text-xs font-medium text-slate-700 line-clamp-2">
                    {incident.description || 'Sin descripción detallada.'}
                  </p>

                  <div className="text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{incident.category} · {SIZE_LABELS[incident.estimated_size]}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{lat.toFixed(5)}, {lng.toFixed(5)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(incident.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Leyenda Inferior Izquierda */}
      <div className="absolute bottom-5 left-5 z-20 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200/80 shadow-lg text-xs space-y-2">
        <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
          Urgencia del reporte
        </p>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="text-slate-600 font-medium">Alta (camión completo o peligroso)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-600 font-medium">Media (pila grande)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-600 font-medium">Baja (bolsa pequeña)</span>
        </div>
        <p className="text-[10px] text-slate-400">Círculos: clústeres K-Means activos ({clusters.length})</p>
      </div>

      {/* Badge Flotante Superior Derecho */}
      <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-md text-xs font-semibold text-slate-700 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>{incidents.length} incidentes geoespaciales</span>
      </div>
    </div>
  );
};

export default LeafletHeatMap;
