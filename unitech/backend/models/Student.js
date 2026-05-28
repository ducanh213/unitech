const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    fullName: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    major: { type: String, trim: true },

    year: { type: Number },
    // ---- Soft delete fields ----
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);
