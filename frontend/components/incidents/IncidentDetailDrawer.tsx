'use client';

import React from 'react';
import { Incident, SIZE_LABELS, STATUS_LABELS } from '@/services/api';
import { formatDate } from '@/lib/utils';
import {
  X,
  MapPin,
  Clock,
  User,
  Tag,
  CheckCircle2,
  Truck,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';

interface IncidentDetailDrawerProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: number, status: 'pending' | 'assigned' | 'resolved') => void;
}

export const IncidentDetailDrawer: React.FC<IncidentDetailDrawerProps> = ({
  incident,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  if (!isOpen || !incident) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Incidente #{incident.code}
                </h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    incident.status === 'pending'
                      ? 'bg-rose-100 text-rose-700'
                      : incident.status === 'assigned'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {STATUS_LABELS[incident.status]}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Reportado mediante la app móvil ciudadana
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Foto Ampliada */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Fotografía de Evidencia
              </label>
              {incident.photo_url ? (
                <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                  <img
                    src={incident.photo_url}
                    alt={incident.category}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <a
                    href={incident.photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-3 right-3 bg-black/70 hover:bg-black text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Ver en alta resolución</span>
                  </a>
                </div>
              ) : (
                <div className="w-full h-40 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                  Sin fotografía adjunta
                </div>
              )}
            </div>

            {/* Descripción */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Descripción del Reporte
              </label>
              <p className="text-xs text-slate-600 leading-relaxed">
                {incident.description || 'Sin notas adicionales proporcionadas por el ciudadano.'}
              </p>
            </div>

            {/* Ficha Técnica */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" /> Categoría:
                </span>
                <span className="font-semibold text-slate-800">{incident.category}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Reportado por:
                </span>
                <span className="text-slate-800 font-semibold">{incident.reporter_name}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" /> Tamaño estimado:
                </span>
                <span className="font-semibold text-slate-800">{SIZE_LABELS[incident.estimated_size]}</span>
              </div>

              {incident.address && (
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-slate-500 shrink-0">Dirección:</span>
                  <span className="text-slate-800 font-medium text-right">{incident.address}</span>
                </div>
              )}

              {incident.reference && (
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-slate-500 shrink-0">Referencia:</span>
                  <span className="text-slate-800 font-medium text-right">{incident.reference}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Confirmaciones «Sigue ahí»:</span>
                <span className="text-slate-800 font-semibold">{incident.confirmations}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Fecha y hora:
                </span>
                <span className="text-slate-800 font-medium">{formatDate(incident.created_at)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-400" /> Tamaño estimado:
                </span>
                <span className="capitalize font-semibold text-slate-800">
                  {incident.estimated_size || 'Mediano'}
                </span>
              </div>
            </div>

            {/* Georreferenciación PostGIS */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Georreferenciación PostGIS (WGS84)</span>
              </div>
              <p className="text-xs font-mono text-emerald-950 font-semibold">
                Latitud: {incident.latitude?.toFixed(6) || 'N/A'} <br />
                Longitud: {incident.longitude?.toFixed(6) || 'N/A'}
              </p>
              <span className="text-[10px] text-emerald-700 block">
                SRID: 4326 | geometry(Point)
              </span>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-2.5">
            {incident.status !== 'resolved' && (
              <button
                onClick={() => onUpdateStatus(incident.id, 'resolved')}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Marcar como Resuelto / Saneado</span>
              </button>
            )}

            {incident.status === 'pending' && (
              <button
                onClick={() => onUpdateStatus(incident.id, 'assigned')}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Asignar a Cuadrilla de Recojo</span>
              </button>
            )}

            {incident.status === 'resolved' && (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-medium text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Este incidente se encuentra debidamente resuelto.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
