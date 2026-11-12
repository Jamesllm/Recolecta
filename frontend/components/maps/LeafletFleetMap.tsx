'use client';

import React, { useEffect } from 'react';
import { CircleMarker, MapContainer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FleetBase, LiveTruck } from '@/services/api';
import { LiveTrucksLayer } from './LiveTrucksLayer';
import { MapStyleLayer } from './MapStyleLayer';

interface LeafletFleetMapProps {
  trucks: LiveTruck[];
  base: FleetBase | null;
  selectedId: number | null;
}

const DEFAULT_CENTER: [number, number] = [-6.7714, -79.8386];

/** Encuadra la base y las rutas al cambiar de camión elegido (no en cada actualización de posición) */
const Framing: React.FC<LeafletFleetMapProps> = ({ trucks, base, selectedId }) => {
  const map = useMap();
  const key = `${selectedId}:${trucks.map((t) => t.id).join(',')}:${base?.latitude}`;
  useEffect(() => {
    const focus = selectedId ? trucks.filter((t) => t.id === selectedId) : trucks;
    const points: [number, number][] = focus.flatMap((t) => [...t.traveled, ...t.remaining]);
    if (base) points.push([base.latitude, base.longitude]);
    if (points.length) map.fitBounds(L.latLngBounds(points).pad(0.12), { maxZoom: 16 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
};

export const LeafletFleetMap: React.FC<LeafletFleetMapProps> = ({ trucks, base, selectedId }) => (
  <MapContainer center={DEFAULT_CENTER} zoom={14} scrollWheelZoom className="w-full h-full">
    <MapStyleLayer position="topright" />
    <Framing trucks={trucks} base={base} selectedId={selectedId} />
    {base && (
      <CircleMarker center={[base.latitude, base.longitude]} radius={11} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#0f172a', fillOpacity: 1 }}>
        <Tooltip permanent direction="right" offset={[12, 0]} className="zone-label">{base.label || 'Base de la flota'}</Tooltip>
      </CircleMarker>
    )}
    <LiveTrucksLayer trucks={trucks} highlightId={selectedId} showLines={(t) => !selectedId || t.id === selectedId} />
  </MapContainer>
);

export default LeafletFleetMap;
