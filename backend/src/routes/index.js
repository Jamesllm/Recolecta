/**
 * Enrutador Central de la API (/api)
 * Módulo: src/routes/index.js
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');
const authController = require('../controllers/authController');
const incidentRoutes = require('./incidentRoutes');
const reportRoutes = require('./reportRoutes');
const clusterRoutes = require('./clusterRoutes');
const ubigeoRoutes = require('./ubigeoRoutes');

// Endpoint de verificación de salud del servicio
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Recolecta+ REST API',
  });
});

// Departamentos, provincias y distritos para el registro
router.use('/ubigeo', ubigeoRoutes);

// Cuentas de usuario (US-01)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.me);

// Reportes de la app del vecino (US-02 y US-03)
router.use('/reports', reportRoutes);

// Incidentes para el panel municipal
router.use('/incidents', incidentRoutes);

// Clústeres K-Means para el panel municipal
router.use('/clusters', clusterRoutes);

module.exports = router;
