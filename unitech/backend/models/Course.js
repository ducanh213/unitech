// backend/models/Course.js
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true       // Mã học phần duy nhất
  },
  title: {
    type: String,
    required: true     // Tên học phần
  },
  credits: {
    type: Number,
    required: true     // Số tín chỉ
  },
  theoryHours: {
    type: Number,
    default: 0         // Số tiết lý thuyết
  },
  practiceHours: {
    type: Number,
    default: 0         // Số tiết bài tập/lab
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'      // Tham chiếu đến học phần khác
  }],
  isGeneral: {
    type: Boolean,
    default: false     // true=đại cương, false=chuyên ngành
  },
  majors: [{           // Nếu chuyên ngành, áp dụng cho các ngành nào
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Major'
  }],
  semesterOffered: {
    type: String       // Ví dụ "HK1", "HK2", ...
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

module.exports = mongoose.model('Course', CourseSchema);
