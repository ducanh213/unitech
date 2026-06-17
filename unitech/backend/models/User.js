const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username:  { type: String, required: true },   // tên đăng nhập
  email:     { type: String, required: true, unique: true },   // email dùng để đăng nhập/OTP
  password:  { type: String, required: true },                 // mật khẩu đã hash
  role:      {                                             
    type: String,
    enum: ['student','teacher','admin'],
    default: 'student'                                      //mặc định quyền sinh viên
  },
  resetOtp: { type: String },                                  // OTP reset mật khẩu
  resetOtpExpires: { type: Date },                             // Thời hạn OTP
  createdAt: { type: Date, default: Date.now }               // ngày tạo tài khoản
});

module.exports = mongoose.model('User', UserSchema);
