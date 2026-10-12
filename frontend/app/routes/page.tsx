'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { ClusterCard } from '@/components/routes/ClusterCard';
import { RoutePanel } from '@/components/routes/RoutePanel';
import { DynamicRouteMap } from '@/components/maps/DynamicRouteMap';
import { Cluster, clusterService, errorMessage } from '@/services/api';
import { AlertCircle, ChevronRight, RefreshCw, Sparkles, Zap } from 'lucide-react';

export default function RoutesPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await clusterService.getClusters();
      setClusters(data);
      // Respeta el clúster elegido desde el panel general (/routes?cluster=ID)
      const requested = Number(new URLSearchParams(window.location.search).get('cluster'));
      setSelectedId((cur) => {
        const wanted = cur ?? requested;
        return data.some((c) => c.id === wanted) ? wanted : data[0]?.id ?? null;
      });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = clusters.find((c) => c.id === selectedId) ?? null;
  const maxCount = Math.max(1, ...clusters.map((c) => c.incident_count));

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Clústeres y rutas" subtitle="Agrupamiento espacial K-Means de los reportes pendientes y orden de recojo sugerido" />

      <div className="p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">Panel general</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-emerald-600">Clústeres y rutas</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{clusters.length} {clusters.length === 1 ? 'clúster activo' : 'clústeres activos'}</span>
            </div>
            <button
              onClick={load}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Recargar</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isLoading && !error && clusters.length === 0 && (
          <div className="p-10 rounded-2xl border border-dashed border-slate-300 bg-white text-center space-y-2">
            <Zap className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-bold text-slate-900">Aún no hay clústeres activos</p>
            <p className="text-sm text-slate-500">
              Ejecute el agrupamiento K-Means desde el <Link href="/" className="text-emerald-700 font-semibold">panel general</Link> cuando existan reportes pendientes.
            </p>
          </div>
        )}

        {selected && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-3 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  Clústeres K-Means
                </h3>
                <p className="text-[11px] text-slate-500">Ordenados por cantidad de reportes</p>
              </div>
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {clusters.map((cluster) => (
                  <ClusterCard
                    key={cluster.id}
                    cluster={cluster}
                    maxCount={maxCount}
                    isSelected={cluster.id === selected.id}
                    onSelect={(c) => setSelectedId(c.id)}
                  />
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Clúster {selected.code}</span>
                <span className="text-xs text-slate-500">{selected.incident_count} reportes · orden sugerido por cercanía</span>
              </div>
              <DynamicRouteMap cluster={selected} />
            </div>

            <div className="lg:col-span-3 h-full">
              <RoutePanel cluster={selected} onUpdated={load} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
