/**
 * Controlador de clústeres K-Means para el panel municipal
 * Módulo: src/controllers/clusterController.js
 */

const path = require('path');
const { execFile } = require('child_process');
const { query } = require('../config/db');
const { reportCode } = require('./reportController');
const { urgencyOf, tonsOf, sumTons } = require('../services/incidentRules');

// Zona del clúster: dirección del reporte más cercano al centroide
const zoneOf = (c) => {
  let best = null;
  let bestD = Infinity;
  for (const i of c.incidents) {
    const d = (i.latitude - c.latitude) ** 2 + (i.longitude - c.longitude) ** 2;
    if (i.address && d < bestD) {
      best = i.address;
      bestD = d;
    }
  }
  return best;
};

const SCRIPT = path.join(__dirname, '..', '..', 'ai', 'cluster_service.py');
const DEFAULT_PYTHON = process.platform === 'win32'
  ? path.join(__dirname, '..', '..', 'ai', 'venv', 'Scripts', 'python.exe')
  : path.join(__dirname, '..', '..', 'ai', 'venv', 'bin', 'python');

/**
 * Clústeres activos con los reportes que agrupa cada uno.
 * Endpoint: GET /api/clusters
 */
const getClusters = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        c.id, c.incident_count, c.created_at,
        ST_Y(c.centroid) AS latitude,
        ST_X(c.centroid) AS longitude,
        COALESCE(json_agg(json_build_object(
          'id', i.id, 'status', i.status, 'category', i.category, 'estimated_size', i.estimated_size,
          'address', i.address, 'latitude', ST_Y(i.location), 'longitude', ST_X(i.location)
        ) ORDER BY i.id) FILTER (WHERE i.id IS NOT NULL), '[]') AS incidents
      FROM clusters c
      LEFT JOIN incidents i ON i.cluster_id = c.id
      WHERE c.status = 'active'
      GROUP BY c.id
      ORDER BY c.incident_count DESC, c.id ASC;`);
    const data = result.rows.map((c) => ({
      ...c,
      code: `C-${String(c.id).padStart(2, '0')}`,
      zone: zoneOf(c),
      estimated_tons: sumTons(c.incidents),
      incidents: c.incidents.map((i) => ({ ...i, code: reportCode(i.id), urgency: urgencyOf(i), estimated_tons: tonsOf(i) })),
    }));
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return next(error);
  }
};

/**
 * Ejecuta el agrupamiento K-Means (backend/ai/cluster_service.py) sobre los reportes pendientes.
 * Endpoint: POST /api/clusters/run  Payload: { k?: number }
 */
const runClustering = async (req, res, next) => {
  try {
    const k = Math.min(Math.max(parseInt(req.body.k, 10) || 3, 1), 20);
    const pending = await query("SELECT COUNT(*)::int AS n FROM incidents WHERE status = 'pending'");
    if (!pending.rows[0].n) {
      return res.status(409).json({ success: false, message: 'No hay reportes pendientes para agrupar.' });
    }

    const python = process.env.PYTHON_BIN || DEFAULT_PYTHON;
    execFile(python, [SCRIPT, '-k', String(k)], { cwd: path.dirname(SCRIPT), timeout: 120000 }, (err, stdout, stderr) => {
      if (err) {
        console.error('[runClustering Error]:', err.message, stderr || stdout);
        return res.status(500).json({ success: false, message: 'El servicio K-Means terminó con error. Revise la consola del backend.' });
      }
      return res.status(200).json({
        success: true,
        message: `Agrupamiento K-Means ejecutado sobre ${pending.rows[0].n} reportes pendientes (K = ${Math.min(k, pending.rows[0].n)}).`,
      });
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getClusters, runClustering };
