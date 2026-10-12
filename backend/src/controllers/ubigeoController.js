/**
 * Ubigeo del Perú para los selectores de departamento, provincia y distrito
 * Módulo: src/controllers/ubigeoController.js
 */

const { query } = require('../config/db');

const list = (sql, params = []) => async (req, res, next) => {
  try {
    const result = await query(sql, params.map((p) => req.params[p]));
    return res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    return next(error);
  }
};

// GET /api/ubigeo/departamentos
const getDepartamentos = list('SELECT id_departamento AS id, nombre FROM departamentos ORDER BY nombre');

// GET /api/ubigeo/departamentos/:id/provincias
const getProvincias = list('SELECT id_provincia AS id, nombre FROM provincias WHERE id_departamento = $1 ORDER BY nombre', ['id']);

// GET /api/ubigeo/provincias/:id/distritos
const getDistritos = list('SELECT ubigeo AS id, nombre FROM distritos WHERE id_provincia = $1 ORDER BY nombre', ['id']);

module.exports = { getDepartamentos, getProvincias, getDistritos };
