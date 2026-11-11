/**
 * Cambio de estado de los reportes, historial y avisos al vecino (US-05 y US-06)
 * Módulo: src/services/reportStatus.js
 */

const { query } = require('../config/db');
const { sendMail } = require('./mailer');
const { titleOf } = require('./incidentRules');

const STATUSES = ['pending', 'assigned', 'resolved'];

const reportCode = (id) => `RL-${String(id).padStart(4, '0')}`;
const clusterCode = (id) => (id == null ? null : `C-${String(id).padStart(2, '0')}`);

/** Texto del aviso según el nuevo estado del reporte. */
const noticeFor = (row, status) => {
  const code = reportCode(row.id);
  const what = titleOf(row).toLowerCase();
  const where = row.address ? ` en ${row.address}` : '';
  if (status === 'assigned') {
    return { title: `Tu reporte ${code} está en ruta`, body: `El municipio asignó tu reporte de ${what}${where} a una ruta de recolección.` };
  }
  if (status === 'resolved') {
    return { title: `Tu reporte ${code} fue atendido`, body: `El municipio recolectó los ${what}${where}. ¡Gracias por ayudar a mantener limpio tu distrito!` };
  }
  return { title: `Tu reporte ${code} volvió a «Pendiente»`, body: `El municipio volverá a revisar tu reporte de ${what}${where}.` };
};

const emailOnResolved = () => process.env.NOTIFY_EMAIL_ON_RESOLVED !== 'false';

/** Correo del aviso de «Resuelto»; no bloquea la respuesta al gestor. */
const emailNotices = (notices) => {
  Promise.resolve().then(async () => {
    for (const n of notices) {
      try {
        const sent = await sendMail({
          to: n.email,
          subject: n.title,
          title: n.title,
          paragraphs: [`Hola, ${n.full_name.split(' ')[0]}:`, n.body, 'Puedes ver la línea de seguimiento en la app, en «Notificaciones».'],
        });
        if (sent) await query('UPDATE notifications SET emailed_at = NOW() WHERE id = $1', [n.id]);
      } catch (error) {
        console.error('[Aviso por correo]:', error.message);
      }
    }
  });
};

/**
 * Cambia el estado de uno o varios reportes. Solo toca los que tenían otro estado:
 * registra el cambio en el historial y avisa al vecino si envió el reporte con su cuenta.
 * Devuelve los identificadores que cambiaron.
 */
const changeStatus = async (ids, status) => {
  const changed = await query(
    `UPDATE incidents
        SET status = $1::incident_status, updated_at = NOW(),
            resolved_at = CASE WHEN $1::incident_status = 'resolved' THEN COALESCE(resolved_at, NOW()) ELSE NULL END
      WHERE id = ANY($2::int[]) AND status <> $1::incident_status
      RETURNING id, user_id, category, address;`,
    [status, ids]
  );
  if (!changed.rowCount) return [];
  const changedIds = changed.rows.map((r) => r.id);
  await query('INSERT INTO incident_events (incident_id, status) SELECT UNNEST($1::int[]), $2::incident_status', [changedIds, status]);

  const notices = [];
  for (const row of changed.rows.filter((r) => r.user_id)) {
    const { title, body } = noticeFor(row, status);
    const inserted = await query(
      `INSERT INTO notifications (user_id, incident_id, status, title, body)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [row.user_id, row.id, status, title, body]
    );
    notices.push({ id: inserted.rows[0].id, user_id: row.user_id, title, body });
  }

  if (status === 'resolved' && emailOnResolved() && notices.length) {
    const users = await query('SELECT id, email, full_name FROM users WHERE id = ANY($1::int[])', [notices.map((n) => n.user_id)]);
    const byId = new Map(users.rows.map((u) => [u.id, u]));
    emailNotices(notices.map((n) => ({ ...n, ...byId.get(n.user_id) })));
  }
  return changedIds;
};

/** Registra el estado inicial de un reporte nuevo en el historial. */
const recordCreated = (incidentId) =>
  query("INSERT INTO incident_events (incident_id, status) VALUES ($1, 'pending')", [incidentId]);

/**
 * Línea de seguimiento de cada reporte (pantallas A4 del panel y 14 de la app):
 * recibido → agrupado por la IA en una zona → asignado a una ruta → recolectado.
 * Recibe filas con id, status, created_at, resolved_at y cluster_id. Devuelve un Map id → pasos.
 */
const timelinesFor = async (rows) => {
  const ids = rows.map((r) => r.id);
  const clusterIds = [...new Set(rows.map((r) => r.cluster_id).filter((c) => c != null))];
  const [events, clusters] = await Promise.all([
    ids.length
      ? query('SELECT incident_id, status, MAX(created_at) AS at FROM incident_events WHERE incident_id = ANY($1::int[]) GROUP BY incident_id, status', [ids])
      : { rows: [] },
    clusterIds.length ? query('SELECT id, created_at FROM clusters WHERE id = ANY($1::int[])', [clusterIds]) : { rows: [] },
  ]);
  const eventAt = new Map(events.rows.map((e) => [`${e.incident_id}:${e.status}`, e.at]));
  const clusterAt = new Map(clusters.rows.map((c) => [c.id, c.created_at]));

  return new Map(rows.map((r) => {
    const onRoute = r.status === 'assigned' || r.status === 'resolved';
    return [r.id, [
      { key: 'received', label: 'Reporte recibido', done: true, at: r.created_at, detail: null },
      {
        key: 'grouped', label: 'Agrupado en una zona prioritaria', done: r.cluster_id != null,
        at: clusterAt.get(r.cluster_id) ?? null, detail: r.cluster_id != null ? `Zona ${clusterCode(r.cluster_id)} (K-Means)` : null,
      },
      { key: 'assigned', label: 'Asignado a una ruta de recolección', done: onRoute, at: onRoute ? eventAt.get(`${r.id}:assigned`) ?? null : null, detail: null },
      { key: 'resolved', label: 'Recolectado', done: r.status === 'resolved', at: r.status === 'resolved' ? r.resolved_at : null, detail: null },
    ]];
  }));
};

module.exports = { STATUSES, changeStatus, recordCreated, timelinesFor, clusterCode, reportCode };
