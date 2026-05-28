// backend/routes/notificationRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const role    = require('../middleware/role');
const ctrl    = require('../controllers/notificationController');

// Get all notifications (dành cho mọi user đã đăng nhập)
router.get('/', auth, ctrl.getAll);

// Create notification (admin only)
router.post('/', auth, role('admin'), ctrl.create);

// Delete notification (admin only)
router.delete('/:id', auth, role('admin'), ctrl.remove);

module.exports = router;
