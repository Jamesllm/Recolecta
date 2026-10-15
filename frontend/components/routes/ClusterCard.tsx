'use client';

import React from 'react';
import { Cluster, clusterPriority, formatTons } from '@/services/api';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface ClusterCardProps {
  cluster: Cluster;
  maxCount: number;
  isSelected: boolean;
  onSelect: (cluster: Cluster) => void;
}

export const ClusterCard: React.FC<ClusterCardProps> = ({ cluster, maxCount, isSelected, onSelect }) => {
  const pct = Math.round((cluster.incident_count / Math.max(1, maxCount)) * 100);
  const level = clusterPriority(cluster.incident_count, maxCount);
  const badge = { Alta: 'bg-rose-100 text-rose-700 border-rose-200', Media: 'bg-amber-100 text-amber-700 border-amber-200', Baja: 'bg-emerald-100 text-emerald-700 border-emerald-200' }[level];
  const bar = { Alta: 'bg-rose-500', Media: 'bg-amber-500', Baja: 'bg-emerald-500' }[level];

  return (
    <button
      onClick={() => onSelect(cluster)}
      className={cn(
        'w-full text-left p-4 rounded-xl border transition-all cursor-pointer',
        isSelected ? 'bg-emerald-50/70 border-emerald-300 shadow-sm ring-1 ring-emerald-200' : 'bg-white border-slate-200/80 hover:border-slate-300'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-900">Clúster {cluster.code}</span>
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md border', badge)}>{level}</span>
        </div>
        <ChevronRight className={cn('w-4 h-4', isSelected ? 'text-emerald-600' : 'text-slate-300')} />
      </div>
      {cluster.zone && <p className="text-xs font-medium text-slate-700 mt-1 truncate" title={cluster.zone}>{cluster.zone}</p>}
      <p className="text-xs text-slate-500 mt-0.5">
        {cluster.incident_count} {cluster.incident_count === 1 ? 'reporte' : 'reportes'} · ≈ {formatTons(cluster.estimated_tons)}
      </p>
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2.5">
        <div className={cn('h-full rounded-full', bar)} style={{ width: `${pct}%` }} />
      </div>
    </button>
  );
};
