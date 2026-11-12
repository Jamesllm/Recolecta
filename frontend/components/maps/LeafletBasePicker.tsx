'use client';

import React from 'react';
import { CircleMarker, MapContainer, Tooltip, useMapEvents } from 'react-leaflet';
import { FleetBase } from '@/services/api';
import { MapStyleLayer } from './MapStyleLayer';

interface LeafletBasePickerProps {
  value: FleetBase | null;
  onPick: (point: { latitude: number; longitude: number }) => void;
}

const DEFAULT_CENTER: [number, number] = [-6.7714, -79.8386];

const ClickToPick: React.FC<{ onPick: LeafletBasePickerProps['onPick'] }> = ({ onPick }) => {
  useMapEvents({ click: (e) => onPick({ latitude: e.latlng.lat, longitude: e.latlng.lng }) });
  return null;
};

/** Mapa para elegir la base de la flota con un clic */
export const LeafletBasePicker: React.FC<LeafletBasePickerProps> = ({ value, onPick }) => (
  <MapContainer
    center={value ? [value.latitude, value.longitude] : DEFAULT_CENTER}
    zoom={14}
    scrollWheelZoom
    className="w-full h-full cursor-crosshair"
  >
    <MapStyleLayer position="topright" attributionSuffix="" />
    <ClickToPick onPick={onPick} />
    {value && (
      <CircleMarker center={[value.latitude, value.longitude]} radius={11} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#0f172a', fillOpacity: 1 }}>
        <Tooltip permanent direction="right" offset={[12, 0]} className="zone-label">{value.label || 'Base de la flota'}</Tooltip>
      </CircleMarker>
    )}
  </MapContainer>
);

export default LeafletBasePicker;
