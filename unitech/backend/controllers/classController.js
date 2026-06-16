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
    } else if (req.user.role === 'student') {
      const Student = require('../models/Student');
      const Major = require('../models/Major');
      
      const stu = await Student.findOne({ user: req.user.id });
      if (stu && stu.major) {
        const majorDoc = await Major.findOne({ code: stu.major });
        if (majorDoc) {
          const courses = await Course.find({
            $or: [
              { isGeneral: true },
              { majors: majorDoc._id }
            ]
          }).select('_id');
          
          filter.course = { $in: courses.map(c => c._id) };
        }
      }
    }

    // Query với filter vừa tạo
    const list = await ClassModel.find(filter)
      .populate({
        path: 'course',
        select: 'code title credits semesterOffered prerequisites',
        populate: { path: 'prerequisites', select: 'code title' }
      })
      .populate('teacher', 'teacherId fullName');

    // Lấy kỳ đang mở (để chấm điểm/giảng dạy)
    const Period = require('../models/Period');
    const openPeriod = await Period.findOne({ status: 'open' });

    // Gắn thêm currentEnrollment và gradingPeriod cho mỗi lớp
    const listWithEnrollment = await Promise.all(
      list.map(async cls => {
        const count = await Registration.countDocuments({ class: cls._id });
        const countInOpen = openPeriod ? await Registration.countDocuments({ class: cls._id, period: openPeriod._id }) : 0;
        
        // Xác định đợt học của lớp (dựa trên registration)
        const periodsWithRegs = await Registration.distinct('period', { class: cls._id });
        const hasOpenReg = openPeriod && periodsWithRegs.some(p => p.toString() === openPeriod._id.toString());
        const gradingPeriod = periodsWithRegs.length
          ? (hasOpenReg
              ? openPeriod
              : await Period.findOne({ _id: { $in: periodsWithRegs }, status: 'closed' }).sort({ endDate: -1 }))
          : null;

        const obj = cls.toObject();
        obj.currentEnrollment = count;
        obj.isActiveInOpenPeriod = countInOpen > 0;
        obj.gradingPeriod = gradingPeriod;
        return obj;
      })
    );

    res.json(listWithEnrollment);
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
 * → Ưu tiên lấy sinh viên thuộc KỲ ĐANG MỞ (nếu có đăng ký), ngược lại lấy kỳ đóng gần nhất
 */
exports.getClassStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Period = require('../models/Period');

    const cls = await ClassModel.findById(id);
    if (!cls) return res.status(404).json({ msg: 'Không tìm thấy lớp' });

    // Kiểm tra quyền: Nếu là teacher thì phải là teacher dạy lớp này
    if (req.user.role === 'teacher') {
      const prof = await Teacher.findOne({ user: req.user.id });
      if (!prof || prof._id.toString() !== cls.teacher.toString()) {
        return res.status(403).json({ msg: 'Không có quyền truy cập lớp này' });
      }
    }

    // Lấy tất cả các kỳ mà lớp này có sinh viên đăng ký
    const periodsWithRegs = await Registration.distinct('period', { class: id });

    // Ưu tiên kỳ đang MỞ nếu lớp có đăng ký trong kỳ đó,
    // nếu không thì lấy kỳ đóng gần nhất (để chấm điểm kỳ cũ)
    const openPeriod = await Period.findOne({ status: 'open' });
    const hasOpenReg = openPeriod && periodsWithRegs.some(p => p.toString() === openPeriod._id.toString());
    const gradingPeriod = periodsWithRegs.length
      ? (hasOpenReg
          ? openPeriod
          : await Period.findOne({ _id: { $in: periodsWithRegs }, status: 'closed' }).sort({ endDate: -1 }))
      : null;

    // Lọc registration theo kỳ gần nhất của lớp này
    const periodFilter = gradingPeriod
      ? { class: id, period: gradingPeriod._id }
      : { class: id };
    const regs = await Registration.find(periodFilter)
      .populate('student', 'studentId fullName')
      .populate('period', 'name status semester endDate');

    res.json(regs);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/classes/:id/students/:studentId/grades
 * Cập nhật điểm cho 1 sinh viên trong lớp (Dành cho giảng viên)
 * → Áp dụng cho kỳ học đang mở, hoặc kỳ đóng gần nhất (nhưng chặn nếu khóa từ 2025)
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

    const Period = require('../models/Period');
    const openPeriod = await Period.findOne({ status: 'open' });

    const periodsWithRegs = await Registration.distinct('period', { class: id });

    // Ưu tiên kỳ đang MỞ nếu lớp có đăng ký trong kỳ đó
    const hasOpenReg = openPeriod && periodsWithRegs.some(p => p.toString() === openPeriod._id.toString());
    const gradingPeriod = periodsWithRegs.length
      ? (hasOpenReg
          ? openPeriod
          : await Period.findOne({ _id: { $in: periodsWithRegs }, status: 'closed' }).sort({ endDate: -1 }))
      : null;

    const periodFilter = gradingPeriod
      ? { class: id, student: studentId, period: gradingPeriod._id }
      : { class: id, student: studentId };

    const reg = await Registration.findOne(periodFilter);
    if (!reg) return res.status(404).json({ msg: 'Sinh viên chưa đăng ký lớp này' });

    // Chỉ cho phép sửa điểm từ Học kỳ 2 (2026) trở đi (endDate > 31/12/2025)
    if (!gradingPeriod || new Date(gradingPeriod.endDate) <= new Date('2025-12-31T23:59:59Z')) {
      return res.status(403).json({ msg: 'Kỳ học này đã kết thúc và bị khóa. Không thể sửa điểm.' });
    }

    // Làm tròn 1 chữ số thập phân cho từng cột điểm
    const round1 = v => (v !== undefined && v !== null) ? Math.round(parseFloat(v) * 10) / 10 : v;
    if (attendanceGrade !== undefined) reg.attendanceGrade = round1(attendanceGrade);
    if (midtermGrade !== undefined)    reg.midtermGrade    = round1(midtermGrade);
    if (finalGrade !== undefined)      reg.finalGrade      = round1(finalGrade);

    // Tính điểm tổng kết (chỉ khi đã có đủ 3 điểm)
    if (reg.attendanceGrade !== null && reg.midtermGrade !== null && reg.finalGrade !== null) {
      reg.totalGrade = Math.round(
        (reg.attendanceGrade * 0.1 + reg.midtermGrade * 0.3 + reg.finalGrade * 0.6) * 10
      ) / 10;
    } else {
      reg.totalGrade = null;
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
 * → Tự động lọc danh sách sinh viên theo kỳ đang hoạt động (mở hoặc đóng gần nhất)
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

    // Tương tự logic lấy danh sách sinh viên: Lọc đúng kỳ đang chấm điểm
    const Period = require('../models/Period');
    const openPeriod = await Period.findOne({ status: 'open' });

    const periodsWithRegs = await Registration.distinct('period', { class: id });

    const hasOpenReg = openPeriod && periodsWithRegs.some(p => p.toString() === openPeriod._id.toString());
    const gradingPeriod = periodsWithRegs.length
      ? (hasOpenReg
          ? openPeriod
          : await Period.findOne({ _id: { $in: periodsWithRegs }, status: 'closed' }).sort({ endDate: -1 }))
      : null;

    const periodFilter = gradingPeriod
      ? { class: id, period: gradingPeriod._id }
      : { class: id };

    // Lấy toàn bộ điểm của sinh viên trong lớp
    const regs = await Registration.find(periodFilter);
    if (!regs || regs.length === 0) {
      return res.json({ status: 'success', predictions: [] });
    }

    // Đóng gói payload gửi cho Python (bổ sung finalGrade)
    const studentsPayload = regs.map(r => ({
      student_id: r.student.toString(),
      attendance: r.attendanceGrade,
      midterm: r.midtermGrade,
      final: r.finalGrade
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
