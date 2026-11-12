/**
 * Recorrido simulado de los camiones en tiempo real (Flota A6 y panel general)
 * Módulo: src/services/fleetSimulator.js
 *
 * Al asignar un camión a una ruta se arma su recorrido por calles (OSRM) desde la base de la flota.
 * Cada 2 segundos el camión avanza a 25 km/h por la geometría; en cada parada se detiene 3 minutos
 * y el reporte pasa a «Resuelto» (el vecino recibe su aviso). Al terminar, el camión queda disponible.
 * El avance se guarda en trucks.trip, así todos los que abren el panel ven la misma posición.
 */

const { query } = require('../config/db');
const { roadRoute, distanceM } = require('./roadRoute');
const { changeStatus, reportCode } = require('./reportStatus');
const { getSettings } = require('./settings');

const SPEED_KMH = 25;
const SPEED_MS = (SPEED_KMH * 1000) / 3600;
const DWELL_S = 180; // tiempo de carga en cada parada
const TICK_MS = 2000;

/** Distancia acumulada en metros en cada punto de la geometría. */
const cumulative = (geometry) => {
  const cum = [0];
  for (let i = 1; i < geometry.length; i++) {
    const [aLat, aLng] = geometry[i - 1];
    const [bLat, bLng] = geometry[i];
    cum.push(cum[i - 1] + distanceM({ latitude: aLat, longitude: aLng }, { latitude: bLat, longitude: bLng }));
  }
  return cum;
};

/** Índice del tramo de la geometría que contiene la distancia m. */
const segmentAt = (cum, m) => {
  let lo = 0;
  let hi = cum.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= m) lo = mid;
    else hi = mid;
  }
  return lo;
};

/** Posición [lat, lng] y rumbo (grados) a la distancia m del recorrido. */
const pointAt = (trip, m) => {
  const { geometry, cum } = trip;
  if (geometry.length === 1) return { position: geometry[0], heading: 0, index: 0 };
  const i = segmentAt(cum, Math.min(m, trip.length_m));
  const [aLat, aLng] = geometry[i];
  const [bLat, bLng] = geometry[Math.min(i + 1, geometry.length - 1)];
  const span = cum[i + 1] - cum[i] || 1;
  const t = Math.max(0, Math.min(1, (m - cum[i]) / span));
  const heading = (Math.atan2((bLng - aLng) * Math.cos((aLat * Math.PI) / 180), bLat - aLat) * 180) / Math.PI;
  return { position: [aLat + (bLat - aLat) * t, aLng + (bLng - aLng) * t], heading, index: i };
};

/**
 * Arma el recorrido de un camión para un clúster: sale de la base de la flota (o de la primera parada
 * si no hay base) y visita los reportes pendientes o en ruta del clúster.
 */
const buildTrip = async (clusterId) => {
  const cluster = await query('SELECT ST_Y(centroid) AS latitude, ST_X(centroid) AS longitude FROM clusters WHERE id = $1', [clusterId]);
  const stops = await query(
    `SELECT id, category, estimated_size, address, ST_Y(location) AS latitude, ST_X(location) AS longitude
       FROM incidents WHERE cluster_id = $1 AND status IN ('pending', 'assigned') ORDER BY id`,
    [clusterId]
  );
  if (!stops.rowCount) return null;
  const base = (await getSettings()).fleet_base;
  const route = await roadRoute(cluster.rows[0], stops.rows, base ? { origin: base } : {});
  const geometry = route.geometry.length ? route.geometry : [[route.stops[0].latitude, route.stops[0].longitude]];
  const cum = cumulative(geometry);
  const length = cum[cum.length - 1];

  // Ubicación de cada parada sobre la geometría, a partir de la distancia de cada tramo
  const legTotal = route.leg_m.reduce((s, d) => s + d, 0) || 1;
  const scale = length / legTotal;
  let acc = 0;
  const atM = route.stops.map((_, k) => {
    if (base) acc += route.leg_m[k] ?? 0;
    else if (k > 0) acc += route.leg_m[k - 1] ?? 0;
    return Math.min(length, acc * scale);
  });

  const now = Date.now();
  return {
    origin: base
      ? { latitude: base.latitude, longitude: base.longitude, label: base.label || 'Base de la flota', is_base: true }
      : { latitude: route.stops[0].latitude, longitude: route.stops[0].longitude, label: 'Primera parada', is_base: false },
    road: route.road,
    geometry,
    cum,
    length_m: length,
    stops: route.stops.map((s, k) => ({
      id: s.id,
      code: reportCode(s.id),
      category: s.category,
      address: s.address,
      latitude: s.latitude,
      longitude: s.longitude,
      at_m: atM[k],
      collected_at: null,
      skipped: false,
    })),
    started_at: new Date(now).toISOString(),
    progress_m: 0,
    last_tick: now,
    dwell_until: 0,
    state: 'driving',
    finished_at: null,
  };
};

/** Avanza el recorrido hasta `now`. Devuelve los reportes a los que llegó el camión. */
const advance = async (trip, now) => {
  let clock = trip.last_tick;
  const arrived = [];
  while (clock < now && trip.state !== 'done') {
    if (trip.dwell_until > clock) {
      clock = Math.min(now, trip.dwell_until);
      if (clock < trip.dwell_until) break;
      trip.state = 'driving';
      continue;
    }
    const next = trip.stops.find((s) => !s.collected_at && !s.skipped);
    const target = next ? next.at_m : trip.length_m;
    const dist = Math.max(0, target - trip.progress_m);
    const canMove = ((now - clock) / 1000) * SPEED_MS;
    if (canMove < dist) {
      trip.progress_m += canMove;
      clock = now;
      break;
    }
    trip.progress_m = target;
    clock += (dist / SPEED_MS) * 1000;
    if (!next) {
      trip.state = 'done';
      trip.finished_at = new Date(clock).toISOString();
      break;
    }
    // Solo se recoge si el reporte sigue abierto (pudo resolverse o rechazarse a mano)
    const open = await query("SELECT 1 FROM incidents WHERE id = $1 AND status IN ('pending', 'assigned')", [next.id]);
    if (open.rowCount) {
      next.collected_at = new Date(clock).toISOString();
      trip.dwell_until = clock + DWELL_S * 1000;
      trip.state = 'collecting';
      arrived.push(next.id);
    } else {
      next.skipped = true;
    }
  }
  trip.last_tick = now;
  return arrived;
};

let running = false;
const tick = async () => {
  if (running) return;
  running = true;
  try {
    const trucks = await query("SELECT id, trip FROM trucks WHERE status = 'on_route' AND trip IS NOT NULL AND trip->>'state' <> 'done'");
    const now = Date.now();
    for (const t of trucks.rows) {
      const trip = t.trip;
      const arrived = await advance(trip, now);
      if (arrived.length) await changeStatus(arrived, 'resolved');
      if (trip.state === 'done') {
        // Ruta completada: el camión queda disponible y se guarda el último recorrido para mostrarlo
        await query("UPDATE trucks SET trip = $2, status = 'available', cluster_id = NULL, updated_at = NOW() WHERE id = $1", [t.id, trip]);
      } else {
        await query('UPDATE trucks SET trip = $2 WHERE id = $1', [t.id, trip]);
      }
    }
  } catch (error) {
    console.error('[Simulación de flota]:', error.message);
  } finally {
    running = false;
  }
};

let timer = null;
const start = () => {
  if (!timer) timer = setInterval(tick, TICK_MS);
};
const stop = () => {
  clearInterval(timer);
  timer = null;
};

/** Estado en vivo de un recorrido: posición, tramo recorrido y por recorrer, próxima parada y llegada estimada. */
const liveView = (trip, now = Date.now()) => {
  const { position, heading, index } = pointAt(trip, trip.progress_m);
  const pending = trip.stops.filter((s) => !s.collected_at && !s.skipped);
  const next = pending[0] ?? null;
  const dwellLeft = Math.max(0, (trip.dwell_until - now) / 1000);
  const toNext = next ? Math.max(0, next.at_m - trip.progress_m) / SPEED_MS + dwellLeft : null;
  const toEnd = Math.max(0, trip.length_m - trip.progress_m) / SPEED_MS + pending.length * DWELL_S + dwellLeft;
  return {
    state: trip.state,
    road: trip.road,
    origin: trip.origin,
    position,
    heading,
    traveled: [...trip.geometry.slice(0, index + 1), position],
    remaining: trip.state === 'done' ? [] : [position, ...trip.geometry.slice(index + 1)],
    progress_m: trip.progress_m,
    length_m: trip.length_m,
    stops_total: trip.stops.length,
    stops_collected: trip.stops.filter((s) => s.collected_at).length,
    // Todas las paradas en orden de visita: recogida, saltada (ya no estaba abierta) o pendiente
    stops: trip.stops.map((s, k) => ({
      id: s.id,
      code: s.code,
      order: k + 1,
      category: s.category,
      latitude: s.latitude,
      longitude: s.longitude,
      state: s.collected_at ? 'collected' : s.skipped ? 'skipped' : 'pending',
      collected_at: s.collected_at,
    })),
    next_stop: next && { id: next.id, code: next.code, category: next.category, address: next.address, latitude: next.latitude, longitude: next.longitude },
    eta_next: toNext != null ? new Date(now + toNext * 1000).toISOString() : null,
    eta_end: trip.state === 'done' ? trip.finished_at : new Date(now + toEnd * 1000).toISOString(),
    started_at: trip.started_at,
    finished_at: trip.finished_at,
    speed_kmh: SPEED_KMH,
    // Velocidad en este momento: detenido mientras carga en una parada o al terminar
    current_speed_kmh: trip.state === 'driving' ? SPEED_KMH : 0,
    dwell_min: DWELL_S / 60,
  };
};

module.exports = { start, stop, tick, buildTrip, liveView, SPEED_KMH, DWELL_S };
