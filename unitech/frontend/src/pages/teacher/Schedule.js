// src/pages/teacher/Schedule.js
import { useEffect, useState } from 'react';
import { getClasses, getPeriods } from '../../api/axios';
import { parseSchedule, DAYS, DAY_LABELS, PERIOD_TIMES } from '../../utils/scheduleParser';
import '../../App.css';

const MORNING = PERIOD_TIMES.slice(0, 5);
const AFTERNOON = PERIOD_TIMES.slice(5, 10);

function getCell(classes, day, periodNo) {
  return classes.find(cls => parseSchedule(cls.schedule)[day]?.includes(periodNo));
}

export default function TeacherSchedule() {
  const [classes, setClasses] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getClasses(), getPeriods()])
      .then(([clsRes, periodRes]) => {
        setClasses(clsRes.data);
        const sortedPeriods = periodRes.data.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        setPeriods(sortedPeriods);
        
        const openP = sortedPeriods.find(p => p.status === 'open');
        if (openP) setSelectedPeriod(openP._id);
        else if (sortedPeriods.length > 0) setSelectedPeriod(sortedPeriods[sortedPeriods.length - 1]._id);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredClasses = classes.filter(c => c.gradingPeriod?._id === selectedPeriod);

  const handlePeriodChange = (pid) => {
    setSelectedPeriod(pid);
  };

  if (loading) return <div className="main-content-card" style={{ textAlign: 'center', padding: 60 }}><p style={{ color: '#64748b' }}>⏳ Đang tải...</p></div>;

  const thS  = { background: '#f8fafc', padding: '10px 8px', fontSize: '0.82rem', fontWeight: 700, color: '#475569', border: '1px solid #e2e8f0', textAlign: 'center', whiteSpace: 'nowrap' };
  const tdS  = { border: '1px solid #e2e8f0', padding: '4px 5px', verticalAlign: 'top', minHeight: 44, minWidth: 88 };
  const lblS = { ...tdS, background: '#fafafa', fontWeight: 600, fontSize: '0.78rem', color: '#64748b', textAlign: 'center', whiteSpace: 'nowrap', minWidth: 105 };
  const secS = { ...tdS, background: '#f0fff4', fontWeight: 800, color: '#166534', fontSize: '0.88rem', textAlign: 'center', minWidth: 52 };

  const renderCell = (day, periodNo) => {
    const cls = getCell(filteredClasses, day, periodNo);
    if (!cls) return null;
    return (
      <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #86efac', borderRadius: 7, padding: '5px 7px', fontSize: '0.78rem', lineHeight: 1.4 }}>
        <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.76rem' }}>{cls.classCode}</div>
        <div style={{ color: '#374151', fontSize: '0.74rem' }}>{cls.course?.title}</div>
        <div style={{ color: '#6b7280', fontSize: '0.7rem' }}>🚪 {cls.room}</div>
      </div>
    );
  };

  return (
    <div>
      <div className="period-tabs" style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '20px' }}>
        {periods.map(p => (
          <button
            key={p._id}
            onClick={() => handlePeriodChange(p._id)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              background: selectedPeriod === p._id ? '#2563eb' : '#f1f5f9',
              color: selectedPeriod === p._id ? '#fff' : '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              boxShadow: selectedPeriod === p._id ? '0 4px 6px -1px rgba(37, 99, 235, 0.2)' : 'none'
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {filteredClasses.length > 0 && (
        <div className="teacher-summary-cards" style={{ marginBottom: 24 }}>
          <div className="summary-card"><p>Số lớp phụ trách</p><h3 style={{ color: '#16a34a' }}>{filteredClasses.length}</h3></div>
          <div className="summary-card" style={{ gridColumn: 'span 2' }}>
            <p>Danh sách lớp trong kỳ</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {filteredClasses.map(cls => (
                <span key={cls._id} style={{ background: '#f0fdf4', color: '#16a34a', padding: '3px 12px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600 }}>
                  {cls.classCode} – {cls.course?.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="main-content-card">
        <h2 style={{ marginTop: 0, marginBottom: 20 }}>Thời khóa biểu {periods.find(p => p._id === selectedPeriod)?.name}</h2>
        {filteredClasses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: '2.5rem', margin: '0 0 12px' }}>📅</p>
            <p>Chưa có lớp nào được phân công.</p>
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
