// backend/routes/registrationRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const ctrl = require("../controllers/registrationController");

// Student đăng ký → only student
router.post("/", auth, role("student"), ctrl.create);

// Xem danh sách → student chỉ xem của mình; admin/teacher xem all
router.get("/", auth, role("admin", "teacher", "student"), ctrl.getAll);

// Hủy đăng ký → student only
router.delete("/:id", auth, role("student"), ctrl.remove);

module.exports = router;
