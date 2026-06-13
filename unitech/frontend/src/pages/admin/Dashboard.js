// src/pages/admin/Dashboard.js
import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { doLogout } from '../../utils/auth';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import '../../App.css';

export default function AdminDashboard() {
  const [showCPW, setShowCPW] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      doLogout(); // doLogout đã tự redirect về /login
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
            <li><NavLink to="" end className={({ isActive }) => isActive ? 'active' : ''}>🏠 Trang Chủ</NavLink></li>
            <li><NavLink to="students" className={({ isActive }) => isActive ? 'active' : ''}>👨‍🎓 Sinh viên</NavLink></li>
            <li><NavLink to="teachers" className={({ isActive }) => isActive ? 'active' : ''}>👩‍🏫 Giảng viên</NavLink></li>
            <li><NavLink to="majors" className={({ isActive }) => isActive ? 'active' : ''}>📚 Ngành học</NavLink></li>
            <li><NavLink to="courses" className={({ isActive }) => isActive ? 'active' : ''}>📖 Học phần</NavLink></li>
            <li><NavLink to="classes" className={({ isActive }) => isActive ? 'active' : ''}>🏫 Lớp học</NavLink></li>
            <li><NavLink to="periods" className={({ isActive }) => isActive ? 'active' : ''}>⏱️ Đợt đăng ký</NavLink></li>
            <li><NavLink to="report"  className={({ isActive }) => isActive ? 'active' : ''}>📊 Báo cáo AI</NavLink></li>
            <li><NavLink to="profile" className={({ isActive }) => isActive ? 'active' : ''}>👤 Tài khoản</NavLink></li>
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
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn-change-password" onClick={() => setShowCPW(true)}>🔒 Đổi mật khẩu</button>
            <button className="admin-logout" onClick={handleLogout}>Đăng xuất</button>
          </div>
        </div>

        {/* Outlet for nested routes */}
        <Outlet />
      </main>

      <ChangePasswordModal isOpen={showCPW} onClose={() => setShowCPW(false)} />
    </div>
  );
}

