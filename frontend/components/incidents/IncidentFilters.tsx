'use client';

import React from 'react';
import { Search, Download, RotateCcw } from 'lucide-react';
import { CATEGORIES } from '@/services/api';

/** Filtros de la pantalla A3 · Incidentes (US-05). La tabla se actualiza al cambiar cualquiera. */
export interface IncidentFilterValues {
  search: string;
  category: string; // 'all' o una categoría
  urgency: string; // 'all' | 'high' | 'medium' | 'low'
  status: string; // 'all' | 'pending' | 'assigned' | 'resolved' | 'rejected'
  period: string; // 'all' | 'today' | '7' | '30'
}

export const EMPTY_FILTERS: IncidentFilterValues = { search: '', category: 'all', urgency: 'all', status: 'all', period: 'all' };

export const PERIOD_OPTIONS = [
  { value: 'all', label: 'Todo el periodo' },
  { value: 'today', label: 'Hoy' },
  { value: '7', label: 'Últimos 7 días' },
  { value: '30', label: 'Últimos 30 días' },
];

interface IncidentFiltersProps {
  values: IncidentFilterValues;
  onChange: (values: IncidentFilterValues) => void;
  onResetFilters: () => void;
  onExportCSV: () => void;
}

const SELECT =
  'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer';

export const IncidentFilters: React.FC<IncidentFiltersProps> = ({ values, onChange, onResetFilters, onExportCSV }) => {
  const set = (key: keyof IncidentFilterValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...values, [key]: e.target.value });
  const active = JSON.stringify(values) !== JSON.stringify(EMPTY_FILTERS);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4.5 shadow-xs">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={values.search}
            onChange={set('search')}
            placeholder="Buscar por código, dirección o descripción..."
            aria-label="Buscar incidentes"
            className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="w-full sm:w-40">
          <select value={values.category} onChange={set('category')} aria-label="Categoría" className={SELECT}>
            <option value="all">Todas las categorías</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-40">
          <select value={values.urgency} onChange={set('urgency')} aria-label="Urgencia" className={SELECT}>
            <option value="all">Todas las urgencias</option>
            <option value="high">Urgencia alta</option>
            <option value="medium">Urgencia media</option>
            <option value="low">Urgencia baja</option>
          </select>
        </div>

        <div className="w-full sm:w-40">
          <select value={values.status} onChange={set('status')} aria-label="Estado" className={SELECT}>
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="assigned">En ruta</option>
            <option value="resolved">Resuelto</option>
            <option value="rejected">Rechazado</option>
          </select>
        </div>

        <div className="w-full sm:w-40">
          <select value={values.period} onChange={set('period')} aria-label="Periodo" className={SELECT}>
            {PERIOD_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onResetFilters}
            disabled={!active}
            className="px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar filtros</span>
          </button>
          <button
            onClick={onExportCSV}
            title="Exportar CSV"
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
