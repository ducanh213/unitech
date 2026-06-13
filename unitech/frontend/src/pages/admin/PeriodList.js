// src/pages/admin/PeriodList.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPeriods, deletePeriod, openPeriod, closePeriod } from '../../api/axios';
import '../../App.css';

const STATUS_CONFIG = {
  pending: { label: '⏳ Chờ mở',   bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
  open:    { label: '🟢 Đang mở',  bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  closed:  { label: '🔒 Đã đóng',  bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' },
};

export default function PeriodList() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchPeriods(); }, []);

  const fetchPeriods = async () => {
    try {
      const res = await getPeriods();
      setPeriods(res.data);
    } catch (err) {
      setError('Lỗi tải danh sách đợt đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Xóa đợt này? Thao tác này không thể hoàn tác.')) return;
    try {
      setActionId(id);
      await deletePeriod(id);
      fetchPeriods();
    } catch (err) {
      setError(err.response?.data?.msg || 'Xóa đợt thất bại');
    } finally {
      setActionId(null);
    }
  };

  const handleOpen = async id => {
    try {
      setActionId(id);
      await openPeriod(id);
      fetchPeriods();
    } catch (err) {
      setError(err.response?.data?.msg || 'Mở đợt thất bại');
    } finally {
      setActionId(null);
    }
  };

  const handleClose = async id => {
    if (!window.confirm('Đóng đợt đăng ký? Sinh viên sẽ không thể đăng ký thêm sau khi đóng.')) return;
    try {
      setActionId(id);
      await closePeriod(id);
      fetchPeriods();
    } catch (err) {
      setError(err.response?.data?.msg || 'Đóng đợt thất bại');
    } finally {
      setActionId(null);
    }
  };

  if (loading) return (
    <div className="main-content-card" style={{ textAlign: 'center', padding: 60 }}>
      <p style={{ color: '#64748b' }}>⏳ Đang tải...</p>
    </div>
  );

  const openCount    = periods.filter(p => p.status === 'open').length;
  const pendingCount = periods.filter(p => p.status === 'pending').length;
  const closedCount  = periods.filter(p => p.status === 'closed').length;

  return (
    <div>
      {/* Thống kê nhanh */}
      <div className="teacher-summary-cards" style={{ marginBottom: 24 }}>
        <div className="summary-card">
          <p>Tổng đợt đăng ký</p>
          <h3 style={{ color: '#2563eb' }}>{periods.length}</h3>
        </div>
        <div className="summary-card">
          <p>🟢 Đang mở</p>
          <h3 style={{ color: '#16a34a' }}>{openCount}</h3>
        </div>
        <div className="summary-card">
          <p>⏳ Chờ mở</p>
          <h3 style={{ color: '#ca8a04' }}>{pendingCount}</h3>
        </div>
        <div className="summary-card">
          <p>🔒 Đã đóng</p>
          <h3 style={{ color: '#64748b' }}>{closedCount}</h3>
        </div>
      </div>

      <div className="main-content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>⏱️ Quản lý Đợt đăng ký</h2>
          <button
            onClick={() => navigate('new')}
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}
          >
            + Thêm đợt mới
          </button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#dc2626' }}>
            ⚠️ {error}
            <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>✕</button>
          </div>
        )}

        {/* Hướng dẫn luồng */}
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: '0.88rem', color: '#1d4ed8' }}>
          <strong>💡 Luồng quản lý đợt:</strong>{' '}
          Tạo đợt <span style={{ padding: '1px 6px', background: '#fef9c3', borderRadius: 4, color: '#854d0e' }}>Chờ mở</span>
          {' → '}Bấm <strong>"Mở"</strong> để sinh viên đăng ký
          <span style={{ padding: '1px 6px', background: '#dcfce7', borderRadius: 4, color: '#15803d' }}> Đang mở</span>
          {' → '}Bấm <strong>"Đóng"</strong> sau khi hết thời hạn
          <span style={{ padding: '1px 6px', background: '#f1f5f9', borderRadius: 4, color: '#64748b' }}> Đã đóng</span>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Tên đợt</th>
                <th>Học kỳ</th>
                <th>Loại</th>
                <th>Bắt đầu</th>
                <th>Kết thúc</th>
                <th style={{ textAlign: 'center' }}>Trạng thái</th>
                <th style={{ textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {periods.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>Chưa có đợt đăng ký nào</td></tr>
              ) : (
                periods.map(p => {
                  const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                  const isActing = actionId === p._id;
                  return (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</td>
                      <td style={{ color: '#475569' }}>{p.semester}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: 20, background: p.isSupplementary ? '#fef3c7' : '#e0f2fe', color: p.isSupplementary ? '#b45309' : '#0369a1', fontWeight: 600 }}>
                          {p.isSupplementary ? '📝 Bổ sung' : '📋 Chính'}
                        </span>
                      </td>
                      <td style={{ color: '#475569' }}>{new Date(p.startDate).toLocaleDateString('vi-VN')}</td>
                      <td style={{ color: '#475569' }}>{new Date(p.endDate).toLocaleDateString('vi-VN')}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ padding: '4px 12px', borderRadius: 20, fontWeight: 700, fontSize: '0.82rem', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                          {p.status === 'pending' && (
                            <button
                              onClick={() => handleOpen(p._id)}
                              disabled={isActing}
                              style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
                            >
                              {isActing ? '...' : '🟢 Mở'}
                            </button>
                          )}
                          {p.status === 'open' && (
                            <button
                              onClick={() => handleClose(p._id)}
                              disabled={isActing}
                              style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
                            >
                              {isActing ? '...' : '🔒 Đóng'}
                            </button>
                          )}
                          {p.status === 'closed' && (
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '5px 8px' }}>Đã kết thúc</span>
                          )}
                          <button
                            onClick={() => navigate(`${p._id}/edit`)}
                            disabled={isActing}
                            style={{ background: '#f1f5f9', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: '0.82rem' }}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            disabled={isActing}
                            style={{ background: '#fff', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: '0.82rem' }}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
