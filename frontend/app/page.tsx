'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DynamicHeatMap } from '@/components/maps/DynamicHeatMap';
import { PriorityAreasCard } from '@/components/dashboard/PriorityAreasCard';
import { MetricSummary } from '@/components/dashboard/MetricSummary';
import { incidentService, clusterService, Incident, Cluster, errorMessage } from '@/services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchIncidentsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [data, groups] = await Promise.all([incidentService.getIncidents(), clusterService.getClusters()]);
      setIncidents(data);
      setClusters(groups);
      setLastUpdated(new Date());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentsData();

    // Revalidación periódica cada 45 segundos
    const interval = setInterval(() => {
      fetchIncidentsData();
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  const pendingCount = incidents.filter((i) => i.status === 'pending').length;
  const assignedCount = incidents.filter((i) => i.status === 'assigned').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Panel general"
        subtitle="Optimización en tiempo real de recolección urbana, mapas de calor y clústeres PostGIS"
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Barra superior de estado de actualización */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Centro de Mando Operativo</h2>
            <p className="text-xs text-slate-500">
              Monitoreo continuo de incidentes reportados por la ciudadanía
            </p>
          </div>

          <button
            onClick={fetchIncidentsData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Actualizar datos</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Métricas Resumen */}
        <MetricSummary
          totalIncidents={incidents.length}
          pendingCount={pendingCount}
          assignedCount={assignedCount}
          resolvedCount={resolvedCount}
        />

        {/* Layout de Dos Columnas (70% Mapa Interactivo / 30% Áreas Prioritarias) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda (70% ~ 8 cols de 12 o 7 cols en lg, 8 en xl) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Mapa de Calor y Densidad Espacial
                </h3>
                <p className="text-xs text-slate-500">
                  Visualización de concentración de residuos y puntos críticos activos
                </p>
              </div>
              <span className="text-xs text-slate-400">
                {lastUpdated ? `Última sincronización: ${lastUpdated.toLocaleTimeString()}` : 'Sin sincronizar'}
              </span>
            </div>

            {/* Componente Dinámico de Mapa Leaflet */}
            <DynamicHeatMap incidents={incidents} clusters={clusters} isLoading={isLoading} />
          </div>

          {/* Columna Derecha (30% ~ 4 cols de 12) */}
          <div className="lg:col-span-4 h-full">
            <PriorityAreasCard clusters={clusters} pendingCount={pendingCount} onClustersUpdated={fetchIncidentsData} />
          </div>
        </div>
      </div>
    </div>
  );
}
