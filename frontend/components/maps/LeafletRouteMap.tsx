'use client';

import React, { useEffect } from 'react';
import { MapContainer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Cluster, RoadRoute, STATUS_LABELS, SIZE_LABELS } from '@/services/api';
import { MapStyleLayer } from './MapStyleLayer';

interface LeafletRouteMapProps {
  cluster: Cluster;
  route: RoadRoute | null; // null mientras se calcula
}

// Icono numerado para cada parada (1, 2, 3...)
const createStepIcon = (stepNumber: number, assigned: boolean) =>
  L.divIcon({
    className: 'custom-route-step-icon',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="w-7 h-7 rounded-full ${assigned ? 'bg-amber-500 ring-amber-200' : 'bg-emerald-600 ring-emerald-200'} text-white font-bold text-[11px] ring-4 shadow-xl flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
          ${stepNumber}
        </span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [0, 0],
    popupAnchor: [0, -14],
  });

// Encuadra el recorrido del clúster seleccionado
const FitToRoute: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  const key = `${points.length}:${points[0]?.join(',')}:${points[points.length - 1]?.join(',')}`;
  useEffect(() => {
    if (points.length) map.fitBounds(L.latLngBounds(points).pad(0.15), { maxZoom: 17 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
};

export const LeafletRouteMap: React.FC<LeafletRouteMapProps> = ({ cluster, route }) => {
  const centroid: [number, number] = [cluster.latitude, cluster.longitude];
  const stops = route?.stops ?? [];
  const done = cluster.incidents.filter((i) => i.status === 'resolved');
  const line = route?.geometry ?? [];
  const fitPoints = line.length > 1 ? line : [centroid, ...cluster.incidents.map((i) => [i.latitude, i.longitude] as [number, number])];

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-slate-100">
      <MapContainer center={centroid} zoom={15} scrollWheelZoom={true} className="w-full h-full z-10">
        <MapStyleLayer position="topright" />
        <FitToRoute points={fitPoints} />

        {/* Recorrido por calles y avenidas (OSRM); punteado si solo hay línea recta */}
        {line.length > 1 && (
          <>
            <Polyline positions={line} pathOptions={{ color: '#ffffff', weight: 9, opacity: 0.9 }} />
            <Polyline
              positions={line}
              pathOptions={{ color: route?.road ? '#2563eb' : '#059669', weight: 5, opacity: 0.95, dashArray: route?.road ? undefined : '8, 8' }}
            />
          </>
        )}

        {/* Centroide calculado por K-Means */}
        <CircleMarker center={centroid} radius={8} pathOptions={{ color: '#0f172a', fillColor: '#0f172a', fillOpacity: 0.85 }}>
          <Popup>Centroide del clúster {cluster.code}</Popup>
        </CircleMarker>

        {/* Reportes ya recolectados del clúster */}
        {done.map((d) => (
          <CircleMarker key={d.id} center={[d.latitude, d.longitude]} radius={5} pathOptions={{ color: '#64748b', fillColor: '#cbd5e1', fillOpacity: 0.9 }}>
            <Popup>#{d.code} · Resuelto</Popup>
          </CircleMarker>
        ))}

        {stops.map((stop, idx) => (
          <Marker key={stop.id} position={[stop.latitude, stop.longitude]} icon={createStepIcon(idx + 1, stop.status === 'assigned')}>
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

      {!route && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
          <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 shadow text-xs font-semibold text-slate-600">
            Calculando la ruta por calles…
          </span>
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200/80 shadow-lg text-xs space-y-1.5">
        <div className="flex items-center gap-2">
          <span className={`w-5 h-1.5 rounded-full ${route?.road === false ? 'bg-emerald-600' : 'bg-blue-600'}`} />
          <span className="text-slate-600 font-medium">{route?.road === false ? 'Orden en línea recta (sin servicio de rutas)' : 'Recorrido por calles (OSRM)'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600" />
          <span className="text-slate-600 font-medium">Parada pendiente</span>
          <span className="w-3 h-3 rounded-full bg-amber-500 ml-2" />
          <span className="text-slate-600 font-medium">En ruta</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-900" />
          <span className="text-slate-600 font-medium">Centroide K-Means</span>
          <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-500 ml-2" />
          <span className="text-slate-600 font-medium">Recolectado</span>
        </div>
      </div>
    </div>
  );
};

export default LeafletRouteMap;
