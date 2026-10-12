/**
 * Controlador de cuentas de usuario (US-01)
 * Módulo: src/controllers/authController.js
 */

const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { signToken } = require('../middlewares/auth');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_RE = /^(?=.*[A-Za-zÁÉÍÓÚáéíóúÑñ])(?=.*\d).{8,}$/;

// Usuario con el nombre de su distrito, provincia y departamento
const SELECT_USER = `
  SELECT u.id, u.full_name, u.email, u.password_hash, u.role, u.created_at, u.ubigeo,
         d.nombre AS distrito, p.nombre AS provincia, de.nombre AS departamento
  FROM users u
  JOIN distritos d ON d.ubigeo = u.ubigeo
  JOIN provincias p ON p.id_provincia = d.id_provincia
  JOIN departamentos de ON de.id_departamento = p.id_departamento`;

const publicUser = (u) => ({
  id: u.id,
  full_name: u.full_name,
  email: u.email,
  role: u.role,
  ubigeo: { code: u.ubigeo, distrito: u.distrito, provincia: u.provincia, departamento: u.departamento },
  created_at: u.created_at,
});

/**
 * Registra un ciudadano.
 * Endpoint: POST /api/register
 * Payload: { full_name, email, password, ubigeo, accept_terms }
 */
const register = async (req, res, next) => {
  try {
    const full_name = (req.body.full_name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const ubigeo = String(req.body.ubigeo || '').trim();
    const { password, accept_terms } = req.body;

    const errors = {};
    if (full_name.length < 3) errors.full_name = 'Ingrese su nombre completo.';
    if (!EMAIL_RE.test(email)) errors.email = 'Ingrese un correo electrónico válido.';
    if (!PASSWORD_RE.test(password || '')) errors.password = 'Mínimo 8 caracteres, con al menos una letra y un número.';
    if (!/^\d{6}$/.test(ubigeo) || !(await query('SELECT 1 FROM distritos WHERE ubigeo = $1', [ubigeo])).rowCount) {
      errors.ubigeo = 'Seleccione su departamento, provincia y distrito.';
    }
    if (accept_terms !== true) errors.accept_terms = 'Debe aceptar los Términos de uso y la Política de privacidad.';
    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: 'Revise los datos del formulario.', errors });
    }

    const exists = await query('SELECT 1 FROM users WHERE LOWER(email) = $1', [email]);
    if (exists.rowCount) {
      return res.status(409).json({ success: false, message: 'Ya existe una cuenta con ese correo.', errors: { email: 'Este correo ya está registrado.' } });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const inserted = await query(
      `INSERT INTO users (full_name, email, password_hash, ubigeo, terms_accepted_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id;`,
      [full_name, email, password_hash, ubigeo]
    );
    const user = (await query(`${SELECT_USER} WHERE u.id = $1`, [inserted.rows[0].id])).rows[0];

    return res.status(201).json({
      success: true,
      message: `¡Bienvenido a Recolecta+, ${user.full_name.split(' ')[0]}!`,
      data: { user: publicUser(user), token: signToken(user) },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Inicia sesión.
 * Endpoint: POST /api/login
 * Payload: { email, password }
 */
const login = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const { password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Ingrese su correo y su contraseña.' });
    }

    const result = await query(`${SELECT_USER} WHERE LOWER(u.email) = $1`, [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Correo o contraseña incorrectos.' });
    }

    return res.status(200).json({ success: true, data: { user: publicUser(user), token: signToken(user) } });
  } catch (error) {
    return next(error);
  }
};

/**
 * Devuelve el usuario de la sesión.
 * Endpoint: GET /api/me
 */
const me = async (req, res, next) => {
  try {
    const result = await query(`${SELECT_USER} WHERE u.id = $1`, [req.user.id]);
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'La cuenta ya no existe.' });
    return res.status(200).json({ success: true, data: publicUser(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, login, me };
