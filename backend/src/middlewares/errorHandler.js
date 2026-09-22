/**
 * Middlewares de Manejo de Errores Globales
 * Módulo: src/middlewares/errorHandler.js
 */

/**
 * Middleware para rutas no encontradas (404)
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: [${req.method}] ${req.originalUrl}`,
    error: 'NOT_FOUND',
  });
};

/**
 * Middleware global de manejo de excepciones y errores 500
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error('[Unhandled Error]:', err);

  // Manejo de errores específicos de PostgreSQL (códigos de error de PG)
  if (err.code === '23505') {
    // Unique violation
    return res.status(409).json({
      success: false,
      message: 'Conflicto de unicidad: el recurso ya existe.',
      error: err.detail || err.message,
    });
  }

  if (err.code === 'XX000' || err.message?.includes('parse error - invalid geometry')) {
    return res.status(400).json({
      success: false,
      message: 'Error de geometría PostGIS: coordenadas inválidas.',
      error: err.message,
    });
  }

  // Error genérico del servidor
  const statusCode = err.status || err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Error interno del servidor.',
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  notFoundHandler,
  globalErrorHandler,
};
