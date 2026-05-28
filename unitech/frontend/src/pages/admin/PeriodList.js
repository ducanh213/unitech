// src/pages/admin/PeriodList.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPeriods,
  deletePeriod,
  openPeriod,
  closePeriod
} from '../../api/axios';

export default function PeriodList() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      const res = await getPeriods();
      setPeriods(res.data);
    } catch (err) {
      console.error('Lỗi tải danh sách đợt đăng ký', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Xóa đợt này?')) return;
    try {
      await deletePeriod(id);
      fetchPeriods();
    } catch (err) {
      console.error('Xóa đợt thất bại', err);
    }
  };

  const handleOpen = async id => {
    try {
      await openPeriod(id);
      fetchPeriods();
    } catch (err) {
      console.error('Mở đợt thất bại', err);
    }
  };

  const handleClose = async id => {
    try {
      await closePeriod(id);
      fetchPeriods();
    } catch (err) {
      console.error('Đóng đợt thất bại', err);
    }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div>
      <h2>Quản lý Đợt đăng ký</h2>
      <button onClick={() => navigate('new')}>Thêm đợt mới</button>
      <table
        border="1"
        cellPadding="5"
        style={{ marginTop: 10, width: '100%', borderCollapse: 'collapse' }}
      >
        <thead>
          <tr>
            <th>Tên</th>
            <th>Kỳ</th>
            <th>Loại</th>
            <th>Bắt đầu</th>
            <th>Kết thúc</th>
            <th>Trạng thái</th>
            <th>Bổ sung?</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {periods.map(p => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.semester}</td>
              <td>{p.isSupplementary ? 'Bổ sung' : 'Chính'}</td>
              <td>{new Date(p.startDate).toLocaleDateString()}</td>
              <td>{new Date(p.endDate).toLocaleDateString()}</td>
              <td>{p.status}</td>
              <td style={{ textAlign: 'center' }}>
                {p.isSupplementary ? '✔︎' : '—'}
              </td>
              <td>
                {p.status === 'pending' && (
                  <button onClick={() => handleOpen(p._id)}>Mở</button>
                )}
                {p.status === 'open' && (
                  <button onClick={() => handleClose(p._id)}>Đóng</button>
                )}{' '}
                <button onClick={() => navigate(`${p._id}/edit`)}>Sửa</button>{' '}
                <button onClick={() => handleDelete(p._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
