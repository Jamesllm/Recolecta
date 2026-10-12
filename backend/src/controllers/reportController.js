/**
 * Controlador de reportes ciudadanos (US-02 y US-03)
 * Módulo: src/controllers/reportController.js
 */

const crypto = require('crypto');
const { query } = require('../config/db');
const { saveImage, imageUrl } = require('../services/storage');

const CATEGORIES = ['Orgánico', 'Inorgánico', 'Escombros', 'Peligroso'];
const SIZES = ['small', 'medium', 'large'];
const STATUSES = ['pending', 'assigned', 'resolved'];
const DEFAULT_RADIUS_M = 500;
const MAX_RADIUS_M = 5000;
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic' };

const reportCode = (id) => `RL-${String(id).padStart(4, '0')}`;

/** Tipo real de la imagen según sus primeros bytes (algunos clientes envían application/octet-stream). */
const detectImageType = (buf) => {
  if (!buf || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buf.toString('ascii', 4, 8) === 'ftyp' && /^(heic|heix|hevc|mif1|msf1)$/.test(buf.toString('ascii', 8, 12))) return 'image/heic';
  return null;
};

const SELECT_REPORT = `
  SELECT
    i.id, i.user_id, i.photo_key, i.category, i.estimated_size, i.description, i.address,
    i.gps_accuracy_m, i.status, i.created_at, i.updated_at,
    ST_X(i.location) AS longitude,
    ST_Y(i.location) AS latitude
  FROM incidents i`;

/** Convierte una fila en la respuesta pública del reporte. */
const toReport = async (row, req) => ({
  id: row.id,
  code: reportCode(row.id),
  category: row.category,
  estimated_size: row.estimated_size,
  description: row.description,
  address: row.address,
  gps_accuracy_m: row.gps_accuracy_m,
  status: row.status,
  latitude: row.latitude,
  longitude: row.longitude,
  distance_m: row.distance_m === undefined ? undefined : Math.round(row.distance_m),
  photo_url: await imageUrl(row.photo_key, req),
  is_mine: row.user_id === req.user.id,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const parseCoord = (value, min, max) => {
  const n = parseFloat(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

/**
 * Registra un reporte con foto y ubicación GPS.
 * Endpoint: POST /api/reports (multipart/form-data)
 * Campos: photo (archivo), latitude, longitude, gps_accuracy_m?, address?, category, estimated_size, description?
 */
const createReport = async (req, res, next) => {
  try {
    const latitude = parseCoord(req.body.latitude, -90, 90);
    const longitude = parseCoord(req.body.longitude, -180, 180);
    const { category, estimated_size } = req.body;
    const description = (req.body.description || '').trim();
    const address = (req.body.address || '').trim() || null;
    const accuracy = parseFloat(req.body.gps_accuracy_m);

    const errors = {};
    const mimeType = req.file ? detectImageType(req.file.buffer) : null;
    if (!req.file) errors.photo = 'Adjunte una foto de los residuos.';
    else if (!mimeType) errors.photo = 'La foto debe ser una imagen JPG, PNG, WEBP o HEIC.';
    if (latitude === null || longitude === null) errors.location = 'La ubicación GPS no es válida.';
    if (!CATEGORIES.includes(category)) errors.category = 'Seleccione el tipo de residuo.';
    if (!SIZES.includes(estimated_size)) errors.estimated_size = 'Seleccione el tamaño estimado.';
    if (description.length > 280) errors.description = 'La descripción admite hasta 280 caracteres.';
    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: 'Revise los datos del reporte.', errors });
    }

    const key = `reports/${req.user.id}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${EXT[mimeType]}`;
    await saveImage(key, req.file.buffer, mimeType);

    const insert = await query(
      `INSERT INTO incidents (user_id, photo_key, category, estimated_size, description, address, gps_accuracy_m, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($8, $9), 4326))
       RETURNING id;`,
      [req.user.id, key, category, estimated_size, description || null, address, Number.isFinite(accuracy) ? accuracy : null, longitude, latitude]
    );
    const result = await query(`${SELECT_REPORT} WHERE i.id = $1`, [insert.rows[0].id]);
    const report = await toReport(result.rows[0], req);

    return res.status(201).json({
      success: true,
      message: `Reporte registrado con el código de seguimiento ${report.code}.`,
      data: report,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Reportes cercanos a una posición, para evitar duplicados.
 * Endpoint: GET /api/reports/nearby?lat=&lng=&radius=500&status=
 */
const getNearbyReports = async (req, res, next) => {
  try {
    const lat = parseCoord(req.query.lat, -90, 90);
    const lng = parseCoord(req.query.lng, -180, 180);
    if (lat === null || lng === null) {
      return res.status(400).json({ success: false, message: 'Los parámetros lat y lng son obligatorios y deben ser válidos.' });
    }
    const radius = Math.min(parseInt(req.query.radius, 10) || DEFAULT_RADIUS_M, MAX_RADIUS_M);
    const values = [lng, lat, radius];
    let filter = '';
    if (req.query.status) {
      if (!STATUSES.includes(req.query.status)) {
        return res.status(400).json({ success: false, message: `Estado no válido. Use: ${STATUSES.join(', ')}.` });
      }
      values.push(req.query.status);
      filter = 'AND i.status = $4';
    }

    const result = await query(
      `WITH here AS (SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography AS g)
       SELECT
         i.id, i.user_id, i.photo_key, i.category, i.estimated_size, i.description, i.address,
         i.gps_accuracy_m, i.status, i.created_at, i.updated_at,
         ST_X(i.location) AS longitude,
         ST_Y(i.location) AS latitude,
         ST_Distance(i.location::geography, here.g) AS distance_m
       FROM incidents i, here
       WHERE ST_DWithin(i.location::geography, here.g, $3) ${filter}
       ORDER BY distance_m ASC
       LIMIT 200;`,
      values
    );
    const data = await Promise.all(result.rows.map((row) => toReport(row, req)));
    return res.status(200).json({ success: true, radius_m: radius, count: data.length, data });
  } catch (error) {
    return next(error);
  }
};

/**
 * Reportes del ciudadano que inició sesión.
 * Endpoint: GET /api/reports/mine
 */
const getMyReports = async (req, res, next) => {
  try {
    const result = await query(`${SELECT_REPORT} WHERE i.user_id = $1 ORDER BY i.created_at DESC`, [req.user.id]);
    const data = await Promise.all(result.rows.map((row) => toReport(row, req)));
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return next(error);
  }
};

/**
 * Detalle de un reporte.
 * Endpoint: GET /api/reports/:id
 */
const getReport = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'Identificador no válido.' });
    const result = await query(`${SELECT_REPORT} WHERE i.id = $1`, [id]);
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'No se encontró el reporte.' });
    return res.status(200).json({ success: true, data: await toReport(result.rows[0], req) });
  } catch (error) {
    return next(error);
  }
};

module.exports = { CATEGORIES, EXT, createReport, getNearbyReports, getMyReports, getReport, reportCode };
