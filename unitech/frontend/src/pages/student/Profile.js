// src/pages/student/Profile.js
import React, { useState, useEffect } from 'react';
import { getStudentMe, updateStudent, updateMyProfile } from '../../api/axios';
import './Profile.css';

export default function Profile() {
  const [form, setForm] = useState({ studentId: '', fullName: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [stuId, setStuId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await getStudentMe();
        const stu = res.data;
        setStuId(stu._id);
        setForm({
          studentId: stu.studentId,
          fullName: stu.fullName,
          email: stu.user?.email || '',
          phone: stu.phone || '',
          address: stu.address || ''
        });
      } catch (err) {
        if (err.response?.status === 404) setError('Không tìm thấy hồ sơ sinh viên.');
        else setError('Không thể tải hồ sơ');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError(''); setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await updateStudent(stuId, { fullName: form.fullName, phone: form.phone, address: form.address });
      await updateMyProfile({ username: form.fullName });
      setSuccess('Cập nhật hồ sơ thành công!');
    } catch (err) {
      setError(err.response?.data?.msg || 'Lỗi khi lưu hồ sơ');
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Đang tải hồ sơ…</p>;

  return (
    <div className="profile-container">
      <h2>👤 Hồ sơ cá nhân</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Mã sinh viên 🔒</label>
          <input name="studentId" value={form.studentId} disabled />
        </div>
        <div>
          <label>Họ tên ✏️</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} required />
        </div>
        <div>
          <label>Email 🔒</label>
          <input name="email" type="email" value={form.email} disabled />
        </div>
        <div>
          <label>Số điện thoại ✏️</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Nhập số điện thoại" />
        </div>
        <div>
          <label>Địa chỉ ✏️</label>
          <input name="address" value={form.address} onChange={handleChange} placeholder="Nhập địa chỉ" />
        </div>
        <button type="submit">💾 Lưu thay đổi</button>
      </form>
    </div>
  );
}
