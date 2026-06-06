// src/pages/admin/AdminProfile.js
import React, { useState } from 'react';
import { getUserFromToken } from '../../utils/auth';
import { updateMyProfile } from '../../api/axios';

export default function AdminProfile() {
  const user = getUserFromToken();
  const [form, setForm] = useState({ username: user?.username || '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError(''); setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await updateMyProfile({ username: form.username });
      setSuccess('Cập nhật thông tin thành công!');
    } catch (err) {
      setError(err.response?.data?.msg || 'Lỗi khi cập nhật');
    }
  };

  return (
    <div className="main-content-card" style={{ maxWidth: '540px' }}>
      <h2>👤 Thông tin tài khoản</h2>
      {error && <p style={{ color: '#b91c1c', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
      {success && <p style={{ color: '#15803d', textAlign: 'center', marginBottom: '1rem' }}>{success}</p>}

      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        <div className="profile-form-group">
          <label>Email (không thể thay đổi)</label>
          <input value={user?.email || ''} disabled className="profile-input" />
        </div>
        <div className="profile-form-group">
          <label>Vai trò</label>
          <input value="Quản trị viên" disabled className="profile-input" />
        </div>
        <div className="profile-form-group">
          <label>Tên hiển thị *</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className="profile-input"
            placeholder="Nhập tên hiển thị"
          />
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button type="submit" className="btn-save">💾 Lưu thay đổi</button>
        </div>
      </form>
    </div>
  );
}
