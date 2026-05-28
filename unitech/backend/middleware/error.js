// backend/middleware/error.js
module.exports = (err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(500).json({ msg: err.message || "Lỗi server nội bộ", stack: err.stack });
};
