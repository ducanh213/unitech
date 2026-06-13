const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Registration = require('../models/Registration');
const Student = require('../models/Student');
const ClassModel = require('../models/Class');
const Course = require('../models/Course');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB');

    // Tìm một vài sinh viên (tầm 15 bạn)
    const students = await Student.find().limit(15);
    let updatedCount = 0;

    for (let s of students) {
      // Tìm các Registration của sinh viên này
      const regs = await Registration.find({ student: s._id });
      
      // Cho sinh viên này tạch 2-3 môn
      for (let i = 0; i < Math.min(3, regs.length); i++) {
        const reg = regs[i];
        reg.attendanceGrade = 5;
        reg.midtermGrade = 3;
        reg.finalGrade = 2; // Rất thấp
        reg.totalGrade = (5 * 0.1) + (3 * 0.3) + (2 * 0.6); // 0.5 + 0.9 + 1.2 = 2.6
        await reg.save();
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} registrations to have failing grades (< 4.0).`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
