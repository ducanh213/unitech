// backend/models/Class.js
const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  classCode: {
    type: String,
    required: true,
    unique: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  room: {
    type: String,
    required: true
  },
  schedule: {
    type: String,
    required: true  // ví dụ: "T2/T4 8:00-10:00"
  },
  capacityMin: {
    type: Number,
    default: 20
  },
  capacityMax: {
    type: Number,
    default: 35,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Class', ClassSchema);
