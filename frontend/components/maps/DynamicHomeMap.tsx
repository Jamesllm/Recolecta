'use client';

import dynamic from 'next/dynamic';

// Leaflet necesita window: el mapa del panel general se carga solo en el navegador
export const DynamicHomeMap = dynamic(() => import('./LeafletHomeMap'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#e9eee6] animate-pulse" aria-hidden="true" />,
});

export type { MapFocus } from './LeafletHomeMap';
