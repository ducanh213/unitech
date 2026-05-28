// src/pages/admin/ClassList.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClasses, deleteClass } from '../../api/axios';

export default function ClassList() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await getClasses();
      setClasses(res.data);
    } catch (err) {
      console.error('Lỗi tải danh sách lớp', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Xóa lớp học này?')) return;
    try {
      await deleteClass(id);
      fetchClasses();
    } catch (err) {
      console.error('Xóa thất bại', err);
    }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div>
      <h2>Quản lý Lớp học</h2>
      <button onClick={() => navigate('new')}>Thêm lớp học</button>
      <table border="1" cellPadding="5" style={{ marginTop: 10, width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Mã lớp</th>
            <th>Học phần</th>
            <th>Giảng viên</th>
            <th>Phòng</th>
            <th>Lịch học</th>
            <th>Sĩ số</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {classes.map(cls => (
            <tr key={cls._id}>
              <td>{cls.classCode}</td>
              <td>{cls.course?.code} - {cls.course?.title}</td>
              <td>{cls.teacher?.teacherId} - {cls.teacher?.fullName}</td>
              <td>{cls.room}</td>
              <td>{cls.schedule}</td>
              <td>{cls.capacityMin} / {cls.capacityMax}</td>
              <td>
                <button onClick={() => navigate(`${cls._id}/edit`)}>Sửa</button>{' '}
                <button onClick={() => handleDelete(cls._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
