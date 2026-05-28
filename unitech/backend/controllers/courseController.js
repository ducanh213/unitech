// backend/controllers/courseController.js
const Course = require('../models/Course');
const Major  = require('../models/Major');
const axios = require('axios'); //DD

/**
 * Helper: convert array of codes to ObjectId array
 */
async function resolveIds(model, fieldName, codes = []) {
  if (!Array.isArray(codes) || codes.length === 0) return [];
  // find docs where code in provided codes
  const docs = await model.find({ code: { $in: codes } }, '_id');
  return docs.map(d => d._id);
}

/**
 * GET /api/courses
 */
exports.getAll = async (req, res, next) => {
  try {
    const list = await Course.find({ isDeleted: false })
      .populate('prerequisites', 'code title')
      .populate('majors', 'code name');
    res.json(list);
  } catch (err) {
    next(err);
  }
};

//DD 
exports.getAIRecommendation = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Môn học không tồn tại" });


        // LẤY DỮ LIỆU THỰC TẾ TỪ DATABASE THAY VÌ RANDOM
        const ClassModel = require('../models/Class');
        const Registration = require('../models/Registration');
        const Student = require('../models/Student');

        // Lấy tất cả các lớp của môn học này
        const classesOfCourse = await ClassModel.find({ course: course._id }).select('_id');
        const classIds = classesOfCourse.map(c => c._id);

        // 1. Số sinh viên đã từng học và trượt (totalGrade < 4)
        const failed_students = await Registration.countDocuments({
            class: { $in: classIds },
            totalGrade: { $lt: 4, $ne: null }
        });

        // 2. Số sinh viên đã học và qua môn
        const passed_students = await Registration.countDocuments({
            class: { $in: classIds },
            totalGrade: { $gte: 4 }
        });

        // 3. Số sinh viên đủ điều kiện học (Tổng sinh viên toàn trường - số người đã qua môn)
        const totalStudents = await Student.countDocuments({ isDeleted: false });
        const passed_prerequisite = totalStudents - passed_students;

        const realData = {
            failed_students: failed_students,
            passed_prerequisite: passed_prerequisite,
            is_core_course: course.isGeneral ? 1 : 0
        };

        // Gọi sang Server Python
        const response = await axios.post('http://127.0.0.1:8080/predict-demand', {
            course_id: course.code,
            course_name: course.title,
            ...realData
        });

        res.json(response.data);
    } catch (error) {
        console.error("Lỗi AI Service:", error.message);
        res.status(500).json({ message: "Server AI chưa khởi động hoặc có lỗi." });
    }
};
/**
 * GET /api/courses/:id
 */
exports.getById = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, isDeleted: false })
      .populate('prerequisites', 'code title')
      .populate('majors', 'code name');

    if (!course) return res.status(404).json({ msg: 'Không tìm thấy học phần' });
    res.json(course);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/courses
 */
exports.create = async (req, res, next) => {
  try {
    const {
      code,
      title,
      credits,
      theoryHours = 0,
      practiceHours = 0,
      prerequisites = [],
      isGeneral = false,
      majors = [],
      semesterOffered
    } = req.body;

    // 1. Duplicate code
    if (await Course.findOne({ code })) {
      return res.status(400).json({ msg: 'Mã học phần đã tồn tại' });
    }
    // 2. If not general, must have majors
    if (!isGeneral && (!Array.isArray(majors) || majors.length === 0)) {
      return res.status(400).json({ msg: 'Chuyên ngành phải có danh sách majors' });
    }

    // 3. Resolve prerequisites and majors to ObjectId arrays
    const prereqIds = await resolveIds(Course, 'prerequisites', prerequisites);
    const majorIds  = await resolveIds(Major, 'majors', majors);

    // 4. Create
    const course = await Course.create({
      code,
      title,
      credits,
      theoryHours,
      practiceHours,
      prerequisites: prereqIds,
      isGeneral,
      majors: majorIds,
      semesterOffered
    });

    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/courses/:id
 */
exports.update = async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, isDeleted: false });
    if (!course) return res.status(404).json({ msg: 'Không tìm thấy học phần' });

    // duplicate code check
    if (req.body.code && req.body.code !== course.code) {
      if (await Course.findOne({ code: req.body.code })) {
        return res.status(400).json({ msg: 'Mã học phần mới đã tồn tại' });
      }
    }

    // if updating majors/prerequisites arrays, resolve IDs
    if (req.body.prerequisites) {
      course.prerequisites = await resolveIds(Course, 'prerequisites', req.body.prerequisites);
    }
    if (req.body.majors) {
      course.majors = await resolveIds(Major, 'majors', req.body.majors);
    }

    // update other fields
    [
      'code','title','credits',
      'theoryHours','practiceHours',
      'isGeneral','semesterOffered'
    ].forEach(key => {
      if (req.body[key] !== undefined) {
        course[key] = req.body[key];
      }
    });

    await course.save();
    const updated = await Course.findById(course._id)
      .populate('prerequisites', 'code title')
      .populate('majors', 'code name');

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/courses/:id
 */
exports.remove = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || course.isDeleted) {
      return res.status(404).json({ msg: 'Không tìm thấy học phần' });
    }
    course.isDeleted = true;
    course.deletedAt = new Date();
    await course.save();

    // Khoá các lớp học thuộc học phần này và xoá đăng ký
    const ClassModel = require('../models/Class');
    const Registration = require('../models/Registration');
    const classes = await ClassModel.find({ course: req.params.id });
    const classIds = classes.map(c => c._id);

    await ClassModel.updateMany(
      { course: req.params.id },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    if (classIds.length > 0) {
      await Registration.deleteMany({ class: { $in: classIds } });
    }

    res.json({ msg: 'Học phần và các lớp học liên quan đã được xoá đồng bộ' });
  } catch (err) {
    next(err);
  }
};
