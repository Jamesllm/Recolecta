/**
 * Envío de correos (US-01: recuperar contraseña; US-06: aviso de reporte resuelto)
 * Módulo: src/services/mailer.js
 *
 * Con SMTP_HOST configurado envía por SMTP. Sin él (desarrollo) muestra el correo en la consola,
 * para que el equipo pueda probar el flujo sin una cuenta de correo.
 */

const nodemailer = require('nodemailer');

let transport = null;
const smtpConfigured = () => !!process.env.SMTP_HOST;

const getTransport = () => {
  if (!transport) {
    const port = parseInt(process.env.SMTP_PORT, 10) || 465;
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transport;
};

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Plantilla común: título, párrafos y un botón opcional. */
const layout = ({ title, paragraphs, action }) => `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#0f172a">
  <h2 style="color:#059669;margin-bottom:4px">Recolecta+</h2>
  <h3 style="margin-top:0">${escapeHtml(title)}</h3>
  ${paragraphs.map((p) => `<p style="line-height:1.5">${escapeHtml(p)}</p>`).join('')}
  ${action ? `<p><a href="${escapeHtml(action.url)}" style="background:#059669;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">${escapeHtml(action.label)}</a></p>` : ''}
  <p style="color:#64748b;font-size:12px">Municipalidad · Recolecta+. Este es un mensaje automático, no lo respondas.</p>
</div>`;

/**
 * Envía un correo. Devuelve true si se envió por SMTP y false si solo se mostró en la consola.
 * @param {{ to: string, subject: string, title: string, paragraphs: string[], action?: { label: string, url: string } }} mail
 */
const sendMail = async ({ to, subject, title, paragraphs, action }) => {
  const text = [title, '', ...paragraphs, ...(action ? ['', `${action.label}: ${action.url}`] : [])].join('\n');
  if (!smtpConfigured()) {
    console.log(`\n[Correo sin enviar: SMTP_HOST no configurado]\nPara: ${to}\nAsunto: ${subject}\n${text}\n`);
    return false;
  }
  await getTransport().sendMail({
    from: process.env.MAIL_FROM || 'Recolecta+ <no-responder@recolecta.pe>',
    to,
    subject,
    text,
    html: layout({ title, paragraphs, action }),
  });
  return true;
};

module.exports = { sendMail, smtpConfigured };
