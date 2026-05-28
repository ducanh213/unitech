const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgot,
  reset
} = require('../controllers/authController');

// Đăng ký tài khoản sinh viên
// body: { username, email, password, extra }
// extra = studentId
router.post('/register', register);

// Đăng nhập
// body: { email, password }
router.post('/login', login);

// Quên mật khẩu (gửi OTP)
// body: { email }
router.post('/forgot', forgot);

// Reset mật khẩu
// body: { email, otp, newPassword }
router.post('/reset', reset);

module.exports = router;
