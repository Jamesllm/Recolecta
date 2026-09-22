'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { DynamicHeatMap } from '@/components/maps/DynamicHeatMap';
import { PriorityAreasCard } from '@/components/dashboard/PriorityAreasCard';
import { MetricSummary } from '@/components/dashboard/MetricSummary';
import { incidentService, Incident, DEMO_INCIDENTS } from '@/services/api';
import { RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>(DEMO_INCIDENTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchIncidentsData = async () => {
    try {
      setIsLoading(true);
      const data = await incidentService.getIncidents();
      setIncidents(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error cargando incidentes:', error);
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
        title="Dashboard"
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
                Última sincronización: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>

            {/* Componente Dinámico de Mapa Leaflet */}
            <DynamicHeatMap incidents={incidents} isLoading={isLoading} />
          </div>

          {/* Columna Derecha (30% ~ 4 cols de 12) */}
          <div className="lg:col-span-4 h-full">
            <PriorityAreasCard />
          </div>
        </div>
      </div>
    </div>
  );
}
