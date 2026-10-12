/**
 * Autenticación con JWT
 * Módulo: src/middlewares/auth.js
 */

const jwt = require('jsonwebtoken');

const TOKEN_TTL = '7d';

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });

/** Exige el encabezado «Authorization: Bearer <token>». */
const requireAuth = (req, res, next) => {
  const header = req.get('Authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Debe iniciar sesión para continuar.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'La sesión expiró o no es válida. Inicie sesión de nuevo.' });
  }
};

module.exports = { signToken, requireAuth };
