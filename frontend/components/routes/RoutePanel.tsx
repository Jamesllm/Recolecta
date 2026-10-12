'use client';

import React, { useState } from 'react';
import { Cluster, STATUS_LABELS, errorMessage, incidentService, suggestedRoute } from '@/services/api';
import { CheckCircle2, AlertCircle, Navigation, ListOrdered, Truck } from 'lucide-react';

interface RoutePanelProps {
  cluster: Cluster;
  onUpdated: () => Promise<void>;
}

const formatKm = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(2)} km`);

export const RoutePanel: React.FC<RoutePanelProps> = ({ cluster, onUpdated }) => {
  const { stops, totalM } = suggestedRoute(cluster);
  const pending = stops.filter((s) => s.status === 'pending');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Marca como «asignados» los reportes pendientes del clúster
  const handleAssign = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      for (const s of pending) await incidentService.updateStatus(s.id, 'assigned');
      await onUpdated();
      setMessage({ ok: true, text: `${pending.length} ${pending.length === 1 ? 'reporte asignado' : 'reportes asignados'} a la cuadrilla.` });
    } catch (error) {
      setMessage({ ok: false, text: errorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between h-full gap-6">
      <div className="space-y-5">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Recorrido del clúster {cluster.code}</h3>
          <p className="text-xs text-slate-500 mt-1">Orden sugerido por cercanía a partir del centroide</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
              <span>Paradas</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{stops.length}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Navigation className="w-3.5 h-3.5 text-indigo-600" />
              <span>Distancia en línea recta</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{formatKm(totalM)}</p>
          </div>
        </div>

        <ol className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {stops.map((s, idx) => (
            <li key={s.id} className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs">
              <span className="w-6 h-6 shrink-0 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">{idx + 1}</span>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800">#{s.code} · {s.category}</p>
                <p className="text-slate-500 truncate">{s.address || `${s.latitude.toFixed(5)}, ${s.longitude.toFixed(5)}`}</p>
                <p className="text-slate-400">{STATUS_LABELS[s.status]}</p>
              </div>
            </li>
          ))}
        </ol>

        {message && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${message.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            {message.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <button
          onClick={handleAssign}
          disabled={isSaving || pending.length === 0}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Truck className="w-4 h-4" />}
          <span>Asignar {pending.length} {pending.length === 1 ? 'reporte pendiente' : 'reportes pendientes'}</span>
        </button>
        <p className="text-[11px] text-center text-slate-400">Cambia su estado a «Asignado»; el vecino lo ve como «En ruta».</p>
      </div>
    </div>
  );
};
