// src/pages/student/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';              // <-- thêm useNavigate
import { getStudentMe, updateStudent } from '../../api/axios';
import { doLogout } from '../../utils/auth';
import './Profile.css';                                       // <-- đảm bảo file tồn tại

export default function Profile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    studentId: '',
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]       = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await getStudentMe();
        const stu = res.data;
        setForm({
          studentId: stu.studentId,
          fullName:  stu.fullName,
          email:     stu.user.email,
          phone:     stu.phone || '',
          address:   stu.address || ''
        });
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Không tìm thấy hồ sơ sinh viên. Vui lòng liên hệ Admin.');
        } else {
          setError('Không thể tải hồ sơ');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError(''); 
    setSuccessMsg('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const me = await getStudentMe();
      await updateStudent(me.data._id, {
        fullName: form.fullName,
        phone:    form.phone,
        address:  form.address
      });
      setSuccessMsg('Cập nhật hồ sơ thành công');
    } catch (err) {
      setError(err.response?.data?.msg || 'Lỗi khi lưu hồ sơ');
    }
  };

  if (loading) return <p>Đang tải hồ sơ…</p>;

  return (
    <div className="profile-container">
     

      <h2>Hồ sơ cá nhân</h2>

      {error && <p className="error">{error}</p>}
      {successMsg && <p className="success">{successMsg}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Mã sinh viên:</label>
          <input name="studentId" value={form.studentId} disabled />
        </div>
        <div>
          <label>Họ tên:</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} required />
        </div>
        <div>
          <label>Email:</label>
          <input name="email" type="email" value={form.email} disabled />
        </div>
        <div>
          <label>Phone:</label>
          <input name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div>
          <label>Địa chỉ:</label>
          <input name="address" value={form.address} onChange={handleChange} />
        </div>
        <button type="submit">Lưu thay đổi</button>
      </form>
    </div>
  );
}
