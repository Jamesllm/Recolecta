'use client';

import React, { useEffect, useState } from 'react';
import { Incident, IncidentStatus, STATUS_BADGE, STATUS_LABELS } from '@/services/api';

// Rechazar exige un motivo, por eso se hace desde el detalle (A4) y no en bloque
const BULK_STATUSES: IncidentStatus[] = ['pending', 'assigned', 'resolved'];
import { formatDate } from '@/lib/utils';
import { Eye, Truck, ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react';

interface IncidentTableProps {
  incidents: Incident[];
  totalCount: number; // incidentes sin filtrar
  onViewDetail: (incident: Incident) => void;
  onAssignRoute: (incident: Incident) => void;
  onBulkStatus: (ids: number[], status: IncidentStatus) => Promise<boolean>;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  totalCount,
  onViewDetail,
  onAssignRoute,
  onBulkStatus,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isApplying, setIsApplying] = useState(false);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(incidents.length / itemsPerPage) || 1;

  // Al filtrar: vuelve a una página válida y deja seleccionados solo los incidentes visibles
  useEffect(() => {
    setCurrentPage((p) => Math.min(p, Math.ceil(incidents.length / itemsPerPage) || 1));
    setSelectedIds((ids) => ids.filter((id) => incidents.some((i) => i.id === id)));
  }, [incidents]);

  const applyBulk = async (status: IncidentStatus) => {
    setIsApplying(true);
    const ok = await onBulkStatus(selectedIds, status);
    setIsApplying(false);
    if (ok) setSelectedIds([]);
  };
  const paginatedIncidents = incidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedIncidents.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Barra de selección (US-05): cuántos incidentes hay seleccionados y acciones sobre todos */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-6 py-3 bg-slate-900 text-white text-xs">
          <span className="font-bold">
            {selectedIds.length} {selectedIds.length === 1 ? 'incidente seleccionado' : 'incidentes seleccionados'}
          </span>
          <select
            value=""
            disabled={isApplying}
            onChange={(e) => e.target.value && applyBulk(e.target.value as IncidentStatus)}
            aria-label="Cambiar estado de los incidentes seleccionados"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold cursor-pointer"
          >
            <option value="">Cambiar estado…</option>
            {BULK_STATUSES.map((st) => (
              <option key={st} value={st}>{STATUS_LABELS[st]}</option>
            ))}
          </select>
          <button
            onClick={() => applyBulk('assigned')}
            disabled={isApplying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 font-semibold cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{isApplying ? 'Aplicando…' : 'Asignar a ruta'}</span>
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="ml-auto flex items-center gap-1 text-slate-300 hover:text-white font-semibold cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Quitar selección</span>
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 pl-6 pr-3 w-10">
                <input
                  type="checkbox"
                  checked={
                    paginatedIncidents.length > 0 &&
                    paginatedIncidents.every((i) => selectedIds.includes(i.id))
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-3">ID Reporte</th>
              <th className="py-3.5 px-3">Evidencia</th>
              <th className="py-3.5 px-3">Fecha y Hora</th>
              <th className="py-3.5 px-3">Ubicación PostGIS</th>
              <th className="py-3.5 px-3">Categoría</th>
              <th className="py-3.5 px-3">Urgencia</th>
              <th className="py-3.5 px-3">Estado</th>
              <th className="py-3.5 pr-6 pl-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {paginatedIncidents.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  No se encontraron incidentes que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              paginatedIncidents.map((incident) => {
                const isSelected = selectedIds.includes(incident.id);
                const urgency = incident.urgency || 'medium';

                return (
                  <tr
                    key={incident.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isSelected ? 'bg-emerald-50/25' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 pl-6 pr-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(incident.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </td>

                    {/* ID */}
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      #{incident.code}
                    </td>

                    {/* Thumbnail Foto */}
                    <td className="py-3.5 px-3">
                      {incident.photo_url ? (
                        <div
                          onClick={() => onViewDetail(incident)}
                          className="w-12 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group relative"
                        >
                          <img
                            src={incident.photo_url}
                            alt={incident.category}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Sin foto</span>
                      )}
                    </td>

                    {/* Fecha y Hora */}
                    <td className="py-3.5 px-3 text-slate-600">
                      {formatDate(incident.created_at)}
                    </td>

                    {/* Ubicación */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>
                          {incident.latitude?.toFixed(4)}, {incident.longitude?.toFixed(4)}
                        </span>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="py-3.5 px-3">
                      <span className="font-medium text-slate-800">
                        {incident.category}
                      </span>
                    </td>

                    {/* Urgencia */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          urgency === 'high'
                            ? 'bg-rose-100 text-rose-700'
                            : urgency === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {urgency === 'high' ? 'Alto' : urgency === 'medium' ? 'Medio' : 'Bajo'}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${STATUS_BADGE[incident.status]}`}
                      >
                        {STATUS_LABELS[incident.status]}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 pr-6 pl-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewDetail(incident)}
                          title="Ver detalle del reporte"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onAssignRoute(incident)}
                          disabled={incident.status !== 'pending'}
                          title="Asignar a ruta"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginador Inferior */}
      <div className="px-6 py-3.5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
        <div>
          Mostrando{' '}
          <span className="font-semibold text-slate-800">
            {paginatedIncidents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
          </span>{' '}
          a{' '}
          <span className="font-semibold text-slate-800">
            {Math.min(currentPage * itemsPerPage, incidents.length)}
          </span>{' '}
          de <span className="font-semibold text-slate-800">{incidents.length}</span>{' '}
          reportes
          {incidents.length < totalCount && <span> (filtrados de {totalCount})</span>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-800 px-2">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
