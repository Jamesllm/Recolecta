'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, ListChecks, Users } from 'lucide-react';
import { Incident, SIZE_LABELS, STATUS_LABELS } from '@/services/api';

interface RecentIncidentsProps {
  incidents: Incident[];
  limit?: number;
}

const STATUS_TONE: Record<Incident['status'], string> = {
  pending: 'bg-amber-100 text-amber-700',
  assigned: 'bg-indigo-100 text-indigo-700',
  resolved: 'bg-emerald-100 text-emerald-700',
};

const timeAgo = (iso: string) => {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  return h < 24 ? `hace ${h} h` : `hace ${Math.round(h / 24)} d`;
};

// Incidentes recientes del «Panel general» (A2, US-04)
export const RecentIncidents: React.FC<RecentIncidentsProps> = ({ incidents, limit = 5 }) => {
  const recent = [...incidents].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
            <ListChecks className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Incidentes recientes</h3>
            <p className="text-xs text-slate-500">Últimos reportes ciudadanos</p>
          </div>
        </div>
        <Link href="/incidents" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
          Ver todos <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="text-xs text-slate-500">Aún no hay reportes registrados.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {recent.map((i) => (
            <li key={i.id} className="flex items-center gap-3 py-3">
              {i.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.photo_url} alt={i.title} className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {i.address || `${i.latitude.toFixed(5)}, ${i.longitude.toFixed(5)}`}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  #{i.code} · {i.title} · {SIZE_LABELS[i.estimated_size]}
                </p>
                <p className="text-[11px] text-slate-400 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(i.created_at)}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{i.confirmations} confirmaciones</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {i.critical && <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">Crítico</span>}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${STATUS_TONE[i.status]}`}>{STATUS_LABELS[i.status]}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
