/**
 * Controlador de Incidentes para el panel municipal (Recolecta+)
 * Módulo: src/controllers/incidentController.js
 *
 * Los incidentes son los reportes que registran los vecinos desde la app (POST /api/reports).
 */

const { query } = require('../config/db');
const { imageUrl } = require('../services/storage');
const { reportCode } = require('./reportController');
const { TONS_BY_SIZE, urgencyOf, isCritical, tonsOf, titleOf, sumTons } = require('../services/incidentRules');

const SELECT_INCIDENT = `
  SELECT
    i.id, i.user_id, COALESCE(u.full_name, 'Invitado') AS reporter_name, i.photo_key, i.category, i.estimated_size,
    i.description, i.address, i.reference, i.status, i.cluster_id,
    ST_X(i.location) AS longitude,
    ST_Y(i.location) AS latitude,
    (SELECT COUNT(*)::int FROM incident_confirmations ic WHERE ic.incident_id = i.id) AS confirmations,
    i.resolved_at, i.created_at, i.updated_at
  FROM incidents i
  LEFT JOIN users u ON u.id = i.user_id`;

const toIncident = async ({ photo_key, ...row }, req) => ({
  ...row,
  code: reportCode(row.id),
  title: titleOf(row),
  urgency: urgencyOf(row),
  critical: isCritical(row),
  estimated_tons: tonsOf(row),
  photo_url: await imageUrl(photo_key, req),
});

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
    const data = await Promise.all(result.rows.map((row) => toIncident(row, req)));

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

    const allowedStatuses = ['pending', 'assigned', 'resolved'];
    const normalizedStatus = String(req.body.status || '').toLowerCase();
    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Estado no válido. Los estados permitidos son: ${allowedStatuses.join(', ')}`,
      });
    }

    // resolved_at registra cuándo se atendió el punto (toneladas recolectadas del día)
    const update = await query(
      `UPDATE incidents
          SET status = $1::incident_status, updated_at = NOW(),
              resolved_at = CASE WHEN $1::incident_status = 'resolved' THEN COALESCE(resolved_at, NOW()) ELSE NULL END
        WHERE id = $2 RETURNING id;`,
      [normalizedStatus, incidentId]
    );
    if (update.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontró ningún incidente con el ID ${incidentId}.`,
      });
    }

    const result = await query(`${SELECT_INCIDENT} WHERE i.id = $1`, [incidentId]);
    return res.status(200).json({
      success: true,
      message: `El estado del incidente ${reportCode(incidentId)} ha sido actualizado a '${normalizedStatus}'.`,
      data: await toIncident(result.rows[0], req),
    });
  } catch (error) {
    console.error('[updateIncidentStatus Error]:', error);
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
    const open = rows.filter((r) => r.status !== 'resolved');
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
};
