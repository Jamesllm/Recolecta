/**
 * Perfil del conductor en la app móvil («Mi ruta»)
 * Módulo: src/controllers/driverController.js
 *
 * El gestor crea la cuenta del conductor en Flota y la enlaza a un camión. Cuando el panel asigna
 * una ruta al camión, el conductor la ve en la app; al pulsar «Iniciar ruta» el recorrido deja de
 * ser simulado y avanza con el GPS del teléfono. Cada parada se marca «Recogido» desde la app.
 */

const { query } = require('../config/db');
const { changeStatus } = require('../services/reportStatus');
const { liveView, startGps, applyGps, collectStop, finishTrip } = require('../services/fleetSimulator');

/** Solo las cuentas con rol «driver». */
const requireDriver = (req, res, next) => {
  if (req.user?.role !== 'driver') return res.status(403).json({ success: false, message: 'Esta sección es solo para conductores de la flota.' });
  return next();
};

const truckOf = async (userId) =>
  (
    await query(
      `SELECT t.id, t.plate, t.driver_name, t.capacity_tons, t.status, t.cluster_id, t.trip,
              (SELECT n.address FROM incidents n JOIN clusters c ON c.id = n.cluster_id
                WHERE n.cluster_id = t.cluster_id AND n.address IS NOT NULL ORDER BY n.location <-> c.centroid LIMIT 1) AS zone
         FROM trucks t WHERE t.driver_user_id = $1`,
      [userId]
    )
  ).rows[0];

const view = (t) => ({
  truck: {
    id: t.id,
    plate: t.plate,
    driver_name: t.driver_name,
    capacity_tons: t.capacity_tons,
    status: t.status,
    cluster_id: t.cluster_id,
    cluster_code: t.cluster_id ? `C-${String(t.cluster_id).padStart(2, '0')}` : null,
    zone: t.zone,
  },
  // Ruta asignada (o la última terminada); null si el panel aún no le asigna una
  trip: t.trip ? liveView(t.trip) : null,
});

const saveTrip = (truckId, trip) => query('UPDATE trucks SET trip = $2 WHERE id = $1', [truckId, trip]);

/** GET /api/driver/me — camión del conductor y su ruta */
const me = async (req, res, next) => {
  try {
    const truck = await truckOf(req.user.id);
    if (!truck) return res.status(200).json({ success: true, data: { truck: null, trip: null } });
    return res.status(200).json({ success: true, data: view(truck) });
  } catch (error) {
    return next(error);
  }
};

/** Camión con una ruta en curso (o un mensaje de por qué no se puede continuar). */
const activeTruck = async (req, res) => {
  const truck = await truckOf(req.user.id);
  if (!truck) {
    res.status(409).json({ success: false, message: 'Tu cuenta aún no está enlazada a un camión. Pídelo al gestor de la flota.' });
    return null;
  }
  if (truck.status !== 'on_route' || !truck.trip || truck.trip.state === 'done') {
    res.status(409).json({ success: false, message: 'Aún no tienes una ruta asignada. El gestor la asigna desde el panel.' });
    return null;
  }
  return truck;
};

/** POST /api/driver/start — el conductor inicia la ruta; desde aquí el recorrido usa su GPS */
const start = async (req, res, next) => {
  try {
    const truck = await activeTruck(req, res);
    if (!truck) return undefined;
    if (truck.trip.source !== 'gps') {
      startGps(truck.trip);
      await saveTrip(truck.id, truck.trip);
    }
    return res.status(200).json({ success: true, message: `Ruta ${view(truck).truck.cluster_code} iniciada. Tu ubicación se comparte mientras la ruta esté activa.`, data: view(truck) });
  } catch (error) {
    return next(error);
  }
};

const num = (v) => (v === undefined || v === null || v === '' ? null : Number(v));

/**
 * POST /api/driver/position — ubicación del teléfono
 * Payload: { latitude, longitude, accuracy? (m), speed? (m/s), heading? (grados) }
 */
const position = async (req, res, next) => {
  try {
    const latitude = num(req.body.latitude);
    const longitude = num(req.body.longitude);
    if (!(latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180)) {
      return res.status(400).json({ success: false, message: 'Ubicación no válida.' });
    }
    const truck = await activeTruck(req, res);
    if (!truck) return undefined;
    if (truck.trip.source !== 'gps') return res.status(409).json({ success: false, message: 'Primero pulse «Iniciar ruta».' });
    const speed = num(req.body.speed);
    const heading = num(req.body.heading);
    applyGps(truck.trip, {
      latitude,
      longitude,
      accuracy: num(req.body.accuracy),
      speed_kmh: speed != null && speed >= 0 ? Math.round(speed * 3.6 * 10) / 10 : null,
      heading: heading != null && heading >= 0 ? heading : null,
    });
    await saveTrip(truck.id, truck.trip);
    const live = liveView(truck.trip);
    return res.status(200).json({ success: true, data: { progress_m: live.progress_m, off_route_m: live.off_route_m, next_stop: live.next_stop } });
  } catch (error) {
    return next(error);
  }
};

/** POST /api/driver/stops/:incidentId/collect — el conductor recogió la parada; el reporte pasa a «Resuelto» */
const collect = async (req, res, next) => {
  try {
    const incidentId = parseInt(req.params.incidentId, 10);
    const truck = await activeTruck(req, res);
    if (!truck) return undefined;
    if (truck.trip.source !== 'gps') return res.status(409).json({ success: false, message: 'Primero pulse «Iniciar ruta».' });
    const stop = truck.trip.stops.find((s) => s.id === incidentId);
    if (!stop) return res.status(404).json({ success: false, message: 'Esa parada no es de tu ruta.' });
    if (stop.collected_at || stop.skipped) return res.status(409).json({ success: false, message: `La parada #${stop.code} ya fue atendida.` });

    // Si el municipio ya resolvió o rechazó el reporte, la parada se salta
    const open = (await query("SELECT 1 FROM incidents WHERE id = $1 AND status IN ('pending', 'assigned')", [incidentId])).rowCount > 0;
    collectStop(truck.trip, incidentId, open);
    if (open) await changeStatus([incidentId], 'resolved');
    await saveTrip(truck.id, truck.trip);
    return res.status(200).json({
      success: true,
      message: open ? `Parada #${stop.code} recogida. El vecino recibió el aviso.` : `La parada #${stop.code} ya no estaba abierta y se saltó.`,
      data: view(truck),
    });
  } catch (error) {
    return next(error);
  }
};

/** POST /api/driver/finish — termina la ruta; el camión queda disponible en la flota */
const finish = async (req, res, next) => {
  try {
    const truck = await activeTruck(req, res);
    if (!truck) return undefined;
    finishTrip(truck.trip);
    await query("UPDATE trucks SET trip = $2, status = 'available', cluster_id = NULL, updated_at = NOW() WHERE id = $1", [truck.id, truck.trip]);
    const left = truck.trip.stops.filter((s) => !s.collected_at && !s.skipped).length;
    return res.status(200).json({
      success: true,
      message: left ? `Ruta terminada. Quedaron ${left} ${left === 1 ? 'parada' : 'paradas'} sin recoger; el gestor las verá en el panel.` : 'Ruta terminada. ¡Buen trabajo!',
      data: view({ ...truck, status: 'available', cluster_id: null }),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { requireDriver, me, start, position, collect, finish };
