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

// Identificador anónimo del teléfono (UUID) que envía la app en «X-Device-Id»
const DEVICE_ID = /^[A-Za-z0-9-]{16,64}$/;

const deviceIdOf = (req) => {
  const device = req.get('X-Device-Id');
  return device && DEVICE_ID.test(device) ? device : null;
};

/**
 * Sesión opcional: el vecino puede usar la app como invitado (US-02).
 * Deja en req.user la cuenta (o null) y en req.deviceId el identificador del teléfono (o null).
 * Un token presente pero inválido sí se rechaza, para que la app cierre la sesión vencida.
 */
const optionalAuth = (req, res, next) => {
  req.deviceId = deviceIdOf(req);
  if (!req.get('Authorization')) {
    req.user = null;
    return next();
  }
  return requireAuth(req, res, next);
};

module.exports = { signToken, requireAuth, optionalAuth, deviceIdOf };
