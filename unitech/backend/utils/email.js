const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// exports.sendOTP = async (to, otp) => {
//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to,
//     subject: 'OTP EduConnect',
//     text: `Your OTP: ${otp}`
//   });
// };

exports.sendOTP = async (email, otp) => {
  console.log("📩 Gửi OTP tới:", email);
  console.log("🔑 OTP là:", otp);
};