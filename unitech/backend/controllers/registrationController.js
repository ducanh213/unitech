// backend/controllers/registrationController.js
const Registration = require("../models/Registration");
const ClassModel   = require("../models/Class");
const Period       = require("../models/Period");
const Student      = require("../models/Student");

// Tiết học (phút từ 0:00)
const PERIOD_TIMES = [
  { no: 1,  s: 7*60+0,   e: 7*60+50  },
  { no: 2,  s: 7*60+55,  e: 8*60+45  },
  { no: 3,  s: 8*60+50,  e: 9*60+40  },
  { no: 4,  s: 9*60+50,  e: 10*60+40 },
  { no: 5,  s: 10*60+45, e: 11*60+35 },
  { no: 6,  s: 12*60+30, e: 13*60+20 },
  { no: 7,  s: 13*60+25, e: 14*60+15 },
  { no: 8,  s: 14*60+20, e: 15*60+10 },
  { no: 9,  s: 15*60+20, e: 16*60+10 },
  { no: 10, s: 16*60+15, e: 17*60+5  },
];

// Parse "T2,T4 07:00-11:35" → { T2: Set{1,2,3,4,5}, T4: Set{1,2,3,4,5} }
function parseScheduleToSlots(schedStr) {
  if (!schedStr) return {};
  const result = {};
  const m = schedStr.match(/^((?:T[2-7],?)+)\s+(\d+):(\d+)\s*[-–]\s*(\d+):(\d+)$/i);
  if (!m) return {};
  const days    = m[1].toUpperCase().split(',').map(d => d.trim());
  const sMin    = parseInt(m[2]) * 60 + parseInt(m[3]);
  const eMin    = parseInt(m[4]) * 60 + parseInt(m[5]);
  const periods = new Set(
    PERIOD_TIMES.filter(p => sMin < p.e + 10 && eMin > p.s - 10).map(p => p.no)
  );
  for (const d of days) result[d] = periods;
  return result;
}

// Kiểm tra 2 schedule có trùng tiết không
function hasConflict(schedA, schedB) {
  const slotsA = parseScheduleToSlots(schedA);
  const slotsB = parseScheduleToSlots(schedB);
  for (const day of Object.keys(slotsA)) {
    if (!slotsB[day]) continue;
    for (const p of slotsA[day]) {
      if (slotsB[day].has(p)) return true;
    }
  }
  return false;
}

// GET /api/registrations
exports.getAll = async (req, res, next) => {
  try {
    const ft = {};
    if (req.user.role === "student") {
      const student = await Student.findOne({ user: req.user.id });
      if (student) ft.student = student._id;
      else return res.json([]);
    }
    const list = await Registration.find(ft)
      .populate({
        path: "class",
        select: "classCode schedule room",
        populate: { path: "course", select: "code title credits" },
      })
      .populate("period", "name semester status");
    return res.json(list);
  } catch (err) { next(err); }
};

// POST /api/registrations
exports.create = async (req, res, next) => {
  try {
    const { class: classId, period: periodId } = req.body;

    // 1) Kiểm tra period đang mở
    const period = await Period.findOne({ _id: periodId, status: "open", isDeleted: false });
    if (!period) return res.status(400).json({ msg: "Đợt đăng ký chưa mở hoặc không tồn tại" });

    // 2) Kiểm tra lớp tồn tại
    const cls = await ClassModel.findOne({ _id: classId, isDeleted: false });
    if (!cls) return res.status(400).json({ msg: "Lớp học không tồn tại" });

    // 3) Lấy student profile từ token
    const studentProfile = await Student.findOne({ user: req.user.id });
    if (!studentProfile) return res.status(400).json({ msg: "Không tìm thấy hồ sơ sinh viên" });

    // 4) Chống đăng ký trùng lớp
    const dup = await Registration.findOne({ student: studentProfile._id, class: classId, period: periodId });
    if (dup) return res.status(400).json({ msg: "Bạn đã đăng ký lớp này rồi" });

    // 5) Kiểm tra trùng tiết (overlap period-based)
    const myRegs = await Registration.find({ student: studentProfile._id, period: periodId })
      .populate("class", "schedule classCode");

    for (const reg of myRegs) {
      if (!reg.class?.schedule) continue;
      if (hasConflict(cls.schedule, reg.class.schedule)) {
        return res.status(400).json({
          msg: `Lịch bị trùng với lớp ${reg.class.classCode} (${reg.class.schedule})`
        });
      }
    }

    // 6) Tạo đăng ký
    const reg = await Registration.create({ student: studentProfile._id, class: classId, period: periodId });

    // 7) Populate để trả về client
    const full = await Registration.findById(reg._id)
      .populate({
        path: "class",
        select: "classCode schedule room",
        populate: { path: "course", select: "code title credits" },
      })
      .populate("period", "name semester status");

    return res.status(201).json(full);
  } catch (err) { 
    console.error("Create Registration Error:", err.message);
    res.status(500).json({ msg: err.message || "Lỗi server" });
  }
};

// DELETE /api/registrations/:id
exports.remove = async (req, res, next) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ msg: "Đăng ký không tồn tại" });
    if (req.user.role !== "student" && req.user.role !== "admin")
      return res.status(403).json({ msg: "Không có quyền hủy đăng ký" });
    await Registration.findByIdAndDelete(req.params.id);
    return res.json({ msg: "Hủy đăng ký thành công" });
  } catch (err) { next(err); }
};
