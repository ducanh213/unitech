// src/pages/student/Grades.js
import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import axiosGlobal from 'axios';

export default function Grades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState('all');
  
  // AI Path States
  const [recommendations, setRecommendations] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiMsg, setAiMsg] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await axios.get('/registrations');
      setGrades(response.data);
    } catch (err) {
      setError('Không thể tải điểm số');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePath = async () => {
    try {
      setAnalyzing(true);
      setAiMsg('');
      const token = localStorage.getItem('token');
      const res = await axiosGlobal.get('http://localhost:5000/api/students/me/ai-path', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecommendations(res.data.recommendations || []);
      setAiMsg(res.data.recommendations?.length > 0 ? '✅ Đã phân tích xong lộ trình học tập!' : '✅ Bạn đã hoàn thành lộ trình học!');
    } catch (err) {
      console.error(err);
      setAiMsg('❌ Lỗi gọi Server AI. Kiểm tra kết nối.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Tính GPA (trung bình các môn đã có điểm tổng kết, không tính kỳ hiện tại)
  const gradedCourses = grades.filter(r => r.totalGrade !== null);
  const round1 = v => v !== null && v !== undefined ? Math.round(parseFloat(v) * 10) / 10 : v;
  const gpa = gradedCourses.length > 0
    ? (gradedCourses.reduce((sum, r) => sum + r.totalGrade, 0) / gradedCourses.length).toFixed(2)
    : null;

  // Phân nhóm theo kỳ
  const semesterGroups = {};
  grades.forEach(r => {
    const key = r.period?.semester || r.period?.name || 'Khác';
    const label = r.period?.name || key;
    if (!semesterGroups[key]) semesterGroups[key] = { label, regs: [], status: r.period?.status };
    semesterGroups[key].regs.push(r);
  });
  const semesterKeys = Object.keys(semesterGroups);
  const displayedGrades = selectedSemester === 'all'
    ? grades
    : (semesterGroups[selectedSemester]?.regs || []);

  // Màu điểm
  const getGradeColor = (score) => {
    if (score === null || score === undefined) return '#94a3b8';
    if (score >= 8.5) return '#16a34a';   // Giỏi
    if (score >= 7.0) return '#2563eb';   // Khá
    if (score >= 5.5) return '#d97706';   // Trung bình
    if (score >= 4.0) return '#64748b';   // Qua môn (Trung bình yếu)
    return '#dc2626';                      // Yếu/Kém (Trượt)
  };

  const getGradeLabel = (score) => {
    if (score === null || score === undefined) return null;
    if (score >= 8.5) return 'Giỏi';
    if (score >= 7.0) return 'Khá';
    if (score >= 5.5) return 'TB';
    if (score >= 4.0) return 'Qua môn';
    return 'Trượt';
  };

  if (loading) return (
    <div className="main-content-card" style={{ textAlign: 'center', padding: '60px' }}>
      <p style={{ color: '#64748b', fontSize: '1rem' }}>⏳ Đang tải điểm số...</p>
    </div>
  );

  if (error) return (
    <div className="main-content-card" style={{ textAlign: 'center', padding: '60px' }}>
      <p style={{ color: '#dc2626' }}>⚠️ {error}</p>
    </div>
  );

  return (
    <div>
      {/* Thẻ thống kê tóm tắt */}
      <div className="teacher-summary-cards" style={{ marginBottom: '28px' }}>
        <div className="summary-card">
          <p>Tổng môn (tất cả kỳ)</p>
          <h3>{grades.length}</h3>
        </div>
        <div className="summary-card">
          <p>Môn đã có điểm</p>
          <h3 style={{ color: '#2563eb' }}>{gradedCourses.length}</h3>
        </div>
        <div className="summary-card">
          <p>Điểm trung bình (GPA)</p>
          <h3 style={{ color: gpa !== null ? getGradeColor(parseFloat(gpa)) : '#94a3b8' }}>
            {gpa !== null ? gpa : '—'}
          </h3>
        </div>
      </div>

      {/* AI LỘ TRÌNH HỌC TẬP */}
      <div style={{ marginBottom: '28px', padding: '24px', borderRadius: '24px', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: '#334155' }}>🤖 Gợi ý Lộ trình Học tập (AI)</h3>
            <p style={{ margin: '8px 0 0', color: '#64748b' }}>Hệ thống tự động phân tích lịch sử điểm số để đề xuất môn học tiếp theo.</p>
          </div>
          <button 
            onClick={handleAnalyzePath}
            disabled={analyzing}
            style={{
              background: '#0284c7', color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {analyzing ? '⏳ Đang phân tích...' : 'Phân tích lộ trình của tôi'}
          </button>
        </div>

        {aiMsg && <p style={{ color: aiMsg.includes('✅') ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{aiMsg}</p>}

        {recommendations.length > 0 && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
            {recommendations.map((course, idx) => {
              const isRetry = course.isRetry;
              return (
                <div key={idx} style={{
                  background: '#fff', padding: '16px', borderRadius: '16px',
                  borderLeft: `4px solid ${isRetry ? '#ef4444' : '#0ea5e9'}`,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  minWidth: '200px'
                }}>
                  <div style={{ marginBottom: 6 }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                      borderRadius: 8,
                      background: isRetry ? '#fee2e2' : '#e0f2fe',
                      color: isRetry ? '#dc2626' : '#0284c7'
                    }}>
                      {isRetry ? '🔁 Học lại' : '➡️ Tiếp theo'}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 8px', color: '#0f172a' }}>{course.title}</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Mã: <strong>{course.code}</strong></p>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Tín chỉ: {course.credits}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bảng điểm */}
      <div className="main-content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ margin: 0 }}>📖 Lịch sử học tập & Điểm số</h2>
          {/* Tabs theo kỳ học */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedSemester('all')}
              style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, background: selectedSemester === 'all' ? '#2563eb' : '#f8fafc', color: selectedSemester === 'all' ? '#fff' : '#374151' }}
            >Tất cả ({grades.length})</button>
            {semesterKeys.map(key => {
              const sg = semesterGroups[key];
              const isOpen = sg.status === 'open';
              return (
                <button
                  key={key}
                  onClick={() => setSelectedSemester(key)}
                  style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${isOpen ? '#86efac' : '#d1d5db'}`, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, background: selectedSemester === key ? (isOpen ? '#16a34a' : '#2563eb') : (isOpen ? '#dcfce7' : '#f8fafc'), color: selectedSemester === key ? '#fff' : (isOpen ? '#15803d' : '#374151') }}
                >{isOpen ? '🟢 ' : ''}{sg.label} ({sg.regs.length})</button>
              );
            })}
          </div>
        </div>

        {displayedGrades.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: '2.5rem', margin: '0 0 12px' }}>📋</p>
            <p style={{ fontSize: '1rem' }}>Bạn chưa đăng ký môn học nào.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: 12 }}>
              Hiển thị <strong>{displayedGrades.length}</strong> môn học
              {selectedSemester !== 'all' && ` · ${semesterGroups[selectedSemester]?.label}`}
            </p>
            <table style={{ opacity: 1 }}>
              <thead>
                <tr>
                  <th>Mã lớp</th>
                  <th>Tên môn học</th>
                  <th>Đợt đăng ký</th>
                  <th style={{ textAlign: 'center' }}>Chuyên cần (10%)</th>
                  <th style={{ textAlign: 'center' }}>Giữa kỳ (30%)</th>
                  <th style={{ textAlign: 'center' }}>Cuối kỳ (60%)</th>
                  <th style={{ textAlign: 'center' }}>Tổng kết</th>
                  <th style={{ textAlign: 'center' }}>Xếp loại</th>
                </tr>
              </thead>
              <tbody>
                {displayedGrades.map((reg) => {
                  const total = reg.totalGrade;
                  return (
                    <tr key={reg._id}>
                      <td>
                        <span style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.88rem'
                        }}>
                          {reg.class?.classCode ?? '—'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, color: '#0f172a' }}>
                        {reg.class?.course?.title ?? '—'}
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.92rem' }}>
                        {reg.period?.name ?? '—'}
                      </td>
                      <td style={{ textAlign: 'center', color: '#475569' }}>
                        {reg.attendanceGrade !== null ? round1(reg.attendanceGrade) : (
                          <span style={{ color: '#cbd5e1' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', color: '#475569' }}>
                        {reg.midtermGrade !== null ? round1(reg.midtermGrade) : (
                          <span style={{ color: '#cbd5e1' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', color: '#475569' }}>
                        {reg.finalGrade !== null ? reg.finalGrade : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ color: '#cbd5e1' }}>—</span>
                            {reg.attendanceGrade !== null && reg.midtermGrade !== null && (
                              <span style={{ 
                                fontSize: '0.75rem', 
                                color: '#f59e0b', 
                                marginTop: '4px',
                                fontWeight: 500,
                                background: '#fef3c7',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                Mục tiêu: {Math.max(0, Math.ceil((4.0 - (reg.attendanceGrade * 0.1) - (reg.midtermGrade * 0.3)) / 0.6 * 10) / 10)}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {total !== null ? (
                          <span style={{
                            fontWeight: 700,
                            fontSize: '1.05rem',
                            color: getGradeColor(total)
                          }}>
                            {total}
                          </span>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontWeight: 500 }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {total !== null ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#fff',
                            background: getGradeColor(total)
                          }}>
                            {getGradeLabel(total)}
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#94a3b8',
                            background: '#f1f5f9'
                          }}>
                            Chờ điểm
                          </span>
                        )}
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