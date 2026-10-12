/**
 * Rutas de reportes ciudadanos (requieren sesión)
 * Módulo: src/routes/reportRoutes.js
 */

const express = require('express');
const multer = require('multer');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');
const reportController = require('../controllers/reportController');

const MAX_PHOTO_MB = 8;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PHOTO_MB * 1024 * 1024, files: 1 },
  // El tipo real se verifica por contenido en el controlador; aquí se descartan archivos que no son imágenes
  fileFilter: (req, file, cb) => {
    if (reportController.EXT[file.mimetype] || file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream') return cb(null, true);
    const err = new Error('La foto debe ser una imagen JPG, PNG, WEBP o HEIC.');
    err.status = 400;
    return cb(err);
  },
});

// Traduce los errores de multer a respuestas 400
const uploadPhoto = (req, res, next) =>
  upload.single('photo')(req, res, (err) => {
    if (!err) return next();
    const message = err.code === 'LIMIT_FILE_SIZE' ? `La foto supera el límite de ${MAX_PHOTO_MB} MB.` : err.message;
    return res.status(400).json({ success: false, message, errors: { photo: message } });
  });

router.use(requireAuth);

// POST /api/reports - Registrar reporte con foto y GPS (US-02)
router.post('/', uploadPhoto, reportController.createReport);

// GET /api/reports/nearby - Reportes en un radio (US-03)
router.get('/nearby', reportController.getNearbyReports);

// GET /api/reports/mine - Reportes del ciudadano
router.get('/mine', reportController.getMyReports);

// GET /api/reports/:id - Detalle de un reporte
router.get('/:id', reportController.getReport);

module.exports = router;
