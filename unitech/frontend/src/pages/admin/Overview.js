// src/pages/admin/Overview.js
import React, { useEffect, useState } from 'react';
import { getStudents, getTeachers, getClasses } from '../../api/axios';

export default function Overview() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes, classesRes] = await Promise.all([
          getStudents(),
          getTeachers(),
          getClasses()
        ]);
        setStats({
          students: studentsRes.data.length,
          teachers: teachersRes.data.length,
          classes: classesRes.data.length
        });
      } catch (err) {
        console.error("Failed to fetch overview stats", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="overview">
      <div className="overview-header">
        <div className="logo-container">
          <img src="/logo.png" alt="UniTech Logo" className="overview-logo app-logo" />
        </div>
        <div>
          <p className="overview-tag">UNITECH Admin</p>
          <h1>Chào mừng Admin đến với hệ thống</h1>
          <p className="overview-description">
            Quản lý toàn bộ dữ liệu đào tạo, sinh viên, giảng viên và học phần trong một nơi.
          </p>
        </div>
      </div>

      <div className="overview-grid">
        <div className="overview-card">
          <p className="overview-card-title">Sinh viên</p>
          <h2>{stats.students}</h2>
          <p>Đang theo dõi và quản lý.</p>
        </div>
        <div className="overview-card">
          <p className="overview-card-title">Giảng viên</p>
          <h2>{stats.teachers}</h2>
          <p>Đang hoạt động trong hệ thống.</p>
        </div>
        <div className="overview-card">
          <p className="overview-card-title">Lớp học</p>
          <h2>{stats.classes}</h2>
          <p>Danh sách lớp đang mở cho đăng ký.</p>
        </div>
      </div>
    </div>
  );
}
