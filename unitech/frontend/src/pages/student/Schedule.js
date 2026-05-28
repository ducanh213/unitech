// src/pages/student/Schedule.js
import { useEffect, useState } from 'react';
import { getRegistrations } from '../../api/axios';
import { parseSchedule, DAYS, DAY_LABELS, PERIOD_TIMES } from '../../utils/scheduleParser';
import '../../App.css';

const MORNING = PERIOD_TIMES.slice(0, 5);
const AFTERNOON = PERIOD_TIMES.slice(5, 10);

// Lấy lớp đang chiếm ô (day, periodNo)
function getCell(regs, day, periodNo) {
  return regs.find(r => parseSchedule(r.class?.schedule)[day]?.includes(periodNo));
}

export default function StudentSchedule() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRegistrations()
      .then(res => setRegs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="main-content-card" style={{ textAlign: 'center', padding: 60 }}><p style={{ color: '#64748b' }}>⏳ Đang tải...</p></div>;

  const thS  = { background: '#f8fafc', padding: '10px 8px', fontSize: '0.82rem', fontWeight: 700, color: '#475569', border: '1px solid #e2e8f0', textAlign: 'center', whiteSpace: 'nowrap' };
  const tdS  = { border: '1px solid #e2e8f0', padding: '4px 5px', verticalAlign: 'top', minHeight: 44, minWidth: 88 };
  const lblS = { ...tdS, background: '#fafafa', fontWeight: 600, fontSize: '0.78rem', color: '#64748b', textAlign: 'center', whiteSpace: 'nowrap', minWidth: 105 };
  const secS = { ...tdS, background: '#f0f9ff', fontWeight: 800, color: '#0369a1', fontSize: '0.88rem', textAlign: 'center', minWidth: 52 };

  const renderCell = (day, periodNo) => {
    const reg = getCell(regs, day, periodNo);
    if (!reg) return null;
    return (
      <div style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1px solid #93c5fd', borderRadius: 7, padding: '5px 7px', fontSize: '0.78rem', lineHeight: 1.4 }}>
        <div style={{ fontWeight: 800, color: '#1d4ed8', fontSize: '0.76rem' }}>{reg.class?.classCode}</div>
        <div style={{ color: '#374151', fontSize: '0.74rem' }}>{reg.class?.course?.title}</div>
        <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>🚪 {reg.class?.room}</div>
      </div>
    );
  };

  return (
    <div>
      {regs.length > 0 && (
        <div className="teacher-summary-cards" style={{ marginBottom: 24 }}>
          <div className="summary-card"><p>Số môn đăng ký</p><h3 style={{ color: '#2563eb' }}>{regs.length}</h3></div>
          <div className="summary-card" style={{ gridColumn: 'span 2' }}>
            <p>Danh sách môn</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {regs.map(r => (
                <span key={r._id} style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 12px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600 }}>
                  {r.class?.classCode} – {r.class?.course?.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="main-content-card">
        <h2 style={{ marginTop: 0, marginBottom: 20 }}>Thời khóa biểu</h2>
        {regs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: '2.5rem', margin: '0 0 12px' }}>📅</p>
            <p>Bạn chưa đăng ký lớp học nào.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thS, minWidth: 52 }}>Buổi</th>
                  <th style={{ ...thS, minWidth: 105 }}>Tiết / Giờ</th>
                  {DAYS.map(d => <th key={d} style={thS}>{DAY_LABELS[d]}</th>)}
                </tr>
              </thead>
              <tbody>
                {MORNING.map((p, i) => (
                  <tr key={`s${p.no}`}>
                    {i === 0 && <td rowSpan={5} style={secS}>☀️<br />Sáng</td>}
                    <td style={lblS}>
                      <div style={{ fontWeight: 700 }}>Tiết {p.no}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>{Math.floor(p.s/60)}:{String(p.s%60).padStart(2,'0')} – {Math.floor(p.e/60)}:{String(p.e%60).padStart(2,'0')}</div>
                    </td>
                    {DAYS.map(day => <td key={day} style={tdS}>{renderCell(day, p.no)}</td>)}
                  </tr>
                ))}
                {AFTERNOON.map((p, i) => (
                  <tr key={`c${p.no}`}>
                    {i === 0 && <td rowSpan={5} style={secS}>🌙<br />Chiều</td>}
                    <td style={lblS}>
                      <div style={{ fontWeight: 700 }}>Tiết {p.no}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>{Math.floor(p.s/60)}:{String(p.s%60).padStart(2,'0')} – {Math.floor(p.e/60)}:{String(p.e%60).padStart(2,'0')}</div>
                    </td>
                    {DAYS.map(day => <td key={day} style={tdS}>{renderCell(day, p.no)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
