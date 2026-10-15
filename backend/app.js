/**
 * Servidor de Aplicación Express - Recolecta+
 * Archivo: app.js
 */

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes');
const storage = require('./src/services/storage');
const { notFoundHandler, globalErrorHandler } = require('./src/middlewares/errorHandler');

const app = express();

// ==========================================================
// 1. Configuración de CORS
// Permite peticiones desde:
// - App Móvil (React Native / Expo en emulador, dispositivo o web)
// - Panel Web (React.js en Vite o Create-React-App: localhost:3000 / 5173)
// ==========================================================
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8081',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8081',
    ];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (como apps móviles nativas, Postman, cURL)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some((allowed) => {
      // Coincidencia exacta o comodín de subdominio/puerto
      if (
        allowed === '*' ||
        allowed === origin ||
        origin.startsWith('exp://') ||
        origin.startsWith('http://192.168.') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) return true;
      return false;
    });

    if (isAllowed) {
      return callback(null, true);
    } else {
      console.warn(`[CORS Bloqueado] Origen no autorizado: ${origin}`);
      return callback(new Error('Acceso no permitido por la política CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// ==========================================================
// 2. Middlewares de Parsing
// ==========================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging básico en entorno de desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ==========================================================
// 3. Registro de Rutas
// ==========================================
app.use('/api', apiRoutes);

// Fotos guardadas en disco cuando STORAGE_DRIVER=local (en S3 se entregan URLs firmadas)
if (storage.DRIVER === 'local') {
  app.use('/uploads', express.static(storage.LOCAL_DIR));
}

// Endpoint raíz informativo
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Bienvenido a la API REST de Recolecta+',
    documentation: '/api/health',
    version: '1.0.0',
  });
});

// ==========================================================
// 4. Middlewares de Manejo de Errores (404 y 500)
// ==========================================================
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
