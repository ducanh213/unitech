// backend/controllers/notificationController.js
const Notification = require('../models/Notification');

/**
 * GET /api/notifications
 * Lấy danh sách thông báo theo vai trò của người dùng
 */
exports.getAll = async (req, res, next) => {
  try {
    const role = req.user.role; // 'student', 'teacher', or 'admin'
    
    // Nếu là admin, lấy tất cả thông báo
    if (role === 'admin') {
      const all = await Notification.find().sort({ createdAt: -1 });
      return res.json(all);
    }

    // Nếu là user, lấy thông báo gửi cho mọi người ('all') hoặc gửi cho role của mình
    const list = await Notification.find({
      $or: [
        { targets: 'all' },
        { targets: role }
      ]
    }).sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/notifications
 * Tạo thông báo mới (Chỉ dành cho Admin)
 * Body: { title, message, targets: ['student', 'teacher', 'all'] }
 */
exports.create = async (req, res, next) => {
  try {
    const { title, message, targets } = req.body;
    
    const notification = await Notification.create({
      title,
      message,
      targets: targets || ['all']
    });

    res.status(201).json(notification);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/notifications/:id
 * Xóa thông báo (Chỉ dành cho Admin)
 */
exports.remove = async (req, res, next) => {
  try {
    const notif = await Notification.findByIdAndDelete(req.params.id);
    if (!notif) return res.status(404).json({ msg: 'Không tìm thấy thông báo' });
    res.json({ msg: 'Đã xóa thông báo' });
  } catch (err) {
    next(err);
  }
};
