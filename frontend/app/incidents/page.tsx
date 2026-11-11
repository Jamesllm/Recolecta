'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { EMPTY_FILTERS, IncidentFilters, IncidentFilterValues } from '@/components/incidents/IncidentFilters';
import { IncidentTable } from '@/components/incidents/IncidentTable';
import { IncidentDetailDrawer } from '@/components/incidents/IncidentDetailDrawer';
import { incidentService, Incident, IncidentStatus, errorMessage } from '@/services/api';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Fecha mínima del periodo elegido (null: sin límite) */
const periodStart = (period: string): number | null => {
  if (period === 'today') {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  const days = Number(period);
  return days > 0 ? Date.now() - days * DAY_MS : null;
};

/** Aplica la búsqueda y los filtros de categoría, urgencia, estado y periodo (US-05) */
const applyFilters = (list: Incident[], f: IncidentFilterValues) => {
  const q = f.search.trim().toLowerCase();
  const since = periodStart(f.period);
  return list.filter(
    (i) =>
      (!q ||
        i.code.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        (i.description ?? '').toLowerCase().includes(q) ||
        (i.address ?? '').toLowerCase().includes(q) ||
        i.reporter_name.toLowerCase().includes(q)) &&
      (f.category === 'all' || i.category === f.category) &&
      (f.urgency === 'all' || i.urgency === f.urgency) &&
      (f.status === 'all' || i.status === f.status) &&
      (since === null || new Date(i.created_at).getTime() >= since)
  );
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filters, setFilters] = useState<IncidentFilterValues>(EMPTY_FILTERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filteredIncidents = useMemo(() => applyFilters(incidents, filters), [incidents, filters]);
  const selectedIncident = incidents.find((i) => i.id === selectedId) ?? null;

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIncidents(await incidentService.getIncidents());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /** Reemplaza en la lista los incidentes que devolvió la API */
  const mergeUpdated = (updated: Incident[]) => {
    const byId = new Map(updated.map((u) => [u.id, u]));
    setIncidents((list) => list.map((i) => byId.get(i.id) ?? i));
  };

  const handleUpdateStatus = async (id: number, status: IncidentStatus) => {
    try {
      setError(null);
      mergeUpdated([await incidentService.updateStatus(id, status)]);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  // Barra de selección: «Cambiar estado» y «Asignar a ruta» para varios incidentes a la vez
  const handleBulkStatus = async (ids: number[], status: IncidentStatus) => {
    try {
      setError(null);
      const { message, data } = await incidentService.updateStatusMany(ids, status);
      mergeUpdated(data);
      setNotice(message);
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    }
  };

  const handleExportCSV = () => {
    const headers = ['Codigo', 'Vecino', 'Categoria', 'Urgencia', 'Estado', 'Latitud', 'Longitud', 'Fecha'];
    const rows = filteredIncidents.map((i) => [
      i.code,
      `"${i.reporter_name}"`,
      `"${i.category}"`,
      i.urgency,
      i.status,
      i.latitude,
      i.longitude,
      `"${i.created_at}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `recolecta_incidentes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingCount = incidents.filter((i) => i.status === 'pending').length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Gestión de Incidentes" subtitle="Búsqueda, filtros y revisión de los reportes ciudadanos antes de asignarlos a una ruta" />

      <div className="p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Registro Central de Reportes</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              {pendingCount} pendientes
            </span>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Recargar</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="flex-1">{notice}</span>
            <button onClick={() => setNotice(null)} className="text-xs font-semibold underline cursor-pointer">Cerrar</button>
          </div>
        )}

        <IncidentFilters
          values={filters}
          onChange={setFilters}
          onResetFilters={() => setFilters(EMPTY_FILTERS)}
          onExportCSV={handleExportCSV}
        />

        <IncidentTable
          incidents={filteredIncidents}
          totalCount={incidents.length}
          onViewDetail={(incident) => setSelectedId(incident.id)}
          onAssignRoute={(incident) => handleUpdateStatus(incident.id, 'assigned')}
          onBulkStatus={handleBulkStatus}
        />

        <IncidentDetailDrawer
          incident={selectedIncident}
          isOpen={selectedIncident !== null}
          onClose={() => setSelectedId(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
}
