// backend/controllers/studentController.js
const bcrypt  = require('bcryptjs');
const User    = require('../models/User');
const Student = require('../models/Student');

/**
 * GET /api/students
 */
exports.getAll = async (req, res, next) => {
  try {
    const list = await Student.find({ isDeleted: { $ne: true } })
      .populate('user', 'username email role');
    res.json(list);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/:id
 */
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stu = await Student.findOne({ _id: id, isDeleted: { $ne: true } })
      .populate('user', 'username email role');
    if (!stu) {
      return res.status(404).json({ msg: 'Không tìm thấy sinh viên' });
    }
    if (
      req.user.role === 'student' &&
      (!stu.user || stu.user._id.toString() !== req.user.id)
    ) {
      return res.status(403).json({ msg: 'Không có quyền xem sinh viên này' });
    }
    res.json(stu);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/students
 */
exports.create = async (req, res, next) => {
  try {
    const {
      studentId,
      fullName,
      email,
      phone,
      address,
      major,
      year
    } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ msg: 'Email đã tồn tại' });
    }
    if (await Student.findOne({ studentId })) {
      return res.status(400).json({ msg: 'Mã sinh viên đã tồn tại' });
    }

    const defaultPwd     = process.env.DEFAULT_STUDENT_PASSWORD || '123456';
    const hashedPassword = await bcrypt.hash(defaultPwd, 10);

    const user = await User.create({
      username: fullName,
      email,
      password: hashedPassword,
      role: 'student'
    });

    const student = await Student.create({
      user:      user._id,
      studentId,
      fullName,
      phone,
      address,
      major,
      year
    });

    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
};
exports.getMe = async (req, res, next) => {
  try {
    // req.user.id là User._id từ token
    const stu = await Student.findOne({ user: req.user.id, isDeleted: false })
      .populate('user', 'username email role');
    if (!stu) {
      return res.status(404).json({ msg: 'Không tìm thấy hồ sơ sinh viên' });
    }
    res.json(stu);
  } catch (err) {
    next(err);
  }
};
/**
 * PUT /api/students/:id
 */
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stu = await Student.findById(id).populate('user', 'username email');
    if (!stu || stu.isDeleted) {
      return res.status(404).json({ msg: 'Không tìm thấy sinh viên' });
    }
    if (
      req.user.role === 'student' &&
      (!stu.user || stu.user._id.toString() !== req.user.id)
    ) {
      return res.status(403).json({ msg: 'Không có quyền sửa sinh viên này' });
    }

    // Chỉ update email nếu user tồn tại và email mới khác
    if (req.body.email && stu.user && req.body.email !== stu.user.email) {
      const exists = await User.findOne({ email: req.body.email });
      if (exists) {
        return res.status(400).json({ msg: 'Email đã tồn tại' });
      }
      await User.findByIdAndUpdate(stu.user._id, { email: req.body.email });
    }

    const allowed = ['fullName','studentId','phone','address','major','year'];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    const updated = await Student.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('user', 'username email role');

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/students/:id
 */
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Tìm document
    const stu = await Student.findById(id);
    if (!stu || stu.isDeleted) {
      return res.status(404).json({ msg: 'Không tìm thấy sinh viên' });
    }

    // Soft delete: chỉ cập nhật 2 trường này
    // Dùng updateOne để tránh validate toàn bộ schema
    await Student.updateOne(
      { _id: id },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    // Xoá tài khoản User (để không thể đăng nhập)
    if (stu.user) {
      await User.deleteOne({ _id: stu.user });
    }

    // Xoá toàn bộ đăng ký học phần của sinh viên này
    const Registration = require('../models/Registration');
    await Registration.deleteMany({ student: id });

    res.json({ msg: 'Sinh viên và dữ liệu liên quan đã được xoá đồng bộ' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/students/me/ai-path
 * Khuyến nghị môn học tiếp theo dựa trên lịch sử học tập
 */
exports.getAIPath = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ msg: 'Không tìm thấy sinh viên' });

    const Registration = require('../models/Registration');
    
    // 1. Lấy tất cả đăng ký trượt của sinh viên (có điểm và điểm < 4.0)
    const failedRegs = await Registration.find({
      student: student._id,
      totalGrade: { $lt: 4.0, $ne: null }
    }).populate({
      path: 'class',
      populate: { path: 'course' }
    });

    const failedCourseCodes = failedRegs
      .filter(r => r.class && r.class.course)
      .map(r => r.class.course.code);

    // 2. Lấy TẤT CẢ các đăng ký của sinh viên (để lọc ra các môn đã đỗ HOẶC chưa có điểm/đang học)
    const allRegs = await Registration.find({
      student: student._id
    }).populate({
      path: 'class',
      populate: { path: 'course' }
    });

    // Môn "đã qua hoặc đang học": là tất cả các môn đã đăng ký TRỪ đi các môn bị trượt
    let passedCourseCodes = allRegs
      .filter(r => r.class && r.class.course && !failedCourseCodes.includes(r.class.course.code))
      .map(r => r.class.course.code);
      
    // Loại bỏ trùng lặp nếu sinh viên đăng ký môn nhiều lần
    passedCourseCodes = [...new Set(passedCourseCodes)];

    // 3. Lọc lại mã môn trượt: nếu môn đó đã được học lại và qua (có trong passedCourseCodes) thì bỏ khỏi danh sách trượt
    const finalFailedCourseCodes = failedCourseCodes.filter(code => !passedCourseCodes.includes(code));

    const axios = require('axios');
    const response = await axios.post('http://127.0.0.1:8080/recommend-path', {
      passed_courses: passedCourseCodes,
      failed_courses: finalFailedCourseCodes
    });

    const recommendedCodes = response.data.recommendations || [];

    // Query chi tiết các môn học được gợi ý, gắn thêm isRetry flag
    const Course = require('../models/Course');
    const suggestedCourses = await Course.find({ code: { $in: recommendedCodes } })
                                         .select('code title credits');

    // Map lại theo đúng thứ tự + gắn isRetry để frontend phân biệt
    const orderedCourses = recommendedCodes
      .map(code => {
        const course = suggestedCourses.find(c => c.code === code);
        if (!course) return null;
        return {
          _id:     course._id,
          code:    course.code,
          title:   course.title,
          credits: course.credits,
          isRetry: finalFailedCourseCodes.includes(code)  // true = học lại, false = môn tiếp theo
        };
      })
      .filter(Boolean);

    res.json({
      status: 'success',
      recommendations: orderedCourses
    });
  } catch (err) {
    console.error("Lỗi gọi Server AI:", err.message);
    res.status(500).json({ msg: "Server AI chưa khởi động hoặc có lỗi." });
  }
};