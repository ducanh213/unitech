import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents, deleteStudent } from '../../api/axios';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await getStudents();
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      // có thể show toast lỗi
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc muốn xóa?')) return;
    try {
      await deleteStudent(id);
      fetchStudents(); // reload danh sách
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Đang tải...</p>;
  return (
    <div>
      <h2>Quản lý sinh viên</h2>
      <button onClick={() => navigate('new')}>Thêm sinh viên</button>
      <table border="1" cellPadding="5" style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>Mã SV</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Địa chỉ</th>
            <th>Chuyên ngành</th>
            <th>Khóa</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s._id}>
              <td>{s.studentId}</td>
              <td>{s.fullName}</td>
              <td>{s.user?.email || '—'}</td>
              <td>{s.phone || '—'}</td>
              <td>{s.address || '—'}</td>
              <td>{s.major || '—'}</td>
              <td>{s.year || '—'}</td>
              <td>
                <button onClick={() => navigate(`${s._id}/edit`)}>Sửa</button>
                <button onClick={() => handleDelete(s._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
