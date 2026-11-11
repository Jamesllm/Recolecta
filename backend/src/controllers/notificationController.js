/**
 * Bandeja de avisos del vecino (US-06, pantalla 15 · Notificaciones)
 * Módulo: src/controllers/notificationController.js
 */

const { query } = require('../config/db');
const { reportCode } = require('../services/reportStatus');

const MAX_ITEMS = 100;

/**
 * Avisos del vecino con sesión iniciada, del más reciente al más antiguo, y cuántos no ha leído.
 * Endpoint: GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, incident_id, status, title, body, read_at, created_at
         FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC, id DESC
        LIMIT ${MAX_ITEMS}`,
      [req.user.id]
    );
    const unread = await query('SELECT COUNT(*)::int AS n FROM notifications WHERE user_id = $1 AND read_at IS NULL', [req.user.id]);
    const data = result.rows.map((n) => ({ ...n, report_code: reportCode(n.incident_id), read: n.read_at !== null }));
    return res.status(200).json({ success: true, unread: unread.rows[0].n, data });
  } catch (error) {
    return next(error);
  }
};

/**
 * Cantidad de avisos sin leer (indicador de la campana del mapa).
 * Endpoint: GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const result = await query('SELECT COUNT(*)::int AS n FROM notifications WHERE user_id = $1 AND read_at IS NULL', [req.user.id]);
    return res.status(200).json({ success: true, unread: result.rows[0].n });
  } catch (error) {
    return next(error);
  }
};

/**
 * Marca un aviso como leído (al tocarlo en la bandeja).
 * Endpoint: POST /api/notifications/:id/read
 */
const markRead = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!(id > 0)) return res.status(400).json({ success: false, message: 'Identificador no válido.' });
    const result = await query(
      'UPDATE notifications SET read_at = COALESCE(read_at, NOW()) WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'No se encontró el aviso.' });
    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

/**
 * Marca todos los avisos como leídos.
 * Endpoint: POST /api/notifications/read-all
 */
const markAllRead = async (req, res, next) => {
  try {
    const result = await query('UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL', [req.user.id]);
    return res.status(200).json({ success: true, updated: result.rowCount });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getNotifications, getUnreadCount, markRead, markAllRead };
