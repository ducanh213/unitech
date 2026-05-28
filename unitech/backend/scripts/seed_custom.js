require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const ClassModel = require('../models/Class');
const Course = require('../models/Course');
const Registration = require('../models/Registration');
const Period = require('../models/Period');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Wipe existing students, teachers, and their users, and all registrations
    console.log('🗑️ Wiping existing students, teachers, and registrations...');
    await Registration.deleteMany({});
    
    // Find all users who are students or teachers
    const usersToDelete = await User.find({ role: { $in: ['student', 'teacher'] } });
    const userIdsToDelete = usersToDelete.map(u => u._id);
    
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await User.deleteMany({ _id: { $in: userIdsToDelete } });
    
    console.log('✅ Wiped old data');

    const passwordHash = await bcrypt.hash('123456', 10);

    // 2. Create 10 Teachers
    console.log('👨‍🏫 Creating 10 teachers...');
    for (let i = 1; i <= 10; i++) {
      const user = await User.create({
        username: `teacher${i}`,
        email: `teacher${i}@gmail.com`,
        password: passwordHash,
        role: 'teacher'
      });
      await Teacher.create({
        user: user._id,
        teacherId: `GV2026${String(i).padStart(3, '0')}`,
        fullName: `Giảng viên ${i}`,
        department: 'CNTT',
        phone: '0900000000'
      });
    }

    // 3. Create 50 Students
    console.log('🎓 Creating 50 students...');
    const students = [];
    for (let i = 1; i <= 50; i++) {
      const user = await User.create({
        username: `student${i}`,
        email: `student${i}@gmail.com`,
        password: passwordHash,
        role: 'student'
      });
      const student = await Student.create({
        user: user._id,
        studentId: `SV2026${String(i).padStart(3, '0')}`,
        fullName: `Sinh viên ${i}`,
        batch: 'K65',
        status: 'Đang học',
        phone: '0900000000'
      });
      students.push(student);
    }

    // 4. Generate Registrations for AI Testing
    console.log('📋 Generating registrations for AI testing...');
    const classes = await ClassModel.find().populate('course');
    const periods = await Period.find();
    if (classes.length === 0 || periods.length === 0) {
      console.log('⚠️ Không có lớp học hoặc đợt đăng ký nào để gán điểm. Hãy tạo đợt đăng ký và lớp trước.');
      process.exit(1);
    }

    const defaultPeriod = periods[0]._id;

    for (const student of students) {
      // Pick 4-5 random classes
      const shuffledClasses = classes.sort(() => 0.5 - Math.random()).slice(0, 5);
      
      let failCourseAssigned = false;
      let emptyCourseAssigned = 0;

      for (const cls of shuffledClasses) {
        let att = 0, mid = 0, fin = null;

        if (!failCourseAssigned) {
          // This course will be FAILED (< 4.0)
          att = Math.floor(Math.random() * 4) + 1; // 1-4
          mid = Math.floor(Math.random() * 5) + 1; // 1-5
          fin = Math.floor(Math.random() * 4) + 1; // 1-4
          failCourseAssigned = true;
        } else if (emptyCourseAssigned < 2) {
          // This course will have NO final grade (for Target Predict AI)
          att = Math.floor(Math.random() * 5) + 5; // 5-9
          mid = Math.floor(Math.random() * 5) + 5; // 5-9
          fin = null;
          emptyCourseAssigned++;
        } else {
          // Normal passing course (>= 5.0)
          att = Math.floor(Math.random() * 4) + 6; // 6-9
          mid = Math.floor(Math.random() * 4) + 6; // 6-9
          fin = Math.floor(Math.random() * 4) + 6; // 6-9
        }

        let total = null;
        if (fin !== null) {
          total = Math.round((att * 0.1 + mid * 0.3 + fin * 0.6) * 10) / 10;
        }

        await Registration.create({
          student: student._id,
          class: cls._id,
          period: defaultPeriod,
          attendanceGrade: att,
          midtermGrade: mid,
          finalGrade: fin,
          totalGrade: total
        });
      }
    }

    console.log('🎉 Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
}

run();
