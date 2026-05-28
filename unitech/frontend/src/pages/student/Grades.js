// src/pages/student/Grades.js
import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import axiosGlobal from 'axios';

export default function Grades() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
      setAiMsg('✅ Đã phân tích xong lộ trình học tập!');
    } catch (err) {
      console.error(err);
      setAiMsg('❌ Lỗi gọi Server AI. Kiểm tra kết nối.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Tính GPA (trung bình các môn đã có điểm tổng kết)
  const gradedCourses = grades.filter(r => r.totalGrade !== null);
  const gpa = gradedCourses.length > 0
    ? (gradedCourses.reduce((sum, r) => sum + r.totalGrade, 0) / gradedCourses.length).toFixed(2)
    : null;

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
    return 'Yếu';
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
          <p>Tổng số môn đăng ký</p>
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
            {recommendations.map((course, idx) => (
              <div key={idx} style={{
                background: '#fff', padding: '16px', borderRadius: '16px', 
                borderLeft: '4px solid #0ea5e9', boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                minWidth: '200px'
              }}>
                <h4 style={{ margin: '0 0 8px', color: '#0f172a' }}>{course.title}</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Mã: <strong>{course.code}</strong></p>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Tín chỉ: {course.credits}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bảng điểm */}
      <div className="main-content-card">
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Bảng điểm chi tiết</h2>

        {grades.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: '2.5rem', margin: '0 0 12px' }}>📋</p>
            <p style={{ fontSize: '1rem' }}>Bạn chưa đăng ký môn học nào.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
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
                {grades.map((reg) => {
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
                        {reg.attendanceGrade !== null ? reg.attendanceGrade : (
                          <span style={{ color: '#cbd5e1' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', color: '#475569' }}>
                        {reg.midtermGrade !== null ? reg.midtermGrade : (
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