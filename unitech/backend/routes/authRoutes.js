const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  register,
  login,
  forgot,
  reset,
  updateMe,
  changePassword
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

// Cập nhật thông tin cá nhân (username) – dùng chung 3 role
// body: { username }
router.put('/me', auth, updateMe);

// Đổi mật khẩu – dùng chung 3 role
// body: { currentPassword, newPassword }
router.put('/me/password', auth, changePassword);

module.exports = router;

