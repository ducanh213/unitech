// backend/routes/courseRoutes.js
// const express = require('express');
// const router  = express.Router();
// const auth    = require('../middleware/auth');
// const role    = require('../middleware/role');
// const ctrl    = require('../controllers/courseController');


// // List all → admin, teacher, student
// router.get('/',    auth, role('admin','teacher','student'), ctrl.getAll);
// router.get('/:id', auth, role('admin','teacher','student'), ctrl.getById);


// // Create → admin only
// router.post('/', auth, role('admin'), ctrl.create);

// // Update → admin only
// router.put('/:id', auth, role('admin'), ctrl.update);

// // Soft-delete → admin only
// router.delete('/:id', auth, role('admin'), ctrl.remove);

// module.exports = router;


// backend/routes/courseRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const role    = require('../middleware/role');
const ctrl    = require('../controllers/courseController');

// List all → admin, teacher, student
router.get('/',    auth, role('admin','teacher','student'), ctrl.getAll);
router.get('/:id', auth, role('admin','teacher','student'), ctrl.getById);


// Create → admin only
router.post('/', auth, role('admin'), ctrl.create);

// Update → admin only
router.put('/:id', auth, role('admin'), ctrl.update);

// Soft-delete → admin only
router.delete('/:id', auth, role('admin'), ctrl.remove);

module.exports = router;