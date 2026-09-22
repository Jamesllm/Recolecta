/**
 * Rutas de la entidad Incidentes
 * Módulo: src/routes/incidentRoutes.js
 */

const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');

// POST /api/incidents - Crear un nuevo reporte con coordenadas PostGIS
router.post('/', incidentController.createIncident);

// GET /api/incidents - Obtener incidentes con coordenadas decimales (ST_X, ST_Y)
router.get('/', incidentController.getIncidents);

// PATCH /api/incidents/:id/status - Actualizar estado (pending, assigned, resolved)
router.patch('/:id/status', incidentController.updateIncidentStatus);

module.exports = router;
