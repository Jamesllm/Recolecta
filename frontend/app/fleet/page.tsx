'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Header, HeaderButton } from '@/components/layout/Header';
import { SlideOver } from '@/components/layout/SlideOver';
import { useLiveTrucks } from '@/lib/useLiveTrucks';
import {
  Cluster,
  FleetBase,
  FleetSummary,
  Truck,
  clusterService,
  errorMessage,
  fieldErrors,
  fleetService,
  formatClock,
  formatKm,
  formatTons,
  settingsService,
} from '@/services/api';
import { AlertCircle, CheckCircle2, MapPin, Plus, RefreshCw, Trash2, Truck as TruckIcon, Wrench } from 'lucide-react';

const FleetMap = dynamic(() => import('@/components/maps/LeafletFleetMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#e9eee6] animate-pulse" aria-hidden="true" />,
});

const STATUS_TONE: Record<Truck['status'], string> = {
  available: 'bg-emerald-100 text-emerald-800',
  on_route: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-slate-200 text-slate-700',
};

const EMPTY = { plate: '', driver_name: '', capacity_tons: '' };

export default function FleetPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [summary, setSummary] = useState<FleetSummary | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [base, setBase] = useState<FleetBase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const live = useLiveTrucks(3000);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const [res, groups, s] = await Promise.all([fleetService.list(), clusterService.getClusters(), settingsService.get()]);
      setTrucks(res.data);
      setSummary(res.summary);
      setClusters(groups);
      setBase(s.settings.fleet_base);
    } catch (err) {
      setNotice({ ok: false, text: errorMessage(err) });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Cuando el simulador termina una ruta o recoge una parada, la tabla se pone al día
  const liveKey = live.map((t) => `${t.id}:${t.state}:${t.stops_collected}`).join(',');
  useEffect(() => {
    if (liveKey) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveKey]);

  const run = async (action: () => Promise<string>) => {
    try {
      setNotice({ ok: true, text: await action() });
      await load();
    } catch (err) {
      setNotice({ ok: false, text: errorMessage(err) });
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});
    try {
      const text = await fleetService.create({
        plate: form.plate,
        driver_name: form.driver_name,
        capacity_tons: Number(form.capacity_tons.replace(',', '.')),
      });
      setForm(EMPTY);
      setFormOpen(false);
      setNotice({ ok: true, text });
      await load();
    } catch (err) {
      setErrors(fieldErrors(err));
    } finally {
      setIsSaving(false);
    }
  };

  const input = 'w-full h-11 px-3.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600';
  const freeClusters = clusters.filter((c) => !trucks.some((t) => t.cluster_id === c.id && t.status === 'on_route'));

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Flota de recogida"
        subtitle="Camiones en vivo: de dónde salen, dónde están y qué ruta siguen"
        actions={
          <>
            <HeaderButton onClick={load} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Recargar
            </HeaderButton>
            <HeaderButton primary onClick={() => { setErrors({}); setFormOpen(true); }}>
              <Plus className="w-4 h-4" /> Registrar camión
            </HeaderButton>
          </>
        }
      />

      <div className="py-6 space-y-5 w-full">
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Tile label="Camiones" value={String(summary.total)} />
            <Tile label="Disponibles" value={String(summary.available)} />
            <Tile label="En ruta" value={String(summary.on_route)} />
            <Tile label="En mantenimiento" value={String(summary.maintenance)} />
            <Tile label="Capacidad total" value={`${String(summary.capacity_tons).replace('.', ',')} t`} />
          </div>
        )}

        {notice && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium ${notice.ok ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-800'}`}>
            {notice.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="flex-1">{notice.text}</span>
            <button type="button" onClick={() => setNotice(null)} className="text-xs font-semibold underline cursor-pointer">Cerrar</button>
          </div>
        )}

        {!base && (
          <p className="flex items-center gap-2 text-sm text-amber-900 bg-amber-50 rounded-2xl px-4 py-3">
            <MapPin className="w-4 h-4 shrink-0" />
            Aún no hay base de la flota: los camiones salen de la primera parada de su ruta. Defínala en
            <Link href="/settings" className="font-semibold">Configuración</Link>.
          </p>
        )}

        {/* Mapa en vivo + camiones en ruta */}
        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4">
          <div className="relative h-[480px] rounded-[20px] overflow-hidden bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
            <FleetMap trucks={live} base={base} selectedId={selectedId} />
            <div className="absolute left-4 bottom-4 z-[500] bg-white/95 rounded-xl shadow px-3 py-2 text-xs text-slate-700 flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5"><span className="w-5 h-1.5 rounded-full bg-slate-400" />Recorrido</span>
              <span className="flex items-center gap-1.5"><span className="w-5 h-1.5 rounded-full bg-blue-700" />Por recorrer</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-900 border-2 border-white" />Salida</span>
            </div>
          </div>
          <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-4 flex flex-col gap-3 max-h-[480px] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Camiones en ruta</h2>
              {selectedId && <button type="button" onClick={() => setSelectedId(null)} className="text-xs font-semibold text-emerald-700 cursor-pointer">Ver todos</button>}
            </div>
            {live.length === 0 && (
              <p className="text-sm text-slate-500">Ningún camión en ruta. Asigne uno a una zona en la tabla de abajo o desde el Panel general.</p>
            )}
            {live.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id === selectedId ? null : t.id)}
                aria-pressed={t.id === selectedId}
                className={`text-left rounded-2xl p-3.5 cursor-pointer ${t.id === selectedId ? 'border-2 border-blue-700 bg-blue-50/40' : 'border border-slate-200 hover:bg-slate-50'}`}
              >
                <span className="flex items-center justify-between gap-2">
                  <b className="font-display text-base">{t.plate}</b>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${t.state === 'done' ? 'bg-slate-200 text-slate-700' : t.state === 'collecting' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'}`}>
                    {t.state === 'done' ? 'Ruta completada' : t.state === 'collecting' ? 'Recogiendo' : 'En camino'}
                  </span>
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">{t.driver_name ?? 'Sin conductor'}{t.cluster_code ? ` · ruta ${t.cluster_code}` : ''}</span>
                <span className="block h-2 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
                  <span className="block h-full bg-blue-700 rounded-full" style={{ width: `${t.length_m ? Math.min(100, (t.progress_m / t.length_m) * 100) : 100}%` }} />
                </span>
                <span className="flex justify-between text-xs text-slate-600 mt-1.5">
                  <span>{t.stops_collected}/{t.stops_total} paradas · {formatKm(t.progress_m)} de {formatKm(t.length_m)}</span>
                  {t.state !== 'done' && <b className={t.current_speed_kmh ? 'text-blue-900' : 'text-amber-800'}>{t.current_speed_kmh} km/h</b>}
                </span>
                {t.state !== 'done' && <span className="block text-xs text-slate-600 mt-1">Faltan <b>{formatKm(Math.max(0, t.length_m - t.progress_m))}</b>{t.current_speed_kmh ? '' : ' · detenido cargando en la parada'}</span>}
                <span className="block text-xs text-slate-600 mt-1">
                  Salió de <b>{t.origin.label}</b> a las {formatClock(t.started_at)}
                </span>
                {t.next_stop ? (
                  <span className="block text-xs text-slate-600">Próxima: <b>#{t.next_stop.code}</b> ({t.next_stop.category}) a las {formatClock(t.eta_next)} · fin {formatClock(t.eta_end)}</span>
                ) : (
                  <span className="block text-xs text-slate-600">Terminó a las {formatClock(t.finished_at)}</span>
                )}
              </button>
            ))}
            <p className="text-[11px] text-slate-400 mt-auto">Simulación en tiempo real: {live[0]?.speed_kmh ?? 25} km/h y {live[0]?.dwell_min ?? 3} min por parada; al llegar, el reporte pasa a «Resuelto».</p>
          </div>
        </section>

        {/* Camiones registrados */}
        <section className="bg-white rounded-[20px] shadow-[0_8px_30px_rgba(15,23,42,0.08)] overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Camiones registrados</h2>
          </div>
          {trucks.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <TruckIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-800">{isLoading ? 'Cargando…' : 'Aún no hay camiones registrados'}</p>
              {!isLoading && <HeaderButton primary className="mx-auto" onClick={() => setFormOpen(true)}><Plus className="w-4 h-4" /> Registrar camión</HeaderButton>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="py-3 pl-6 pr-3">Placa</th>
                    <th className="py-3 px-3">Conductor</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3">Ruta</th>
                    <th className="py-3 px-3 w-56">Avance / capacidad</th>
                    <th className="py-3 pr-6 pl-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {trucks.map((t) => (
                    <tr key={t.id}>
                      <td className="py-3.5 pl-6 pr-3 font-display font-bold text-slate-900 whitespace-nowrap">{t.plate}</td>
                      <td className="py-3.5 px-3">{t.driver_name ?? <span className="text-slate-400">Sin asignar</span>}</td>
                      <td className="py-3.5 px-3 whitespace-nowrap"><span className={`px-2.5 py-1 rounded-full font-semibold text-xs ${STATUS_TONE[t.status]}`}>{t.status_label}</span></td>
                      <td className="py-3.5 px-3">
                        {t.cluster_code ? (
                          <Link href={`/routes?cluster=${t.cluster_id}`} className="text-emerald-800 font-semibold">{t.cluster_code}{t.zone ? ` · ${t.zone.split('·')[0].trim()}` : ''}</Link>
                        ) : t.trip?.state === 'done' ? (
                          <span className="text-xs text-slate-500">Última ruta terminada a las {formatClock(t.trip.finished_at)}</span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-3.5 px-3">
                        {t.trip && t.status === 'on_route' ? (
                          <>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-700 rounded-full" style={{ width: `${t.trip.progress_pct}%` }} /></div>
                            <p className="text-xs text-slate-500 mt-1">{t.trip.stops_collected}/{t.trip.stops_total} paradas · fin {formatClock(t.trip.eta_end)}</p>
                          </>
                        ) : (
                          <p className="text-xs text-slate-500">Capacidad {String(t.capacity_tons).replace('.', ',')} t</p>
                        )}
                        {t.cluster_code && <p className="text-xs text-slate-500">Carga pendiente ≈ {formatTons(t.load_tons)} ({t.capacity_used_pct} %)</p>}
                      </td>
                      <td className="py-3.5 pr-6 pl-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {t.status === 'available' && freeClusters.length > 0 && (
                            <select
                              aria-label={`Asignar ${t.plate} a una zona`}
                              value=""
                              onChange={(e) => e.target.value && run(() => fleetService.assign(t.id, Number(e.target.value)))}
                              className="h-9 px-2 rounded-full border border-slate-200 bg-white text-xs font-semibold cursor-pointer"
                            >
                              <option value="">Asignar a zona…</option>
                              {freeClusters.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.incident_count} reportes</option>)}
                            </select>
                          )}
                          {t.status === 'on_route' && (
                            <button type="button" onClick={() => run(() => fleetService.release(t.id))} className="h-9 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold cursor-pointer">Detener y liberar</button>
                          )}
                          {t.status !== 'maintenance' ? (
                            <button type="button" onClick={() => run(() => fleetService.update(t.id, { status: 'maintenance' }))} title="Pasar a mantenimiento" aria-label={`Pasar ${t.plate} a mantenimiento`} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"><Wrench className="w-4 h-4" /></button>
                          ) : (
                            <button type="button" onClick={() => run(() => fleetService.update(t.id, { status: 'available' }))} className="h-9 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold cursor-pointer">Disponible</button>
                          )}
                          <button
                            type="button"
                            onClick={() => window.confirm(`¿Eliminar el camión ${t.plate}?`) && run(() => fleetService.remove(t.id))}
                            aria-label={`Eliminar ${t.plate}`}
                            className="w-9 h-9 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Registrar camión */}
      <SlideOver
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Registrar camión"
        subtitle="Queda disponible para asignarlo a una ruta"
        footer={
          <div className="flex gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="flex-1 h-11 rounded-full bg-white border border-slate-200 text-sm font-semibold cursor-pointer">Cancelar</button>
            <button type="submit" form="truck-form" disabled={isSaving || !form.plate || !form.capacity_tons} className="flex-1 h-11 rounded-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold cursor-pointer">
              {isSaving ? 'Guardando…' : 'Registrar'}
            </button>
          </div>
        }
      >
        <form id="truck-form" onSubmit={create} className="space-y-4">
          <label className="block space-y-1.5 text-sm font-medium text-slate-700">
            <span>Placa</span>
            <input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })} placeholder="ABC-123" autoFocus className={`${input} ${errors.plate ? 'border-rose-400' : 'border-slate-200'}`} />
            {errors.plate && <span className="block text-xs text-rose-700">{errors.plate}</span>}
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-slate-700">
            <span>Conductor <span className="text-slate-400 font-normal">(opcional)</span></span>
            <input value={form.driver_name} onChange={(e) => setForm({ ...form, driver_name: e.target.value })} placeholder="Nombre y apellidos" className={`${input} ${errors.driver_name ? 'border-rose-400' : 'border-slate-200'}`} />
            {errors.driver_name && <span className="block text-xs text-rose-700">{errors.driver_name}</span>}
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-slate-700">
            <span>Capacidad de carga (toneladas)</span>
            <input value={form.capacity_tons} onChange={(e) => setForm({ ...form, capacity_tons: e.target.value })} placeholder="Por ejemplo, 8" inputMode="decimal" className={`${input} ${errors.capacity_tons ? 'border-rose-400' : 'border-slate-200'}`} />
            {errors.capacity_tons && <span className="block text-xs text-rose-700">{errors.capacity_tons}</span>}
          </label>
          <p className="text-xs text-slate-500">
            Para que salga a recoger, asígnelo a una zona desde la tabla de camiones o desde el Panel general. El recorrido empieza en la base de la flota.
          </p>
        </form>
      </SlideOver>
    </div>
  );
}

const Tile: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgba(15,23,42,0.06)] p-4">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="font-display text-2xl font-bold text-slate-900">{value}</p>
  </div>
);
