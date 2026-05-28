import React, { useState, useEffect } from 'react';
import { getTeacherMe } from '../../api/axios';
import { getUserFromToken } from '../../utils/auth';
import '../../App.css';

export default function TeacherInfo() {
  const [profile, setProfile] = useState(null);
  const user = getUserFromToken();

  useEffect(() => {
    (async () => {
      try {
        const res = await getTeacherMe();
        setProfile(res.data);
      } catch (err) {
        console.error('Lỗi lấy thông tin giảng viên', err);
      }
    })();
  }, []);

  return (
    <div className="main-content-card">
      <h2>Thông tin giảng viên</h2>

      <div className="profile-details" style={{ marginTop: '24px' }}>
        <div>
          <span>Họ tên</span>
          <strong>{profile?.fullName || user?.username || 'Chưa có thông tin'}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{profile?.user?.email || user?.email || 'Chưa có email'}</strong>
        </div>
        <div>
          <span>Vai trò</span>
          <strong>{profile?.user?.role || user?.role || 'Giảng viên'}</strong>
        </div>
        <div>
          <span>Mã giảng viên</span>
          <strong>{profile?.teacherId || user?.id || user?._id || 'Chưa có mã'}</strong>
        </div>
        <div>
          <span>Khoa / Bộ môn</span>
          <strong>{profile?.department || 'Chưa cập nhật'}</strong>
        </div>
        <div>
          <span>Bằng cấp</span>
          <strong>{profile?.degree || 'Chưa cập nhật'}</strong>
        </div>
      </div>
    </div>
  );
}
