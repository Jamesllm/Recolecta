/**
 * Controlador de Incidentes para el panel municipal (Recolecta+)
 * Módulo: src/controllers/incidentController.js
 *
 * Los incidentes son los reportes que registran los vecinos desde la app (POST /api/reports).
 */

const { query } = require('../config/db');
const { imageUrl } = require('../services/storage');
const { reportCode } = require('./reportController');

const SELECT_INCIDENT = `
  SELECT
    i.id, i.user_id, u.full_name AS reporter_name, i.photo_key, i.category, i.estimated_size,
    i.description, i.address, i.status, i.cluster_id,
    ST_X(i.location) AS longitude,
    ST_Y(i.location) AS latitude,
    i.created_at, i.updated_at
  FROM incidents i
  JOIN users u ON u.id = i.user_id`;

const toIncident = async ({ photo_key, ...row }, req) => ({
  ...row,
  code: reportCode(row.id),
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

    const update = await query('UPDATE incidents SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id;', [normalizedStatus, incidentId]);
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

module.exports = {
  getIncidents,
  updateIncidentStatus,
};
