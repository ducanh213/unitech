// src/pages/student/Courses.js
// Trang này CHỈ để xem danh sách học phần (course) theo ngành.
// Việc đăng ký thực tế được thực hiện ở trang "Đăng ký học" (Register.js)
import { useState, useEffect } from 'react';
import { getCourses } from '../../api/axios';
import '../../App.css';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all'); // 'all' | 'general' | 'major'

  useEffect(() => {
    getCourses()
      .then(res => setCourses(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="main-content-card" style={{ textAlign: 'center', padding: 60 }}>
      <p style={{ color: '#64748b' }}>⏳ Đang tải...</p>
    </div>
  );

  const filtered = courses.filter(c => {
    if (filter === 'general') return c.isGeneral;
    if (filter === 'major')   return !c.isGeneral;
    return true;
  });

  return (
    <div>
      {/* Thống kê */}
      <div className="teacher-summary-cards" style={{ marginBottom: 24 }}>
        <div className="summary-card">
          <p>Tổng học phần</p>
          <h3 style={{ color: '#2563eb' }}>{courses.length}</h3>
        </div>
        <div className="summary-card">
          <p>Đại cương</p>
          <h3 style={{ color: '#7c3aed' }}>{courses.filter(c => c.isGeneral).length}</h3>
        </div>
        <div className="summary-card">
          <p>Chuyên ngành</p>
          <h3 style={{ color: '#b45309' }}>{courses.filter(c => !c.isGeneral).length}</h3>
        </div>
      </div>

      <div className="main-content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ margin: 0 }}>📖 Danh sách Học phần</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['all', 'Tất cả'], ['general', 'Đại cương'], ['major', 'Chuyên ngành']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                style={{
                  padding: '6px 14px', borderRadius: 20, border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  background: filter === val ? '#2563eb' : '#f8fafc',
                  color: filter === val ? '#fff' : '#374151',
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Mã HP</th>
                <th>Tên học phần</th>
                <th style={{ textAlign: 'center' }}>Tín chỉ</th>
                <th>Phân loại</th>
                <th>Học kỳ</th>
                <th>Điều kiện tiên quyết</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(course => (
                <tr key={course._id}>
                  <td>
                    <span style={{ background: '#f1f5f9', color: '#0f172a', padding: '3px 8px', borderRadius: 6, fontWeight: 700, fontSize: '0.85rem' }}>
                      {course.code}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: '#0f172a' }}>{course.title}</td>
                  <td style={{ textAlign: 'center', color: '#475569', fontWeight: 600 }}>{course.credits}</td>
                  <td>
                    <span style={{
                      padding: '4px 10px', borderRadius: 20, fontWeight: 600, fontSize: '0.8rem',
                      background: course.isGeneral ? '#e0f2fe' : '#fef3c7',
                      color: course.isGeneral ? '#0369a1' : '#b45309',
                    }}>
                      {course.isGeneral ? '📘 Đại cương' : '🎓 Chuyên ngành'}
                    </span>
                  </td>
                  <td style={{ color: '#475569' }}>{course.semesterOffered || '—'}</td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {Array.isArray(course.prerequisites) && course.prerequisites.length > 0
                      ? course.prerequisites.map(p => p.code || p).join(', ')
                      : <span style={{ color: '#94a3b8' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
