// backend/routes/periodRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const role    = require('../middleware/role');
const ctrl    = require('../controllers/periodController');

// List → admin, teacher
router.get('/', auth, role('admin','teacher', 'student'), ctrl.getAll);

// Get one → admin, teacher
router.get('/:id', auth, role('admin','teacher', 'student'), ctrl.getById);

// Create → admin
router.post('/', auth, role('admin'), ctrl.create);

// Update → admin
router.put('/:id', auth, role('admin'), ctrl.update);

// Open → admin
router.patch('/:id/open',  auth, role('admin'), ctrl.open);

// Close → admin
router.patch('/:id/close', auth, role('admin'), ctrl.close);

// Soft-delete → admin
router.delete('/:id', auth, role('admin'), ctrl.remove);

module.exports = router;
