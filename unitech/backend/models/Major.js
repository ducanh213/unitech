// backend/models/Major.js
const mongoose = require('mongoose');

const MajorSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true    // mã ngành không trùng
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String   // mô tả ngắn
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

module.exports = mongoose.model('Major', MajorSchema);
