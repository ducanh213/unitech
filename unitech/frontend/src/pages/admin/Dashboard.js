// src/pages/admin/Dashboard.js
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { doLogout } from '../../utils/auth';
import '../../App.css';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      doLogout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">U</div>
          <div>
            <h2>UniTech Admin</h2>
            <p>Quản lý đào tạo</p>
          </div>
        </div>
        <nav>
          <ul className="nav-list">
            <li><Link to="">🏠 Trang Chủ</Link></li>
            <li><Link to="students">👨‍🎓 Sinh viên</Link></li>
            <li><Link to="teachers">👩‍🏫 Giảng viên</Link></li>
            <li><Link to="majors">📚 Ngành học</Link></li>
            <li><Link to="courses">📖 Học phần</Link></li>
            <li><Link to="classes">🏫 Lớp học</Link></li>
            <li><Link to="periods">⏱️ Đợt đăng ký</Link></li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <div className="admin-header-bar">
          <div>
            <p className="admin-page-label">Admin Dashboard</p>
            <h1>Quản lý hệ thống</h1>
            <p className="admin-page-description">
              Xem tổng quan, quản lý sinh viên, giảng viên và các dữ liệu quan trọng.
            </p>
          </div>
          <button className="admin-logout" onClick={handleLogout}>Đăng xuất</button>
        </div>

        {/* Outlet for nested routes */}
        <Outlet />
      </main>
    </div>
  );
}
