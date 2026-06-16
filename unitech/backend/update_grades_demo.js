const mongoose = require('mongoose');
require('dotenv').config();
const Registration = require('./models/Registration');
const Student = require('./models/Student');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Đã kết nối MongoDB.");

    const students = await Student.find({ isDeleted: { $ne: true } });
    console.log(`Tìm thấy ${students.length} sinh viên.`);

    // Nhóm sinh viên theo chuyên ngành
    const studentsByMajor = {};
    students.forEach(s => {
      const major = s.major || 'Unknown';
      if (!studentsByMajor[major]) studentsByMajor[major] = [];
      studentsByMajor[major].push(s);
    });

    console.log("Số sinh viên theo ngành:", Object.keys(studentsByMajor).map(m => `${m}: ${studentsByMajor[m].length}`).join(', '));

    // Cấu hình phân bổ điểm:
    // Tổng thể mong muốn: 15% Giỏi, 15% Yếu, 35% Khá, 35% TB
    // Ngành "Màu vàng" (Nhiều sinh viên yếu/cảnh cáo): CNTT, WEB
    // Ngành "Màu xanh" (Nhiều sinh viên giỏi): DES, DS
    // Ngành bình thường (Cân bằng): MOB

    let updatedCount = { excellent: 0, good: 0, average: 0, weak: 0 };

    for (const [major, majorStudents] of Object.entries(studentsByMajor)) {
      let config = { weak: 0.15, excellent: 0.15, good: 0.35, average: 0.35 };
      
      if (major === 'CNTT' || major === 'WEB') {
        // Ngành có nhiều sinh viên điểm kém (Màu vàng/cam trên biểu đồ)
        config = { weak: 0.35, excellent: 0.05, good: 0.30, average: 0.30 };
      } else if (major === 'DES' || major === 'DS') {
        // Ngành có nhiều sinh viên điểm cao (Màu xanh trên biểu đồ)
        config = { weak: 0.05, excellent: 0.35, good: 0.40, average: 0.20 };
      } else {
        // Ngành bình thường
        config = { weak: 0.10, excellent: 0.10, good: 0.35, average: 0.45 };
      }

      // Xáo trộn mảng sinh viên để random người được điểm cao/thấp
      const shuffled = [...majorStudents].sort(() => 0.5 - Math.random());
      const total = shuffled.length;

      const weakCount = Math.floor(total * config.weak);
      const excellentCount = Math.floor(total * config.excellent);
      const goodCount = Math.floor(total * config.good);

      for (let i = 0; i < total; i++) {
        const stu = shuffled[i];
        const regs = await Registration.find({ student: stu._id });
        if (regs.length === 0) continue;

        let targetGradeLow, targetGradeHigh;
        let category = '';

        if (i < weakCount) {
          // Yếu: 2.0 - 4.8
          targetGradeLow = 2.0;
          targetGradeHigh = 4.8;
          category = 'weak';
        } else if (i < weakCount + excellentCount) {
          // Giỏi: 8.2 - 9.8
          targetGradeLow = 8.2;
          targetGradeHigh = 9.8;
          category = 'excellent';
        } else if (i < weakCount + excellentCount + goodCount) {
          // Khá: 7.0 - 8.1
          targetGradeLow = 7.0;
          targetGradeHigh = 8.1;
          category = 'good';
        } else {
          // Trung bình: 5.0 - 6.9
          targetGradeLow = 5.0;
          targetGradeHigh = 6.9;
          category = 'average';
        }

        updatedCount[category]++;

        for (const reg of regs) {
          // Random điểm trong khoảng cho trước
          const randomGrade = (Math.random() * (targetGradeHigh - targetGradeLow) + targetGradeLow).toFixed(1);
          reg.attendanceGrade = 10;
          reg.midtermGrade = parseFloat(randomGrade);
          reg.finalGrade = parseFloat(randomGrade);
          // Công thức tính điểm tổng kết: 10% CC + 30% GK + 60% CK
          reg.totalGrade = parseFloat((10 * 0.1 + reg.midtermGrade * 0.3 + reg.finalGrade * 0.6).toFixed(1));
          await reg.save();
        }
      }
    }

    console.log(`\nCập nhật thành công điểm chính thức cho toàn bộ sinh viên!`);
    console.log(`- Nhóm Giỏi (>= 8.2): ${updatedCount.excellent} sinh viên`);
    console.log(`- Nhóm Khá (7.0 - 8.1): ${updatedCount.good} sinh viên`);
    console.log(`- Nhóm Trung bình (5.0 - 6.9): ${updatedCount.average} sinh viên`);
    console.log(`- Nhóm Yếu (< 5.0): ${updatedCount.weak} sinh viên`);

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
