// backend/routes/classRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const role    = require('../middleware/role');
const ctrl    = require('../controllers/classController');

// List all → admin, teacher, student
router.get('/', auth, role('admin','teacher','student'), ctrl.getAll);

// Get one → admin, teacher, student
router.get('/:id', auth, role('admin','teacher','student'), ctrl.getById);

// Create → admin only
router.post('/', auth, role('admin'), ctrl.create);

// Update → admin only
router.put('/:id', auth, role('admin'), ctrl.update);

// Soft-delete → admin only
router.delete('/:id', auth, role('admin'), ctrl.remove);

// Get students in a class → admin, teacher
router.get('/:id/students', auth, role('admin', 'teacher'), ctrl.getClassStudents);

// AI Risk Prediction → admin, teacher
router.get('/:id/ai-risk', auth, role('admin', 'teacher'), ctrl.getAIRisk);

// Update grades for a student in a class → teacher only
router.put('/:id/students/:studentId/grades', auth, role('teacher'), ctrl.updateStudentGrades);

module.exports = router;
