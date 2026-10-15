/**
 * Controlador de reportes ciudadanos (US-02 y US-03)
 * Módulo: src/controllers/reportController.js
 *
 * El vecino puede usar la app con su cuenta (req.user) o como invitado, identificado solo por su teléfono (req.deviceId).
 */

const crypto = require('crypto');
const { query } = require('../config/db');
const { saveImage, imageUrl } = require('../services/storage');
const { urgencyOf, isCritical, titleOf } = require('../services/incidentRules');

const CATEGORIES = ['Orgánico', 'Inorgánico', 'Escombros', 'Peligroso'];
const SIZES = ['small', 'medium', 'large'];
const STATUSES = ['pending', 'assigned', 'resolved'];
const DEFAULT_RADIUS_M = 500;
const MAX_RADIUS_M = 5000;
const MAX_REFERENCE = 140;
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

const REPORT_COLUMNS = `
    i.id, i.user_id, i.device_id, i.photo_key, i.category, i.estimated_size, i.description, i.address, i.reference,
    i.gps_accuracy_m, i.status, i.created_at, i.updated_at,
    ST_X(i.location) AS longitude,
    ST_Y(i.location) AS latitude`;

const SELECT_REPORT = `SELECT ${REPORT_COLUMNS} FROM incidents i`;

/** El reporte es del vecino si coincide su cuenta, o si lo envió como invitado desde este teléfono. */
const isMine = (row, req) =>
  (!!req.user && row.user_id === req.user.id) ||
  (row.user_id === null && !!req.deviceId && row.device_id === req.deviceId);

/** Confirmaciones «Sigue ahí» de cada reporte y si el vecino actual ya confirmó. */
const confirmationsFor = async (ids, req) => {
  if (!ids.length) return new Map();
  const result = await query(
    `SELECT incident_id, COUNT(*)::int AS total,
            BOOL_OR(($2::int IS NOT NULL AND user_id = $2) OR ($3::text IS NOT NULL AND device_id = $3)) AS mine
       FROM incident_confirmations
      WHERE incident_id = ANY($1::int[])
      GROUP BY incident_id`,
    [ids, req.user ? req.user.id : null, req.deviceId]
  );
  return new Map(result.rows.map((r) => [r.incident_id, r]));
};

/** Convierte una fila en la respuesta pública del reporte (sin datos de quien lo envió). */
const toReport = async (row, req, confirmations) => {
  const conf = confirmations.get(row.id);
  return {
    id: row.id,
    code: reportCode(row.id),
    title: titleOf(row),
    category: row.category,
    estimated_size: row.estimated_size,
    urgency: urgencyOf(row),
    critical: isCritical(row),
    description: row.description,
    address: row.address,
    reference: row.reference,
    gps_accuracy_m: row.gps_accuracy_m,
    status: row.status,
    latitude: row.latitude,
    longitude: row.longitude,
    distance_m: row.distance_m === undefined ? undefined : Math.round(row.distance_m),
    photo_url: await imageUrl(row.photo_key, req),
    confirmations: conf ? conf.total : 0,
    confirmed_by_me: !!(conf && conf.mine),
    is_mine: isMine(row, req),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const toReports = async (rows, req) => {
  const confirmations = await confirmationsFor(rows.map((r) => r.id), req);
  return Promise.all(rows.map((row) => toReport(row, req, confirmations)));
};

const findReport = async (id) => (await query(`${SELECT_REPORT} WHERE i.id = $1`, [id])).rows[0];

const parseCoord = (value, min, max) => {
  const n = parseFloat(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

const parseId = (value) => {
  const id = parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
};

const NO_IDENTITY = { success: false, message: 'Inicie sesión o actualice la app para continuar como invitado.' };

/**
 * Registra un reporte con foto y ubicación GPS, con cuenta o como invitado.
 * Endpoint: POST /api/reports (multipart/form-data)
 * Campos: photo (archivo), latitude, longitude, gps_accuracy_m?, address?, reference?, category, estimated_size, description?
 */
const createReport = async (req, res, next) => {
  try {
    if (!req.user && !req.deviceId) return res.status(400).json(NO_IDENTITY);

    const latitude = parseCoord(req.body.latitude, -90, 90);
    const longitude = parseCoord(req.body.longitude, -180, 180);
    const { category, estimated_size } = req.body;
    const description = (req.body.description || '').trim();
    const address = (req.body.address || '').trim() || null;
    const reference = (req.body.reference || '').trim();
    const accuracy = parseFloat(req.body.gps_accuracy_m);

    const errors = {};
    const mimeType = req.file ? detectImageType(req.file.buffer) : null;
    if (!req.file) errors.photo = 'Adjunte una foto de los residuos.';
    else if (!mimeType) errors.photo = 'La foto debe ser una imagen JPG, PNG, WEBP o HEIC.';
    if (latitude === null || longitude === null) errors.location = 'La ubicación GPS no es válida.';
    if (!CATEGORIES.includes(category)) errors.category = 'Seleccione el tipo de residuo.';
    if (!SIZES.includes(estimated_size)) errors.estimated_size = 'Seleccione el tamaño estimado.';
    if (description.length > 280) errors.description = 'La descripción admite hasta 280 caracteres.';
    if (reference.length > MAX_REFERENCE) errors.reference = `La referencia admite hasta ${MAX_REFERENCE} caracteres.`;
    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: 'Revise los datos del reporte.', errors });
    }

    const owner = req.user ? String(req.user.id) : 'guest';
    const key = `reports/${owner}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${EXT[mimeType]}`;
    await saveImage(key, req.file.buffer, mimeType);

    const insert = await query(
      `INSERT INTO incidents (user_id, device_id, photo_key, category, estimated_size, description, address, reference, gps_accuracy_m, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ST_SetSRID(ST_MakePoint($10, $11), 4326))
       RETURNING id;`,
      [req.user ? req.user.id : null, req.deviceId, key, category, estimated_size, description || null, address, reference || null,
        Number.isFinite(accuracy) ? accuracy : null, longitude, latitude]
    );
    const [report] = await toReports([await findReport(insert.rows[0].id)], req);

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
       SELECT ${REPORT_COLUMNS},
         ST_Distance(i.location::geography, here.g) AS distance_m
       FROM incidents i, here
       WHERE ST_DWithin(i.location::geography, here.g, $3) ${filter}
       ORDER BY distance_m ASC
       LIMIT 200;`,
      values
    );
    const data = await toReports(result.rows, req);
    return res.status(200).json({ success: true, radius_m: radius, count: data.length, data });
  } catch (error) {
    return next(error);
  }
};

/**
 * Reportes del vecino: los de su cuenta y los que envió como invitado desde este teléfono.
 * Endpoint: GET /api/reports/mine
 */
const getMyReports = async (req, res, next) => {
  try {
    if (!req.user && !req.deviceId) return res.status(400).json(NO_IDENTITY);
    const result = req.user
      ? await query(`${SELECT_REPORT} WHERE i.user_id = $1 OR (i.user_id IS NULL AND $2::text IS NOT NULL AND i.device_id = $2) ORDER BY i.created_at DESC`, [req.user.id, req.deviceId])
      : await query(`${SELECT_REPORT} WHERE i.user_id IS NULL AND i.device_id = $1 ORDER BY i.created_at DESC`, [req.deviceId]);
    const data = await toReports(result.rows, req);
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
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ success: false, message: 'Identificador no válido.' });
    const row = await findReport(id);
    if (!row) return res.status(404).json({ success: false, message: 'No se encontró el reporte.' });
    const [report] = await toReports([row], req);
    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    return next(error);
  }
};

/**
 * Confirmación «Sigue ahí»: otro vecino indica que el punto sigue sin atenderse (una vez por cuenta y por teléfono).
 * Endpoint: POST /api/reports/:id/confirm
 */
const confirmReport = async (req, res, next) => {
  try {
    if (!req.user && !req.deviceId) return res.status(400).json(NO_IDENTITY);
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ success: false, message: 'Identificador no válido.' });
    const row = await findReport(id);
    if (!row) return res.status(404).json({ success: false, message: 'No se encontró el reporte.' });
    if (row.status === 'resolved') return res.status(409).json({ success: false, message: 'Este punto ya fue atendido.' });
    if (isMine(row, req)) return res.status(409).json({ success: false, message: 'No puedes confirmar tu propio reporte.' });

    // Si ya confirmó con esta cuenta o desde este teléfono, el índice único evita contarlo dos veces
    await query(
      'INSERT INTO incident_confirmations (incident_id, user_id, device_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [id, req.user ? req.user.id : null, req.deviceId]
    );
    const [report] = await toReports([row], req);
    return res.status(200).json({ success: true, message: 'Gracias por confirmar que el punto sigue ahí.', data: report });
  } catch (error) {
    return next(error);
  }
};

module.exports = { CATEGORIES, EXT, createReport, getNearbyReports, getMyReports, getReport, confirmReport, reportCode };
