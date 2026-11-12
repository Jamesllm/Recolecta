/**
 * Enrutador Central de la API (/api)
 * Módulo: src/routes/index.js
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');
const authController = require('../controllers/authController');
const passwordController = require('../controllers/passwordController');
const notificationController = require('../controllers/notificationController');
const analyticsController = require('../controllers/analyticsController');
const fleetController = require('../controllers/fleetController');
const settingsController = require('../controllers/settingsController');
const driverController = require('../controllers/driverController');
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
router.post('/password/forgot', passwordController.forgotPassword);
router.post('/password/reset', passwordController.resetPassword);

// Avisos del vecino sobre sus reportes (US-06)
router.get('/notifications', requireAuth, notificationController.getNotifications);
router.get('/notifications/unread-count', requireAuth, notificationController.getUnreadCount);
router.post('/notifications/read-all', requireAuth, notificationController.markAllRead);
router.post('/notifications/:id/read', requireAuth, notificationController.markRead);

// Reportes de la app del vecino (US-02 y US-03)
router.use('/reports', reportRoutes);

// Incidentes para el panel municipal
router.use('/incidents', incidentRoutes);

// Clústeres K-Means para el panel municipal
router.use('/clusters', clusterRoutes);

// Análisis (A7, US-09), flota (A6) y configuración (A8, US-10) del panel municipal
router.get('/analytics', analyticsController.getAnalytics);
router.get('/fleet', fleetController.getFleet);
router.get('/fleet/live', fleetController.getLive);
router.post('/fleet', fleetController.createTruck);
router.patch('/fleet/:id', fleetController.updateTruck);
router.post('/fleet/:id/assign', fleetController.assignTruck);
router.post('/fleet/:id/release', fleetController.releaseTruck);
router.delete('/fleet/:id', fleetController.deleteTruck);
router.post('/fleet/:id/driver-account', fleetController.createDriverAccount);
router.post('/fleet/:id/driver-account/reset', fleetController.resetDriverPassword);
router.delete('/fleet/:id/driver-account', fleetController.removeDriverAccount);

// Perfil del conductor en la app móvil («Mi ruta»): ruta asignada, GPS en vivo y paradas recogidas
const driverOnly = [requireAuth, driverController.requireDriver];
router.get('/driver/me', driverOnly, driverController.me);
router.post('/driver/start', driverOnly, driverController.start);
router.post('/driver/position', driverOnly, driverController.position);
router.post('/driver/stops/:incidentId/collect', driverOnly, driverController.collect);
router.post('/driver/finish', driverOnly, driverController.finish);
router.get('/settings', settingsController.getAll);
router.patch('/settings', settingsController.update);
router.get('/users/summary', settingsController.usersSummary);

module.exports = router;
