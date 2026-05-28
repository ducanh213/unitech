const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const Student= require('../models/Student');
const { sendOTP } = require('../utils/email');
require('dotenv').config();

// POST /api/auth/register
// body: { username, email, password, extra, phone, address }
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, extra /* studentId */, phone, address } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ msg: 'Email đã được sử dụng' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed,
      role: 'student'
    });

    await Student.create({
      user:      user._id,
      studentId: extra,
      fullName:  username,
      phone,
      address
    });

    res.status(201).json({ msg: 'Đăng ký thành công' });
  } catch (err) {
    next(err);
  }
};


// POST /api/auth/login
exports.login = async (req, res, next) => {
  try { 
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Sai email hoặc mật khẩu' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Sai email hoặc mật khẩu' });

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, role: user.role, username: user.username, email: user.email });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot
exports.forgot = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'Email không tồn tại' });
    const otp = Math.floor(100000 + Math.random()*900000).toString();
    // TODO: lưu OTP vào DB hoặc cache để verify
    await sendOTP(email, otp);
    res.json({ msg: 'OTP đã được gửi' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset
exports.reset = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    // TODO: kiểm tra OTP
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });
    res.json({ msg: 'Đổi mật khẩu thành công' });
  } catch (err) {
    next(err);
  }
};
