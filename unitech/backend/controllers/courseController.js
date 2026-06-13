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
