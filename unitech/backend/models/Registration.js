// backend/models/Registration.js
const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  period: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Period',
    required: true
  },
  attendanceGrade: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  midtermGrade: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  finalGrade: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  totalGrade: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Đảm bảo mỗi sinh viên chỉ đăng ký cùng lớp + cùng đợt một lần
RegistrationSchema.index({ student: 1, class: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
