/**
 * Controlador de clústeres K-Means para el panel municipal
 * Módulo: src/controllers/clusterController.js
 */

const path = require('path');
const { execFile } = require('child_process');
const { query } = require('../config/db');
const { reportCode } = require('./reportController');
const { urgencyOf, tonsOf, sumTons } = require('../services/incidentRules');
const { getSettings } = require('../services/settings');
const { roadRoute } = require('../services/roadRoute');

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

/** Ejecución de K-Means que generó los clústeres activos: K usado, modo de elección y métricas. */
const latestRun = async () => {
  const result = await query(`
    SELECT id, k, k_mode, incident_count, weighted, silhouette, davies_bouldin, created_at
    FROM cluster_runs
    WHERE id = (SELECT MAX(run_id) FROM clusters WHERE status = 'active')`);
  return result.rows[0] ?? null;
};

/** Lectura de la silueta según Kaufman y Rousseeuw (1990). */
const silhouetteLabel = (s) => {
  if (s == null) return 'sin medir';
  if (s > 0.7) return 'estructura fuerte';
  if (s > 0.5) return 'estructura razonable';
  if (s > 0.25) return 'estructura débil';
  return 'sin estructura clara';
};

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
      LEFT JOIN incidents i ON i.cluster_id = c.id AND i.status <> 'rejected'
      WHERE c.status = 'active'
      GROUP BY c.id
      ORDER BY c.incident_count DESC, c.id ASC;`);
    const data = result.rows.map((c) => ({
      ...c,
      code: `C-${String(c.id).padStart(2, '0')}`,
      incident_count: c.incidents.length, // sin los reportes rechazados después del agrupamiento
      zone: zoneOf(c),
      estimated_tons: sumTons(c.incidents),
      incidents: c.incidents.map((i) => ({ ...i, code: reportCode(i.id), urgency: urgencyOf(i), estimated_tons: tonsOf(i) })),
    }));
    const run = await latestRun();
    return res.status(200).json({ success: true, count: data.length, data, run });
  } catch (error) {
    return next(error);
  }
};

/**
 * Ejecuta el agrupamiento K-Means (backend/ai/cluster_service.py) sobre los reportes pendientes.
 * Endpoint: POST /api/clusters/run  Payload: { k?: number | 'auto' }
 * Sin k (o con 'auto'), el servicio prueba K de 2 a 8 y usa el de mayor silueta.
 */
const runClustering = async (req, res, next) => {
  try {
    const manualK = parseInt(req.body.k, 10);
    const settings = await getSettings(); // parámetros de la IA definidos en Configuración (A8)
    const args = [SCRIPT, '--k-max', String(settings.clusters_k_max)];
    if (manualK > 0) args.push('-k', String(Math.min(manualK, 20)));
    if (!settings.clusters_weighted) args.push('--no-weights');

    const pending = await query("SELECT COUNT(*)::int AS n FROM incidents WHERE status = 'pending'");
    if (!pending.rows[0].n) {
      return res.status(409).json({ success: false, message: 'No hay reportes pendientes para agrupar.' });
    }

    const python = process.env.PYTHON_BIN || DEFAULT_PYTHON;
    execFile(python, args, { cwd: path.dirname(SCRIPT), timeout: 120000 }, async (err, stdout, stderr) => {
      if (err) {
        console.error('[runClustering Error]:', err.message, stderr || stdout);
        return res.status(500).json({ success: false, message: 'El servicio K-Means terminó con error. Revise la consola del backend.' });
      }
      try {
        const run = await latestRun();
        const how = run?.k_mode === 'auto' ? 'elegido por silueta' : 'indicado por el gestor';
        const quality = run?.silhouette == null ? '' : `, silueta ${run.silhouette.toFixed(2)} (${silhouetteLabel(run.silhouette)})`;
        return res.status(200).json({
          success: true,
          message: `K-Means agrupó ${pending.rows[0].n} reportes pendientes en ${run?.k ?? '?'} zonas (K ${how}${quality}).`,
          run,
        });
      } catch (error) {
        return next(error);
      }
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Ruta de recolección del clúster por calles y avenidas (OSRM), con las paradas aún no recolectadas.
 * Endpoint: GET /api/clusters/:id/route
 */
const getClusterRoute = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!(id > 0)) return res.status(400).json({ success: false, message: 'Identificador no válido.' });
    const cluster = await query('SELECT ST_Y(centroid) AS latitude, ST_X(centroid) AS longitude FROM clusters WHERE id = $1', [id]);
    if (!cluster.rowCount) return res.status(404).json({ success: false, message: 'No se encontró el clúster.' });
    const stops = await query(
      `SELECT id, status, category, estimated_size, address, ST_Y(location) AS latitude, ST_X(location) AS longitude
         FROM incidents WHERE cluster_id = $1 AND status IN ('pending', 'assigned') ORDER BY id`,
      [id]
    );
    const route = await roadRoute(cluster.rows[0], stops.rows);
    return res.status(200).json({
      success: true,
      data: {
        ...route,
        stops: route.stops.map((s) => ({ ...s, code: reportCode(s.id), urgency: urgencyOf(s), estimated_tons: tonsOf(s) })),
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getClusters, runClustering, getClusterRoute };
