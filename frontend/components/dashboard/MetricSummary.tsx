'use client';

import React from 'react';
import { AlertTriangle, Flame, Truck, Weight } from 'lucide-react';
import { DaySummary, formatTons, SIZE_LABELS } from '@/services/api';

interface MetricSummaryProps {
  summary: DaySummary | null;
}

// Indicadores del día del «Panel general» (A2, US-04), calculados por la API a partir de los reportes
export const MetricSummary: React.FC<MetricSummaryProps> = ({ summary }) => {
  const value = (n?: number) => (summary ? n : '—');
  const factors = summary
    ? (Object.keys(summary.tons_by_size) as (keyof DaySummary['tons_by_size'])[])
        .map((k) => `${SIZE_LABELS[k]} ${formatTons(summary.tons_by_size[k])}`)
        .join(' · ')
    : '';

  const cards = [
    {
      title: 'Incidentes abiertos',
      value: value(summary?.open),
      subtitle: summary ? `${summary.pending} ${summary.pending === 1 ? 'pendiente' : 'pendientes'} · ${summary.assigned} en ruta` : 'Pendientes y en ruta',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      title: 'Críticos sin asignar',
      value: value(summary?.critical_unassigned),
      subtitle: 'Pendientes de urgencia alta (peligroso o camión completo)',
      icon: Flame,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
    },
    {
      title: 'Rutas activas',
      value: value(summary?.active_routes),
      subtitle: 'Clústeres con reportes en ruta',
      icon: Truck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
    },
    {
      title: 'Recolectado hoy',
      value: summary ? formatTons(summary.tons_collected_today) : '—',
      subtitle: summary ? `Estimado · ${summary.resolved_today} ${summary.resolved_today === 1 ? 'punto atendido' : 'puntos atendidos'}` : 'Estimado por tamaño',
      icon: Weight,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      hint: factors ? `Carga estimada por tamaño: ${factors}` : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            title={card.hint}
            className="bg-white rounded-2xl border border-slate-200/80 p-4.5 shadow-xs hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl ${card.bgColor} ${card.borderColor} border flex items-center justify-center ${card.color}`}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="mt-3">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</span>
            </div>

            <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};
