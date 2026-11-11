/**
 * Recuperar contraseña (US-01, pantalla 06)
 * Módulo: src/controllers/passwordController.js
 *
 * El vecino pide un enlace por correo; el enlace abre una página del backend donde crea la nueva contraseña.
 * El token solo se guarda como hash SHA-256, se usa una vez y caduca a los 30 minutos.
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { sendMail } = require('../services/mailer');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_RE = /^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñ])(?=.*\d).{8,}$/;
const TTL_MINUTES = 30;
const RESEND_SECONDS = 60;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const publicUrl = () => (process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`).replace(/\/$/, '');

// Misma respuesta exista o no la cuenta, para no revelar qué correos están registrados
const GENERIC_OK = 'Si el correo está registrado, te enviamos un enlace para crear una nueva contraseña. Revisa tu bandeja de entrada.';

/**
 * Envía el enlace para crear una nueva contraseña.
 * Endpoint: POST /api/password/forgot  Payload: { email }
 */
const forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, message: 'Ingrese un correo electrónico válido.', errors: { email: 'Ingrese un correo electrónico válido.' } });
    }
    const found = await query('SELECT id, full_name, email FROM users WHERE LOWER(email) = $1', [email]);
    const user = found.rows[0];
    if (!user) return res.status(200).json({ success: true, message: GENERIC_OK });

    // Evita reenviar correos seguidos a la misma cuenta
    const recent = await query(
      `SELECT 1 FROM password_resets WHERE user_id = $1 AND created_at > NOW() - INTERVAL '${RESEND_SECONDS} seconds'`,
      [user.id]
    );
    if (recent.rowCount) return res.status(200).json({ success: true, message: GENERIC_OK });

    const token = crypto.randomBytes(32).toString('hex');
    await query('UPDATE password_resets SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL', [user.id]);
    await query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '${TTL_MINUTES} minutes')`,
      [user.id, hashToken(token)]
    );
    await sendMail({
      to: user.email,
      subject: 'Crea una nueva contraseña de Recolecta+',
      title: 'Crea una nueva contraseña',
      paragraphs: [
        `Hola, ${user.full_name.split(' ')[0]}:`,
        `Recibimos una solicitud para cambiar la contraseña de tu cuenta. El enlace caduca en ${TTL_MINUTES} minutos y solo se puede usar una vez.`,
        'Si no lo pediste, ignora este correo: tu contraseña actual sigue funcionando.',
      ],
      action: { label: 'Crear nueva contraseña', url: `${publicUrl()}/reset-password?token=${token}` },
    });
    return res.status(200).json({ success: true, message: GENERIC_OK });
  } catch (error) {
    return next(error);
  }
};

/** Solicitud vigente para el token, o null si no existe, ya se usó o caducó. */
const validReset = async (token) => {
  if (!/^[a-f0-9]{64}$/.test(token || '')) return null;
  const result = await query(
    'SELECT id, user_id FROM password_resets WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()',
    [hashToken(token)]
  );
  return result.rows[0] ?? null;
};

/** Guarda la nueva contraseña. Devuelve { ok, message }. */
const applyReset = async (token, password) => {
  const reset = await validReset(token);
  if (!reset) return { ok: false, status: 410, message: 'El enlace caducó o ya se usó. Solicita uno nuevo desde la app.' };
  if (!PASSWORD_RE.test(password || '')) return { ok: false, status: 400, message: 'Mínimo 8 caracteres, con al menos una letra y un número.' };
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [await bcrypt.hash(password, 10), reset.user_id]);
  await query('UPDATE password_resets SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL', [reset.user_id]);
  return { ok: true, status: 200, message: 'Tu contraseña se actualizó. Ya puedes iniciar sesión en la app con la nueva contraseña.' };
};

/**
 * Endpoint: POST /api/password/reset  Payload: { token, password }
 */
const resetPassword = async (req, res, next) => {
  try {
    const result = await applyReset(String(req.body.token || ''), req.body.password);
    return res.status(result.status).json({ success: result.ok, message: result.message });
  } catch (error) {
    return next(error);
  }
};

// ---------- Página web que abre el enlace del correo ----------

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const page = (body) => `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Nueva contraseña · Recolecta+</title>
<style>
  body{font-family:Arial,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:24px}
  main{max-width:420px;margin:40px auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px}
  h1{color:#059669;font-size:22px;margin:0 0 4px} h2{font-size:18px;margin:0 0 16px}
  label{display:block;font-size:14px;font-weight:bold;margin:14px 0 6px}
  input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #cbd5e1;border-radius:10px;font-size:16px}
  button{margin-top:18px;width:100%;padding:13px;background:#059669;color:#fff;border:0;border-radius:10px;font-size:16px;font-weight:bold}
  .help{color:#64748b;font-size:13px;margin-top:6px} .msg{padding:12px;border-radius:10px;font-size:14px}
  .ok{background:#ecfdf5;color:#065f46} .err{background:#fef2f2;color:#991b1b}
</style></head><body><main><h1>Recolecta+</h1>${body}</main></body></html>`;

const form = (token, error) => page(`
  <h2>Crea una nueva contraseña</h2>
  ${error ? `<p class="msg err">${escapeHtml(error)}</p>` : ''}
  <form method="post" action="/reset-password">
    <input type="hidden" name="token" value="${escapeHtml(token)}">
    <label for="password">Nueva contraseña</label>
    <input id="password" name="password" type="password" minlength="8" required autocomplete="new-password">
    <p class="help">Mínimo 8 caracteres, con al menos una letra y un número.</p>
    <label for="confirm">Repite la contraseña</label>
    <input id="confirm" name="confirm" type="password" minlength="8" required autocomplete="new-password">
    <button type="submit">Guardar contraseña</button>
  </form>`);

/** GET /reset-password?token= */
const resetPage = async (req, res, next) => {
  try {
    const token = String(req.query.token || '');
    if (!(await validReset(token))) {
      return res.status(410).send(page('<h2>Enlace no válido</h2><p class="msg err">El enlace caducó o ya se usó. Solicítalo de nuevo desde «¿Olvidaste tu contraseña?» en la app.</p>'));
    }
    return res.send(form(token));
  } catch (error) {
    return next(error);
  }
};

/** POST /reset-password (formulario de la página) */
const resetPageSubmit = async (req, res, next) => {
  try {
    const token = String(req.body.token || '');
    if (req.body.password !== req.body.confirm) return res.status(400).send(form(token, 'Las contraseñas no coinciden.'));
    const result = await applyReset(token, req.body.password);
    if (result.ok) return res.send(page(`<h2>Contraseña actualizada</h2><p class="msg ok">${escapeHtml(result.message)}</p>`));
    if (result.status === 410) return res.status(410).send(page(`<h2>Enlace no válido</h2><p class="msg err">${escapeHtml(result.message)}</p>`));
    return res.status(result.status).send(form(token, result.message));
  } catch (error) {
    return next(error);
  }
};

module.exports = { forgotPassword, resetPassword, resetPage, resetPageSubmit, TTL_MINUTES };
