'use client';

import React from 'react';
import { CircleMarker, Marker, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { LiveTruck, formatClock, formatKm } from '@/services/api';

/** Icono del camión: círculo con la flecha del rumbo y la placa debajo */
const truckIcon = (t: LiveTruck, highlighted: boolean) =>
  L.divIcon({
    className: '',
    iconSize: [44, 58],
    iconAnchor: [22, 22],
    html: `
      <div style="position:relative;width:44px;display:flex;flex-direction:column;align-items:center">
        <div style="width:44px;height:44px;border-radius:50%;background:${t.state === 'done' ? '#64748b' : '#1d4ed8'};border:3px solid #fff;box-shadow:0 6px 16px rgba(15,23,42,.35);display:flex;align-items:center;justify-content:center;${highlighted ? 'outline:4px solid rgba(29,78,216,.25);' : ''}">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="6" width="14" height="10" rx="1"></rect><path d="M15 9h4l3 3v4h-7"></path><circle cx="6" cy="18" r="2"></circle><circle cx="18" cy="18" r="2"></circle></svg>
        </div>
        <div style="position:absolute;top:-9px;left:50%;width:0;height:0;transform:translateX(-50%) rotate(${t.heading}deg);transform-origin:50% 31px;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:10px solid ${t.state === 'done' ? '#64748b' : '#1d4ed8'}"></div>
        <span style="margin-top:3px;background:#0f172a;color:#fff;font:700 10px Inter,sans-serif;padding:1px 6px;border-radius:999px;white-space:nowrap">${t.plate}${t.state === 'done' ? '' : ` · <span style="color:${t.current_speed_kmh ? '#93c5fd' : '#fcd34d'}">${t.current_speed_kmh} km/h</span>`}</span>
      </div>`,
  });

const STATE_TEXT: Record<LiveTruck['state'], string> = {
  driving: 'En camino',
  collecting: 'Recogiendo en la parada',
  done: 'Ruta completada',
};

interface LiveTrucksLayerProps {
  trucks: LiveTruck[];
  highlightId?: number | null;
  showLines?: (t: LiveTruck) => boolean; // por defecto, todas las rutas
  showStops?: (t: LiveTruck) => boolean; // por defecto, las paradas de las rutas dibujadas
}

/** Número de parada pendiente (las recogidas se ven como un check verde) */
const stopIcon = (order: number, isNext: boolean) =>
  L.divIcon({
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `<div style="width:${isNext ? 26 : 22}px;height:${isNext ? 26 : 22}px;border-radius:50%;background:${isNext ? '#1d4ed8' : '#ffffff'};color:${isNext ? '#ffffff' : '#1d4ed8'};border:2px solid #1d4ed8;box-shadow:0 2px 6px rgba(15,23,42,.25);display:flex;align-items:center;justify-content:center;font:700 ${order > 99 ? 9 : 11}px Inter,sans-serif">${order}</div>`,
  });

const doneIcon = L.divIcon({
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#059669;border:2px solid #fff;box-shadow:0 2px 6px rgba(15,23,42,.25);display:flex;align-items:center;justify-content:center"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"></path></svg></div>',
});

/** Camiones en vivo: salida, tramo recorrido (gris), tramo por recorrer (azul) y posición actual */
export const LiveTrucksLayer: React.FC<LiveTrucksLayerProps> = ({ trucks, highlightId = null, showLines = () => true, showStops }) => (
  <>
    {trucks.map((t) => {
      const lines = showLines(t);
      const stops = showStops ? showStops(t) : lines;
      return (
        <React.Fragment key={t.id}>
          {lines && t.traveled.length > 1 && (
            <Polyline positions={t.traveled} pathOptions={{ color: '#94a3b8', weight: 5, opacity: 0.85 }} />
          )}
          {lines && t.remaining.length > 1 && (
            <>
              <Polyline positions={t.remaining} pathOptions={{ color: '#ffffff', weight: 9, opacity: 0.9 }} />
              <Polyline positions={t.remaining} pathOptions={{ color: '#1d4ed8', weight: 5, opacity: 0.95 }} />
            </>
          )}
          {lines && (
            <CircleMarker center={[t.origin.latitude, t.origin.longitude]} radius={8} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#0f172a', fillOpacity: 1 }}>
              <Tooltip direction="top" offset={[0, -8]}>Salida · {t.origin.label}</Tooltip>
            </CircleMarker>
          )}
          {/* Paradas de la ruta: recogidas (check verde), pendientes numeradas y la próxima en azul */}
          {stops &&
            t.stops.map((s) => (
              <Marker
                key={`stop-${t.id}-${s.id}`}
                position={[s.latitude, s.longitude]}
                icon={s.state === 'pending' ? stopIcon(s.order, s.id === t.next_stop?.id) : doneIcon}
                opacity={s.state === 'skipped' ? 0.45 : 1}
                zIndexOffset={s.id === t.next_stop?.id ? 500 : 0}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  Parada {s.order} · #{s.code} · {s.category}
                  <br />
                  {s.state === 'collected'
                    ? `Recogida a las ${formatClock(s.collected_at)}`
                    : s.state === 'skipped'
                      ? 'Saltada: ya no estaba abierta'
                      : s.id === t.next_stop?.id
                        ? `Próxima parada · llega ${formatClock(t.eta_next)}`
                        : 'Pendiente'}
                </Tooltip>
              </Marker>
            ))}
          <Marker position={t.position} icon={truckIcon(t, t.id === highlightId)} zIndexOffset={1000}>
            <Tooltip direction="right" offset={[24, 0]}>
              <div className="text-xs">
                <b>{t.plate}</b>{t.driver_name ? ` · ${t.driver_name}` : ''}
                <br />
                {STATE_TEXT[t.state]}{t.cluster_code ? ` · ruta ${t.cluster_code}` : ''}
                <br />
                {t.state !== 'done' && <>Velocidad: <b>{t.current_speed_kmh} km/h</b>{t.current_speed_kmh ? '' : ' (detenido)'}<br /></>}
                Recorrido {formatKm(t.progress_m)} de {formatKm(t.length_m)}
                {t.state !== 'done' ? ` · faltan ${formatKm(Math.max(0, t.length_m - t.progress_m))}` : ''}
                <br />
                {t.stops_collected}/{t.stops_total} paradas
                {t.next_stop ? ` · próxima #${t.next_stop.code} a las ${formatClock(t.eta_next)}` : ''}
              </div>
            </Tooltip>
          </Marker>
        </React.Fragment>
      );
    })}
  </>
);
