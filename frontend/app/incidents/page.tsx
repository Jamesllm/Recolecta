'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { IncidentFilters } from '@/components/incidents/IncidentFilters';
import { IncidentTable } from '@/components/incidents/IncidentTable';
import { IncidentDetailDrawer } from '@/components/incidents/IncidentDetailDrawer';
import { incidentService, Incident, errorMessage } from '@/services/api';
import { AlertCircle, Download, RefreshCw } from 'lucide-react';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Drawer de Detalle
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await incidentService.getIncidents();
      setIncidents(data);
      applyFilterLogic(data, searchTerm, selectedCategory, selectedStatus);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilterLogic = (
    list: Incident[],
    search: string,
    category: string,
    status: string
  ) => {
    let result = [...list];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.code.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.address && i.address.toLowerCase().includes(q)) ||
          i.reporter_name.toLowerCase().includes(q)
      );
    }

    if (category !== 'all') {
      result = result.filter((i) => i.category === category);
    }

    if (status !== 'all') {
      result = result.filter((i) => i.status === status);
    }

    setFilteredIncidents(result);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyFilters = () => {
    applyFilterLogic(incidents, searchTerm, selectedCategory, selectedStatus);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setFilteredIncidents(incidents);
  };

  const handleUpdateStatus = async (
    id: number,
    status: 'pending' | 'assigned' | 'resolved'
  ) => {
    try {
      const updated = await incidentService.updateStatus(id, status);
      const newIncidents = incidents.map((inc) =>
        inc.id === id ? { ...inc, status: updated.status } : inc
      );
      setIncidents(newIncidents);
      applyFilterLogic(newIncidents, searchTerm, selectedCategory, selectedStatus);
      if (selectedIncident && selectedIncident.id === id) {
        setSelectedIncident({ ...selectedIncident, status: updated.status });
      }
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleExportCSV = () => {
    const headers = ['Codigo', 'Vecino', 'Categoria', 'Estado', 'Latitud', 'Longitud', 'Fecha'];
    const rows = filteredIncidents.map((i) => [
      i.code,
      `"${i.reporter_name}"`,
      `"${i.category}"`,
      i.status,
      i.latitude,
      i.longitude,
      `"${i.created_at}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `recolecta_incidentes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingCriticalCount = incidents.filter((i) => i.status === 'pending').length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Gestión de Incidentes"
        subtitle="Auditoría, validación de evidencia fotográfica y despacho de reportes ciudadanos"
      />

      <div className="p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Header superior de la vista */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              Registro Central de Reportes
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              {pendingCriticalCount} pendientes
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`}
              />
              <span>Recargar</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Barra de Filtros */}
        <IncidentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          category={selectedCategory}
          onCategoryChange={setSelectedCategory}
          status={selectedStatus}
          onStatusChange={setSelectedStatus}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          onExportCSV={handleExportCSV}
        />

        {/* Tabla Interactiva de Datos */}
        <IncidentTable
          incidents={filteredIncidents}
          onViewDetail={(incident) => {
            setSelectedIncident(incident);
            setIsDrawerOpen(true);
          }}
          onAssignTruck={(incident) => {
            handleUpdateStatus(incident.id, 'assigned');
          }}
        />

        {/* Drawer Lateral de Detalle */}
        <IncidentDetailDrawer
          incident={selectedIncident}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
}
