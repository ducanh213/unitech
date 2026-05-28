const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true    // Tiêu đề thông báo
  },
  message: {
    type: String,
    required: true    // Nội dung thông báo
  },
  targets: [{
    type: String      // Có thể là 'student','teacher','admin' hoặc cụ thể ID user
  }],
  expireAt: {
    type: Date        // Ngày hết hạn hiển thị (nếu muốn)
  },
  createdAt: {
    type: Date,
    default: Date.now // Thời điểm tạo thông báo
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
