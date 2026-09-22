'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, AlertTriangle, Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { incidentService } from '@/services/api';

interface PriorityArea {
  id: string;
  name: string;
  alertsCount: number;
  densityLevel: 'Crítica' | 'Media' | 'Moderada';
  progress: number;
  trend: string;
  colorClass: string;
}

const PRIORITY_AREAS: PriorityArea[] = [
  {
    id: 'area-1',
    name: 'Centro-Norte',
    alertsCount: 18,
    densityLevel: 'Crítica',
    progress: 92,
    trend: '+4 en la última hora',
    colorClass: 'bg-rose-500',
  },
  {
    id: 'area-2',
    name: 'Industrial Sur',
    alertsCount: 12,
    densityLevel: 'Media',
    progress: 68,
    trend: '+2 reportes nuevos',
    colorClass: 'bg-amber-500',
  },
  {
    id: 'area-3',
    name: 'Mercado Central',
    alertsCount: 8,
    densityLevel: 'Moderada',
    progress: 45,
    trend: 'Estable',
    colorClass: 'bg-emerald-500',
  },
];

export const PriorityAreasCard: React.FC = () => {
  const router = useRouter();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRunOptimization = async () => {
    try {
      setIsOptimizing(true);
      setSuccessMessage(null);
      const res = await incidentService.triggerRouteOptimization(3);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          router.push('/routes');
        }, 1200);
      }
    } catch (error) {
      console.error('Error optimizando rutas:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between h-full">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Áreas prioritarias</h3>
              <p className="text-xs text-slate-500">Ordenadas por saturación y densidad</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">
            3 focos activos
          </span>
        </div>

        {/* Lista de Áreas */}
        <div className="space-y-3.5">
          {PRIORITY_AREAS.map((area) => (
            <div
              key={area.id}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm text-slate-800">{area.name}</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    area.densityLevel === 'Crítica'
                      ? 'bg-rose-100 text-rose-700'
                      : area.densityLevel === 'Media'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {area.alertsCount} alertas
                </span>
              </div>

              {/* Barra de Progreso */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${area.colorClass} transition-all duration-500`}
                  style={{ width: `${area.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                <span>Nivel: {area.densityLevel}</span>
                <span className="font-medium">{area.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback Message */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage} Redirigiendo a consola de rutas...</span>
          </div>
        )}
      </div>

      {/* Botón Destacado Verde IA */}
      <div className="pt-6 border-t border-slate-100">
        <button
          onClick={handleRunOptimization}
          disabled={isOptimizing}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-75 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 group cursor-pointer"
        >
          {isOptimizing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Procesando K-Means sobre PostGIS...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-200 group-hover:rotate-12 transition-transform" />
              <span>Ejecutar la optimización de rutas con IA</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
        <p className="text-[11px] text-center text-slate-400 mt-2">
          Calcula centroides K-Means y genera polylines de recojo óptimo
        </p>
      </div>
    </div>
  );
};
