// src/pages/student/Dashboard.js
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { doLogout, getUserFromToken } from '../../utils/auth';
import '../../App.css';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      doLogout();
      navigate('/login', { replace: true });
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
          <NavLink to="/student/profile" className={({ isActive }) => isActive ? 'dashboard-menu-item active' : 'dashboard-menu-item'}>Hồ sơ</NavLink>
          <NavLink to="/student/register" className={({ isActive }) => isActive ? 'dashboard-menu-item active' : 'dashboard-menu-item'}>Đăng ký học</NavLink>
          <NavLink to="/student/registrations" className={({ isActive }) => isActive ? 'dashboard-menu-item active' : 'dashboard-menu-item'}>Học phần đã đăng ký</NavLink>
          <NavLink to="/student/schedule" className={({ isActive }) => isActive ? 'dashboard-menu-item active' : 'dashboard-menu-item'}>Thời khóa biểu</NavLink>
          <NavLink to="/student/grades" className={({ isActive }) => isActive ? 'dashboard-menu-item active' : 'dashboard-menu-item'}>Điểm số</NavLink>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-subtitle">Xin chào,</p>
            <h1 className="dashboard-heading">{user?.username || 'Sinh viên'}</h1>
          </div>
          <button className="dashboard-logout" onClick={handleLogout}>Đăng xuất</button>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
