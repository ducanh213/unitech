// backend/controllers/majorController.js
const Major = require('../models/Major');

/**
 * GET /api/majors
 * List all non-deleted majors
 * Access: admin, teacher
 */
exports.getAll = async (req, res, next) => {
  try {
    const list = await Major.find({ isDeleted: false });
    res.json(list);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/majors/:id
 * Get one major by id
 * Access: admin, teacher
 */
exports.getById = async (req, res, next) => {
  try {
    const major = await Major.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    if (!major) {
      return res.status(404).json({ msg: 'Không tìm thấy ngành học' });
    }
    res.json(major);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/majors
 * Create a new major
 * body: { code, name, description? }
 * Access: admin
 */
exports.create = async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    // Kiểm duplicate
    if (await Major.findOne({ code })) {
      return res.status(400).json({ msg: 'Mã ngành đã tồn tại' });
    }
    const major = await Major.create({ code, name, description });
    res.status(201).json(major);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/majors/:id
 * Update a major
 * body: { code?, name?, description? }
 * Access: admin
 */
exports.update = async (req, res, next) => {
  try {
    const major = await Major.findOne({ 
      _id: req.params.id,
      isDeleted: false 
    });
    if (!major) {
      return res.status(404).json({ msg: 'Không tìm thấy ngành học' });
    }
    ['code','name','description'].forEach(key => {
      if (req.body[key] !== undefined) {
        major[key] = req.body[key];
      }
    });
    await major.save();
    res.json(major);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/majors/:id
 * Soft-delete a major
 * Access: admin
 */
exports.remove = async (req, res, next) => {
  try {
    const major = await Major.findById(req.params.id);
    if (!major || major.isDeleted) {
      return res.status(404).json({ msg: 'Không tìm thấy ngành học' });
    }
    major.isDeleted = true;
    major.deletedAt = new Date();
    await major.save();
    res.json({ msg: 'Ngành học đã được xoá thành công' });
  } catch (err) {
    next(err);
  }
};
