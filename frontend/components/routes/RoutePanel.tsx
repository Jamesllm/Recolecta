'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Cluster,
  RoadRoute,
  STATUS_LABELS,
  Truck as TruckType,
  errorMessage,
  fleetService,
  formatDuration,
  formatTons,
  incidentService,
} from '@/services/api';
import { CheckCircle2, AlertCircle, Navigation, ListOrdered, Truck, Clock } from 'lucide-react';

interface RoutePanelProps {
  cluster: Cluster;
  route: RoadRoute | null;
  onUpdated: () => Promise<void>;
}

const MIN_PER_STOP = 3; // tiempo estimado de carga en cada parada
const formatKm = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`);

export const RoutePanel: React.FC<RoutePanelProps> = ({ cluster, route, onUpdated }) => {
  const stops = route?.stops ?? [];
  const pending = stops.filter((s) => s.status === 'pending');
  const load = stops.reduce((sum, s) => sum + s.estimated_tons, 0);
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [truckId, setTruckId] = useState<number | ''>('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Camiones que pueden tomar esta ruta: disponibles o ya asignados a este clúster
  useEffect(() => {
    fleetService
      .list()
      .then(({ data }) => {
        const usable = data.filter((t) => t.status === 'available' || t.cluster_id === cluster.id);
        setTrucks(usable);
        const current = usable.find((t) => t.cluster_id === cluster.id && t.status === 'on_route');
        setTruckId(current ? current.id : '');
      })
      .catch(() => setTrucks([]));
    setMessage(null);
  }, [cluster.id]);

  const assignedTruck = trucks.find((t) => t.cluster_id === cluster.id && t.status === 'on_route');

  const handleAssign = async () => {
    try {
      setIsSaving(true);
      setMessage(null);
      let text: string;
      if (truckId) {
        text = await fleetService.assign(Number(truckId), cluster.id);
      } else {
        const res = await incidentService.updateStatusMany(pending.map((s) => s.id), 'assigned');
        text = res.message;
      }
      await onUpdated();
      setMessage({ ok: true, text });
    } catch (error) {
      setMessage({ ok: false, text: errorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const driveMin = route?.duration_s != null ? route.duration_s : null;
  const totalS = driveMin != null ? driveMin + stops.length * MIN_PER_STOP * 60 : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between h-full gap-5">
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Recorrido del clúster {cluster.code}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {route?.road === false ? 'Orden por cercanía en línea recta' : 'Orden y trazado por calles y avenidas (OSRM)'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Stat icon={<ListOrdered className="w-3.5 h-3.5 text-emerald-600" />} label="Paradas" value={route ? String(stops.length) : '…'} />
          <Stat icon={<Navigation className="w-3.5 h-3.5 text-blue-600" />} label={route?.road === false ? 'Distancia (recta)' : 'Distancia por calles'} value={route ? formatKm(route.distance_m) : '…'} />
          <Stat
            icon={<Clock className="w-3.5 h-3.5 text-amber-600" />}
            label="Tiempo estimado"
            value={totalS != null ? formatDuration(totalS) : route ? 'n/d' : '…'}
            hint={driveMin != null ? `${formatDuration(driveMin)} manejo + ${MIN_PER_STOP} min por parada` : undefined}
          />
          <Stat icon={<Truck className="w-3.5 h-3.5 text-slate-600" />} label="Carga estimada" value={route ? formatTons(load) : '…'} />
        </div>

        <ol className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {stops.map((s, idx) => (
            <li key={s.id} className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs">
              <span className={`w-6 h-6 shrink-0 rounded-full text-white font-bold flex items-center justify-center ${s.status === 'assigned' ? 'bg-amber-500' : 'bg-emerald-600'}`}>{idx + 1}</span>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800">#{s.code} · {s.category}</p>
                <p className="text-slate-500 truncate">{s.address || `${s.latitude.toFixed(5)}, ${s.longitude.toFixed(5)}`}</p>
                <p className="text-slate-400">{STATUS_LABELS[s.status]}</p>
              </div>
            </li>
          ))}
          {route && stops.length === 0 && <li className="text-xs text-slate-500">Todos los reportes del clúster ya fueron recolectados.</li>}
        </ol>

        {message && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${message.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            {message.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {assignedTruck && (
          <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            Camión asignado: <b>{assignedTruck.plate}</b>{assignedTruck.driver_name ? ` · ${assignedTruck.driver_name}` : ''} ({assignedTruck.capacity_used_pct}% de su capacidad)
          </p>
        )}
        <label className="flex items-center justify-between gap-2 text-xs text-slate-600">
          <span>Camión</span>
          <select
            value={truckId}
            onChange={(e) => setTruckId(e.target.value ? Number(e.target.value) : '')}
            className="flex-1 max-w-[200px] px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 font-semibold"
          >
            <option value="">Sin camión</option>
            {trucks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.plate} · {String(t.capacity_tons).replace('.', ',')} t{t.cluster_id === cluster.id ? ' (asignado)' : ''}
              </option>
            ))}
          </select>
        </label>
        {trucks.length === 0 && (
          <p className="text-[11px] text-slate-400">
            No hay camiones disponibles. Regístrelos en <Link href="/fleet" className="text-emerald-700 font-semibold">Flota de recogida</Link>.
          </p>
        )}
        <button
          onClick={handleAssign}
          disabled={isSaving || !route || (pending.length === 0 && (!truckId || truckId === assignedTruck?.id))}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Truck className="w-4 h-4" />}
          <span>{truckId ? 'Asignar camión a la ruta' : `Asignar ${pending.length} ${pending.length === 1 ? 'reporte pendiente' : 'reportes pendientes'}`}</span>
        </button>
        <p className="text-[11px] text-center text-slate-400">Los reportes pendientes pasan a «En ruta» y el vecino recibe el aviso.</p>
      </div>
    </div>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string; hint?: string }> = ({ icon, label, value, hint }) => (
  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100" title={hint}>
    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mb-0.5">
      {icon}
      <span>{label}</span>
    </div>
    <p className="text-base font-bold text-slate-900 whitespace-nowrap">{value}</p>
    {hint && <p className="text-[10px] text-slate-400 leading-tight">{hint}</p>}
  </div>
);
