'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { ClusterCard } from '@/components/routes/ClusterCard';
import { DispatchPanel } from '@/components/routes/DispatchPanel';
import { DynamicRouteMap } from '@/components/maps/DynamicRouteMap';
import { DEMO_CLUSTERS, ClusterRoute } from '@/services/api';
import {
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Route,
  Zap,
} from 'lucide-react';

export default function RoutesPage() {
  const [clusters, setClusters] = useState<ClusterRoute[]>(DEMO_CLUSTERS);
  const [selectedCluster, setSelectedCluster] = useState<ClusterRoute>(DEMO_CLUSTERS[0]);
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'high' | 'medium'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((res) => setTimeout(res, 800));
    setIsRefreshing(false);
  };

  const filteredClusters = clusters.filter((c) => {
    if (urgencyFilter === 'high') return c.density === 'Alta';
    if (urgencyFilter === 'medium') return c.density === 'Media';
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Optimización de Rutas"
        subtitle="Agrupamiento espacial por K-Means, telemetría y despacho de flota"
      />

      <div className="p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Breadcrumbs y Control Superior */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Consola
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-700">Optimización de rutas</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-emerald-600">Recorridos activos</span>
          </nav>

          <div className="flex items-center gap-3">
            {/* Badge AI Model v2.1 Active */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Model v2.1 Active</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`}
              />
              <span>Refrescar</span>
            </button>
          </div>
        </div>

        {/* Layout de 3 Columnas: Panel Clústeres (Izquierda) | Mapa Seguimiento (Centro) | Métricas y Despacho (Derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Panel Izquierdo: Grupos / Clústeres (3 cols de 12) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  Clústeres Espaciales
                </h3>
                <p className="text-[11px] text-slate-500">
                  Agrupaciones generadas por IA
                </p>
              </div>

              {/* Filtro de ordenación por urgencia */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[10px] font-semibold">
                <button
                  onClick={() => setUrgencyFilter('all')}
                  className={`px-2 py-0.5 rounded ${
                    urgencyFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setUrgencyFilter('high')}
                  className={`px-2 py-0.5 rounded ${
                    urgencyFilter === 'high'
                      ? 'bg-white text-rose-700 shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  Alta
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredClusters.map((cluster) => (
                <ClusterCard
                  key={cluster.id}
                  cluster={cluster}
                  isSelected={selectedCluster.id === cluster.id}
                  onSelect={(c) => setSelectedCluster(c)}
                />
              ))}
            </div>
          </div>

          {/* Panel Central: Mapa de Seguimiento en Vivo (6 cols de 12) */}
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Trazado en Vivo: {selectedCluster.name}
              </span>
              <span className="text-xs text-slate-500">
                {selectedCluster.stops.length} paradas óptimas hacia Relleno Sanitario
              </span>
            </div>

            <DynamicRouteMap cluster={selectedCluster} />
          </div>

          {/* Panel Derecho: Métricas y Envío de Ruta (3 cols de 12) */}
          <div className="lg:col-span-3 h-full">
            <DispatchPanel selectedCluster={selectedCluster} />
          </div>
        </div>
      </div>
    </div>
  );
}
