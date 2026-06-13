// src/pages/student/Dashboard.js
import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { doLogout, getUserFromToken } from '../../utils/auth';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import '../../App.css';

export default function StudentDashboard() {
  const user = getUserFromToken();
  const [showCPW, setShowCPW] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      doLogout(); // doLogout đã tự redirect về /login
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="dashboard-logo">UNITECH</div>
          <p>Hệ thống quản lý đào tạo</p>
        </div>
        <nav className="dashboard-menu">
          <NavLink to="/student/profile"       className={({ isActive }) => isActive ? 'dashboard-menu-item active' : 'dashboard-menu-item'}>👤 Hồ sơ</NavLink>
          <NavLink to="/student/register"       className={({ isActive }) => isActive ? 'dashboard-menu-item active' : 'dashboard-menu-item'}>📝 Đăng ký học</NavLink>
          <NavLink to="/student/registrations"  className={({ isActive }) => isActive ? 'dashboard-menu-item active' : 'dashboard-menu-item'}>📋 Học phần kỳ này</NavLink>
          <NavLink to="/student/schedule"       className={({ isActive }) => isActive ? 'dashboard-menu-item active' : 'dashboard-menu-item'}>📅 Thời khóa biểu</NavLink>
          <NavLink to="/student/grades"         className={({ isActive }) => isActive ? 'dashboard-menu-item active' : 'dashboard-menu-item'}>📖 Lịch sử & Điểm số</NavLink>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-subtitle">Xin chào,</p>
            <h1 className="dashboard-heading">{user?.username || 'Sinh viên'}</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn-change-password" onClick={() => setShowCPW(true)}>🔒 Đổi mật khẩu</button>
            <button className="admin-logout" onClick={handleLogout}>Đăng xuất</button>
          </div>
        </header>

        <Outlet />
      </main>

      <ChangePasswordModal isOpen={showCPW} onClose={() => setShowCPW(false)} />
    </div>
  );
}
