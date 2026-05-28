import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMajors, deleteMajor } from '../../api/axios';

export default function MajorList() {
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMajors();
  }, []);

  const fetchMajors = async () => {
    try {
      const res = await getMajors();
      setMajors(res.data);
    } catch (err) {
      console.error('Không tải được danh sách ngành', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc muốn xóa ngành này?')) return;
    try {
      await deleteMajor(id);
      fetchMajors();
    } catch (err) {
      console.error('Xóa ngành thất bại', err);
    }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div>
      <h2>Quản lý Ngành học</h2>
      <button onClick={() => navigate('new')}>Thêm ngành</button>
      <table border="1" cellPadding="5" style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>Mã ngành</th>
            <th>Tên ngành</th>
            <th>Mô tả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {majors.map(m => (
            <tr key={m._id}>
              <td>{m.code}</td>
              <td>{m.name}</td>
              <td>{m.description || '—'}</td>
              <td>
                <button onClick={() => navigate(`${m._id}/edit`)}>Sửa</button>
                <button onClick={() => handleDelete(m._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
