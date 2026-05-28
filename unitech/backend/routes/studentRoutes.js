// backend/routes/studentRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const role    = require('../middleware/role');
const ctrl    = require('../controllers/studentController');

// List all → only admin, teacher
router.get('/', auth, role('admin','teacher'), ctrl.getAll);

router.get('/me', auth, role('student'), ctrl.getMe);
router.get('/me/ai-path', auth, role('student'), ctrl.getAIPath);

// Get by id → admin/teacher or student self
router.get('/:id', auth, role('admin','teacher','student'), ctrl.getById);

// Create → admin only
router.post('/', auth, role('admin'), ctrl.create);

// Update → admin or student self
router.put('/:id', auth, role('admin','student'), ctrl.update);

// Delete → admin only
router.delete('/:id', auth, role('admin'), ctrl.remove);

module.exports = router;
