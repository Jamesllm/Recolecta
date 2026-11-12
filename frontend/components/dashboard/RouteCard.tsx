'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Cluster,
  RoadRoute,
  Truck,
  errorMessage,
  fleetService,
  formatDuration,
  formatTons,
  incidentService,
} from '@/services/api';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface RouteCardProps {
  cluster: Cluster;
  route: RoadRoute | null;
  onAssigned: () => Promise<void>;
}

const MIN_PER_STOP = 3;
const formatKm = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`);

/** Tarjeta flotante «Ruta sugerida por la IA» del panel general */
export const RouteCard: React.FC<RouteCardProps> = ({ cluster, route, onAssigned }) => {
  const stops = route?.stops ?? [];
  const pending = stops.filter((s) => s.status === 'pending');
  const load = stops.reduce((sum, s) => sum + s.estimated_tons, 0);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [truckId, setTruckId] = useState<number | ''>('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fleetService
      .list()
      .then(({ data }) => {
        if (cancelled) return;
        const usable = data.filter((t) => t.status === 'available' || t.cluster_id === cluster.id);
        setTrucks(usable);
        setTruckId(usable.find((t) => t.cluster_id === cluster.id && t.status === 'on_route')?.id ?? '');
        setMessage(null);
      })
      .catch(() => !cancelled && setTrucks([]));
    return () => {
      cancelled = true;
    };
  }, [cluster.id]);

  const assignedTruck = trucks.find((t) => t.cluster_id === cluster.id && t.status === 'on_route');

  const assign = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      const text = truckId
        ? await fleetService.assign(Number(truckId), cluster.id)
        : (await incidentService.updateStatusMany(pending.map((s) => s.id), 'assigned')).message;
      await onAssigned();
      setMessage({ ok: true, text });
    } catch (error) {
      setMessage({ ok: false, text: errorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const totalS = route?.duration_s != null ? route.duration_s + stops.length * MIN_PER_STOP * 60 : null;

  return (
    <section aria-label="Ruta sugerida" className="w-full max-w-[360px] bg-white rounded-[20px] shadow-[0_12px_40px_rgba(15,23,42,0.16)] p-5 flex flex-col gap-3.5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Ruta sugerida por la IA</p>
        <h2 className="font-display text-xl font-bold text-slate-900 leading-tight mt-0.5 truncate" title={cluster.zone ?? undefined}>
          Zona {cluster.code}{cluster.zone ? ` · ${cluster.zone.split('·')[0].trim()}` : ''}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat value={route ? String(stops.length) : '…'} label="paradas" />
        <Stat value={route ? formatKm(route.distance_m) : '…'} label={route?.road === false ? 'en línea recta' : 'por calles'} />
        <Stat value={route ? formatTons(load) : '…'} label="carga" />
      </div>
      {totalS != null && (
        <p className="text-xs text-slate-500 -mt-1">
          Tiempo estimado <b className="text-slate-800">{formatDuration(totalS)}</b> ({formatDuration(route!.duration_s!)} de manejo + {MIN_PER_STOP} min por parada)
        </p>
      )}
      {route?.warning && <p className="text-xs text-amber-700">{route.warning}</p>}

      {stops.length > 0 && (
        <ol className="flex flex-col gap-1.5 text-sm">
          {stops.slice(0, 2).map((s, idx) => (
            <li key={s.id} className="flex items-center gap-2.5 min-w-0">
              <span className={`w-6 h-6 shrink-0 rounded-full text-white text-xs font-bold flex items-center justify-center ${s.status === 'assigned' ? 'bg-amber-500' : 'bg-emerald-700'}`}>{idx + 1}</span>
              <span className="truncate">#{s.code} · {s.category}</span>
            </li>
          ))}
          {stops.length > 2 && (
            <li className="flex items-center gap-2.5 text-slate-500">
              <span className="w-6 h-6 shrink-0 rounded-full border-2 border-slate-300 text-xs font-bold flex items-center justify-center">+</span>
              {stops.length - 2} paradas más
            </li>
          )}
        </ol>
      )}
      {route && stops.length === 0 && <p className="text-sm text-slate-500">Todos los reportes de esta zona ya fueron recolectados.</p>}

      {assignedTruck && (
        <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
          En ruta con <b>{assignedTruck.plate}</b> · {assignedTruck.capacity_used_pct} % de su capacidad
        </p>
      )}

      <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-600">
        Camión
        <select
          value={truckId}
          onChange={(e) => setTruckId(e.target.value ? Number(e.target.value) : '')}
          className="h-11 border border-slate-200 rounded-xl px-3 text-sm font-medium text-slate-800 bg-white"
        >
          <option value="">Sin camión (solo marcar «En ruta»)</option>
          {trucks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.plate} · {String(t.capacity_tons).replace('.', ',')} t{t.driver_name ? ` · ${t.driver_name}` : ''}
            </option>
          ))}
        </select>
      </label>
      {trucks.length === 0 && (
        <p className="text-[11px] text-slate-500 -mt-2">No hay camiones disponibles: regístrelos en <Link href="/fleet" className="font-semibold text-emerald-700">Flota</Link>.</p>
      )}

      {message && (
        <p className={`text-xs flex items-start gap-1.5 ${message.ok ? 'text-emerald-800' : 'text-rose-700'}`}>
          {message.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {message.text}
        </p>
      )}

      <button
        type="button"
        onClick={assign}
        disabled={isSaving || !route || (pending.length === 0 && (!truckId || truckId === assignedTruck?.id))}
        className="h-12 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-[15px] cursor-pointer"
      >
        {isSaving
          ? 'Asignando…'
          : truckId
            ? 'Asignar camión a la ruta'
            : pending.length
              ? `Asignar ${pending.length} ${pending.length === 1 ? 'reporte' : 'reportes'}`
              : 'Ruta en curso'}
      </button>
      <Link href={`/routes?cluster=${cluster.id}`} className="text-xs font-semibold text-emerald-700 flex items-center gap-1 self-center">
        Ver todas las paradas <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </section>
  );
};

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="bg-slate-50 rounded-xl py-2.5 px-1">
    <b className="block font-display text-lg text-slate-900 whitespace-nowrap">{value}</b>
    <span className="text-[11px] text-slate-500">{label}</span>
  </div>
);
