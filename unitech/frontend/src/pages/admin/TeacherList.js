// src/pages/admin/TeacherList.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeachers, deleteTeacher } from '../../api/axios';

export default function TeacherList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await getTeachers();
      setTeachers(res.data);
    } catch (err) {
      console.error('Failed to load teachers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc muốn xóa giảng viên này?')) return;
    try {
      await deleteTeacher(id);
      fetchTeachers();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div>
      <h2>Quản lý Giảng viên</h2>
      <button onClick={() => navigate('new')}>Thêm giảng viên</button>
      <table border="1" cellPadding="5" style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>Mã GV</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Khoa/Phòng ban</th>
            <th>Trình độ</th>
            <th>Môn đủ đk dạy</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map(t => (
            <tr key={t._id}>
              <td>{t.teacherId}</td>
              <td>{t.fullName}</td>
              <td>{t.user?.email || '—'}</td>
              <td>{t.department}</td>
              <td>{t.degree || '—'}</td>
              <td>{t.qualifiedSubjects ? t.qualifiedSubjects.length : 0} môn</td>
              <td>
                <button onClick={() => navigate(`${t._id}/edit`)}>Sửa</button>
                <button onClick={() => handleDelete(t._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
