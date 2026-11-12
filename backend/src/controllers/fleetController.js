/**
 * Flota de recogida (pantalla A6): camiones, conductor, capacidad usada y ruta asignada
 * Módulo: src/controllers/fleetController.js
 *
 * La ruta de un camión es un clúster activo de K-Means. La capacidad usada es la carga estimada
 * de los reportes del clúster que aún no se recolectan, frente a la capacidad del camión.
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { tonsOf } = require('../services/incidentRules');
const { changeStatus } = require('../services/reportStatus');
const { buildTrip, liveView } = require('../services/fleetSimulator');

const PLATE_RE = /^[A-Z0-9]{3}-?\d{3}$/; // placas peruanas: ABC-123 o A1B-234
const STATUS_LABEL = { available: 'Disponible', on_route: 'En ruta', maintenance: 'En mantenimiento' };

const SELECT_TRUCKS = `
  SELECT t.id, t.plate, t.driver_name, t.capacity_tons, t.status, t.cluster_id, t.assigned_at, t.created_at, t.trip,
         t.driver_user_id, du.email AS driver_email,
         c.status AS cluster_status,
         (SELECT n.address FROM incidents n WHERE n.cluster_id = c.id AND n.address IS NOT NULL ORDER BY n.location <-> c.centroid LIMIT 1) AS zone,
         COALESCE((SELECT json_agg(json_build_object('estimated_size', i.estimated_size, 'status', i.status))
                     FROM incidents i WHERE i.cluster_id = t.cluster_id AND i.status IN ('pending', 'assigned')), '[]') AS open_items
    FROM trucks t
    LEFT JOIN clusters c ON c.id = t.cluster_id
    LEFT JOIN users du ON du.id = t.driver_user_id`;

const toTruck = (t) => {
  const load = Math.round(t.open_items.reduce((s, i) => s + tonsOf(i), 0) * 100) / 100;
  return {
    id: t.id,
    plate: t.plate,
    driver_name: t.driver_name,
    capacity_tons: t.capacity_tons,
    status: t.status,
    status_label: STATUS_LABEL[t.status],
    cluster_id: t.cluster_id,
    cluster_code: t.cluster_id ? `C-${String(t.cluster_id).padStart(2, '0')}` : null,
    cluster_active: t.cluster_status === 'active',
    zone: t.zone,
    stops: t.open_items.length,
    load_tons: load,
    capacity_used_pct: t.cluster_id ? Math.round((load / t.capacity_tons) * 100) : 0,
    assigned_at: t.assigned_at,
    created_at: t.created_at,
    // Cuenta del conductor en la app («Mi ruta»); null si aún no tiene acceso
    driver_account: t.driver_user_id ? { user_id: t.driver_user_id, email: t.driver_email } : null,
    // Avance del recorrido simulado (null si el camión no tiene recorrido)
    trip: t.trip
      ? {
          state: t.trip.state,
          source: t.trip.source === 'gps' ? 'gps' : 'sim',
          stops_total: t.trip.stops.length,
          stops_collected: t.trip.stops.filter((s) => s.collected_at).length,
          progress_pct: t.trip.length_m ? Math.round((t.trip.progress_m / t.trip.length_m) * 100) : 100,
          origin_label: t.trip.origin.label,
          started_at: t.trip.started_at,
          finished_at: t.trip.finished_at,
          eta_end: liveView(t.trip).eta_end,
        }
      : null,
  };
};

const findTruck = async (id) => (await query(`${SELECT_TRUCKS} WHERE t.id = $1`, [id])).rows[0];

/** Valida placa, conductor y capacidad. Devuelve { errors } o { values }. */
const validate = (body, partial = false) => {
  const errors = {};
  const values = {};
  if (!partial || body.plate !== undefined) {
    const plate = String(body.plate || '').trim().toUpperCase();
    if (!PLATE_RE.test(plate)) errors.plate = 'Ingrese una placa válida, por ejemplo ABC-123.';
    else values.plate = plate.includes('-') ? plate : `${plate.slice(0, 3)}-${plate.slice(3)}`;
  }
  if (!partial || body.driver_name !== undefined) {
    const name = String(body.driver_name || '').trim();
    if (name && name.length < 3) errors.driver_name = 'Ingrese el nombre completo del conductor.';
    else values.driver_name = name || null;
  }
  if (!partial || body.capacity_tons !== undefined) {
    const cap = Number(body.capacity_tons);
    if (!(cap > 0 && cap <= 40)) errors.capacity_tons = 'La capacidad debe estar entre 0,1 y 40 toneladas.';
    else values.capacity_tons = cap;
  }
  if (body.status !== undefined) {
    if (!['available', 'maintenance'].includes(body.status)) errors.status = 'El estado puede ser «Disponible» o «En mantenimiento».';
    else values.status = body.status;
  }
  return Object.keys(errors).length ? { errors } : { values };
};

/** GET /api/fleet */
const getFleet = async (req, res, next) => {
  try {
    const result = await query(`${SELECT_TRUCKS} ORDER BY t.status, t.plate`);
    const data = result.rows.map(toTruck);
    const summary = {
      total: data.length,
      available: data.filter((t) => t.status === 'available').length,
      on_route: data.filter((t) => t.status === 'on_route').length,
      maintenance: data.filter((t) => t.status === 'maintenance').length,
      capacity_tons: Math.round(data.reduce((s, t) => s + t.capacity_tons, 0) * 10) / 10,
    };
    return res.status(200).json({ success: true, summary, data });
  } catch (error) {
    return next(error);
  }
};

/** POST /api/fleet  Payload: { plate, driver_name?, capacity_tons } */
const createTruck = async (req, res, next) => {
  try {
    const { errors, values } = validate(req.body);
    if (errors) return res.status(400).json({ success: false, message: 'Revise los datos del camión.', errors });
    const dup = await query('SELECT 1 FROM trucks WHERE UPPER(plate) = $1', [values.plate]);
    if (dup.rowCount) return res.status(409).json({ success: false, message: 'Ya existe un camión con esa placa.', errors: { plate: 'Esta placa ya está registrada.' } });
    const inserted = await query(
      'INSERT INTO trucks (plate, driver_name, capacity_tons) VALUES ($1, $2, $3) RETURNING id',
      [values.plate, values.driver_name, values.capacity_tons]
    );
    return res.status(201).json({ success: true, message: `Camión ${values.plate} registrado.`, data: toTruck(await findTruck(inserted.rows[0].id)) });
  } catch (error) {
    return next(error);
  }
};

/** PATCH /api/fleet/:id  Payload: { driver_name?, capacity_tons?, status? ('available' | 'maintenance') } */
const updateTruck = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const truck = await findTruck(id);
    if (!truck) return res.status(404).json({ success: false, message: 'No se encontró el camión.' });
    const { errors, values } = validate({ ...req.body, plate: undefined }, true);
    if (errors) return res.status(400).json({ success: false, message: 'Revise los datos del camión.', errors });
    // Al cambiar a «Disponible» o «En mantenimiento» se libera la ruta asignada
    const sets = Object.keys(values).map((k, i) => `${k} = $${i + 2}`);
    if (values.status) sets.push('cluster_id = NULL', 'assigned_at = NULL', 'trip = NULL');
    if (sets.length) await query(`UPDATE trucks SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1`, [id, ...Object.values(values)]);
    return res.status(200).json({ success: true, message: `Camión ${truck.plate} actualizado.`, data: toTruck(await findTruck(id)) });
  } catch (error) {
    return next(error);
  }
};

/**
 * Asigna el camión a la ruta de un clúster activo y pasa a «En ruta» los reportes pendientes del clúster.
 * Endpoint: POST /api/fleet/:id/assign  Payload: { cluster_id }
 */
const assignTruck = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const clusterId = parseInt(req.body.cluster_id, 10);
    const truck = await findTruck(id);
    if (!truck) return res.status(404).json({ success: false, message: 'No se encontró el camión.' });
    if (truck.status === 'maintenance') return res.status(409).json({ success: false, message: `El camión ${truck.plate} está en mantenimiento.` });
    const cluster = await query("SELECT id FROM clusters WHERE id = $1 AND status = 'active'", [clusterId]);
    if (!cluster.rowCount) return res.status(400).json({ success: false, message: 'Elija un clúster activo.' });
    const busy = await query("SELECT plate FROM trucks WHERE cluster_id = $1 AND status = 'on_route' AND id <> $2", [clusterId, id]);
    if (busy.rowCount) return res.status(409).json({ success: false, message: `La ruta ya tiene asignado el camión ${busy.rows[0].plate}.` });

    // Recorrido por calles desde la base de la flota; el simulador lo hace avanzar en tiempo real
    const trip = await buildTrip(clusterId);
    if (!trip) return res.status(409).json({ success: false, message: 'La ruta no tiene reportes por recoger.' });
    await query("UPDATE trucks SET status = 'on_route', cluster_id = $2, assigned_at = NOW(), trip = $3, updated_at = NOW() WHERE id = $1", [id, clusterId, trip]);
    const pending = await query("SELECT id FROM incidents WHERE cluster_id = $1 AND status = 'pending'", [clusterId]);
    const changed = await changeStatus(pending.rows.map((r) => r.id), 'assigned');
    const code = `C-${String(clusterId).padStart(2, '0')}`;
    return res.status(200).json({
      success: true,
      message: `Camión ${truck.plate} asignado a la ruta ${code}; ${changed.length} ${changed.length === 1 ? 'reporte pasó' : 'reportes pasaron'} a «En ruta».`,
      data: toTruck(await findTruck(id)),
    });
  } catch (error) {
    return next(error);
  }
};

/** POST /api/fleet/:id/release — libera el camión (vuelve a «Disponible» sin ruta) */
const releaseTruck = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const truck = await findTruck(id);
    if (!truck) return res.status(404).json({ success: false, message: 'No se encontró el camión.' });
    await query("UPDATE trucks SET status = 'available', cluster_id = NULL, assigned_at = NULL, trip = NULL, updated_at = NOW() WHERE id = $1", [id]);
    return res.status(200).json({ success: true, message: `Camión ${truck.plate} disponible.`, data: toTruck(await findTruck(id)) });
  } catch (error) {
    return next(error);
  }
};

/** DELETE /api/fleet/:id */
const deleteTruck = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await query('DELETE FROM trucks WHERE id = $1 RETURNING plate', [id]);
    if (!deleted.rowCount) return res.status(404).json({ success: false, message: 'No se encontró el camión.' });
    return res.status(200).json({ success: true, message: `Camión ${deleted.rows[0].plate} eliminado.` });
  } catch (error) {
    return next(error);
  }
};

/**
 * Camiones con recorrido simulado: posición actual, de dónde salieron, tramo recorrido y por recorrer,
 * próxima parada y llegada estimada. Incluye los que terminaron su ruta en la última hora.
 * Endpoint: GET /api/fleet/live
 */
const getLive = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT t.id, t.plate, t.driver_name, t.capacity_tons, t.status, t.cluster_id, t.trip
        FROM trucks t
       WHERE t.trip IS NOT NULL
         AND (t.trip->>'state' <> 'done' OR (t.trip->>'finished_at')::timestamptz > NOW() - INTERVAL '1 hour')
       ORDER BY t.plate`);
    const now = Date.now();
    const data = result.rows.map((t) => ({
      id: t.id,
      plate: t.plate,
      driver_name: t.driver_name,
      status: t.status,
      cluster_id: t.cluster_id,
      cluster_code: t.cluster_id ? `C-${String(t.cluster_id).padStart(2, '0')}` : null,
      ...liveView(t.trip, now),
    }));
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

// ── Cuenta del conductor (perfil «Mi ruta» de la app móvil) ─────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DRIVER_UBIGEO = process.env.DRIVER_UBIGEO || '140101'; // distrito de las cuentas de conductor (Chiclayo)

/** Contraseña temporal legible (8 letras y 2 números) que el gestor entrega al conductor */
const tempPassword = () => {
  const letters = 'abcdefghjkmnpqrstuvwxyz';
  const bytes = crypto.randomBytes(10);
  const word = Array.from(bytes.subarray(0, 8), (b) => letters[b % letters.length]).join('');
  return word.charAt(0).toUpperCase() + word.slice(1) + String(bytes[8] % 10) + String(bytes[9] % 10);
};

/**
 * Crea (o enlaza) la cuenta del conductor del camión y devuelve una contraseña temporal una sola vez.
 * Endpoint: POST /api/fleet/:id/driver-account  Payload: { email, full_name? }
 */
const createDriverAccount = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const truck = await findTruck(id);
    if (!truck) return res.status(404).json({ success: false, message: 'No se encontró el camión.' });
    const email = String(req.body.email || '').trim().toLowerCase();
    const fullName = String(req.body.full_name || truck.driver_name || '').trim();
    const errors = {};
    if (!EMAIL_RE.test(email)) errors.email = 'Ingrese un correo válido.';
    if (fullName.length < 3) errors.full_name = 'Ingrese el nombre completo del conductor.';
    if (Object.keys(errors).length) return res.status(400).json({ success: false, message: 'Revise los datos del conductor.', errors });
    if (truck.driver_user_id) return res.status(409).json({ success: false, message: `El camión ${truck.plate} ya tiene la cuenta ${truck.driver_email}.` });

    const existing = (await query('SELECT id, role FROM users WHERE LOWER(email) = $1', [email])).rows[0];
    if (existing && existing.role !== 'driver') {
      return res.status(409).json({ success: false, message: 'Ese correo ya es de una cuenta de vecino o de gestor.', errors: { email: 'Use otro correo para el conductor.' } });
    }
    if (existing) {
      const other = await query('SELECT plate FROM trucks WHERE driver_user_id = $1', [existing.id]);
      if (other.rowCount) return res.status(409).json({ success: false, message: `Esa cuenta ya conduce el camión ${other.rows[0].plate}.`, errors: { email: 'Ya está enlazada a otro camión.' } });
    }

    const password = tempPassword();
    const hash = await bcrypt.hash(password, 10);
    const userId = existing
      ? (await query('UPDATE users SET full_name = $2, password_hash = $3 WHERE id = $1 RETURNING id', [existing.id, fullName, hash])).rows[0].id
      : (
          await query(
            "INSERT INTO users (full_name, email, password_hash, ubigeo, role, terms_accepted_at) VALUES ($1, $2, $3, $4, 'driver', NOW()) RETURNING id",
            [fullName, email, hash, DRIVER_UBIGEO]
          )
        ).rows[0].id;
    await query('UPDATE trucks SET driver_user_id = $2, driver_name = $3, updated_at = NOW() WHERE id = $1', [id, userId, fullName]);
    return res.status(201).json({
      success: true,
      message: `Acceso creado para ${fullName}. Entréguele el correo y la contraseña temporal; con ellos entra a la app y ve «Mi ruta».`,
      data: { truck: toTruck(await findTruck(id)), email, temp_password: password },
    });
  } catch (error) {
    return next(error);
  }
};

/** POST /api/fleet/:id/driver-account/reset — nueva contraseña temporal */
const resetDriverPassword = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const truck = await findTruck(id);
    if (!truck?.driver_user_id) return res.status(404).json({ success: false, message: 'El camión no tiene cuenta de conductor.' });
    const password = tempPassword();
    await query('UPDATE users SET password_hash = $2 WHERE id = $1', [truck.driver_user_id, await bcrypt.hash(password, 10)]);
    return res.status(200).json({ success: true, message: `Nueva contraseña temporal para ${truck.driver_email}.`, data: { email: truck.driver_email, temp_password: password } });
  } catch (error) {
    return next(error);
  }
};

/** DELETE /api/fleet/:id/driver-account — quita el acceso del conductor a este camión */
const removeDriverAccount = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const truck = await findTruck(id);
    if (!truck?.driver_user_id) return res.status(404).json({ success: false, message: 'El camión no tiene cuenta de conductor.' });
    await query('UPDATE trucks SET driver_user_id = NULL, updated_at = NOW() WHERE id = $1', [id]);
    return res.status(200).json({ success: true, message: `La cuenta ${truck.driver_email} ya no conduce el camión ${truck.plate}.`, data: toTruck(await findTruck(id)) });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createDriverAccount, resetDriverPassword, removeDriverAccount, getLive, getFleet, createTruck, updateTruck, assignTruck, releaseTruck, deleteTruck };
