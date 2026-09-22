'use client';

import React, { useState } from 'react';
import { ClusterRoute, incidentService } from '@/services/api';
import { Truck, Clock, Navigation, CheckCircle2, AlertCircle, Send } from 'lucide-react';

interface DispatchPanelProps {
  selectedCluster: ClusterRoute;
}

const TRUCKS = [
  { id: 'truck-07', label: 'Camión #07 — J. Martínez (Cap: 12 Ton)' },
  { id: 'truck-12', label: 'Camión #12 — R. Quispe (Cap: 15 Ton)' },
  { id: 'truck-03', label: 'Camión #03 — M. Valdivia (Cap: 10 Ton)' },
  { id: 'truck-19', label: 'Camión #19 — E. Sánchez (Cap: 12 Ton)' },
];

export const DispatchPanel: React.FC<DispatchPanelProps> = ({ selectedCluster }) => {
  const [selectedTruck, setSelectedTruck] = useState(TRUCKS[0].id);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const handleDispatch = async () => {
    try {
      setIsDispatching(true);
      await incidentService.dispatchRoute(selectedCluster.id, selectedTruck);
      setDispatched(true);
      setTimeout(() => setDispatched(false), 5000);
    } catch (error) {
      console.error('Error al despachar la ruta:', error);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between h-full">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-slate-900 text-base">
              Métricas de Despacho & Ruta
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Parámetros de navegación calculados para {selectedCluster.name}
          </p>
        </div>

        {/* Métricas: Distancia y Tiempo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Distancia est.</span>
            </div>
            <p className="text-xl font-bold text-slate-900">
              {selectedCluster.estimatedDistanceKm} km
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tiempo est.</span>
            </div>
            <p className="text-xl font-bold text-slate-900">
              {selectedCluster.estimatedTimeMin} mins
            </p>
          </div>
        </div>

        {/* Barra de Capacidad Necesaria */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-slate-700">
            <span>Capacidad necesaria</span>
            <span className="text-emerald-700 font-bold">
              {selectedCluster.requiredCapacityPct}%
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${selectedCluster.requiredCapacityPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Estimada sobre 18 m³ de residuos compactables
          </p>
        </div>

        {/* Selector de Camión / Conductor */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Asignar camión / conductor
          </label>
          <div className="relative">
            <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedTruck}
              onChange={(e) => setSelectedTruck(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none transition-all cursor-pointer"
            >
              {TRUCKS.map((truck) => (
                <option key={truck.id} value={truck.id}>
                  {truck.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mensaje de Confirmación */}
        {dispatched && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">¡Ruta despachada con éxito!</p>
              <p className="text-[11px] text-emerald-700">
                La hoja de ruta digital fue enviada a la terminal del conductor.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Botón Verde Ancho de Despacho */}
      <div className="pt-6 border-t border-slate-100">
        <button
          onClick={handleDispatch}
          disabled={isDispatching}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-75 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isDispatching ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Transmitiendo telemetría...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Ruta de recogida de envíos</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-center text-slate-400 mt-2">
          Asigna y notifica en tiempo real a la unidad de recolección
        </p>
      </div>
    </div>
  );
};
