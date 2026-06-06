// src/pages/teacher/TeacherInfo.js
import React, { useState, useEffect } from 'react';
import { getTeacherMe, updateTeacher, updateMyProfile } from '../../api/axios';
import '../../App.css';

export default function TeacherInfo() {
  const [profile, setProfile] = useState(null);
  const [teacherDocId, setTeacherDocId] = useState(null);
  const [form, setForm] = useState({ fullName: '', phone: '', department: '', degree: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getTeacherMe();
        const t = res.data;
        setProfile(t);
        setTeacherDocId(t._id);
        setForm({
          fullName: t.fullName || '',
          phone: t.phone || '',
          department: t.department || '',
          degree: t.degree || ''
        });
      } catch (err) {
        setError('Không thể tải thông tin giảng viên');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError(''); setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await updateTeacher(teacherDocId, {
        fullName: form.fullName,
        phone: form.phone,
        department: form.department,
        degree: form.degree
      });
      await updateMyProfile({ username: form.fullName });
      setSuccess('Cập nhật thông tin thành công!');
    } catch (err) {
      setError(err.response?.data?.msg || 'Lỗi khi lưu thông tin');
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Đang tải thông tin…</p>;

  return (
    <div className="main-content-card">
      <h2>👤 Thông tin giảng viên</h2>
      {error && <p style={{ color: '#b91c1c', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
      {success && <p style={{ color: '#15803d', textAlign: 'center', marginBottom: '1rem' }}>{success}</p>}

      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        <div className="profile-form-group">
          <label>Mã giảng viên 🔒</label>
          <input value={profile?.teacherId || ''} disabled className="profile-input" />
        </div>
        <div className="profile-form-group">
          <label>Email 🔒</label>
          <input value={profile?.user?.email || ''} disabled className="profile-input" />
        </div>
        <div className="profile-form-group">
          <label>Họ tên ✏️ *</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} required className="profile-input" placeholder="Nhập họ tên" />
        </div>
        <div className="profile-form-group">
          <label>Số điện thoại ✏️</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="profile-input" placeholder="Nhập số điện thoại" />
        </div>
        <div className="profile-form-group">
          <label>Khoa / Bộ môn ✏️</label>
          <input name="department" value={form.department} onChange={handleChange} className="profile-input" placeholder="Nhập tên khoa/bộ môn" />
        </div>
        <div className="profile-form-group">
          <label>Bằng cấp ✏️</label>
          <input name="degree" value={form.degree} onChange={handleChange} className="profile-input" placeholder="VD: Thạc sĩ, Tiến sĩ" />
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button type="submit" className="btn-save">💾 Lưu thay đổi</button>
        </div>
      </form>
    </div>
  );
}
