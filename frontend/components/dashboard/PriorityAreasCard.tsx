'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Flame, CheckCircle2, AlertCircle } from 'lucide-react';
import { Cluster, clusterService, errorMessage } from '@/services/api';

interface PriorityAreasCardProps {
  clusters: Cluster[];
  pendingCount: number;
  onClustersUpdated: () => Promise<void>;
}

const K_OPTIONS = [2, 3, 4, 5];

export const PriorityAreasCard: React.FC<PriorityAreasCardProps> = ({ clusters, pendingCount, onClustersUpdated }) => {
  const router = useRouter();
  const [k, setK] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const maxCount = Math.max(1, ...clusters.map((c) => c.incident_count));

  const handleRun = async () => {
    try {
      setIsRunning(true);
      setMessage(null);
      const text = await clusterService.run(k);
      await onClustersUpdated();
      setMessage({ ok: true, text });
    } catch (error) {
      setMessage({ ok: false, text: errorMessage(error) });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between h-full">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Áreas prioritarias</h3>
              <p className="text-xs text-slate-500">Clústeres K-Means de reportes pendientes</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">
            {clusters.length} {clusters.length === 1 ? 'clúster' : 'clústeres'}
          </span>
        </div>

        {/* Lista de clústeres */}
        {clusters.length === 0 ? (
          <p className="text-xs text-slate-500 leading-relaxed">
            Aún no hay clústeres activos. Ejecute el agrupamiento K-Means para identificar las zonas con más reportes pendientes.
          </p>
        ) : (
          <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
            {clusters.map((cluster) => {
              const pct = Math.round((cluster.incident_count / maxCount) * 100);
              const level = pct >= 66 ? 'Alta' : pct >= 33 ? 'Media' : 'Baja';
              const tone = level === 'Alta' ? ['bg-rose-100 text-rose-700', 'bg-rose-500'] : level === 'Media' ? ['bg-amber-100 text-amber-700', 'bg-amber-500'] : ['bg-emerald-100 text-emerald-700', 'bg-emerald-500'];
              return (
                <button
                  key={cluster.id}
                  onClick={() => router.push(`/routes?cluster=${cluster.id}`)}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm text-slate-800">Clúster {cluster.code}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${tone[0]}`}>
                      {cluster.incident_count} {cluster.incident_count === 1 ? 'reporte' : 'reportes'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${tone[1]} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                    <span>Prioridad: {level}</span>
                    <span className="font-medium">
                      {cluster.latitude.toFixed(4)}, {cluster.longitude.toFixed(4)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {message && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${message.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            {message.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Ejecutar K-Means */}
      <div className="pt-6 border-t border-slate-100 space-y-3">
        <label className="flex items-center justify-between text-xs text-slate-600">
          <span>Número de clústeres (K)</span>
          <select
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            className="px-2 py-1 border border-slate-200 rounded-lg bg-white text-slate-800 font-semibold"
          >
            {K_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <button
          onClick={handleRun}
          disabled={isRunning || pendingCount === 0}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 group cursor-pointer"
        >
          {isRunning ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Ejecutando K-Means sobre PostGIS...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Ejecutar agrupamiento K-Means</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
        <p className="text-[11px] text-center text-slate-400">
          {pendingCount === 0 ? 'No hay reportes pendientes para agrupar.' : `Agrupa los ${pendingCount} reportes pendientes y guarda los centroides en PostGIS.`}
        </p>
      </div>
    </div>
  );
};
