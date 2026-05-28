// src/pages/teacher/Dashboard.js
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getUserFromToken, doLogout } from '../../utils/auth';
import { getTeacherMe } from '../../api/axios';
import '../../App.css';

export default function TeacherDashboard() {
  const user = getUserFromToken();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getTeacherMe();
        setProfile(res.data);
      } catch (err) {
        console.error('Lỗi tải profile giảng viên', err);
      }
    })();
  }, []);

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      doLogout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">GV</div>
          <div>
            <h2>Giảng viên</h2>
            <p>Quản lý lớp và lịch dạy</p>
          </div>
        </div>

        <nav>
          <ul className="nav-list">
            <li>
              <NavLink
                to=""
                end
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                🏫 Lớp dạy
              </NavLink>
            </li>
            <li>
              <NavLink
                to="info"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                👤 Thông tin giảng viên
              </NavLink>
            </li>
            <li>
              <NavLink
                to="schedule"
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                📅 Thời khóa biểu
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <div className="teacher-profile-panel">
          <div className="teacher-profile-card">
            <div className="profile-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="profile-avatar">{profile?.fullName?.charAt(0) || user?.username?.charAt(0) || 'G'}</div>
                <div>
                  <h2>{profile?.fullName || user?.username || 'Giảng viên'}</h2>
                  <p>{profile?.user?.email || user?.email || 'Không có email'}</p>
                </div>
              </div>
              <button className="dashboard-logout" onClick={handleLogout}>Đăng xuất</button>
            </div>

            <div className="profile-details">
              <div>
                <span>Mã giảng viên</span>
                <strong>{profile?.teacherId || user?.id || user?._id || 'Chưa cập nhật'}</strong>
              </div>
              <div>
                <span>Vai trò</span>
                <strong>{profile?.user?.role || user?.role || 'Giảng viên'}</strong>
              </div>
              <div>
                <span>Khoa / Bộ môn</span>
                <strong>{profile?.department || 'Chưa cập nhật'}</strong>
              </div>
            </div>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
