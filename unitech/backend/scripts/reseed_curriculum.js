/**
 * reseed_curriculum.js
 * Timeline kỳ học:
 *   KH-2025  : Năm 2 học HK1 (lịch sử xa)
 *   HK1-2025 : Năm 1 học HK1, Năm 2 học HK2 (kỳ 1 - có điểm)
 *   HK2-2025 : Năm 1 học HK2, Năm 2 học HK3 (kỳ 2 - đang chấm điểm)
 *   KH-2026  : Mở đăng ký (kỳ hè - chưa có điểm, ít sv đăng ký sẵn)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Teacher    = require('../models/Teacher');
const ClassModel = require('../models/Class');
const Course     = require('../models/Course');
const Registration = require('../models/Registration');
const Period     = require('../models/Period');
const Major      = require('../models/Major');
const Student    = require('../models/Student');

const randGrade = (mn, mx) => Math.round((Math.random() * (mx - mn) + mn) * 10) / 10;
const calcTotal = (a, m, f) => a == null ? null : Math.round((a*.1 + m*.3 + f*.6) * 10) / 10;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected');

  const periods = await Period.find({});
  const pMap = {}; periods.forEach(p => pMap[p.semester] = p);
  const pKH25  = pMap['KH-2025'];
  const pHK125 = pMap['HK1-2025'];
  const pHK225 = pMap['HK2-2025']; // kỳ 2 - đang chấm điểm
  const pOpen  = pMap['KH-2026'];  // kỳ hè - đang mở đăng ký

  if (!pKH25 || !pHK125 || !pHK225 || !pOpen) {
    console.error('❌ Thiếu period!'); process.exit(1);
  }

  const majors = await Major.find({});
  const mMap = {}; majors.forEach(m => mMap[m.code] = m._id);
  const teachers = await Teacher.find({});
  if (!teachers.length) throw new Error('Không có giảng viên!');

  console.log('🗑  Xóa dữ liệu cũ...');
  await Registration.deleteMany({});
  await ClassModel.deleteMany({});
  await Course.deleteMany({});

  const allMajors = majors.map(m => m._id);
  const courseDefs = [
    { code:'ENG101', title:'Tiếng Anh chuyên ngành 1', credits:3, sem:'HK1', gen:true,  majors:allMajors, pre:[] },
    { code:'ENG102', title:'Tiếng Anh chuyên ngành 2', credits:3, sem:'HK2', gen:true,  majors:allMajors, pre:['ENG101'] },
    // WEB
    { code:'WEB101', title:'Lập trình C/C++ Cơ bản',      credits:3, sem:'HK1', majors:[mMap['WEB']], pre:[] },
    { code:'WEB102', title:'HTML/CSS & UI/UX',              credits:3, sem:'HK1', majors:[mMap['WEB']], pre:[] },
    { code:'WEB103', title:'Cơ sở dữ liệu SQL',            credits:3, sem:'HK1', majors:[mMap['WEB']], pre:[] },
    { code:'WEB201', title:'Lập trình OOP Java',            credits:4, sem:'HK2', majors:[mMap['WEB']], pre:['WEB101'] },
    { code:'WEB202', title:'Phát triển Web Backend',        credits:4, sem:'HK2', majors:[mMap['WEB']], pre:['WEB102','WEB103'] },
    { code:'WEB203', title:'Javascript Nâng cao',           credits:3, sem:'HK2', majors:[mMap['WEB']], pre:['WEB102'] },
    { code:'WEB301', title:'Lập trình Frontend ReactJS',    credits:4, sem:'HK3', majors:[mMap['WEB']], pre:['WEB203'] },
    { code:'WEB302', title:'Node.js & Express API',         credits:4, sem:'HK3', majors:[mMap['WEB']], pre:['WEB202','WEB203'] },
    { code:'WEB303', title:'Phân tích & Thiết kế HTTT',    credits:3, sem:'HK3', majors:[mMap['WEB']], pre:['WEB103'] },
    { code:'WEB401', title:'Triển khai & Cloud (AWS)',      credits:3, sem:'HK4', majors:[mMap['WEB']], pre:['WEB302'] },
    { code:'WEB402', title:'Bảo mật Web',                   credits:3, sem:'HK4', majors:[mMap['WEB']], pre:['WEB301','WEB302'] },
    { code:'WEB403', title:'Đồ án Tốt nghiệp (WEB)',       credits:5, sem:'HK4', majors:[mMap['WEB']], pre:['WEB301','WEB302'] },
    // DS
    { code:'DS101',  title:'Python Cơ bản',                 credits:3, sem:'HK1', majors:[mMap['DS']], pre:[] },
    { code:'DS102',  title:'Toán & Xác suất thống kê',      credits:3, sem:'HK1', majors:[mMap['DS']], pre:[] },
    { code:'DS103',  title:'Cơ sở dữ liệu SQL',             credits:3, sem:'HK1', majors:[mMap['DS']], pre:[] },
    { code:'DS201',  title:'Python Data Analysis (Pandas)', credits:4, sem:'HK2', majors:[mMap['DS']], pre:['DS101','DS102'] },
    { code:'DS202',  title:'Cấu trúc dữ liệu & Giải thuật',credits:4, sem:'HK2', majors:[mMap['DS']], pre:['DS101'] },
    { code:'DS203',  title:'Trực quan hóa dữ liệu',         credits:3, sem:'HK2', majors:[mMap['DS']], pre:['DS103'] },
    { code:'DS301',  title:'Machine Learning Cơ bản',       credits:4, sem:'HK3', majors:[mMap['DS']], pre:['DS201'] },
    { code:'DS302',  title:'Big Data (Hadoop/Spark)',        credits:4, sem:'HK3', majors:[mMap['DS']], pre:['DS201','DS202'] },
    { code:'DS303',  title:'Khai phá dữ liệu',              credits:3, sem:'HK3', majors:[mMap['DS']], pre:['DS203'] },
    { code:'DS401',  title:'Deep Learning Nâng cao',         credits:4, sem:'HK4', majors:[mMap['DS']], pre:['DS301'] },
    { code:'DS402',  title:'Triển khai mô hình (MLOps)',     credits:3, sem:'HK4', majors:[mMap['DS']], pre:['DS301'] },
    { code:'DS403',  title:'Đồ án Tốt nghiệp (DS)',         credits:5, sem:'HK4', majors:[mMap['DS']], pre:['DS301','DS302'] },
    // MOB
    { code:'MOB101', title:'Lập trình Java Cơ bản',         credits:3, sem:'HK1', majors:[mMap['MOB']], pre:[] },
    { code:'MOB102', title:'UI/UX cho Mobile',               credits:3, sem:'HK1', majors:[mMap['MOB']], pre:[] },
    { code:'MOB103', title:'Cơ sở dữ liệu SQLite',          credits:3, sem:'HK1', majors:[mMap['MOB']], pre:[] },
    { code:'MOB201', title:'Lập trình Android Cơ bản',      credits:4, sem:'HK2', majors:[mMap['MOB']], pre:['MOB101'] },
    { code:'MOB202', title:'CTDL & Thuật toán',             credits:4, sem:'HK2', majors:[mMap['MOB']], pre:['MOB101'] },
    { code:'MOB203', title:'Lập trình Swift/iOS Cơ bản',    credits:3, sem:'HK2', majors:[mMap['MOB']], pre:[] },
    { code:'MOB301', title:'Android Nâng cao & API',        credits:4, sem:'HK3', majors:[mMap['MOB']], pre:['MOB201','MOB103'] },
    { code:'MOB302', title:'Lập trình Đa nền tảng Flutter', credits:4, sem:'HK3', majors:[mMap['MOB']], pre:['MOB201'] },
    { code:'MOB303', title:'iOS Nâng cao',                   credits:3, sem:'HK3', majors:[mMap['MOB']], pre:['MOB203'] },
    { code:'MOB401', title:'Kiến trúc phần mềm Mobile',     credits:3, sem:'HK4', majors:[mMap['MOB']], pre:['MOB301'] },
    { code:'MOB402', title:'Publish App & ASO',             credits:3, sem:'HK4', majors:[mMap['MOB']], pre:['MOB301','MOB302'] },
    { code:'MOB403', title:'Đồ án Tốt nghiệp (Mobile)',     credits:5, sem:'HK4', majors:[mMap['MOB']], pre:['MOB301','MOB302'] },
    // DES
    { code:'DES101', title:'Nhập môn Thiết kế đồ họa',      credits:3, sem:'HK1', majors:[mMap['DES']], pre:[] },
    { code:'DES102', title:'Nguyên lý thị giác & Màu sắc',  credits:3, sem:'HK1', majors:[mMap['DES']], pre:[] },
    { code:'DES103', title:'Photoshop & Illustrator',        credits:3, sem:'HK1', majors:[mMap['DES']], pre:[] },
    { code:'DES201', title:'Thiết kế UI/UX Cơ bản',         credits:4, sem:'HK2', majors:[mMap['DES']], pre:['DES101','DES102'] },
    { code:'DES202', title:'Thực hành Figma/Adobe XD',       credits:4, sem:'HK2', majors:[mMap['DES']], pre:['DES103'] },
    { code:'DES203', title:'Nhiếp ảnh & Chỉnh sửa ảnh',    credits:3, sem:'HK2', majors:[mMap['DES']], pre:[] },
    { code:'DES301', title:'UI/UX Web & App Nâng cao',      credits:4, sem:'HK3', majors:[mMap['DES']], pre:['DES201','DES202'] },
    { code:'DES302', title:'Animation & After Effects',      credits:4, sem:'HK3', majors:[mMap['DES']], pre:['DES103'] },
    { code:'DES303', title:'Branding & Bộ nhận diện',       credits:3, sem:'HK3', majors:[mMap['DES']], pre:['DES101'] },
    { code:'DES401', title:'Thiết kế 3D cơ bản',            credits:3, sem:'HK4', majors:[mMap['DES']], pre:['DES101'] },
    { code:'DES402', title:'Tương tác người-máy (HCI)',      credits:3, sem:'HK4', majors:[mMap['DES']], pre:['DES301'] },
    { code:'DES403', title:'Đồ án Tốt nghiệp (Design)',     credits:5, sem:'HK4', majors:[mMap['DES']], pre:['DES301','DES302'] },
  ];

  // ── Tạo môn học ────────────────────────────────────────────────────────────
  console.log('📚 Tạo 50 môn học...');
  const cMap = {};
  for (const c of courseDefs) {
    const doc = await Course.create({
      code: c.code, title: c.title, credits: c.credits,
      semesterOffered: c.sem, isGeneral: c.gen || false, majors: c.majors,
    });
    cMap[c.code] = doc._id;
  }
  for (const c of courseDefs) {
    if (c.pre && c.pre.length)
      await Course.findByIdAndUpdate(cMap[c.code], { prerequisites: c.pre.map(p => cMap[p]) });
  }

  // ── Tạo lớp học (~78 lớp) ─────────────────────────────────────────────────
  // Gen: 3 lớp | HK1/HK2 chuyên ngành: 2 lớp | HK3/HK4: 1 lớp
  console.log('🏫 Tạo lớp học...');
  const SCHEDS = ['T2/T4 07:00-09:00','T2/T4 09:00-11:00','T2/T4 13:00-15:00',
                  'T3/T5 07:00-09:00','T3/T5 09:00-11:00','T3/T5 13:00-15:00',
                  'T6/T7 07:00-09:00','T6/T7 09:00-11:00','T6/T7 13:00-15:00'];
  const ROOMS = ['A101','A102','B201','B202','C101','C102','D101','Lab1','Lab2'];

  const allClasses = [];
  for (const c of courseDefs) {
    const n = c.gen ? 3 : (c.sem === 'HK1' || c.sem === 'HK2') ? 2 : 1;
    for (let i = 1; i <= n; i++) {
      const cls = await ClassModel.create({
        course: cMap[c.code], classCode: `CL${c.code}-${i}`,
        teacher: pick(teachers)._id, capacityMax: 20,
        schedule: pick(SCHEDS), room: pick(ROOMS), term: '2025-2026',
      });
      cls._code = c.code; cls._sem = c.sem; cls._gen = c.gen || false;
      allClasses.push(cls);
    }
  }

  const byCode = {};
  allClasses.forEach(c => { if (!byCode[c._code]) byCode[c._code] = []; byCode[c._code].push(c); });

  // ── Helper ─────────────────────────────────────────────────────────────────
  const enrollCount = {};
  function pickClass(code, usedIds) {
    const list = byCode[code] || [];
    let cls = list.find(l => !usedIds.has(l._id.toString()) && (enrollCount[l._id]||0) < 20);
    if (!cls) cls = list.filter(l => (enrollCount[l._id]||0) < 20)
                        .sort((a,b) => (enrollCount[a._id]||0)-(enrollCount[b._id]||0))[0];
    if (!cls) return null;
    enrollCount[cls._id] = (enrollCount[cls._id]||0) + 1;
    usedIds.add(cls._id.toString());
    return cls;
  }

  function gradedReg(sid, cls, pid, passed=true) {
    const a = randGrade(6,10), m = randGrade(passed?5:3, passed?10:6), f = randGrade(passed?4.5:2, passed?10:4.9);
    return { student:sid, class:cls._id, period:pid, attendanceGrade:a, midtermGrade:m, finalGrade:f, totalGrade:calcTotal(a,m,f) };
  }
  function openReg(sid, cls, pid) {
    return { student:sid, class:cls._id, period:pid, attendanceGrade:null, midtermGrade:null, finalGrade:null, totalGrade:null };
  }

  function getCodes(majorCode, sem) {
    const mId = mMap[majorCode]?.toString();
    return courseDefs.filter(c => c.sem === sem && (c.gen || (mId && c.majors.some(id => id?.toString() === mId)))).map(c => c.code);
  }

  // ── Phân công sinh viên ────────────────────────────────────────────────────
  console.log('📝 Phân công đăng ký...');
  const students = await Student.find({}).sort({ studentId: 1 });
  const allRegs  = [];

  // Tài khoản demo (sv1, sv76): KHÔNG pre-seed kỳ hè → đăng ký live khi demo
  const demoStudentIds = new Set([students[0]?._id?.toString(), students[75]?._id?.toString()].filter(Boolean));

  let counter = 0;
  for (const st of students) {
    counter++;
    // Dựa vào mã sinh viên: SV2024... là Năm 2, SV2025... là Năm 1
    const isYear2 = st.studentId && st.studentId.startsWith('SV2024');
    const mCode   = st.major;
    const isDemo  = demoStudentIds.has(st._id.toString());

    if (!isYear2) {
      // NĂM 1:
      // Kỳ 1 (HK1-2025): HK1 courses, có điểm
      const u1 = new Set();
      for (const code of getCodes(mCode, 'HK1')) {
        const cls = pickClass(code, u1); if (!cls) continue;
        allRegs.push(gradedReg(st._id, cls, pHK125._id, Math.random() > 0.20));
      }
      // Kỳ 2 (HK2-2025): HK2 courses, CÓ ĐIỂM (đang chấm)
      const u2 = new Set();
      for (const code of getCodes(mCode, 'HK2')) {
        const cls = pickClass(code, u2); if (!cls) continue;
        allRegs.push(gradedReg(st._id, cls, pHK225._id, Math.random() > 0.15));
      }
      // Kỳ hè (KH-2026): HK3 courses, chưa điểm — demo sv thì không seed, sv khác seed 1 ít
      if (!isDemo) {
        const u3 = new Set();
        const hk3 = getCodes(mCode, 'HK3');
        const quota = Math.random() < 0.25 ? 0 : Math.random() < 0.5 ? 1 : 2; // 0/1/2 môn
        let cnt = 0;
        for (const code of hk3) {
          if (cnt >= quota) break;
          const cls = pickClass(code, u3); if (!cls) continue;
          allRegs.push(openReg(st._id, cls, pOpen._id)); cnt++;
        }
      }
    } else {
      // NĂM 2:
      // Xa nhất (KH-2025): HK1 courses, có điểm
      const u0 = new Set();
      for (const code of getCodes(mCode, 'HK1')) {
        const cls = pickClass(code, u0); if (!cls) continue;
        allRegs.push(gradedReg(st._id, cls, pKH25._id, true));
      }
      // Kỳ 1 (HK1-2025): HK2 courses, có điểm
      const u1 = new Set();
      for (const code of getCodes(mCode, 'HK2')) {
        const cls = pickClass(code, u1); if (!cls) continue;
        allRegs.push(gradedReg(st._id, cls, pHK125._id, Math.random() > 0.15));
      }
      // Kỳ 2 (HK2-2025): HK3 courses, CÓ ĐIỂM (đang chấm)
      const u2 = new Set();
      for (const code of getCodes(mCode, 'HK3')) {
        const cls = pickClass(code, u2); if (!cls) continue;
        allRegs.push(gradedReg(st._id, cls, pHK225._id, Math.random() > 0.15));
      }
      // Kỳ hè (KH-2026): HK4 courses, chưa điểm
      if (!isDemo) {
        const u3 = new Set();
        const hk4 = getCodes(mCode, 'HK4');
        const quota = Math.random() < 0.25 ? 0 : Math.random() < 0.5 ? 1 : 2;
        let cnt = 0;
        for (const code of hk4) {
          if (cnt >= quota) break;
          const cls = pickClass(code, u3); if (!cls) continue;
          allRegs.push(openReg(st._id, cls, pOpen._id)); cnt++;
        }
      }
    }
  }

  // ── Lưu batch ─────────────────────────────────────────────────────────────
  const BATCH = 500;
  for (let i = 0; i < allRegs.length; i += BATCH)
    await Registration.insertMany(allRegs.slice(i, i+BATCH), { ordered: false });

  const hist = allRegs.filter(r => r.totalGrade !== null).length;
  const open = allRegs.filter(r => r.totalGrade === null).length;
  console.log(`\n🎉 HOÀN TẤT!`);
  console.log(`   📚 50 môn | 🏫 ${allClasses.length} lớp | 📋 ${allRegs.length} registrations`);
  console.log(`   - Có điểm (kỳ 1 + kỳ 2): ${hist}`);
  console.log(`   - Kỳ hè (chưa điểm):      ${open}`);
  console.log(`\n   Demo: student1@gmail.com / student76@gmail.com (chưa đăng ký kỳ hè)`);
  process.exit(0);
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
