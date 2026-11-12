/**
 * Controlador de Incidentes para el panel municipal (Recolecta+)
 * Módulo: src/controllers/incidentController.js
 *
 * Los incidentes son los reportes que registran los vecinos desde la app (POST /api/reports).
 */

const { query } = require('../config/db');
const { imageUrl } = require('../services/storage');
const { TONS_BY_SIZE, urgencyOf, isCritical, tonsOf, titleOf, sumTons } = require('../services/incidentRules');
const { STATUSES, REJECTION_REASONS, changeStatus, timelinesFor, clusterCode, reportCode } = require('../services/reportStatus');

const STATUS_LABEL = { pending: 'Pendiente', assigned: 'En ruta', resolved: 'Resuelto', rejected: 'Rechazado' };

/** Para rechazar se exige uno de los motivos de la lista. Devuelve el mensaje de error o null. */
const rejectionError = (status, reason) =>
  status === 'rejected' && !REJECTION_REASONS.includes(reason)
    ? `Elija el motivo del rechazo: ${REJECTION_REASONS.join(', ')}.`
    : null;

const SELECT_INCIDENT = `
  SELECT
    i.id, i.user_id, COALESCE(u.full_name, 'Invitado') AS reporter_name, i.photo_key, i.category, i.estimated_size,
    i.description, i.address, i.reference, i.status, i.cluster_id, i.rejection_reason,
    ST_X(i.location) AS longitude,
    ST_Y(i.location) AS latitude,
    (SELECT COUNT(*)::int FROM incident_confirmations ic WHERE ic.incident_id = i.id) AS confirmations,
    i.resolved_at, i.created_at, i.updated_at
  FROM incidents i
  LEFT JOIN users u ON u.id = i.user_id`;

const toIncident = async ({ photo_key, ...row }, req, timelines) => ({
  ...row,
  code: reportCode(row.id),
  title: titleOf(row),
  urgency: urgencyOf(row),
  critical: isCritical(row),
  estimated_tons: tonsOf(row),
  cluster_code: clusterCode(row.cluster_id),
  timeline: timelines.get(row.id) ?? [],
  photo_url: await imageUrl(photo_key, req),
});

/** Incidentes con su línea de seguimiento (recibido, agrupado, en ruta, recolectado). */
const toIncidents = async (rows, req) => {
  const timelines = await timelinesFor(rows);
  return Promise.all(rows.map((row) => toIncident(row, req, timelines)));
};

/**
 * Obtiene los incidentes con sus coordenadas en decimal nativo.
 * Endpoint: GET /api/incidents?status=&category=
 */
const getIncidents = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const whereClauses = [];
    const values = [];

    if (status) {
      values.push(status);
      whereClauses.push(`i.status = $${values.length}`);
    }
    if (category) {
      values.push(category);
      whereClauses.push(`i.category = $${values.length}`);
    }

    const where = whereClauses.length ? ` WHERE ${whereClauses.join(' AND ')}` : '';
    const result = await query(`${SELECT_INCIDENT}${where} ORDER BY i.created_at DESC;`, values);
    const data = await toIncidents(result.rows, req);

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('[getIncidents Error]:', error);
    return next(error);
  }
};

/**
 * Actualiza el estado de un incidente específico.
 * Endpoint: PATCH /api/incidents/:id/status
 * Payload esperado: { status: 'pending' | 'assigned' | 'resolved' }
 */
const updateIncidentStatus = async (req, res, next) => {
  try {
    const incidentId = parseInt(req.params.id, 10);
    if (isNaN(incidentId)) {
      return res.status(400).json({
        success: false,
        message: 'El identificador del incidente debe ser un número entero válido.',
      });
    }

    const normalizedStatus = String(req.body.status || '').toLowerCase();
    if (!STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Estado no válido. Los estados permitidos son: ${STATUSES.join(', ')}`,
      });
    }

    const reasonError = rejectionError(normalizedStatus, req.body.reason);
    if (reasonError) return res.status(400).json({ success: false, message: reasonError });

    const exists = await query('SELECT 1 FROM incidents WHERE id = $1', [incidentId]);
    if (!exists.rowCount) {
      return res.status(404).json({
        success: false,
        message: `No se encontró ningún incidente con el ID ${incidentId}.`,
      });
    }
    // Registra el cambio en el historial y avisa al vecino (US-06); resolved_at marca la hora de recolección
    await changeStatus([incidentId], normalizedStatus, req.body.reason);

    const result = await query(`${SELECT_INCIDENT} WHERE i.id = $1`, [incidentId]);
    return res.status(200).json({
      success: true,
      message: `El incidente ${reportCode(incidentId)} pasó a «${STATUS_LABEL[normalizedStatus]}».`,
      data: (await toIncidents(result.rows, req))[0],
    });
  } catch (error) {
    console.error('[updateIncidentStatus Error]:', error);
    return next(error);
  }
};

/**
 * Cambia el estado de varios incidentes seleccionados en la tabla (barra de selección de A3).
 * Endpoint: PATCH /api/incidents/status
 * Payload: { ids: number[], status: 'pending' | 'assigned' | 'resolved' }
 */
const updateManyStatus = async (req, res, next) => {
  try {
    const ids = [...new Set((Array.isArray(req.body.ids) ? req.body.ids : []).map((n) => parseInt(n, 10)).filter((n) => n > 0))];
    const status = String(req.body.status || '').toLowerCase();
    if (!ids.length || ids.length > 500) {
      return res.status(400).json({ success: false, message: 'Seleccione entre 1 y 500 incidentes.' });
    }
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Estado no válido. Los estados permitidos son: ${STATUSES.join(', ')}` });
    }
    const reasonError = rejectionError(status, req.body.reason);
    if (reasonError) return res.status(400).json({ success: false, message: reasonError });
    const changed = await changeStatus(ids, status, req.body.reason);
    const result = await query(`${SELECT_INCIDENT} WHERE i.id = ANY($1::int[]) ORDER BY i.created_at DESC`, [ids]);
    const label = STATUS_LABEL[status];
    return res.status(200).json({
      success: true,
      message: `${changed.length} de ${ids.length} incidentes pasaron a «${label}»${changed.length < ids.length ? ' (los demás ya tenían ese estado)' : ''}.`,
      changed,
      data: await toIncidents(result.rows, req),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Indicadores del día para el panel general (US-04).
 * Endpoint: GET /api/incidents/summary
 * - open: reportes pendientes o en ruta
 * - critical_unassigned: pendientes de urgencia alta (peligroso o camión completo)
 * - active_routes: clústeres con al menos un reporte en ruta
 * - tons_collected_today: carga estimada de los reportes atendidos hoy (hora de Lima)
 */
const getSummary = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT i.status, i.category, i.estimated_size, i.cluster_id,
             (i.resolved_at AT TIME ZONE 'America/Lima')::date = (NOW() AT TIME ZONE 'America/Lima')::date AS resolved_today
        FROM incidents i;`);
    const rows = result.rows;
    const open = rows.filter((r) => r.status === 'pending' || r.status === 'assigned');
    const routes = new Set(rows.filter((r) => r.status === 'assigned' && r.cluster_id !== null).map((r) => r.cluster_id));
    const collected = rows.filter((r) => r.status === 'resolved' && r.resolved_today);
    return res.status(200).json({
      success: true,
      data: {
        open: open.length,
        pending: rows.filter((r) => r.status === 'pending').length,
        assigned: rows.filter((r) => r.status === 'assigned').length,
        critical_unassigned: rows.filter(isCritical).length,
        active_routes: routes.size,
        resolved_today: collected.length,
        tons_collected_today: sumTons(collected),
        tons_open: sumTons(open),
        tons_by_size: TONS_BY_SIZE,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getIncidents,
  getSummary,
  updateIncidentStatus,
  updateManyStatus,
};
