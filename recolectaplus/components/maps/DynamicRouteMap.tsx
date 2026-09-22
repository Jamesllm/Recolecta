'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ClusterRoute } from '@/services/api';
import { Route } from 'lucide-react';

const LeafletRouteMapComponent = dynamic(
  () => import('./LeafletRouteMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[620px] rounded-2xl bg-slate-100 border border-slate-200 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center animate-bounce">
          <Route className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-500">
          Cargando telemetría de ruta y nodos de recolección...
        </p>
        <span className="text-xs text-slate-400">Trazando trayectorias óptimas PostGIS</span>
      </div>
    ),
  }
);

interface DynamicRouteMapProps {
  cluster: ClusterRoute;
}

export const DynamicRouteMap: React.FC<DynamicRouteMapProps> = (props) => {
  return <LeafletRouteMapComponent {...props} />;
};

export default DynamicRouteMap;
