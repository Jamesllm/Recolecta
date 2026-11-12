'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { FleetSummary, Truck, errorMessage, fieldErrors, fleetService, formatTons } from '@/services/api';
import { AlertCircle, CheckCircle2, Plus, RefreshCw, Trash2, Truck as TruckIcon, Wrench } from 'lucide-react';

const STATUS_TONE: Record<Truck['status'], string> = {
  available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  on_route: 'bg-blue-100 text-blue-700 border-blue-200',
  maintenance: 'bg-slate-200 text-slate-600 border-slate-300',
};

const EMPTY = { plate: '', driver_name: '', capacity_tons: '' };

export default function FleetPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [summary, setSummary] = useState<FleetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    try {
      setIsLoading(true);
      const res = await fleetService.list();
      setTrucks(res.data);
      setSummary(res.summary);
    } catch (err) {
      setNotice({ ok: false, text: errorMessage(err) });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
      setNotice({ ok: true, text });
      await load();
    } catch (err) {
      setErrors(fieldErrors(err));
      setNotice({ ok: false, text: errorMessage(err) });
    } finally {
      setIsSaving(false);
    }
  };

  const input = 'w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20';

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Flota de recogida" subtitle="Camiones, conductores, capacidad usada y ruta asignada" />

      <div className="p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Tile label="Camiones" value={String(summary.total)} />
            <Tile label="Disponibles" value={String(summary.available)} />
            <Tile label="En ruta" value={String(summary.on_route)} />
            <Tile label="En mantenimiento" value={String(summary.maintenance)} />
            <Tile label="Capacidad total" value={`${String(summary.capacity_tons).replace('.', ',')} t`} />
          </div>
        )}

        {notice && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium ${notice.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
            {notice.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span className="flex-1">{notice.text}</span>
            <button onClick={() => setNotice(null)} className="text-xs font-semibold underline cursor-pointer">Cerrar</button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          {/* Registrar camión */}
          <form onSubmit={create} className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-600" /> Registrar camión</h3>
            <label className="block space-y-1 text-xs text-slate-600">
              <span>Placa</span>
              <input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })} placeholder="ABC-123" className={`${input} ${errors.plate ? 'border-rose-300' : 'border-slate-200'}`} />
              {errors.plate && <span className="text-rose-600">{errors.plate}</span>}
            </label>
            <label className="block space-y-1 text-xs text-slate-600">
              <span>Conductor (opcional)</span>
              <input value={form.driver_name} onChange={(e) => setForm({ ...form, driver_name: e.target.value })} placeholder="Nombre y apellidos" className={`${input} ${errors.driver_name ? 'border-rose-300' : 'border-slate-200'}`} />
              {errors.driver_name && <span className="text-rose-600">{errors.driver_name}</span>}
            </label>
            <label className="block space-y-1 text-xs text-slate-600">
              <span>Capacidad (toneladas)</span>
              <input value={form.capacity_tons} onChange={(e) => setForm({ ...form, capacity_tons: e.target.value })} placeholder="8" inputMode="decimal" className={`${input} ${errors.capacity_tons ? 'border-rose-300' : 'border-slate-200'}`} />
              {errors.capacity_tons && <span className="text-rose-600">{errors.capacity_tons}</span>}
            </label>
            <button type="submit" disabled={isSaving || !form.plate || !form.capacity_tons} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold rounded-xl text-xs cursor-pointer">
              {isSaving ? 'Guardando…' : 'Registrar camión'}
            </button>
            <p className="text-[11px] text-slate-400">La ruta se asigna desde <Link href="/routes" className="text-emerald-700 font-semibold">Rutas con IA</Link>, eligiendo el camión en el clúster.</p>
          </form>

          {/* Camiones */}
          <section className="xl:col-span-3 bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Camiones</h3>
              <button onClick={load} disabled={isLoading} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer">
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} /> Recargar
              </button>
            </div>
            {trucks.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <TruckIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-800">{isLoading ? 'Cargando…' : 'Aún no hay camiones registrados'}</p>
                {!isLoading && <p className="text-xs text-slate-500">Registre los camiones de la municipalidad para asignarlos a las rutas.</p>}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 pl-6 pr-3">Placa</th>
                      <th className="py-3 px-3">Conductor</th>
                      <th className="py-3 px-3">Estado</th>
                      <th className="py-3 px-3">Ruta asignada</th>
                      <th className="py-3 px-3 w-48">Capacidad usada</th>
                      <th className="py-3 pr-6 pl-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {trucks.map((t) => (
                      <tr key={t.id}>
                        <td className="py-3 pl-6 pr-3 font-mono font-bold text-slate-900 whitespace-nowrap">{t.plate}</td>
                        <td className="py-3 px-3">{t.driver_name ?? <span className="text-slate-400">Sin asignar</span>}</td>
                        <td className="py-3 px-3 whitespace-nowrap"><span className={`px-2 py-0.5 rounded-full border font-semibold text-[11px] ${STATUS_TONE[t.status]}`}>{t.status_label}</span></td>
                        <td className="py-3 px-3">
                          {t.cluster_code ? (
                            <Link href={`/routes?cluster=${t.cluster_id}`} className="text-emerald-700 font-semibold">
                              {t.cluster_code}{t.zone ? ` · ${t.zone}` : ''}{!t.cluster_active ? ' (clúster ya no activo)' : ''}
                            </Link>
                          ) : <span className="text-slate-400">—</span>}
                          {t.cluster_code && <p className="text-[11px] text-slate-400">{t.stops} paradas · ≈ {formatTons(t.load_tons)}</p>}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${t.capacity_used_pct > 100 ? 'bg-rose-500' : 'bg-blue-600'}`} style={{ width: `${Math.min(100, t.capacity_used_pct)}%` }} />
                            </div>
                            <span className="w-28 text-right whitespace-nowrap">{t.capacity_used_pct} % de {String(t.capacity_tons).replace('.', ',')} t</span>
                          </div>
                          {t.capacity_used_pct > 100 && <p className="text-[11px] text-rose-600">Supera la capacidad: requiere más de un viaje.</p>}
                        </td>
                        <td className="py-3 pr-6 pl-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {t.status === 'on_route' && (
                              <button onClick={() => run(() => fleetService.release(t.id))} className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold cursor-pointer">Liberar</button>
                            )}
                            {t.status !== 'maintenance' ? (
                              <button onClick={() => run(() => fleetService.update(t.id, { status: 'maintenance' }))} title="Pasar a mantenimiento" className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"><Wrench className="w-3.5 h-3.5" /></button>
                            ) : (
                              <button onClick={() => run(() => fleetService.update(t.id, { status: 'available' }))} className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold cursor-pointer">Disponible</button>
                            )}
                            <button
                              onClick={() => window.confirm(`¿Eliminar el camión ${t.plate}?`) && run(() => fleetService.remove(t.id))}
                              title="Eliminar"
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      </div>
    </div>
  );
}

const Tile: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 p-4">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);
