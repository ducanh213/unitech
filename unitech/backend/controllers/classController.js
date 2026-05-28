// backend/controllers/classController.js
const ClassModel = require('../models/Class');
const Course     = require('../models/Course');
const Teacher    = require('../models/Teacher');
const Registration = require('../models/Registration');

// GET /api/classes
exports.getAll = async (req, res, next) => {
  try {
    // Build filter
    const filter = { isDeleted: false };

    // Nếu là teacher, chỉ lấy những lớp do họ dạy
    if (req.user.role === 'teacher') {
      // Tìm Teacher profile bằng user.id từ token
      const prof = await Teacher.findOne({ user: req.user.id });
      if (!prof) {
        return res.status(404).json({ msg: 'Không tìm thấy giảng viên' });
      }
      filter.teacher = prof._id;
    }

    // Query với filter vừa tạo
    const list = await ClassModel.find(filter)
      .populate('course', 'code title')
      .populate('teacher', 'teacherId fullName');

    res.json(list);
  } catch (err) {
    next(err);
  }
};


/**
 * GET /api/classes/:id
 * Get one class by id
 * Access: admin, teacher, student
 */
exports.getById = async (req, res, next) => {
  try {
    const cls = await ClassModel.findOne({
      _id: req.params.id,
      isDeleted: false
    })
    .populate('course', 'code title')
    .populate('teacher', 'teacherId fullName');

    if (!cls) {
      return res.status(404).json({ msg: 'Không tìm thấy lớp học' });
    }
    res.json(cls);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/classes
 * Body: { classCode, course, teacher, room, schedule, capacityMin?, capacityMax }
 * Access: admin
 */
exports.create = async (req, res, next) => {
  try {
    const {
      classCode,
      course,
      teacher,
      room,
      schedule,
      capacityMin = 15,
      capacityMax
    } = req.body;

    // duplicate classCode
    if (await ClassModel.findOne({ classCode })) {
      return res.status(400).json({ msg: 'Mã lớp học đã tồn tại' });
    }
    // check course & teacher exist
    if (!await Course.findById(course)) {
      return res.status(400).json({ msg: 'Course không tồn tại' });
    }
    if (!await Teacher.findById(teacher)) {
      return res.status(400).json({ msg: 'Teacher không tồn tại' });
    }

    const cls = await ClassModel.create({
      classCode,
      course,
      teacher,
      room,
      schedule,
      capacityMin,
      capacityMax
    });
    res.status(201).json(cls);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/classes/:id
 * Update class
 * Body: any of { classCode, course, teacher, room, schedule, capacityMin, capacityMax }
 * Access: admin
 */
exports.update = async (req, res, next) => {
  try {
    const cls = await ClassModel.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    if (!cls) {
      return res.status(404).json({ msg: 'Không tìm thấy lớp học' });
    }

    // nếu đổi classCode, kiểm duplicate
    if (req.body.classCode && req.body.classCode !== cls.classCode) {
      if (await ClassModel.findOne({ classCode: req.body.classCode })) {
        return res.status(400).json({ msg: 'Mã lớp học mới đã tồn tại' });
      }
    }

    // gán fields
    [
      'classCode','course','teacher',
      'room','schedule','capacityMin','capacityMax'
    ].forEach(key => {
      if (req.body[key] !== undefined) {
        cls[key] = req.body[key];
      }
    });

    await cls.save();
    res.json(cls);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/classes/:id
 * Soft-delete class
 * Access: admin
 */
exports.remove = async (req, res, next) => {
  try {
    const cls = await ClassModel.findById(req.params.id);
    if (!cls || cls.isDeleted) {
      return res.status(404).json({ msg: 'Không tìm thấy lớp học' });
    }
    cls.isDeleted = true;
    cls.deletedAt = new Date();
    await cls.save();

    // Xoá toàn bộ đăng ký học phần của lớp học này
    await Registration.deleteMany({ class: req.params.id });

    res.json({ msg: 'Lớp học và các đăng ký liên quan đã được xoá đồng bộ' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/classes/:id/students
 * Lấy danh sách sinh viên trong một lớp (Dành cho giảng viên / admin)
 */
exports.getClassStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cls = await ClassModel.findById(id);
    if (!cls) return res.status(404).json({ msg: 'Không tìm thấy lớp' });

    // Kiểm tra quyền: Nếu là teacher thì phải là teacher dạy lớp này
    if (req.user.role === 'teacher') {
      const prof = await Teacher.findOne({ user: req.user.id });
      if (!prof || prof._id.toString() !== cls.teacher.toString()) {
        return res.status(403).json({ msg: 'Không có quyền truy cập lớp này' });
      }
    }

    const regs = await Registration.find({ class: id })
      .populate('student', 'studentId fullName');

    res.json(regs);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/classes/:id/students/:studentId/grades
 * Cập nhật điểm cho 1 sinh viên trong lớp (Dành cho giảng viên)
 */
exports.updateStudentGrades = async (req, res, next) => {
  try {
    const { id, studentId } = req.params;
    const { attendanceGrade, midtermGrade, finalGrade } = req.body;

    const cls = await ClassModel.findById(id);
    if (!cls) return res.status(404).json({ msg: 'Không tìm thấy lớp' });

    if (req.user.role === 'teacher') {
      const prof = await Teacher.findOne({ user: req.user.id });
      if (!prof || prof._id.toString() !== cls.teacher.toString()) {
        return res.status(403).json({ msg: 'Không có quyền sửa điểm lớp này' });
      }
    }

    const reg = await Registration.findOne({ class: id, student: studentId });
    if (!reg) return res.status(404).json({ msg: 'Sinh viên chưa đăng ký lớp này' });

    if (attendanceGrade !== undefined) reg.attendanceGrade = attendanceGrade;
    if (midtermGrade !== undefined) reg.midtermGrade = midtermGrade;
    if (finalGrade !== undefined) reg.finalGrade = finalGrade;

    // Tính điểm tổng kết
    if (reg.attendanceGrade !== null && reg.midtermGrade !== null && reg.finalGrade !== null) {
      reg.totalGrade = (reg.attendanceGrade * 0.1) + (reg.midtermGrade * 0.3) + (reg.finalGrade * 0.6);
      reg.totalGrade = Math.round(reg.totalGrade * 10) / 10; // Làm tròn 1 chữ số thập phân
    }

    await reg.save();
    res.json(reg);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/classes/:id/ai-risk
 * Gửi điểm số sang Server Python AI để đánh giá rủi ro trượt môn
 */
exports.getAIRisk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cls = await ClassModel.findById(id);
    if (!cls) return res.status(404).json({ msg: 'Không tìm thấy lớp' });

    // Kiểm tra quyền
    if (req.user.role === 'teacher') {
      const prof = await Teacher.findOne({ user: req.user.id });
      if (!prof || prof._id.toString() !== cls.teacher.toString()) {
        return res.status(403).json({ msg: 'Không có quyền truy cập lớp này' });
      }
    }

    // Lấy toàn bộ điểm của sinh viên trong lớp
    const regs = await Registration.find({ class: id });
    if (!regs || regs.length === 0) {
      return res.json({ status: 'success', predictions: [] });
    }

    // Đóng gói payload gửi cho Python
    const studentsPayload = regs.map(r => ({
      student_id: r.student.toString(),
      attendance: r.attendanceGrade,
      midterm: r.midtermGrade
    }));

    const axios = require('axios');
    const response = await axios.post('http://127.0.0.1:8080/predict-risk', {
      students: studentsPayload
    });

    res.json(response.data);
  } catch (err) {
    console.error("Lỗi gọi Server AI:", err.message);
    res.status(500).json({ msg: "Server AI chưa khởi động hoặc có lỗi." });
  }
};
