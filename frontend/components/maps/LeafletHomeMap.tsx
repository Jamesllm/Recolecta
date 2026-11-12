'use client';

import React, { useEffect } from 'react';
import { MapContainer, Circle, CircleMarker, Polyline, Popup, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Cluster, Incident, LiveTruck, RoadRoute, STATUS_LABELS, URGENCY_LABELS, clusterPriority, distanceM } from '@/services/api';
import { LiveTrucksLayer } from './LiveTrucksLayer';
import { MapStyleLayer } from './MapStyleLayer';

export interface MapFocus {
  latitude: number;
  longitude: number;
  key: string; // cambia en cada búsqueda para volver a centrar aunque sea el mismo punto
  zoom?: number;
}

interface LeafletHomeMapProps {
  incidents: Incident[];
  clusters: Cluster[];
  selectedId: number | null;
  onSelect: (clusterId: number) => void;
  route: RoadRoute | null;
  focus: MapFocus | null;
  trucks: LiveTruck[];
  kiosk?: boolean; // modo kiosko: se ven todos los recorridos en vivo y el mapa sigue a los camiones
}

const DEFAULT_CENTER: [number, number] = [-6.7714, -79.8386];
// Espacio que ocupan las capas flotantes (riel, búsqueda, tarjeta de ruta y hoja inferior)
const PADDING = { paddingTopLeft: L.point(130, 110), paddingBottomRight: L.point(420, 250) };
const KIOSK_PADDING = { paddingTopLeft: L.point(340, 120), paddingBottomRight: L.point(60, 60) };

/** Radio de la zona: distancia del centroide al 75 % de sus reportes (sin que un reporte aislado la agrande) */
const zoneRadiusM = (c: Cluster) => {
  const d = c.incidents.map((i) => distanceM(c, i)).sort((a, b) => a - b);
  return Math.max(100, d[Math.floor((d.length - 1) * 0.75)] ?? 0);
};

const URGENCY_COLOR = { high: '#dc2626', medium: '#d97706', low: '#059669' } as const;
const PRIORITY_COLOR = { Alta: '#dc2626', Media: '#d97706', Baja: '#059669' } as const;

/** Encuadra todo al cargar y la ruta del clúster elegido cuando llega */
const Framing: React.FC<{ clusters: Cluster[]; route: RoadRoute | null; focus: MapFocus | null; trucks: LiveTruck[]; kiosk: boolean }> = ({ clusters, route, focus, trucks, kiosk }) => {
  const map = useMap();
  const clustersKey = clusters.map((c) => c.id).join(',');
  const routeKey = route ? `${route.geometry.length}:${route.geometry[0]?.join(',')}` : '';
  const active = trucks.filter((t) => t.state !== 'done');
  const trucksKey = active.map((t) => t.id).join(',');

  // Modo kiosko: encuadra los recorridos de todos los camiones en ruta (o todas las zonas si no hay)
  useEffect(() => {
    if (!kiosk) return;
    const points: [number, number][] = active.flatMap((t) => [...t.traveled, ...t.remaining]);
    if (!points.length) clusters.forEach((c) => points.push([c.latitude, c.longitude]));
    if (points.length) map.flyToBounds(L.latLngBounds(points).pad(0.1), { ...KIOSK_PADDING, duration: 0.8, maxZoom: 16 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kiosk, trucksKey, clustersKey, map]);

  useEffect(() => {
    if (!clusters.length || kiosk) return;
    map.fitBounds(L.latLngBounds(clusters.map((c) => [c.latitude, c.longitude] as [number, number])).pad(0.4), PADDING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clustersKey, map]);

  useEffect(() => {
    if (!kiosk && route && route.geometry.length > 1) map.flyToBounds(L.latLngBounds(route.geometry), { ...PADDING, duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey, map]);

  useEffect(() => {
    if (focus) map.flyTo([focus.latitude, focus.longitude], focus.zoom ?? 18, { duration: 0.8 });
  }, [focus, map]);

  return null;
};

export const LeafletHomeMap: React.FC<LeafletHomeMapProps> = ({ incidents, clusters, selectedId, onSelect, route, focus, trucks, kiosk = false }) => {
  const maxCount = Math.max(1, ...clusters.map((c) => c.incident_count));
  // Si un camión ya recorre la zona elegida, se muestra su recorrido real en vez de la ruta planificada
  const activeTruck = trucks.find((t) => t.cluster_id === selectedId && t.state !== 'done') ?? null;
  const plan = !activeTruck && !kiosk; // en kiosko solo se ven los recorridos en vivo
  const line = plan ? route?.geometry ?? [] : [];
  const first = plan ? route?.stops[0] : undefined;
  const last = plan && route && route.stops.length > 1 ? route.stops[route.stops.length - 1] : null;

  return (
    <div className={`home-map absolute inset-0 ${kiosk ? 'kiosk' : ''}`}>
      <MapContainer center={DEFAULT_CENTER} zoom={15} zoomControl={false} scrollWheelZoom={true} className="w-full h-full">
        <MapStyleLayer position="bottomleft" />
        <ZoomControl position="bottomleft" />
        <Framing clusters={clusters} route={route} focus={focus} trucks={trucks} kiosk={kiosk} />

        {/* Zonas detectadas por K-Means, coloreadas por prioridad */}
        {clusters.map((c) => {
          const color = PRIORITY_COLOR[clusterPriority(c.incident_count, maxCount)];
          const selected = c.id === selectedId;
          return (
            <Circle
              key={`zone-${c.id}`}
              center={[c.latitude, c.longitude]}
              radius={zoneRadiusM(c)}
              pathOptions={{ color, fillColor: color, fillOpacity: selected ? 0.16 : 0.07, weight: selected ? 3 : 1.5, dashArray: selected ? undefined : '6 6' }}
              eventHandlers={{ click: () => onSelect(c.id) }}
            >
              <Tooltip permanent direction="center" className="zone-label" interactive>
                {c.code}
              </Tooltip>
            </Circle>
          );
        })}

        {/* Reportes como puntos por urgencia */}
        {incidents.map((i) => (
          <CircleMarker
            key={i.id}
            center={[i.latitude, i.longitude]}
            radius={i.critical ? 6 : 4.5}
            pathOptions={{ color: '#ffffff', weight: 1.5, fillColor: URGENCY_COLOR[i.urgency], fillOpacity: i.status === 'assigned' ? 0.55 : 0.95 }}
          >
            <Popup>
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-900">#{i.code} · {i.category}</p>
                <p className="text-slate-600">{URGENCY_LABELS[i.urgency]} · {STATUS_LABELS[i.status]}</p>
                {i.address && <p className="text-slate-500">{i.address}</p>}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Ruta sugerida por calles del clúster elegido */}
        {line.length > 1 && (
          <>
            <Polyline positions={line} pathOptions={{ color: '#ffffff', weight: 10, opacity: 0.95 }} />
            <Polyline positions={line} pathOptions={{ color: route?.road ? '#2563eb' : '#0f172a', weight: 5, dashArray: route?.road ? undefined : '8 8' }} />
          </>
        )}
        {first && (
          <CircleMarker center={[first.latitude, first.longitude]} radius={9} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#047857', fillOpacity: 1 }}>
            <Tooltip direction="top" offset={[0, -8]}>Inicio · #{first.code}</Tooltip>
          </CircleMarker>
        )}
        {last && (
          <CircleMarker center={[last.latitude, last.longitude]} radius={9} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#0f172a', fillOpacity: 1 }}>
            <Tooltip direction="top" offset={[0, -8]}>Fin · #{last.code}</Tooltip>
          </CircleMarker>
        )}
        {/* Camiones en vivo: todos visibles; se dibuja el recorrido del que atiende la zona elegida */}
        <LiveTrucksLayer
          trucks={kiosk ? trucks.filter((t) => t.state !== 'done') : trucks}
          highlightId={activeTruck?.id ?? null}
          showLines={(t) => t.state !== 'done' && (kiosk || t.cluster_id === selectedId)}
        />
      </MapContainer>
    </div>
  );
};

export default LeafletHomeMap;
