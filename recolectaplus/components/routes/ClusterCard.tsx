'use client';

import React from 'react';
import { ClusterRoute } from '@/services/api';
import { cn } from '@/lib/utils';
import { Layers, AlertCircle, ChevronRight } from 'lucide-react';

interface ClusterCardProps {
  cluster: ClusterRoute;
  isSelected: boolean;
  onSelect: (cluster: ClusterRoute) => void;
}

export const ClusterCard: React.FC<ClusterCardProps> = ({
  cluster,
  isSelected,
  onSelect,
}) => {
  const densityBadge = {
    Alta: 'bg-rose-100 text-rose-700 border-rose-200',
    Media: 'bg-amber-100 text-amber-700 border-amber-200',
    Baja: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }[cluster.density];

  const barColor = {
    Alta: 'bg-rose-500',
    Media: 'bg-amber-500',
    Baja: 'bg-emerald-500',
  }[cluster.density];

  return (
    <div
      onClick={() => onSelect(cluster)}
      className={cn(
        'p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group',
        isSelected
          ? 'bg-emerald-50/40 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
      )}
    >
      {isSelected && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-sm">{cluster.name}</span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-md text-[10px] font-bold border',
              densityBadge
            )}
          >
            {cluster.density}
          </span>
        </div>
        <ChevronRight
          className={cn(
            'w-4 h-4 transition-transform group-hover:translate-x-0.5',
            isSelected ? 'text-emerald-600' : 'text-slate-400'
          )}
        />
      </div>

      <p className="text-xs text-slate-500 mt-1">
        {cluster.reportsCount} reportes pendientes
      </p>

      {/* Barra de Nivel de Volumen */}
      <div className="mt-3">
        <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
          <span>Nivel de volumen</span>
          <span className="font-bold">{cluster.volumePercentage}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-300', barColor)}
            style={{ width: `${cluster.volumePercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
