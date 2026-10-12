'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Cluster, STATUS_LABELS, SIZE_LABELS, suggestedRoute } from '@/services/api';

interface LeafletRouteMapProps {
  cluster: Cluster;
}

// Icono numerado para cada parada (1, 2, 3...)
const createStepIcon = (stepNumber: number) =>
  L.divIcon({
    className: 'custom-route-step-icon',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs ring-4 ring-emerald-200 shadow-xl flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
          ${stepNumber}
        </span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [0, 0],
    popupAnchor: [0, -16],
  });

// Encuadra el clúster seleccionado
const FitToCluster: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  const key = points.map((p) => p.join(',')).join(';');
  useEffect(() => {
    if (points.length) map.fitBounds(L.latLngBounds(points).pad(0.3), { maxZoom: 17 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
};

export const LeafletRouteMap: React.FC<LeafletRouteMapProps> = ({ cluster }) => {
  const { stops } = suggestedRoute(cluster);
  const routePoints = stops.map((s) => [s.latitude, s.longitude] as [number, number]);
  const centroid: [number, number] = [cluster.latitude, cluster.longitude];

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-slate-100">
      <MapContainer center={centroid} zoom={15} scrollWheelZoom={true} className="w-full h-full z-10">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToCluster points={[centroid, ...routePoints]} />

        {/* Centroide calculado por K-Means */}
        <CircleMarker center={centroid} radius={9} pathOptions={{ color: '#0f172a', fillColor: '#0f172a', fillOpacity: 0.85 }}>
          <Popup>Centroide del clúster {cluster.code}</Popup>
        </CircleMarker>

        {/* Orden de visita sugerido (vecino más cercano) */}
        {routePoints.length > 1 && (
          <Polyline positions={routePoints} pathOptions={{ color: '#059669', weight: 4, opacity: 0.85, dashArray: '8, 8' }} />
        )}

        {stops.map((stop, idx) => (
          <Marker key={stop.id} position={[stop.latitude, stop.longitude]} icon={createStepIcon(idx + 1)}>
            <Popup>
              <div className="p-1 space-y-1 text-xs">
                <p className="font-bold text-slate-800">Parada {idx + 1} · #{stop.code}</p>
                <p className="text-slate-600">{stop.category} · {SIZE_LABELS[stop.estimated_size]}</p>
                <p className="text-slate-500">{stop.address || `${stop.latitude.toFixed(5)}, ${stop.longitude.toFixed(5)}`}</p>
                <p className="text-slate-500">Estado: {STATUS_LABELS[stop.status]}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200/80 shadow-lg text-xs space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-900" />
          <span className="text-slate-600 font-medium">Centroide K-Means</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600" />
          <span className="text-slate-600 font-medium">Paradas en orden sugerido</span>
        </div>
      </div>
    </div>
  );
};

export default LeafletRouteMap;
