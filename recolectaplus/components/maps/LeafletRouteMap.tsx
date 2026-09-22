'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { ClusterRoute } from '@/services/api';
import { MapPin, Star, Navigation } from 'lucide-react';

interface LeafletRouteMapProps {
  cluster: ClusterRoute;
}

// Icono numerado para paradas (1, 2, 3, 4...)
const createStepIcon = (stepNumber: number) => {
  return L.divIcon({
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
};

// Icono estrella dorada para el Relleno Sanitario (Municipal Dump)
const createDumpIcon = () => {
  return L.divIcon({
    className: 'custom-dump-icon',
    html: `
      <div class="relative flex items-center justify-center">
        <span class="w-10 h-10 rounded-full bg-slate-900 text-amber-400 ring-4 ring-amber-400/50 shadow-2xl flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [0, 0],
    popupAnchor: [0, -20],
  });
};

export const LeafletRouteMap: React.FC<LeafletRouteMapProps> = ({ cluster }) => {
  // Construir array de coordenadas para la Polyline continua
  const routePoints: [number, number][] = [
    ...cluster.stops.map((stop) => [stop.lat, stop.lng] as [number, number]),
    [cluster.dumpLocation.lat, cluster.dumpLocation.lng],
  ];

  // Centroide inicial del mapa
  const initialCenter: [number, number] = [
    cluster.stops[0]?.lat || -12.0463,
    cluster.stops[0]?.lng || -77.0427,
  ];

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs bg-slate-100">
      <MapContainer
        key={cluster.id}
        center={initialCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Polyline Verde de Seguimiento de la Ruta Óptima */}
        <Polyline
          positions={routePoints}
          pathOptions={{
            color: '#059669', // Emerald 600
            weight: 5,
            opacity: 0.9,
            lineJoin: 'round',
            lineCap: 'round',
            dashArray: '8, 4',
          }}
        />

        {/* Nodos de Paradas Numeradas (1, 2, 3, 4...) */}
        {cluster.stops.map((stop) => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={createStepIcon(stop.step)}
          >
            <Popup>
              <div className="p-1 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Parada #{stop.step}</span>
                </div>
                <p className="font-semibold text-slate-800 text-xs">{stop.title}</p>
                <p className="text-[11px] text-slate-500">{stop.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Nodo Destino Final: Municipal Dump con Estrella */}
        <Marker
          position={[cluster.dumpLocation.lat, cluster.dumpLocation.lng]}
          icon={createDumpIcon()}
        >
          <Popup>
            <div className="p-1 space-y-1">
              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>Destino Final de Disposición</span>
              </div>
              <p className="font-bold text-slate-900 text-xs">
                {cluster.dumpLocation.title}
              </p>
              <p className="text-[11px] text-slate-500">
                Punto de pesaje y descarga automatizada
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Overlay Flotante de Leyenda de Ruta */}
      <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-md text-xs space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 bg-emerald-600 rounded-full" />
          <span className="font-bold text-slate-800">Recorrido Optimizado IA</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">
            #
          </span>
          <span>Paradas programadas ({cluster.stops.length})</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>Relleno Sanitario Municipal</span>
        </div>
      </div>
    </div>
  );
};

export default LeafletRouteMap;
