// backend/controllers/periodController.js
const Period = require('../models/Period');

/**
 * GET /api/periods
 * List all non-deleted periods
 * Access: admin, teacher
 */
exports.getAll = async (req, res, next) => {
  try {
    const list = await Period.find({ isDeleted: false });
    res.json(list);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/periods/:id
 * Get one period
 * Access: admin, teacher
 */
exports.getById = async (req, res, next) => {
  try {
    const p = await Period.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    if (!p) return res.status(404).json({ msg: 'Không tìm thấy đợt đăng ký' });
    res.json(p);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/periods
 * Create new period
 * body: { name, semester, startDate, endDate, isSupplementary? }
 * Access: admin
 */
exports.create = async (req, res, next) => {
  try {
    const { name, semester, startDate, endDate, isSupplementary = false } = req.body;
    if (await Period.findOne({ name })) {
      return res.status(400).json({ msg: 'Tên đợt đã tồn tại' });
    }
    const period = await Period.create({
      name,
      semester,
      startDate,
      endDate,
      isSupplementary
    });
    res.status(201).json(period);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/periods/:id
 * Update period (except status)
 * Access: admin
 */
exports.update = async (req, res, next) => {
  try {
    const period = await Period.findOne({
      _id: req.params.id,
      isDeleted: false
    });
    if (!period) return res.status(404).json({ msg: 'Không tìm thấy đợt đăng ký' });

    ['name','semester','startDate','endDate','isSupplementary'].forEach(key => {
      if (req.body[key] !== undefined) {
        period[key] = req.body[key];
      }
    });
    await period.save();
    res.json(period);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/periods/:id/open
 * Set status = 'open'
 * Access: admin
 */
exports.open = async (req, res, next) => {
  try {
    const p = await Period.findOne({ _id: req.params.id, isDeleted: false });
    if (!p) return res.status(404).json({ msg: 'Không tìm thấy đợt đăng ký' });
    if (p.status !== 'pending') {
      return res.status(400).json({ msg: 'Chỉ có đợt ở trạng thái pending mới mở được' });
    }
    p.status = 'open';
    await p.save();
    res.json({ msg: 'Đợt đăng ký đã được mở', period: p });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/periods/:id/close
 * Set status = 'closed'
 * Access: admin
 */
exports.close = async (req, res, next) => {
  try {
    const p = await Period.findOne({ _id: req.params.id, isDeleted: false });
    if (!p) return res.status(404).json({ msg: 'Không tìm thấy đợt đăng ký' });
    if (p.status !== 'open') {
      return res.status(400).json({ msg: 'Chỉ có đợt đang mở mới đóng được' });
    }
    p.status = 'closed';
    await p.save();
    res.json({ msg: 'Đợt đăng ký đã được đóng', period: p });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/periods/:id
 * Hard-delete period
 * Access: admin
 */
exports.remove = async (req, res, next) => {
  try {
    const result = await Period.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: 'Không tìm thấy đợt đăng ký' });
    }
    res.json({ msg: 'Đợt đăng ký đã được xóa' });
  } catch (err) {
    next(err);
  }
};
