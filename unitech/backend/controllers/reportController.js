// backend/controllers/reportController.js
const Student      = require('../models/Student');
const Registration = require('../models/Registration');

/**
 * Phân loại sinh viên theo GPA
 * Rule-based AI - không cần Python
 * 
 * Ngưỡng dựa trên thang điểm 10 của Việt Nam:
 *   Giỏi / Xuất sắc: GPA >= 8.0
 *   Khá: 7.0 <= GPA < 8.0
 *   Trung bình: 5.0 <= GPA < 7.0
 *   Yếu / Nguy cơ: GPA < 5.0
 */
function classifyStudent(gpa, failedCount, hasGrades) {
  if (!hasGrades) return 'no_data';
  if (gpa >= 8.0) return 'excellent';   // Giỏi / Xuất sắc
  if (gpa >= 7.0) return 'good';        // Khá
  if (gpa >= 5.0) return 'average';     // Trung bình
  return 'weak';                        // Yếu / Nguy cơ
}

/**
 * GET /api/reports/academic
 * Báo cáo chất lượng đào tạo toàn trường, phân theo ngành
 * Chỉ Admin được gọi
 */
exports.getAcademicReport = async (req, res, next) => {
  try {
    // 1. Lấy toàn bộ sinh viên chưa bị xóa
    const students = await Student.find({ isDeleted: { $ne: true } })
      .populate('user', 'username email')
      .lean();

    // 2. Lấy toàn bộ registrations đã có điểm tổng kết
    //    Populate đủ để tính GPA và nhóm môn
    const allRegs = await Registration.find({})
      .populate({
        path: 'class',
        select: 'course',
        populate: { path: 'course', select: 'code title credits' }
      })
      .lean();

    // Map: studentId (ObjectId string) → danh sách registrations của SV đó
    const regsByStudent = {};
    for (const reg of allRegs) {
      const sid = reg.student?.toString();
      if (!sid) continue;
      if (!regsByStudent[sid]) regsByStudent[sid] = [];
      regsByStudent[sid].push(reg);
    }

    // 3. Tính chỉ số từng sinh viên
    const studentStats = students.map(stu => {
      const regs      = regsByStudent[stu._id.toString()] || [];
      const gradedRegs = regs.filter(r => r.totalGrade !== null && r.totalGrade !== undefined);
      const failedRegs = gradedRegs.filter(r => r.totalGrade < 4.0);
      const passedRegs = gradedRegs.filter(r => r.totalGrade >= 4.0);

      const hasGrades  = gradedRegs.length > 0;
      const gpa        = hasGrades
        ? parseFloat((gradedRegs.reduce((s, r) => s + r.totalGrade, 0) / gradedRegs.length).toFixed(2))
        : 0;
      const failedCount = failedRegs.length;
      const passedCount = passedRegs.length;

      // Danh sách môn rớt (để Admin xem chi tiết)
      const failedCourses = failedRegs.map(r => ({
        code:       r.class?.course?.code  || '?',
        title:      r.class?.course?.title || '?',
        totalGrade: r.totalGrade
      }));

      const group = classifyStudent(gpa, failedCount, hasGrades);

      return {
        _id:          stu._id,
        studentId:    stu.studentId,
        fullName:     stu.fullName,
        major:        stu.major || 'Chưa phân ngành',
        year:         stu.year,
        gpa,
        failedCount,
        passedCount,
        totalCourses: gradedRegs.length,
        group,
        failedCourses,
      };
    });

    // 4. Group sinh viên theo ngành
    const majorMap = {};
    for (const stu of studentStats) {
      const key = stu.major;
      if (!majorMap[key]) {
        majorMap[key] = {
          majorName: key,
          students:  []
        };
      }
      majorMap[key].students.push(stu);
    }

    // 5. Tính chỉ số chất lượng từng ngành
    const majorReports = Object.values(majorMap).map(m => {
      const allStu       = m.students;
      const withGrades   = allStu.filter(s => s.group !== 'no_data');
      const atRisk       = allStu.filter(s => s.group === 'weak');

      const avgGpa = withGrades.length > 0
        ? parseFloat((withGrades.reduce((s, st) => s + st.gpa, 0) / withGrades.length).toFixed(2))
        : 0;

      // Tỷ lệ đậu = tổng môn đậu / (tổng môn đậu + tổng môn rớt) của toàn ngành
      const totalPassed = allStu.reduce((s, st) => s + st.passedCount, 0);
      const totalFailed = allStu.reduce((s, st) => s + st.failedCount, 0);
      const passRate = (totalPassed + totalFailed) > 0
        ? parseFloat(((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1))
        : null;

      // Điểm sức khỏe ngành (0-100)
      const atRiskRate   = allStu.length > 0 ? atRisk.length / allStu.length : 0;
      const healthScore  = Math.round((1 - atRiskRate) * 100);
      const healthStatus = healthScore >= 80 ? 'good' : healthScore >= 60 ? 'warning' : 'critical';

      // Đếm theo nhóm
      const groupCounts = {
        excellent: allStu.filter(s => s.group === 'excellent').length,
        good:      allStu.filter(s => s.group === 'good').length,
        average:   allStu.filter(s => s.group === 'average').length,
        weak:      allStu.filter(s => s.group === 'weak').length,
        no_data:   allStu.filter(s => s.group === 'no_data').length,
      };

      // Trả về toàn bộ danh sách sinh viên của ngành để có thể view bất kỳ nhóm nào
      const studentsList = allStu.sort((a, b) => b.gpa - a.gpa);

      return {
        majorName:     m.majorName,
        totalStudents: allStu.length,
        avgGpa,
        passRate,
        healthScore,
        healthStatus,
        groupCounts,
        studentsList,
      };
    })
    // Sắp xếp ngành: critical trước, rồi warning, rồi good
    .sort((a, b) => {
      const order = { critical: 0, warning: 1, good: 2 };
      return (order[a.healthStatus] ?? 3) - (order[b.healthStatus] ?? 3);
    });

    // 6. Tổng hợp toàn trường
    const totalStudents = studentStats.length;
    const allWithGrades = studentStats.filter(s => s.group !== 'no_data');
    const overallGpa    = allWithGrades.length > 0
      ? parseFloat((allWithGrades.reduce((s, st) => s + st.gpa, 0) / allWithGrades.length).toFixed(2))
      : 0;
    const atRiskTotal   = studentStats.filter(s => s.group === 'weak').length;
    const totalPassed   = studentStats.reduce((s, st) => s + st.passedCount, 0);
    const totalFailed   = studentStats.reduce((s, st) => s + st.failedCount, 0);
    const overallPassRate = (totalPassed + totalFailed) > 0
      ? parseFloat(((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1))
      : null;

    const overallGroupCounts = {
      excellent: studentStats.filter(s => s.group === 'excellent').length,
      good:      studentStats.filter(s => s.group === 'good').length,
      average:   studentStats.filter(s => s.group === 'average').length,
      weak:      studentStats.filter(s => s.group === 'weak').length,
      no_data:   studentStats.filter(s => s.group === 'no_data').length,
    };

    res.json({
      generatedAt: new Date().toISOString(),
      overallStats: {
        totalStudents,
        overallGpa,
        atRiskTotal,
        overallPassRate,
        groupCounts: overallGroupCounts,
      },
      majorReports,
    });

  } catch (err) {
    next(err);
  }
};
