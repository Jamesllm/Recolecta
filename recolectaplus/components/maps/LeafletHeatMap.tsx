'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Incident } from '@/services/api';
import { AlertCircle, Clock, MapPin, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface LeafletHeatMapProps {
  incidents: Incident[];
  isLoading?: boolean;
}

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

// Áreas de calor simuladas alrededor de focos de alta concentración en Lima/urbano
const DENSITY_CLUSTERS = [
  {
    name: 'Sector Centro-Norte',
    lat: -12.046374,
    lng: -77.042793,
    radius: 700,
    alerts: '12 alerts',
    urgency: 'high' as const,
    color: '#ef4444',
    fillColor: '#f87171',
  },
  {
    name: 'Zona Industrial Sur',
    lat: -12.0535,
    lng: -77.0560,
    radius: 580,
    alerts: '8 alerts',
    urgency: 'medium' as const,
    color: '#f59e0b',
    fillColor: '#fbbf24',
  },
  {
    name: 'Área Mercado Central',
    lat: -12.0395,
    lng: -77.0345,
    radius: 450,
    alerts: '5 alerts',
    urgency: 'low' as const,
    color: '#10b981',
    fillColor: '#34d399',
  },
];

export const LeafletHeatMap: React.FC<LeafletHeatMapProps> = ({ incidents, isLoading }) => {
  // Centro geográfico por defecto (Lima Metropolitana)
  const defaultCenter: [number, number] = [-12.046374, -77.042793];

  return (
    <div className="relative w-full h-[580px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-slate-100">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        {/* Capa de mosaico moderna y limpia */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Círculos de Calor / Densidad Espacial */}
        {DENSITY_CLUSTERS.map((cluster, i) => (
          <React.Fragment key={`cluster-${i}`}>
            <Circle
              center={[cluster.lat, cluster.lng]}
              radius={cluster.radius}
              pathOptions={{
                color: cluster.color,
                fillColor: cluster.fillColor,
                fillOpacity: 0.22,
                weight: 2,
                dashArray: cluster.urgency === 'high' ? '4, 4' : undefined,
              }}
            >
              <Popup>
                <div className="p-1">
                  <span className="font-bold text-slate-800 text-sm">{cluster.name}</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold text-white"
                      style={{ backgroundColor: cluster.color }}
                    >
                      {cluster.alerts}
                    </span>
                    <span className="text-xs text-slate-500">Densidad Crítica</span>
                  </div>
                </div>
              </Popup>
            </Circle>

            {/* Marcador representativo del centroide de densidad */}
            <Circle
              center={[cluster.lat, cluster.lng]}
              radius={70}
              pathOptions={{
                color: cluster.color,
                fillColor: cluster.color,
                fillOpacity: 0.8,
                weight: 1,
              }}
            />
          </React.Fragment>
        ))}

        {/* Marcadores individuales de incidentes reportados */}
        {incidents.map((incident) => {
          const lat = incident.latitude || defaultCenter[0];
          const lng = incident.longitude || defaultCenter[1];

          return (
            <Marker
              key={incident.id}
              position={[lat, lng]}
              icon={createCustomIcon(incident.urgency || 'medium')}
            >
              <Popup className="custom-popup">
                <div className="p-2 max-w-xs space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      Reporte #{incident.id}
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
                      {incident.status}
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
                      <span>{incident.category}</span>
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
          Capas de Densidad y Calor
        </p>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs shadow-rose-200" />
          <span className="text-slate-600 font-medium">Alta Criticidad (&gt; 10 alertas)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs shadow-amber-200" />
          <span className="text-slate-600 font-medium">Densidad Media (6 - 10 alertas)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs shadow-emerald-200" />
          <span className="text-slate-600 font-medium">Controlado (&lt; 5 alertas)</span>
        </div>
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
