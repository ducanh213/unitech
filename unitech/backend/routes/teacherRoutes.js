// backend/routes/teacherRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const role    = require('../middleware/role');
const ctrl    = require('../controllers/teacherController');

// List all → admin only
router.get('/', auth, role('admin'), ctrl.getAll);

// Get current teacher
router.get('/me', auth, role('teacher'), ctrl.getMe);

// Get one → admin or teacher themself
router.get('/:id', auth, role('admin','teacher'), ctrl.getById);

// Create → admin only
router.post('/', auth, role('admin'), ctrl.create);

// Update → admin or teacher themself
router.put('/:id', auth, role('admin','teacher'), ctrl.update);

// Delete → admin only
router.delete('/:id', auth, role('admin'), ctrl.remove);

module.exports = router;
