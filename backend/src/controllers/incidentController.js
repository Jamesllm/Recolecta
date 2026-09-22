/**
 * Controlador de Incidentes de Recolección (Recolecta+)
 * Módulo: src/controllers/incidentController.js
 */

const { query } = require('../config/db');

/**
 * Registra un nuevo incidente georreferenciado con PostGIS.
 * Endpoint: POST /api/incidents
 * Payload esperado: { user_id, photo_url, category, estimated_size, description, latitude, longitude }
 */
const createIncident = async (req, res, next) => {
  try {
    const {
      user_id,
      photo_url,
      category,
      estimated_size,
      description,
      latitude,
      longitude,
    } = req.body;

    // 1. Validaciones de campos obligatorios
    const missingFields = [];
    if (!user_id) missingFields.push('user_id');
    if (!category) missingFields.push('category');
    if (latitude === undefined || latitude === null) missingFields.push('latitude');
    if (longitude === undefined || longitude === null) missingFields.push('longitude');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Faltan campos obligatorios: ${missingFields.join(', ')}`,
      });
    }

    // 2. Validación de rangos geográficos (WGS84 EPSG:4326)
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      return res.status(400).json({
        success: false,
        message: 'La latitud debe ser un número decimal válido entre -90 y 90.',
      });
    }

    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      return res.status(400).json({
        success: false,
        message: 'La longitud debe ser un número decimal válido entre -180 y 180.',
      });
    }

    // 3. Inserción en PostGIS: ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    // Nota: En PostGIS ST_MakePoint recibe primero X (longitud) y luego Y (latitud)
    const insertQuery = `
      INSERT INTO incidents (
        user_id,
        photo_url,
        category,
        estimated_size,
        description,
        location,
        status,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5,
        ST_SetSRID(ST_MakePoint($6, $7), 4326),
        'pending',
        NOW(),
        NOW()
      )
      RETURNING 
        id,
        user_id,
        photo_url,
        category,
        estimated_size,
        description,
        status,
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS latitude,
        created_at,
        updated_at;
    `;

    const values = [
      user_id,
      photo_url || null,
      category,
      estimated_size || null,
      description || null,
      lngNum, // $6: X (longitude)
      latNum, // $7: Y (latitude)
    ];

    const result = await query(insertQuery, values);
    const createdIncident = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Incidente registrado exitosamente.',
      data: createdIncident,
    });
  } catch (error) {
    console.error('[createIncident Error]:', error);
    return next(error);
  }
};

/**
 * Obtiene la lista completa de incidentes con sus coordenadas en decimal nativo.
 * Endpoint: GET /api/incidents
 */
const getIncidents = async (req, res, next) => {
  try {
    const { status, category } = req.query;

    let selectQuery = `
      SELECT 
        id,
        user_id,
        photo_url,
        category,
        estimated_size,
        description,
        status,
        cluster_id,
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS latitude,
        created_at,
        updated_at
      FROM incidents
    `;

    const whereClauses = [];
    const values = [];

    if (status) {
      values.push(status);
      whereClauses.push(`status = $${values.length}`);
    }

    if (category) {
      values.push(category);
      whereClauses.push(`category = $${values.length}`);
    }

    if (whereClauses.length > 0) {
      selectQuery += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    selectQuery += ` ORDER BY created_at DESC;`;

    const result = await query(selectQuery, values);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
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
    const { id } = req.params;
    const { status } = req.body;

    // 1. Validar ID numérico
    const incidentId = parseInt(id, 10);
    if (isNaN(incidentId)) {
      return res.status(400).json({
        success: false,
        message: 'El identificador del incidente debe ser un número entero válido.',
      });
    }

    // 2. Validar estado permitido
    const allowedStatuses = ['pending', 'assigned', 'resolved'];
    if (!status || !allowedStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Estado no válido. Los estados permitidos son: ${allowedStatuses.join(', ')}`,
      });
    }

    const normalizedStatus = status.toLowerCase();

    // 3. Ejecutar actualización
    const updateQuery = `
      UPDATE incidents
      SET 
        status = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING 
        id,
        user_id,
        photo_url,
        category,
        estimated_size,
        description,
        status,
        cluster_id,
        ST_X(location::geometry) AS longitude,
        ST_Y(location::geometry) AS latitude,
        created_at,
        updated_at;
    `;

    const result = await query(updateQuery, [normalizedStatus, incidentId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontró ningún incidente con el ID ${incidentId}.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `El estado del incidente #${incidentId} ha sido actualizado a '${normalizedStatus}'.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[updateIncidentStatus Error]:', error);
    return next(error);
  }
};

module.exports = {
  createIncident,
  getIncidents,
  updateIncidentStatus,
};
