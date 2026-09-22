/**
 * Enrutador Central de la API (/api)
 * Módulo: src/routes/index.js
 */

const express = require('express');
const router = express.Router();
const incidentRoutes = require('./incidentRoutes');

// Endpoint de verificación de salud del servicio
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Recolecta+ REST API',
  });
});

// Rutas de incidentes montadas en /api/incidents
router.use('/incidents', incidentRoutes);

module.exports = router;
