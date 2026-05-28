// backend/models/Teacher.js
const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true      // mỗi User chỉ 1 profile Teacher
  },
  teacherId: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    enum: ['Cử nhân', 'Thạc sĩ', 'Tiến sĩ', 'Phó Giáo sư', 'Giáo sư'],
    default: 'Thạc sĩ'
  },
  qualifiedSubjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],

  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', TeacherSchema);
