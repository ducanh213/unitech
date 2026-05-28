// backend/controllers/teacherController.js
const bcrypt  = require('bcryptjs');
const User    = require('../models/User');
const Teacher = require('../models/Teacher');

/**
 * GET /api/teachers/me
 * Get current teacher profile
 */
exports.getMe = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id, isDeleted: false })
      .populate('user', 'username email role')
      .populate('qualifiedSubjects', 'code title');
    if (!teacher) {
      return res.status(404).json({ msg: 'Không tìm thấy giảng viên' });
    }
    res.json(teacher);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/teachers
 * List non-deleted teachers (admin only)
 */
exports.getAll = async (req, res, next) => {
  try {
    const list = await Teacher.find({ isDeleted: false })
      .populate('user', 'username email role')
      .populate('qualifiedSubjects', 'code title');
    res.json(list);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/teachers/:id
 * Access: admin or teacher themself
 */
exports.getById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('user', 'username email role')
      .populate('qualifiedSubjects', 'code title');

    if (!teacher) {
      return res.status(404).json({ msg: 'Không tìm thấy giảng viên' });
    }
    if (
      req.user.role === 'teacher' &&
      teacher.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: 'Không có quyền xem giảng viên này' });
    }

    res.json(teacher);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/teachers
 * Body: { fullName, email, password, teacherId, department }
 * Access: admin only
 */
exports.create = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      password,
      teacherId,
      department,
      degree,
      qualifiedSubjects
    } = req.body;

    // 1. Check duplicate email & teacherId
    if (await User.findOne({ email })) {
      return res.status(400).json({ msg: 'Email đã tồn tại' });
    }
    if (await Teacher.findOne({ teacherId })) {
      return res.status(400).json({ msg: 'Mã giảng viên đã tồn tại' });
    }

    // 2. Create User with role 'teacher'
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: fullName,
      email,
      password: hashed,
      role: 'teacher'
    });

    // 3. Create Teacher profile
    const teacher = await Teacher.create({
      user:       user._id,
      teacherId,
      fullName,
      department,
      degree,
      qualifiedSubjects
    });

    // 4. Return created record
    res.status(201).json(teacher);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/teachers/:id
 * Update teacher
 * Access: admin or teacher themself
 */
exports.update = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('user', 'username email');

    if (!teacher) {
      return res.status(404).json({ msg: 'Không tìm thấy giảng viên' });
    }
    if (
      req.user.role === 'teacher' &&
      teacher.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ msg: 'Không có quyền sửa giảng viên này' });
    }

    // Update email in User if changed
    if (req.body.email && teacher.user && req.body.email !== teacher.user.email) {
      const exists = await User.findOne({ email: req.body.email });
      if (exists) return res.status(400).json({ msg: 'Email đã tồn tại' });
      await User.findByIdAndUpdate(teacher.user._id, { email: req.body.email });
    }

    // Update allowed fields in Teacher
    ['fullName','teacherId','department','degree','qualifiedSubjects'].forEach(key => {
      if (req.body[key] !== undefined) {
        teacher[key] = req.body[key];
      }
    });
    await teacher.save();

    // Re-populate user
    const updated = await Teacher.findById(req.params.id)
      .populate('user', 'username email role');

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/teachers/:id
 * Soft-delete teacher
 * Access: admin only
 */
exports.remove = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher || teacher.isDeleted) {
      return res.status(404).json({ msg: 'Không tìm thấy giảng viên' });
    }
    teacher.isDeleted = true;
    teacher.deletedAt = new Date();
    await teacher.save();

    // Xoá tài khoản User
    if (teacher.user) {
      await User.deleteOne({ _id: teacher.user });
    }

    // Khoá các lớp học do GV này dạy và xoá đăng ký của các lớp đó
    const ClassModel = require('../models/Class');
    const Registration = require('../models/Registration');
    const classes = await ClassModel.find({ teacher: req.params.id });
    const classIds = classes.map(c => c._id);

    await ClassModel.updateMany(
      { teacher: req.params.id },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    if (classIds.length > 0) {
      await Registration.deleteMany({ class: { $in: classIds } });
    }

    res.json({ msg: 'Giảng viên và dữ liệu liên quan đã được xoá đồng bộ' });
  } catch (err) {
    next(err);
  }
};
