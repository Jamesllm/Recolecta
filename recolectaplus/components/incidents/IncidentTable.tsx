'use client';

import React, { useState } from 'react';
import { Incident } from '@/services/api';
import { formatDate } from '@/lib/utils';
import { Eye, Edit3, Truck, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface IncidentTableProps {
  incidents: Incident[];
  onViewDetail: (incident: Incident) => void;
  onAssignTruck: (incident: Incident) => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  onViewDetail,
  onAssignTruck,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(incidents.length / itemsPerPage) || 1;
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
                      #RL-{incident.id}
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
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          incident.status === 'pending'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : incident.status === 'assigned'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {incident.status === 'pending'
                          ? 'Pendiente'
                          : incident.status === 'assigned'
                          ? 'En Ruta'
                          : 'Resuelto'}
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
                          onClick={() => onAssignTruck(incident)}
                          title="Asignar camión"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors"
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
