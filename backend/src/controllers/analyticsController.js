/**
 * Indicadores del servicio de recolección por periodo (pantalla A7 · Análisis, US-09)
 * Módulo: src/controllers/analyticsController.js
 */

const { query } = require('../config/db');
const { sumTons, tonsOf } = require('../services/incidentRules');

const PERIODS = [7, 30, 90];
const DAY_MS = 24 * 60 * 60 * 1000;
const SLA_HOURS = 48; // cumplimiento: reportes atendidos en 48 horas o menos
const CATEGORIES = ['Orgánico', 'Inorgánico', 'Escombros', 'Peligroso'];

// Fecha en Lima (AAAA-MM-DD) para agrupar por día
const limaDate = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(d);
const dayLabel = (d) => new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: 'short' }).format(d);

/** Variación porcentual frente al periodo anterior (null si el anterior es 0). */
const variation = (current, previous) => (previous ? Math.round(((current - previous) / previous) * 1000) / 10 : null);

const hours = (r) => (new Date(r.resolved_at) - new Date(r.created_at)) / 3_600_000;

/** Indicadores de un periodo [from, to). */
const kpisFor = (rows, from, to) => {
  const inRange = (d) => d && d >= from && d < to;
  const received = rows.filter((r) => inRange(new Date(r.created_at)));
  const resolved = rows.filter((r) => r.status === 'resolved' && inRange(r.resolved_at && new Date(r.resolved_at)));
  const valid = received.filter((r) => r.status !== 'rejected');
  const onTime = valid.filter((r) => r.status === 'resolved' && r.resolved_at && hours(r) <= SLA_HOURS);
  const reporters = new Set(received.map((r) => (r.user_id ? `u${r.user_id}` : `d${r.device_id}`)));
  return {
    received: received.length,
    resolved: resolved.length,
    rejected: received.length - valid.length,
    avg_resolution_hours: resolved.length ? Math.round((resolved.reduce((s, r) => s + hours(r), 0) / resolved.length) * 10) / 10 : null,
    tons_collected: sumTons(resolved),
    participants: reporters.size,
    compliance_pct: valid.length ? Math.round((onTime.length / valid.length) * 1000) / 10 : null,
    _received: received,
    _resolved: resolved,
  };
};

/**
 * Endpoint: GET /api/analytics?days=7|30|90
 * Devuelve los indicadores del periodo con su variación frente al periodo anterior de igual duración,
 * la serie por día (o por semana en 90 días), el desglose por categoría y por estado y el ranking de zonas.
 */
const getAnalytics = async (req, res, next) => {
  try {
    const days = PERIODS.includes(Number(req.query.days)) ? Number(req.query.days) : 30;
    const now = new Date();
    const from = new Date(now.getTime() - days * DAY_MS);
    const prevFrom = new Date(now.getTime() - 2 * days * DAY_MS);

    const result = await query(
      `SELECT id, user_id, device_id, category, estimated_size, status, created_at, resolved_at
         FROM incidents WHERE created_at >= $1 OR resolved_at >= $1`,
      [prevFrom]
    );
    const rows = result.rows;
    const current = kpisFor(rows, from, now);
    const previous = kpisFor(rows, prevFrom, from);

    // Serie: por día (7 y 30 días) o por semana (90 días)
    const step = days === 90 ? 7 : 1;
    const series = [];
    for (let t = from.getTime(); t < now.getTime(); t += step * DAY_MS) {
      const start = new Date(t);
      const end = new Date(Math.min(t + step * DAY_MS, now.getTime()));
      const k = kpisFor(rows, start, end);
      series.push({ label: step === 1 ? dayLabel(end) : `Sem. ${dayLabel(start)}`, date: limaDate(start), received: k.received, resolved: k.resolved });
    }

    const byCategory = CATEGORIES.map((category) => ({
      category,
      received: current._received.filter((r) => r.category === category).length,
      resolved: current._resolved.filter((r) => r.category === category).length,
      tons_collected: sumTons(current._resolved.filter((r) => r.category === category)),
    }));

    const byStatus = ['pending', 'assigned', 'resolved', 'rejected'].map((status) => ({
      status,
      count: current._received.filter((r) => r.status === status).length,
    }));

    // Ranking de zonas: clústeres activos ordenados por reportes abiertos (pendientes o en ruta)
    const zones = await query(`
      SELECT c.id,
             COUNT(i.id)::int AS open_count,
             COALESCE(json_agg(json_build_object('category', i.category, 'estimated_size', i.estimated_size)) FILTER (WHERE i.id IS NOT NULL), '[]') AS items,
             (SELECT n.address FROM incidents n WHERE n.cluster_id = c.id AND n.address IS NOT NULL
               ORDER BY n.location <-> c.centroid LIMIT 1) AS zone
        FROM clusters c
        LEFT JOIN incidents i ON i.cluster_id = c.id AND i.status IN ('pending', 'assigned')
       WHERE c.status = 'active'
       GROUP BY c.id
       ORDER BY open_count DESC, c.id
       LIMIT 8`);

    const strip = ({ _received, _resolved, ...k }) => k;
    const cur = strip(current);
    const prev = strip(previous);
    return res.status(200).json({
      success: true,
      data: {
        days,
        sla_hours: SLA_HOURS,
        from,
        to: now,
        kpis: cur,
        previous: prev,
        variation: Object.fromEntries(Object.keys(cur).map((k) => [k, typeof cur[k] === 'number' && typeof prev[k] === 'number' ? variation(cur[k], prev[k]) : null])),
        series,
        by_category: byCategory,
        by_status: byStatus,
        zones: zones.rows.map((z) => ({
          id: z.id,
          code: `C-${String(z.id).padStart(2, '0')}`,
          zone: z.zone,
          open_count: z.open_count,
          estimated_tons: Math.round(z.items.reduce((s, i) => s + tonsOf(i), 0) * 100) / 100,
        })),
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getAnalytics };
