'use client';

import React from 'react';
import { AlertTriangle, Truck, Clock, CheckCircle, TrendingUp } from 'lucide-react';

interface MetricSummaryProps {
  totalIncidents: number;
  pendingCount: number;
  assignedCount: number;
  resolvedCount: number;
}

export const MetricSummary: React.FC<MetricSummaryProps> = ({
  totalIncidents,
  pendingCount,
  assignedCount,
  resolvedCount,
}) => {
  const cards = [
    {
      title: 'Alertas Pendientes',
      value: pendingCount,
      subtitle: 'Requieren despacho prioritario',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      badge: '+3 hoy',
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      title: 'En Ruta / Asignadas',
      value: assignedCount,
      subtitle: 'Camiones activos en recolección',
      icon: Truck,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      badge: '4 unidades',
      badgeColor: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Incidentes Resueltos',
      value: resolvedCount,
      subtitle: 'Puntos críticos saneados',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      badge: '98% tasa',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: 'Tiempo Prom. de Respuesta',
      value: '28 min',
      subtitle: 'Optimizado con algoritmo IA',
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      badge: '-14% vs ayer',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
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

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};
