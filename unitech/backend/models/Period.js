// backend/models/Period.js
const mongoose = require('mongoose');

const PeriodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true        // tên đợt không trùng
  },
  semester: {
    type: String,
    required: true      // ví dụ "HK1-2025"
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending','open','closed'],
    default: 'pending'  // pending → open → closed (dùng cho giảng dạy/chấm điểm)
  },
  isRegistrationOpen: {
    type: Boolean,
    default: false      // Dùng cho đợt đăng ký học
  },
  isSupplementary: {
    type: Boolean,
    default: false     // true nếu là đợt bổ sung
  },
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Period', PeriodSchema);
