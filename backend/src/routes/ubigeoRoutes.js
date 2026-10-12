/**
 * Rutas públicas de ubigeo
 * Módulo: src/routes/ubigeoRoutes.js
 */

const express = require('express');
const router = express.Router();
const ubigeoController = require('../controllers/ubigeoController');

router.get('/departamentos', ubigeoController.getDepartamentos);
router.get('/departamentos/:id/provincias', ubigeoController.getProvincias);
router.get('/provincias/:id/distritos', ubigeoController.getDistritos);

module.exports = router;
