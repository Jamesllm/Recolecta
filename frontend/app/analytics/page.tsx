'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { GroupedBars } from '@/components/analytics/GroupedBars';
import { Analytics, AnalyticsKpis, STATUS_BADGE, STATUS_LABELS, analyticsService, errorMessage, formatTons } from '@/services/api';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Clock, FileText, Minus, RefreshCw, Users, Weight } from 'lucide-react';

// Colores de las series (paleta categórica validada para daltonismo)
const RECEIVED = '#2a78d6';
const RESOLVED = '#eb6834';
const PERIODS: Array<{ days: 7 | 30 | 90; label: string }> = [
  { days: 7, label: 'Últimos 7 días' },
  { days: 30, label: 'Últimos 30 días' },
  { days: 90, label: 'Últimos 90 días' },
];

const fmt = (n: number | null, digits = 1) => (n == null ? 'n/d' : n.toFixed(digits).replace('.', ','));
const formatHours = (h: number | null) => (h == null ? 'n/d' : h < 48 ? `${fmt(h)} h` : `${fmt(h / 24)} días`);

export default function AnalyticsPage() {
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  const load = async (d = days) => {
    try {
      setIsLoading(true);
      setError(null);
      setData(await analyticsService.get(d));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const maxCategory = Math.max(1, ...(data?.by_category.map((c) => c.received) ?? [1]));
  const maxZone = Math.max(1, ...(data?.zones.map((z) => z.open_count) ?? [1]));

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Análisis" subtitle="Indicadores del servicio de recolección por periodo, categoría y zona" />

      <div className="p-8 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Filtros: periodo */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1" role="tablist" aria-label="Periodo">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                role="tab"
                aria-selected={days === p.days}
                onClick={() => setDays(p.days)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${days === p.days ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => load()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Recargar</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {data && (
          <>
            {/* Indicadores principales (US-09) con variación frente al periodo anterior */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <Kpi icon={<FileText className="w-4 h-4" />} label="Reportes recibidos" value={String(data.kpis.received)} metric="received" data={data} />
              <Kpi icon={<Clock className="w-4 h-4" />} label="Tiempo medio de resolución" value={formatHours(data.kpis.avg_resolution_hours)} metric="avg_resolution_hours" data={data} lowerIsBetter />
              <Kpi icon={<Weight className="w-4 h-4" />} label="Toneladas recolectadas (estimadas)" value={formatTons(data.kpis.tons_collected)} metric="tons_collected" data={data} />
              <Kpi icon={<Users className="w-4 h-4" />} label="Vecinos participantes" value={String(data.kpis.participants)} metric="participants" data={data} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Serie temporal */}
              <section className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900">Reportes recibidos y atendidos</h3>
                    <p className="text-xs text-slate-500">{days === 90 ? 'Por semana' : 'Por día'} · {PERIODS.find((p) => p.days === days)?.label.toLowerCase()}</p>
                  </div>
                  <button onClick={() => setShowTable((v) => !v)} className="text-xs font-semibold text-emerald-700 cursor-pointer">
                    {showTable ? 'Ver gráfico' : 'Ver tabla'}
                  </button>
                </div>
                {showTable ? (
                  <div className="max-h-[260px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="text-slate-500 text-left">
                        <tr><th className="py-1.5">{days === 90 ? 'Semana' : 'Día'}</th><th className="text-right">Recibidos</th><th className="text-right">Atendidos</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {data.series.map((s) => (
                          <tr key={s.date}><td className="py-1.5">{s.label}</td><td className="text-right">{s.received}</td><td className="text-right">{s.resolved}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <GroupedBars
                    data={data.series}
                    unit="reportes"
                    series={[
                      { key: 'received', label: 'Recibidos', color: RECEIVED },
                      { key: 'resolved', label: 'Atendidos', color: RESOLVED },
                    ]}
                  />
                )}
              </section>

              {/* Cumplimiento y estados */}
              <section className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5">
                <div>
                  <h3 className="font-bold text-slate-900">Cumplimiento</h3>
                  <p className="text-xs text-slate-500">Reportes del periodo atendidos en {data.sla_hours} h o menos (sin contar los rechazados)</p>
                </div>
                <p className="text-4xl font-bold text-slate-900">{data.kpis.compliance_pct == null ? 'n/d' : `${fmt(data.kpis.compliance_pct)} %`}</p>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Estado actual de los reportes del periodo</p>
                  {data.by_status.map((s) => (
                    <div key={s.status} className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded-full border font-semibold ${STATUS_BADGE[s.status]}`}>{STATUS_LABELS[s.status]}</span>
                      <span className="font-semibold text-slate-800">{s.count}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Por categoría */}
              <section className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900">Reportes por categoría</h3>
                  <p className="text-xs text-slate-500">Recibidos en el periodo · atendidos y toneladas recolectadas</p>
                </div>
                <div className="space-y-3">
                  {data.by_category.map((c) => (
                    <div key={c.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{c.category}</span>
                        <span className="text-slate-500">
                          <b className="text-slate-900">{c.received}</b> recibidos · {c.resolved} atendidos · {formatTons(c.tons_collected)}
                        </span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(c.received / maxCategory) * 100}%`, background: RECEIVED }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Ranking de zonas */}
              <section className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900">Ranking de zonas</h3>
                  <p className="text-xs text-slate-500">Clústeres activos de K-Means con más reportes abiertos (pendientes o en ruta)</p>
                </div>
                {data.zones.length === 0 ? (
                  <p className="text-xs text-slate-500">No hay clústeres activos. Ejecute K-Means desde el panel general.</p>
                ) : (
                  <ol className="space-y-3">
                    {data.zones.map((z, i) => (
                      <li key={z.id} className="flex items-center gap-3 text-xs">
                        <span className="w-6 text-right font-bold text-slate-400">{i + 1}</span>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-800 truncate">{z.zone ?? 'Sin dirección'} <span className="text-slate-400 font-normal">· {z.code}</span></span>
                            <span className="text-slate-500 shrink-0"><b className="text-slate-900">{z.open_count}</b> abiertos · ≈ {formatTons(z.estimated_tons)}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-slate-500" style={{ width: `${(z.open_count / maxZone) * 100}%` }} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const Kpi: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  metric: keyof AnalyticsKpis;
  data: Analytics;
  lowerIsBetter?: boolean;
}> = ({ icon, label, value, metric, data }) => {
  const v = data.variation[metric];
  const Arrow = v == null || v === 0 ? Minus : v > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-2">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="flex items-center gap-1 text-xs text-slate-500">
        <Arrow className="w-3.5 h-3.5" />
        {v == null ? 'Sin datos del periodo anterior' : `${v > 0 ? '+' : ''}${fmt(v)} % frente al periodo anterior`}
      </p>
    </div>
  );
};
