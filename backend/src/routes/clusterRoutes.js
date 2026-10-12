/**
 * Rutas de clústeres K-Means
 * Módulo: src/routes/clusterRoutes.js
 */

const express = require('express');
const router = express.Router();
const clusterController = require('../controllers/clusterController');

// GET /api/clusters - Clústeres activos con sus reportes
router.get('/', clusterController.getClusters);

// POST /api/clusters/run - Ejecutar K-Means sobre los reportes pendientes
router.post('/run', clusterController.runClustering);

module.exports = router;
