// backend/routes/reportRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const role    = require('../middleware/role');
const ctrl    = require('../controllers/reportController');

// GET /api/reports/academic → Admin only
router.get('/academic', auth, role('admin'), ctrl.getAcademicReport);

module.exports = router;
