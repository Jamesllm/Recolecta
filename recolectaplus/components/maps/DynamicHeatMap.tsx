'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Incident } from '@/services/api';
import { MapPin } from 'lucide-react';

// Carga dinámica de Leaflet para desactivar el Server-Side Rendering (evita ReferenceError: window is not defined)
const LeafletHeatMapComponent = dynamic(
  () => import('./LeafletHeatMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[580px] rounded-2xl bg-slate-100 border border-slate-200 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center animate-bounce">
          <MapPin className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-500">
          Cargando capas geoespaciales y mapa de calor...
        </p>
        <span className="text-xs text-slate-400">Consultando nodos PostGIS WGS84</span>
      </div>
    ),
  }
);

interface DynamicHeatMapProps {
  incidents: Incident[];
  isLoading?: boolean;
}

export const DynamicHeatMap: React.FC<DynamicHeatMapProps> = (props) => {
  return <LeafletHeatMapComponent {...props} />;
};

export default DynamicHeatMap;
