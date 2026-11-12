/**
 * Configuración del panel (pantalla A8, US-10): parámetros de la IA, reglas de automatización y usuarios
 * Módulo: src/controllers/settingsController.js
 */

const { query } = require('../config/db');
const { getSettings, updateSettings } = require('../services/settings');
const { smtpConfigured } = require('../services/mailer');

/** GET /api/settings */
const getAll = async (req, res, next) => {
  try {
    return res.status(200).json({ success: true, data: await getSettings(), email_enabled: smtpConfigured() });
  } catch (error) {
    return next(error);
  }
};

/** PATCH /api/settings  Payload: { clusters_k_max?, clusters_weighted?, notify_email_on_resolved?, welcome_email? } */
const update = async (req, res, next) => {
  try {
    const { errors, settings } = await updateSettings(req.body);
    if (errors) return res.status(400).json({ success: false, message: Object.values(errors)[0], errors });
    return res.status(200).json({ success: true, message: 'Configuración guardada.', data: settings });
  } catch (error) {
    return next(error);
  }
};

/**
 * Usuarios: equipo municipal (rol gestor) y resumen de vecinos registrados.
 * De los vecinos no se devuelve el correo: el panel aún no tiene inicio de sesión (US-10, Sprint 3).
 * Endpoint: GET /api/users/summary
 */
const usersSummary = async (req, res, next) => {
  try {
    const team = await query(`
      SELECT u.id, u.full_name, u.email, u.role, u.created_at
        FROM users u WHERE u.role = 'manager' ORDER BY u.full_name`);
    const citizens = await query(`
      SELECT COUNT(*)::int AS total,
             COUNT(*) FILTER (WHERE u.created_at >= NOW() - INTERVAL '30 days')::int AS last_30_days,
             COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM incidents i WHERE i.user_id = u.id))::int AS with_reports
        FROM users u WHERE u.role = 'citizen'`);
    const recent = await query(`
      SELECT u.id, u.full_name, d.nombre AS distrito, u.created_at,
             (SELECT COUNT(*)::int FROM incidents i WHERE i.user_id = u.id) AS reports
        FROM users u JOIN distritos d ON d.ubigeo = u.ubigeo
       WHERE u.role = 'citizen'
       ORDER BY u.created_at DESC LIMIT 10`);
    return res.status(200).json({ success: true, data: { team: team.rows, citizens: citizens.rows[0], recent: recent.rows } });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getAll, update, usersSummary };
