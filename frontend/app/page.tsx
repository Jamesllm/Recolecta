'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DynamicHomeMap, MapFocus } from '@/components/maps/DynamicHomeMap';
import { RouteCard } from '@/components/dashboard/RouteCard';
import { useLiveTrucks } from '@/lib/useLiveTrucks';
import {
  Cluster,
  DaySummary,
  Incident,
  LiveTruck,
  RoadRoute,
  STATUS_BADGE,
  formatClock,
  formatKm,
  STATUS_LABELS,
  clusterPriority,
  clusterService,
  errorMessage,
  formatTons,
  incidentService,
} from '@/services/api';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Minimize2, MonitorPlay, RefreshCw, Search, Sparkles } from 'lucide-react';

const K_OPTIONS: Array<number | 'auto'> = ['auto', 2, 3, 4, 5, 6, 7, 8];
const PRIORITY_TONE = { Alta: 'bg-rose-100 text-rose-800', Media: 'bg-amber-100 text-amber-800', Baja: 'bg-emerald-100 text-emerald-800' } as const;
const URGENCY_DOT = { high: 'bg-red-600', medium: 'bg-amber-600', low: 'bg-emerald-600' } as const;

const timeAgo = (iso: string) => {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  return h < 24 ? `hace ${h} h` : `hace ${Math.round(h / 24)} d`;
};

/** Panel general «Mapa primero»: el mapa ocupa la pantalla y las herramientas flotan encima */
export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [route, setRoute] = useState<RoadRoute | null>(null);
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'zones' | 'recent'>('zones');
  const [sheetOpen, setSheetOpen] = useState(true);
  const [k, setK] = useState<number | 'auto'>('auto');
  const [isRunning, setIsRunning] = useState(false);
  const liveTrucks = useLiveTrucks(3000);
  const [kiosk, setKiosk] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  // Modo kiosko: se abre con ?kiosko=1 (útil para una pantalla fija en la central)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('kiosko') === '1') setKiosk(true);
  }, []);

  useEffect(() => {
    if (kiosk) document.body.dataset.kiosk = '1';
    else delete document.body.dataset.kiosk;
    const url = new URL(window.location.href);
    if (kiosk) url.searchParams.set('kiosko', '1');
    else url.searchParams.delete('kiosko');
    window.history.replaceState(window.history.state, '', url);
    if (!kiosk) return;
    setNow(new Date());
    const clock = setInterval(() => setNow(new Date()), 15000);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setKiosk(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearInterval(clock);
      window.removeEventListener('keydown', onKey);
      delete document.body.dataset.kiosk;
    };
  }, [kiosk]);

  const enterKiosk = () => {
    setKiosk(true);
    document.documentElement.requestFullscreen?.().catch(() => undefined);
  };
  const exitKiosk = () => {
    setKiosk(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
  };

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [data, groups, day] = await Promise.all([incidentService.getIncidents(), clusterService.getClusters(), incidentService.getSummary()]);
      setIncidents(data.filter((i) => i.status !== 'rejected'));
      setClusters(groups);
      setSummary(day);
      // Por defecto se muestra la ruta de la zona con más reportes
      setSelectedId((cur) => (groups.some((g) => g.id === cur) ? cur : groups[0]?.id ?? null));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 45000);
    return () => clearInterval(interval);
  }, [load]);

  // Cuando un camión recoge una parada, los indicadores y las zonas se actualizan
  const collectedKey = liveTrucks.map((t) => `${t.id}:${t.stops_collected}:${t.state}`).join(',');
  useEffect(() => {
    if (collectedKey) load();
  }, [collectedKey, load]);

  const selected = clusters.find((c) => c.id === selectedId) ?? null;
  const routeKey = selected ? `${selected.id}:${selected.incidents.map((i) => `${i.id}${i.status}`).join(',')}` : '';
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setRoute(null);
    clusterService.getRoute(selected.id).then((r) => !cancelled && setRoute(r)).catch(() => !cancelled && setRoute(null));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  // Búsqueda: zonas y reportes por código, dirección o categoría
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const zones = clusters
      .filter((c) => c.code.toLowerCase().includes(q) || (c.zone ?? '').toLowerCase().includes(q))
      .map((c) => ({ key: `z${c.id}`, title: `Zona ${c.code}`, detail: `${c.incident_count} reportes · ${c.zone ?? ''}`, pick: () => setSelectedId(c.id) }));
    const reports = incidents
      .filter((i) => i.code.toLowerCase().includes(q) || (i.address ?? '').toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
      .map((i) => ({ key: `r${i.id}`, title: `#${i.code} · ${i.category}`, detail: `${STATUS_LABELS[i.status]} · ${i.address ?? ''}`, pick: () => setFocus({ latitude: i.latitude, longitude: i.longitude, key: `${i.id}-${Date.now()}` }) }));
    return [...zones, ...reports].slice(0, 7);
  }, [query, clusters, incidents]);

  const optimize = async () => {
    try {
      setIsRunning(true);
      setNotice(null);
      setError(null);
      setNotice(await clusterService.run(k));
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsRunning(false);
    }
  };

  const maxCount = Math.max(1, ...clusters.map((c) => c.incident_count));
  const recent = incidents.slice(0, 10);
  const pendingCount = summary?.pending ?? 0;
  const onRoute = liveTrucks.filter((t) => t.state !== 'done').length;
  const pickTruck = (t: LiveTruck) => {
    if (t.cluster_id) setSelectedId(t.cluster_id);
    setFocus({ latitude: t.position[0], longitude: t.position[1], key: `truck-${t.id}-${Date.now()}`, zoom: 16 });
  };

  const map = <DynamicHomeMap incidents={incidents} clusters={clusters} selectedId={selectedId} onSelect={setSelectedId} route={route} focus={focus} trucks={liveTrucks} kiosk={kiosk} />;

  // Modo kiosko: el mapa a pantalla completa con lo justo (hora, 4 indicadores, camiones en ruta y leyenda)
  if (kiosk) {
    return (
      <div className="fixed inset-0">
        {map}
        <div className="pointer-events-none absolute inset-0 z-[1000] flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="pointer-events-auto h-[52px] pl-2 pr-5 bg-white rounded-full shadow-[0_8px_30px_rgba(15,23,42,0.12)] flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" width={38} height={38} className="w-[38px] h-[38px] object-contain" />
              <span className="leading-tight">
                <b className="block font-display text-[15px] text-slate-900">Recolecta+</b>
                <span className="block text-[11px] text-slate-500">Monitoreo en vivo</span>
              </span>
              <span className="w-px h-7 bg-slate-200" aria-hidden="true" />
              <b className="font-display text-xl text-slate-900 tabular-nums">{now ? now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</b>
            </div>
            <Chip value={summary ? String(summary.open) : '…'} label="abiertos" />
            <Chip value={summary ? String(summary.critical_unassigned) : '…'} label="críticos sin asignar" tone="danger" />
            <Chip value={String(onRoute)} label={onRoute === 1 ? 'camión en ruta' : 'camiones en ruta'} tone="live" />
            <Chip value={summary ? formatTons(summary.tons_collected_today) : '…'} label="recolectado hoy" />
            <button
              type="button"
              onClick={exitKiosk}
              title="Salir del modo kiosko (Esc)"
              className="pointer-events-auto ml-auto h-11 px-4 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Minimize2 className="w-4 h-4" aria-hidden="true" /> Salir
            </button>
          </div>

          {error && (
            <div className="pointer-events-auto self-start max-w-xl flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium shadow-lg bg-rose-50 text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="pointer-events-auto self-start">
            <LiveTrucksCard trucks={liveTrucks} selectedClusterId={null} onPick={pickTruck} kiosk />
          </div>

          <div className="pointer-events-auto mt-auto self-end">
            <MapLegend />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0">
      {map}

      {/* Capas flotantes */}
      <div className="pointer-events-none absolute inset-0 z-[1000] flex flex-col gap-4 p-4 pl-[120px]">
        {/* Búsqueda e indicadores */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="pointer-events-auto relative flex-1 min-w-[260px] max-w-[420px]">
            <label className="flex items-center gap-2.5 h-[52px] px-5 bg-white rounded-full shadow-[0_8px_30px_rgba(15,23,42,0.12)] text-slate-500">
              <Search className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
              <span className="sr-only">Buscar</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar reporte, zona o dirección"
                className="flex-1 bg-transparent outline-none text-[15px] text-slate-900 placeholder:text-slate-500"
              />
            </label>
            {results.length > 0 && (
              <ul className="absolute left-0 right-0 top-[58px] bg-white rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.18)] py-2 max-h-80 overflow-y-auto">
                {results.map((r) => (
                  <li key={r.key}>
                    <button
                      type="button"
                      onClick={() => {
                        r.pick();
                        setQuery('');
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="block text-sm font-semibold text-slate-900">{r.title}</span>
                      <span className="block text-xs text-slate-500 truncate">{r.detail}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Chip value={summary ? String(summary.open) : '…'} label="abiertos" />
          <Chip value={summary ? String(summary.critical_unassigned) : '…'} label="críticos sin asignar" tone="danger" />
          <Chip value={summary ? String(summary.active_routes) : '…'} label="rutas activas" />
          <Chip value={summary ? formatTons(summary.tons_collected_today) : '…'} label="recolectado hoy" />
          <Chip value={String(onRoute)} label={onRoute === 1 ? 'camión en ruta' : 'camiones en ruta'} tone="live" />
          <button
            type="button"
            onClick={load}
            aria-label="Actualizar datos"
            title="Actualizar datos"
            className="pointer-events-auto w-11 h-11 rounded-full bg-white shadow-[0_8px_30px_rgba(15,23,42,0.10)] flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-700' : ''}`} />
          </button>
          <button
            type="button"
            onClick={enterKiosk}
            title="Mapa a pantalla completa con lo esencial, para una pantalla fija"
            className="pointer-events-auto h-11 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center gap-2 shadow-[0_8px_30px_rgba(15,23,42,0.18)] cursor-pointer"
          >
            <MonitorPlay className="w-4 h-4" aria-hidden="true" /> Modo kiosko
          </button>
        </div>

        {(error || notice) && (
          <div className={`pointer-events-auto self-start max-w-xl flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium shadow-lg ${error ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-900'}`}>
            {error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span className="flex-1">{error ?? notice}</span>
            <button type="button" onClick={() => (error ? setError(null) : setNotice(null))} className="text-xs font-semibold underline cursor-pointer">Cerrar</button>
          </div>
        )}

        {/* Camiones en vivo (izquierda) y tarjeta de ruta (derecha) */}
        <div className="flex-1 min-h-0 flex justify-between items-start gap-4">
          <div className="pointer-events-auto">
            <LiveTrucksCard
              trucks={liveTrucks}
              selectedClusterId={selectedId}
              onPick={pickTruck}
            />
          </div>
          {selected && (
            <div className="pointer-events-auto max-h-full overflow-y-auto rounded-[20px]">
              <RouteCard
                cluster={selected}
                route={route}
                liveTruck={liveTrucks.find((t) => t.cluster_id === selected.id && t.state !== 'done') ?? null}
                onAssigned={load}
              />
            </div>
          )}
        </div>

        {/* Hoja inferior */}
        <section aria-label="Zonas e incidentes" className="pointer-events-auto bg-white rounded-[20px] shadow-[0_-4px_30px_rgba(15,23,42,0.10)] px-5 py-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div role="tablist" aria-label="Contenido de la hoja" className="flex gap-1 bg-slate-100 rounded-full p-1">
              <button role="tab" aria-selected={tab === 'zones'} type="button" onClick={() => { setTab('zones'); setSheetOpen(true); }} className={`px-4 h-9 rounded-full text-sm font-semibold cursor-pointer ${tab === 'zones' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}>
                Zonas prioritarias <span className="text-slate-500 font-medium">{clusters.length}</span>
              </button>
              <button role="tab" aria-selected={tab === 'recent'} type="button" onClick={() => { setTab('recent'); setSheetOpen(true); }} className={`px-4 h-9 rounded-full text-sm font-semibold cursor-pointer ${tab === 'recent' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}>
                Incidentes recientes
              </button>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-slate-600">
                Zonas (K)
                <select value={k} onChange={(e) => setK(e.target.value === 'auto' ? 'auto' : Number(e.target.value))} className="h-10 px-2 border border-slate-200 rounded-full bg-white text-sm font-semibold text-slate-800">
                  {K_OPTIONS.map((n) => <option key={n} value={n}>{n === 'auto' ? 'Automático (IA)' : n}</option>)}
                </select>
              </label>
              <button
                type="button"
                onClick={optimize}
                disabled={isRunning || pendingCount === 0}
                title={pendingCount === 0 ? 'No hay reportes pendientes para agrupar' : `Agrupa los ${pendingCount} reportes pendientes con K-Means`}
                className="h-10 px-4 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                {isRunning ? 'Agrupando…' : 'Optimizar rutas con IA'}
              </button>
              <button type="button" onClick={() => setSheetOpen((v) => !v)} aria-label={sheetOpen ? 'Contraer la hoja' : 'Expandir la hoja'} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer">
                {sheetOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {sheetOpen && tab === 'zones' && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {clusters.length === 0 && <p className="text-sm text-slate-500 py-3">Aún no hay zonas: use «Optimizar rutas con IA» para agrupar los reportes pendientes.</p>}
              {clusters.map((c) => {
                const level = clusterPriority(c.incident_count, maxCount);
                const active = c.id === selectedId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    aria-pressed={active}
                    className={`shrink-0 w-[210px] text-left rounded-2xl p-3 cursor-pointer transition-colors ${active ? 'border-2 border-emerald-700 bg-emerald-50/40' : 'border border-slate-200 hover:bg-slate-50'}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <b className="font-display text-[15px] text-slate-900">Zona {c.code}</b>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_TONE[level]}`}>{level}</span>
                    </span>
                    <span className="block text-xs text-slate-500 truncate mt-0.5">{c.zone ?? 'Sin dirección'}</span>
                    <span className="block text-[13px] text-slate-700 mt-1.5">{c.incident_count} reportes · ≈ {formatTons(c.estimated_tons)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {sheetOpen && tab === 'recent' && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {recent.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => setFocus({ latitude: i.latitude, longitude: i.longitude, key: `${i.id}-${Date.now()}` })}
                  className="shrink-0 w-[230px] text-left rounded-2xl p-3 border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  <span className="flex items-center justify-between gap-2">
                    <b className="text-sm text-slate-900 flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${URGENCY_DOT[i.urgency]}`} aria-hidden="true" />#{i.code}</b>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[i.status]}`}>{STATUS_LABELS[i.status]}</span>
                  </span>
                  <span className="block text-[13px] text-slate-700 mt-1">{i.category} · {timeAgo(i.created_at)}</span>
                  <span className="block text-xs text-slate-500 truncate">{i.address ?? 'Sin dirección'}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const Chip: React.FC<{ value: string; label: string; tone?: 'danger' | 'live' }> = ({ value, label, tone }) => (
  <span className={`pointer-events-auto h-11 px-4 rounded-full flex items-center gap-2 text-sm shadow-[0_8px_30px_rgba(15,23,42,0.10)] whitespace-nowrap ${tone === 'danger' ? 'bg-rose-50 text-rose-900' : tone === 'live' ? 'bg-blue-50 text-blue-900' : 'bg-white text-slate-700'}`}>
    {tone === 'live' && <span className="w-2 h-2 rounded-full bg-blue-700 animate-pulse" aria-hidden="true" />}
    <b className="font-display text-lg text-slate-900" style={tone === 'danger' ? { color: '#9f1239' } : tone === 'live' ? { color: '#1e3a8a' } : undefined}>{value}</b>
    {label}
  </span>
);

/** Tarjeta flotante «En ruta ahora»: camiones con recorrido en vivo; al tocar uno, el mapa va hacia él */
const LiveTrucksCard: React.FC<{ trucks: LiveTruck[]; selectedClusterId: number | null; onPick: (t: LiveTruck) => void; kiosk?: boolean }> = ({ trucks, selectedClusterId, onPick, kiosk = false }) => {
  const active = trucks.filter((t) => t.state !== 'done');
  if (!active.length && !kiosk) return null;
  return (
    <section aria-label="Camiones en ruta" className={`w-[290px] bg-white rounded-[20px] shadow-[0_12px_40px_rgba(15,23,42,0.16)] p-4 flex flex-col gap-2.5 overflow-y-auto ${kiosk ? 'max-h-[calc(100vh-260px)]' : 'max-h-[calc(100vh-480px)] min-h-[120px]'}`}>
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <span className="w-2 h-2 rounded-full bg-blue-700 animate-pulse" aria-hidden="true" /> En ruta ahora
      </p>
      {!active.length && <p className="text-sm text-slate-500">No hay camiones en ruta en este momento.</p>}
      {active.map((t) => {
        const pct = t.length_m ? Math.min(100, (t.progress_m / t.length_m) * 100) : 100;
        const selected = t.cluster_id === selectedClusterId;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onPick(t)}
            aria-pressed={selected}
            className={`text-left rounded-2xl p-3 cursor-pointer ${selected ? 'border-2 border-blue-700 bg-blue-50/40' : 'border border-slate-200 hover:bg-slate-50'}`}
          >
            <span className="flex items-center justify-between gap-2">
              <b className="font-display text-[15px] text-slate-900">{t.plate}</b>
              <span className="text-[11px] font-semibold text-blue-900">{t.state === 'collecting' ? 'Recogiendo' : 'En camino'}{t.cluster_code ? ` · ${t.cluster_code}` : ''}</span>
            </span>
            <span className="block h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <span className="block h-full bg-blue-700 rounded-full" style={{ width: `${pct}%` }} />
            </span>
            <span className="flex items-center justify-between gap-2 text-xs text-slate-600 mt-1.5">
              <span>{formatKm(t.progress_m)} de {formatKm(t.length_m)}</span>
              <b className={t.current_speed_kmh ? 'text-blue-900' : 'text-amber-800'}>{t.current_speed_kmh} km/h</b>
            </span>
            <span className="block text-xs text-slate-600">{t.stops_collected}/{t.stops_total} paradas · salió de {t.origin.label}</span>
            {t.next_stop && <span className="block text-xs text-slate-600">Próxima #{t.next_stop.code} a las {formatClock(t.eta_next)}</span>}
          </button>
        );
      })}
    </section>
  );
};

/** Leyenda compacta del modo kiosko */
const MapLegend: React.FC = () => (
  <section aria-label="Leyenda del mapa" className="bg-white/95 rounded-[18px] shadow-[0_12px_40px_rgba(15,23,42,0.16)] px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-700">
    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600" aria-hidden="true" />Urgencia alta</span>
    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600" aria-hidden="true" />Media</span>
    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" aria-hidden="true" />Baja</span>
    <span className="w-px h-4 bg-slate-200" aria-hidden="true" />
    <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-blue-700 border-2 border-white shadow" aria-hidden="true" />Camión</span>
    <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-white border-2 border-blue-700 text-[8px] font-bold text-blue-700 flex items-center justify-center" aria-hidden="true">1</span>Parada</span>
    <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow" aria-hidden="true" />Recogida</span>
    <span className="flex items-center gap-1.5"><span className="w-5 h-1 rounded-full bg-blue-700" aria-hidden="true" />Por recorrer</span>
    <span className="flex items-center gap-1.5"><span className="w-5 h-1 rounded-full bg-slate-400" aria-hidden="true" />Recorrido</span>
  </section>
);
