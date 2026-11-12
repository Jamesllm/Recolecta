/**
 * Flota de recogida (pantalla A6): camiones, conductor, capacidad usada y ruta asignada
 * Módulo: src/controllers/fleetController.js
 *
 * La ruta de un camión es un clúster activo de K-Means. La capacidad usada es la carga estimada
 * de los reportes del clúster que aún no se recolectan, frente a la capacidad del camión.
 */

const { query } = require('../config/db');
const { tonsOf } = require('../services/incidentRules');
const { changeStatus } = require('../services/reportStatus');

const PLATE_RE = /^[A-Z0-9]{3}-?\d{3}$/; // placas peruanas: ABC-123 o A1B-234
const STATUS_LABEL = { available: 'Disponible', on_route: 'En ruta', maintenance: 'En mantenimiento' };

const SELECT_TRUCKS = `
  SELECT t.id, t.plate, t.driver_name, t.capacity_tons, t.status, t.cluster_id, t.assigned_at, t.created_at,
         c.status AS cluster_status,
         (SELECT n.address FROM incidents n WHERE n.cluster_id = c.id AND n.address IS NOT NULL ORDER BY n.location <-> c.centroid LIMIT 1) AS zone,
         COALESCE((SELECT json_agg(json_build_object('estimated_size', i.estimated_size, 'status', i.status))
                     FROM incidents i WHERE i.cluster_id = t.cluster_id AND i.status IN ('pending', 'assigned')), '[]') AS open_items
    FROM trucks t
    LEFT JOIN clusters c ON c.id = t.cluster_id`;

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
    if (values.status) sets.push('cluster_id = NULL', 'assigned_at = NULL');
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

    await query("UPDATE trucks SET status = 'on_route', cluster_id = $2, assigned_at = NOW(), updated_at = NOW() WHERE id = $1", [id, clusterId]);
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
    await query("UPDATE trucks SET status = 'available', cluster_id = NULL, assigned_at = NULL, updated_at = NOW() WHERE id = $1", [id]);
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

module.exports = { getFleet, createTruck, updateTruck, assignTruck, releaseTruck, deleteTruck };
