/**
 * Ruta de recolección por calles y avenidas (pantalla A5 · Rutas con IA)
 * Módulo: src/services/roadRoute.js
 *
 * Usa OSRM (Open Source Routing Machine) sobre OpenStreetMap:
 * - Hasta 100 paradas: servicio «trip», que ordena las paradas por distancia real en calles (problema del viajante),
 *   empezando en la parada más cercana al centroide y terminando en la más lejana de ella.
 * - Más paradas: orden del vecino más cercano y servicio «route» para trazar el recorrido por calles.
 * Si OSRM no responde, devuelve el orden del vecino más cercano en línea recta (road: false).
 *
 * OSRM_URL permite usar un servidor propio; por defecto se usa el servidor público de demostración.
 */

const OSRM_URL = (process.env.OSRM_URL || 'https://router.project-osrm.org').replace(/\/$/, '');
const TRIP_MAX = 100;
const ROUTE_MAX = 400;
const TIMEOUT_MS = 12000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

/** Distancia en metros entre dos puntos (fórmula del semiverseno). */
const distanceM = (a, b) => {
  const R = 6371000;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/** Orden del vecino más cercano a partir del punto de inicio. */
const nearestNeighbor = (start, stops) => {
  const pending = [...stops];
  const ordered = [];
  let from = start;
  while (pending.length) {
    let best = 0;
    for (let i = 1; i < pending.length; i++) if (distanceM(from, pending[i]) < distanceM(from, pending[best])) best = i;
    const [next] = pending.splice(best, 1);
    ordered.push(next);
    from = next;
  }
  return ordered;
};

const coordsOf = (stops) => stops.map((s) => `${s.longitude.toFixed(6)},${s.latitude.toFixed(6)}`).join(';');

const osrm = async (path) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${OSRM_URL}${path}`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'RecolectaPlus/1.0 (proyecto universitario)' },
    });
    const body = await res.json();
    if (!res.ok || body.code !== 'Ok') throw new Error(body.message || body.code || `HTTP ${res.status}`);
    return body;
  } finally {
    clearTimeout(timer);
  }
};

const straightLine = (ordered) => ({
  road: false,
  stops: ordered,
  geometry: ordered.map((s) => [s.latitude, s.longitude]),
  distance_m: ordered.reduce((sum, s, i) => (i ? sum + distanceM(ordered[i - 1], s) : 0), 0),
  duration_s: null,
});

/**
 * Calcula la ruta que recorre las paradas empezando por la más cercana al centroide del clúster.
 * @param {{ latitude: number, longitude: number }} centroid
 * @param {Array<{ id: number, latitude: number, longitude: number }>} stops
 * @returns {Promise<{ road: boolean, stops: object[], geometry: [number, number][], distance_m: number, duration_s: number|null, warning?: string }>}
 */
const roadRoute = async (centroid, stops) => {
  if (stops.length === 0) return { road: true, stops: [], geometry: [], distance_m: 0, duration_s: 0 };
  // Primera parada: la más cercana al centroide; el resto, en el orden que proponga OSRM
  const byNearness = nearestNeighbor(centroid, stops);
  if (stops.length === 1) return { road: true, stops: byNearness, geometry: [[byNearness[0].latitude, byNearness[0].longitude]], distance_m: 0, duration_s: 0 };

  const key = `${centroid.latitude},${centroid.longitude}|${stops.map((s) => s.id).sort((a, b) => a - b).join(',')}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;

  let value;
  try {
    if (stops.length <= TRIP_MAX) {
      // OSRM solo admite viajes sin retorno con inicio y fin fijos: termina en la parada más lejana del inicio
      const first = byNearness[0];
      const rest = byNearness.slice(1);
      let far = 0;
      rest.forEach((s, i) => { if (distanceM(first, s) > distanceM(first, rest[far])) far = i; });
      const input = [first, ...rest.filter((_, i) => i !== far), rest[far]];
      const body = await osrm(`/trip/v1/driving/${coordsOf(input)}?source=first&destination=last&roundtrip=false&geometries=geojson&overview=full`);
      const ordered = new Array(input.length);
      body.waypoints.forEach((w, i) => { ordered[w.waypoint_index] = input[i]; });
      const trip = body.trips[0];
      value = {
        road: true,
        stops: ordered,
        geometry: trip.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        distance_m: trip.distance,
        duration_s: trip.duration,
      };
    } else {
      const ordered = byNearness.slice(0, ROUTE_MAX);
      const body = await osrm(`/route/v1/driving/${coordsOf(ordered)}?geometries=geojson&overview=full`);
      const route = body.routes[0];
      value = {
        road: true,
        stops: byNearness,
        geometry: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        distance_m: route.distance,
        duration_s: route.duration,
      };
    }
  } catch (error) {
    console.warn('[OSRM]: sin ruta por calles, se usa línea recta:', error.message);
    return { ...straightLine(byNearness), warning: 'No se pudo consultar el servicio de rutas por calles; se muestra el orden en línea recta.' };
  }
  cache.set(key, { at: Date.now(), value });
  return value;
};

module.exports = { roadRoute, distanceM };
