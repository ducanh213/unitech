require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User         = require('../models/User');
const Student      = require('../models/Student');
const Teacher      = require('../models/Teacher');
const ClassModel   = require('../models/Class');
const Course       = require('../models/Course');
const Registration = require('../models/Registration');
const Period       = require('../models/Period');
const Major        = require('../models/Major');

const SCHEDULES = [
  'T2/T4 07:00-09:00', 'T2/T4 09:00-11:00', 'T2/T4 13:00-15:00', 'T2/T4 15:00-17:00',
  'T3/T5 07:00-09:00', 'T3/T5 09:00-11:00', 'T3/T5 13:00-15:00', 'T3/T5 15:00-17:00',
  'T6/T7 07:00-09:00', 'T6/T7 09:00-11:00', 'T6/T7 13:00-15:00', 'T6/T7 15:00-17:00',
];
const ROOMS = ['A101','A102','A103','A201','A202','B101','B102','B103','B201','B202','C101','C102'];

function randGrade(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Wiping all old data...');
    await Registration.deleteMany({});
    await ClassModel.deleteMany({});
    await Course.deleteMany({});
    await Major.deleteMany({});
    
    const oldUsers = await User.find({ role: { $in: ['student', 'teacher'] } });
    const oldUserIds = oldUsers.map(u => u._id);
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await User.deleteMany({ _id: { $in: oldUserIds } });

    console.log('🎓 Creating 4 Majors...');
    const majorWeb = await Major.create({ code: 'WEB', name: 'Web Fullstack', description: 'Chuyên ngành lập trình Web' });
    const majorDS  = await Major.create({ code: 'DS', name: 'Data Science', description: 'Khoa học dữ liệu & AI' });
    const majorMob = await Major.create({ code: 'MOB', name: 'Mobile Development', description: 'Lập trình ứng dụng di động' });
    const majorDes = await Major.create({ code: 'DES', name: 'UI/UX Design', description: 'Thiết kế giao diện & Trải nghiệm' });
    const majors = [majorWeb, majorDS, majorMob, majorDes];

    console.log('📚 Creating 21 Courses...');
    const courseDataRaw = [
      { code: 'ENG101', title: 'Tiếng Anh chuyên ngành CNTT', credits: 3, isGeneral: true, semesterOffered: 'HK1', majors: [] },
      { code: 'PM101',  title: 'Quản lý dự án Agile & Scrum', credits: 2, isGeneral: true, semesterOffered: 'HK2', majors: [] },
      { code: 'SOFT101',title: 'Kỹ năng mềm & Phỏng vấn',    credits: 2, isGeneral: true, semesterOffered: 'HK4', majors: [] },
      { code: 'WEB101', title: 'Lập trình Web cơ bản',       credits: 3, isGeneral: false, semesterOffered: 'HK1', majors: [majorWeb._id] },
      { code: 'WEB102', title: 'Lập trình Frontend ReactJS', credits: 4, isGeneral: false, semesterOffered: 'HK2', majors: [majorWeb._id], preReqCode: 'WEB101' },
      { code: 'WEB201', title: 'Lập trình Backend NodeJS',   credits: 4, isGeneral: false, semesterOffered: 'HK3', majors: [majorWeb._id], preReqCode: 'WEB101' },
      { code: 'WEB202', title: 'Cơ sở dữ liệu Web',          credits: 3, isGeneral: false, semesterOffered: 'HK3', majors: [majorWeb._id], preReqCode: 'WEB101' },
      { code: 'WEB301', title: 'Đồ án Web Fullstack',        credits: 5, isGeneral: false, semesterOffered: 'HK4', majors: [majorWeb._id], preReqCodes: ['WEB102','WEB201'] },
      { code: 'DS101',  title: 'Nhập môn Python & PT Dữ liệu',credits: 3, isGeneral: false, semesterOffered: 'HK1', majors: [majorDS._id] },
      { code: 'DS102',  title: 'Học máy cơ bản',             credits: 4, isGeneral: false, semesterOffered: 'HK2', majors: [majorDS._id], preReqCode: 'DS101' },
      { code: 'DS201',  title: 'Trí tuệ nhân tạo AI',        credits: 4, isGeneral: false, semesterOffered: 'HK3', majors: [majorDS._id], preReqCode: 'DS102' },
      { code: 'DS202',  title: 'Khai phá dữ liệu',           credits: 3, isGeneral: false, semesterOffered: 'HK3', majors: [majorDS._id], preReqCode: 'DS101' },
      { code: 'DS301',  title: 'Đồ án Data Science',         credits: 5, isGeneral: false, semesterOffered: 'HK4', majors: [majorDS._id], preReqCode: 'DS201' },
      { code: 'MOB101', title: 'Nhập môn Lập trình Di động', credits: 3, isGeneral: false, semesterOffered: 'HK1', majors: [majorMob._id] },
      { code: 'MOB102', title: 'Lập trình Flutter Cơ bản',   credits: 4, isGeneral: false, semesterOffered: 'HK2', majors: [majorMob._id], preReqCode: 'MOB101' },
      { code: 'MOB201', title: 'Lập trình Flutter Nâng cao', credits: 4, isGeneral: false, semesterOffered: 'HK3', majors: [majorMob._id], preReqCode: 'MOB102' },
      { code: 'MOB301', title: 'Đồ án Mobile App',           credits: 5, isGeneral: false, semesterOffered: 'HK4', majors: [majorMob._id], preReqCode: 'MOB201' },
      { code: 'DES101', title: 'Nguyên lý Thiết kế',         credits: 3, isGeneral: false, semesterOffered: 'HK1', majors: [majorDes._id] },
      { code: 'DES102', title: 'Công cụ Thiết kế Figma',     credits: 4, isGeneral: false, semesterOffered: 'HK2', majors: [majorDes._id], preReqCode: 'DES101' },
      { code: 'DES201', title: 'Nghiên cứu UX',              credits: 3, isGeneral: false, semesterOffered: 'HK3', majors: [majorDes._id], preReqCode: 'DES102' },
      { code: 'DES301', title: 'Đồ án UI/UX',                credits: 5, isGeneral: false, semesterOffered: 'HK4', majors: [majorDes._id], preReqCode: 'DES201' }
    ];

    const courses = [];
    const courseMap = {};

    for (const c of courseDataRaw) {
      const doc = await Course.create({ ...c, theoryHours: c.credits * 15, practiceHours: c.credits * 5 });
      courses.push(doc);
      courseMap[c.code] = doc._id;
    }

    for (const c of courseDataRaw) {
      if (c.preReqCode || c.preReqCodes) {
        const doc = await Course.findOne({ code: c.code });
        const preReqs = [];
        if (c.preReqCode) preReqs.push(courseMap[c.preReqCode]);
        if (c.preReqCodes) c.preReqCodes.forEach(p => preReqs.push(courseMap[p]));
        doc.prerequisites = preReqs;
        await doc.save();
      }
    }

    let period = await Period.findOne({ name: 'Học kỳ 1 Năm 2026' });
    if (!period) period = await Period.create({ name: 'Học kỳ 1 Năm 2026', semester: 'HK1-2026', startDate: new Date(), endDate: new Date(Date.now() + 30*24*60*60*1000) });

    let pastPeriod = await Period.findOne({ name: 'Học kỳ 2 Năm 2025' });
    if (!pastPeriod) pastPeriod = await Period.create({ name: 'Học kỳ 2 Năm 2025', semester: 'HK2-2025', startDate: new Date(Date.now() - 120*24*60*60*1000), endDate: new Date(Date.now() - 90*24*60*60*1000) });

    // ── 4. Tạo 12 giảng viên
    console.log('👨‍🏫 Creating 12 teachers...');
    const passwordHash = await bcrypt.hash('123456', 10);
    const teachers = [];
    const depts = ['Web Fullstack', 'Data Science', 'Mobile Dev', 'UI/UX Design'];
    const teachersByDept = { 'Web Fullstack': [], 'Data Science': [], 'Mobile Dev': [], 'UI/UX Design': [] };

    for (let i = 1; i <= 12; i++) {
      const deptName = depts[(i - 1) % 4];
      const user = await User.create({ username: `Giảng viên ${i}`, email: `teacher${i}@gmail.com`, password: passwordHash, role: 'teacher' });
      const teacher = await Teacher.create({ user: user._id, teacherId: `GV2026${String(i).padStart(3, '0')}`, fullName: `Giảng viên ${i}`, department: deptName, phone: `090000000${i}` });
      teachers.push(teacher);
      teachersByDept[deptName].push(teacher);
    }

    // ── 5. Tạo 42 Lớp học
    console.log('🏫 Creating 42 classes (No overlapping schedules for teachers)...');
    const classes = [];
    const teacherSchedules = {}; // tracking { teacherId: Set of schedules }
    teachers.forEach(t => teacherSchedules[t._id.toString()] = new Set());
    
    let roomIdx = 0;
    let schedIdx = 0;

    for (const course of courses) {
      // Tìm khoa tương ứng của môn học
      let deptOfCourse = 'Web Fullstack'; // default fallback cho môn đại cương
      if (!course.isGeneral && course.majors && course.majors.length > 0) {
        const m = majors.find(mj => mj._id.toString() === course.majors[0].toString());
        if (m) {
          if (m.code === 'WEB') deptOfCourse = 'Web Fullstack';
          if (m.code === 'DS') deptOfCourse = 'Data Science';
          if (m.code === 'MOB') deptOfCourse = 'Mobile Dev';
          if (m.code === 'DES') deptOfCourse = 'UI/UX Design';
        }
      }

      for (let j = 0; j < 2; j++) { 
        // Lấy giảng viên random trong khoa
        const availableTeachers = teachersByDept[deptOfCourse];
        const teacher = availableTeachers[Math.floor(Math.random() * availableTeachers.length)];
        
        // Tìm lịch không bị trùng cho giảng viên này (Bắt đầu tìm từ schedIdx để rải đều lịch)
        const tScheds = teacherSchedules[teacher._id.toString()];
        let selectedSchedule = null;
        for (let i = 0; i < SCHEDULES.length; i++) {
          const testSched = SCHEDULES[(schedIdx + i) % SCHEDULES.length];
          if (!tScheds.has(testSched)) {
            selectedSchedule = testSched;
            schedIdx += i + 1;
            break;
          }
        }
        
        // Nếu chẳng may tất cả 12 lịch đều kẹt (rất khó xảy ra với 3-4 lớp/GV), lấy tạm lịch đầu tiên
        if (!selectedSchedule) {
          selectedSchedule = SCHEDULES[0];
        }
        
        tScheds.add(selectedSchedule);

        const cls = await ClassModel.create({
          classCode:   `CL${course.code}-${j+1}`,
          course:      course._id,
          teacher:     teacher._id,
          room:        ROOMS[roomIdx % ROOMS.length],
          schedule:    selectedSchedule,
          capacityMin: 20,
          capacityMax: 50,
        });
        classes.push(cls);
        roomIdx++;
      }
    }
    console.log(`✅ ${classes.length} classes created without teacher schedule conflicts`);

    // ── 6. Tạo 150 sinh viên & Phân bổ
    console.log('🎓 Creating 150 students and distributing...');
    const students = [];
    const registrations = [];

    for (let i = 1; i <= 150; i++) {
      let currentSemesterNum;
      if (i <= 10) {
        currentSemesterNum = Math.floor(Math.random() * 3) + 2; // VIP: HK2, HK3, HK4
      } else {
        currentSemesterNum = ((i - 1) % 4) + 1; // Normal: HK1 -> HK4
      }
      
      const currentSemester = `HK${currentSemesterNum}`;
      const majorIdx = Math.floor((i - 1) / 4) % 4;
      const studentMajor = majors[majorIdx];

      const user = await User.create({ username: `Sinh viên ${i}`, email: `student${i}@gmail.com`, password: passwordHash, role: 'student' });
      const student = await Student.create({ user: user._id, studentId: `SV2026${String(i).padStart(3, '0')}`, fullName: `Sinh viên ${i}`, batch: `K2026-${studentMajor.code}`, status: 'Đang học', phone: '0900000000' });
      students.push(student);

      const validCourses = courses.filter(c => c.semesterOffered === currentSemester && (c.isGeneral || c.majors.some(m => m.toString() === studentMajor._id.toString())));
      let failedCourses = [];
      let pastAssignedClasses = new Set();
      
      if (i <= 10) {
        let pastCourses = courses.filter(c => 
          parseInt(c.semesterOffered.replace('HK','')) < currentSemesterNum &&
          (c.isGeneral || c.majors.some(m => m.toString() === studentMajor._id.toString()))
        );
        // Chọn ngẫu nhiên 1 môn rớt
        if (pastCourses.length > 0) {
          const fc = pastCourses[Math.floor(Math.random() * pastCourses.length)];
          failedCourses.push(fc);
          
          const fClasses = classes.filter(cls => cls.course.toString() === fc._id.toString());
          if (fClasses.length > 0) {
            const pastCls = fClasses[fClasses.length - 1]; // Lấy lớp cuối
            pastAssignedClasses.add(pastCls._id.toString());
            registrations.push({
              student: student._id,
              class: pastCls._id,
              period: pastPeriod._id,
              attendanceGrade: randGrade(6, 9),
              midtermGrade: randGrade(5, 7),
              finalGrade: randGrade(2, 4.9), // Điểm rớt < 5.0
              totalGrade: randGrade(3, 4.9)
            });
          }
        }
      }

      const assignedSchedules = new Set();
      const coursesToRegister = [...validCourses, ...failedCourses];
      
      for (const course of coursesToRegister) {
        const courseClasses = classes.filter(cls => cls.course.toString() === course._id.toString());
        let selectedClass = null;
        for (const cls of courseClasses) {
          if (!assignedSchedules.has(cls.schedule) && !pastAssignedClasses.has(cls._id.toString())) {
            selectedClass = cls;
            break;
          }
        }
        if (!selectedClass) {
            // Fallback nếu kẹt lịch
            selectedClass = courseClasses.find(cls => !pastAssignedClasses.has(cls._id.toString())) || courseClasses[0];
        }
        
        assignedSchedules.add(selectedClass.schedule);

        let att = randGrade(6, 10), mid = randGrade(6, 10), fin = randGrade(6, 10);
        if (currentSemesterNum === 1 && Math.random() > 0.5) fin = null;
        let total = fin !== null ? Math.round((att * 0.1 + mid * 0.3 + fin * 0.6) * 10) / 10 : null;

        registrations.push({ student: student._id, class: selectedClass._id, period: period._id, attendanceGrade: att, midtermGrade: mid, finalGrade: fin, totalGrade: total });
      }
    }

    const BATCH = 500;
    for (let i = 0; i < registrations.length; i += BATCH) await Registration.insertMany(registrations.slice(i, i + BATCH), { ordered: false });

    console.log(`✅ ${registrations.length} registrations created`);
    console.log('\n🎉 Seed hoàn tất!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi seed:', err);
    process.exit(1);
  }
}

run();
