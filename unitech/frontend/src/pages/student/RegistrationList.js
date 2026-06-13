// src/pages/student/RegistrationList.js
// "Học phần kỳ này" — chỉ hiển thị các môn đã đăng ký trong đợt ĐANG MỞ
// + nút Hủy (khi đợt còn mở)
import React, { useState, useEffect } from 'react';
import { getRegistrations, deleteRegistration } from '../../api/axios';
import '../../App.css';

export default function RegistrationList() {
  const [regs, setRegs]       = useState([]);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);
  const [periodInfo, setPeriodInfo] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await getRegistrations();
      // Chỉ lấy registrations của đợt đang mở
      const openRegs = data.filter(r => r.period?.status === 'open');
      setRegs(openRegs);
      if (openRegs.length > 0) setPeriodInfo(openRegs[0].period);
    } catch (err) {
      setError(err.response?.data?.msg || 'Không tải được đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy đăng ký?\nViệc hủy sẽ xóa môn này khỏi thời khóa biểu.')) return;
    try {
      await deleteRegistration(id);
      setRegs(regs.filter(r => r._id !== id));
    } catch (err) {
      setError(err.response?.data?.msg || 'Hủy đăng ký thất bại');
    }
  };

  if (loading) return (
    <div className="main-content-card" style={{ textAlign: 'center', padding: '60px' }}>
      <p style={{ color: '#64748b' }}>⏳ Đang tải...</p>
    </div>
  );

  const totalCredits = regs.reduce((sum, r) => sum + (r.class?.course?.credits ?? 0), 0);

  return (
    <div>
      {/* Thẻ tóm tắt */}
      <div className="teacher-summary-cards" style={{ marginBottom: 24 }}>
        <div className="summary-card">
          <p>Đợt đăng ký</p>
          <h3 style={{ color: '#7c3aed', fontSize: '0.95rem' }}>
            {periodInfo ? periodInfo.name : '—'}
          </h3>
        </div>
        <div className="summary-card">
          <p>Môn đã đăng ký</p>
          <h3 style={{ color: '#2563eb' }}>{regs.length}</h3>
        </div>
        <div className="summary-card">
          <p>Tổng tín chỉ</p>
          <h3 style={{ color: '#16a34a' }}>{totalCredits}</h3>
        </div>
      </div>

      <div className="main-content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: '0 0 4px' }}>📋 Học phần kỳ này</h2>
            {periodInfo && (
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                🟢 {periodInfo.name} · {periodInfo.semester} · Đang mở
              </p>
            )}
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#dc2626', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        {regs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: '2.5rem', margin: '0 0 12px' }}>📚</p>
            <p>Bạn chưa đăng ký học phần nào trong kỳ này.</p>
            <p style={{ fontSize: '0.85rem' }}>Vào <strong>Đăng ký học</strong> để chọn lớp.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Mã lớp</th>
                  <th>Tên học phần</th>
                  <th style={{ textAlign: 'center' }}>Tín chỉ</th>
                  <th>Lịch học</th>
                  <th>Phòng</th>
                  <th style={{ textAlign: 'center' }}>Điểm</th>
                  <th style={{ textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {regs.map(r => {
                  const cls    = r.class   || {};
                  const course = cls.course || {};
                  return (
                    <tr key={r._id}>
                      <td>
                        <span style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: 8, fontWeight: 700, fontSize: '0.88rem' }}>
                          {cls.classCode || '—'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, color: '#0f172a' }}>{course.title || '—'}</td>
                      <td style={{ textAlign: 'center', color: '#475569' }}>{course.credits ?? '—'}</td>
                      <td style={{ color: '#475569', fontSize: '0.88rem' }}>{cls.schedule || '—'}</td>
                      <td style={{ color: '#475569' }}>{cls.room || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600, background: '#f1f5f9', color: '#94a3b8' }}>
                          ⏳ Chờ điểm
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="delete-btn"
                          onClick={() => handleCancel(r._id)}
                        >
                          🗑 Hủy
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
