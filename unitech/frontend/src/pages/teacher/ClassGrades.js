import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getClassById, getClassStudents, updateStudentGrades } from '../../api/axios';
import '../../App.css';

const getGradeColor = (score) => {
  if (score === null || score === undefined) return '#94a3b8';
  if (score >= 8.5) return '#16a34a';
  if (score >= 7.0) return '#2563eb';
  if (score >= 5.5) return '#d97706';
  if (score >= 4.0) return '#64748b';
  return '#dc2626';
};

const getGradeLabel = (score) => {
  if (score === null || score === undefined) return null;
  if (score >= 8.5) return 'Giỏi';
  if (score >= 7.0) return 'Khá';
  if (score >= 5.5) return 'TB';
  if (score >= 4.0) return 'Qua môn';
  return 'Yếu';
};

export default function ClassGrades() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ attendanceGrade: '', midtermGrade: '', finalGrade: '' });
  const [msg, setMsg] = useState('');
  const [riskData, setRiskData] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => { fetchData(); }, [classId]); // eslint-disable-line

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clsRes, stuRes] = await Promise.all([
        getClassById(classId),
        getClassStudents(classId),
      ]);
      setClassInfo(clsRes.data);
      setStudents(stuRes.data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu lớp', err);
      setMsg('❌ Không thể tải danh sách sinh viên.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (reg) => {
    setEditingId(reg.student._id);
    setMsg('');
    setEditForm({
      attendanceGrade: reg.attendanceGrade !== null ? reg.attendanceGrade : '',
      midtermGrade: reg.midtermGrade !== null ? reg.midtermGrade : '',
      finalGrade: reg.finalGrade !== null ? reg.finalGrade : '',
    });
  };

  const handleCancelEdit = () => setEditingId(null);

  const handleSave = async (studentId) => {
    try {
      setSaving(true);
      const payload = {
        attendanceGrade: editForm.attendanceGrade !== '' ? Number(editForm.attendanceGrade) : null,
        midtermGrade: editForm.midtermGrade !== '' ? Number(editForm.midtermGrade) : null,
        finalGrade: editForm.finalGrade !== '' ? Number(editForm.finalGrade) : null,
      };
      await updateStudentGrades(classId, studentId, payload);
      setEditingId(null);
      setMsg('✅ Lưu điểm thành công!');
      fetchData();
    } catch (err) {
      console.error('Lỗi lưu điểm', err);
      setMsg('❌ Lỗi lưu điểm, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyzeRisk = async () => {
    try {
      setAnalyzing(true);
      setMsg('');
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/classes/${classId}/ai-risk`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRiskData(res.data.predictions || []);
      setMsg('✅ Phân tích rủi ro bằng AI hoàn tất!');
    } catch (err) {
      console.error(err);
      setMsg('❌ Lỗi gọi Server AI. Kiểm tra kết nối Python.');
    } finally {
      setAnalyzing(false);
    }
  };

  const gradedCount = students.filter(s => s.totalGrade !== null).length;
  // Kiểm tra kỳ hiện tại có được phép sửa điểm không (Học kỳ 2 2026 trở đi)
  const currentPeriod = students[0]?.period;
  const isOpenPeriod = currentPeriod ? new Date(currentPeriod.endDate) > new Date('2025-12-31T23:59:59Z') : false;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: '#f1f5f9', border: '1px solid #e2e8f0',
            borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
            fontWeight: 600, color: '#475569',
          }}
        >
          ← Trở về
        </button>
        <h2 style={{ margin: 0, color: '#0f172a' }}>
          Nhập điểm — Lớp{' '}
          {classInfo
            ? `${classInfo.classCode} (${classInfo.course?.title})`
            : 'Đang tải...'}
        </h2>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={handleAnalyzeRisk}
            disabled={analyzing}
            style={{
              background: '#8b5cf6', color: 'white', border: 'none',
              borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            {analyzing ? '⏳ Đang phân tích...' : '🤖 Phân tích Rủi ro AI'}
          </button>
        </div>
      </div>

      {msg && (
        <div style={{
          padding: '10px 16px', borderRadius: 10, marginBottom: 16,
          background: msg.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
          color: msg.startsWith('✅') ? '#16a34a' : '#dc2626',
          border: `1px solid ${msg.startsWith('✅') ? '#86efac' : '#fca5a5'}`,
          fontWeight: 600,
        }}>
          {msg}
        </div>
      )}

      {/* Thẻ tóm tắt */}
      <div className="teacher-summary-cards" style={{ marginBottom: 24 }}>
        <div className="summary-card">
          <p>Sinh viên đăng ký</p>
          <h3 style={{ color: '#2563eb' }}>{loading ? '…' : students.length}</h3>
        </div>
        <div className="summary-card">
          <p>Đã có điểm tổng kết</p>
          <h3 style={{ color: '#16a34a' }}>{loading ? '…' : gradedCount}</h3>
        </div>
        <div className="summary-card">
          <p>Chờ nhập điểm</p>
          <h3 style={{ color: '#d97706' }}>{loading ? '…' : students.length - gradedCount}</h3>
        </div>
        {!loading && currentPeriod && (
          <div className="summary-card" style={{ borderLeft: `3px solid ${isOpenPeriod ? '#16a34a' : '#94a3b8'}` }}>
            <p>Kỳ học</p>
            <h3 style={{ color: isOpenPeriod ? '#16a34a' : '#64748b', fontSize: '0.95rem' }}>
              {isOpenPeriod ? '🟢' : '🔒'} {currentPeriod.name}
            </h3>
          </div>
        )}
      </div>

      <div className="main-content-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
            ⏳ Đang tải danh sách sinh viên...
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: '2.5rem', margin: '0 0 12px' }}>👥</p>
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>Chưa có sinh viên nào đăng ký lớp này.</p>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
              Sinh viên cần đăng ký qua trang "Đăng ký học" và đợt đăng ký phải đang mở.
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã SV</th>
                  <th>Họ tên</th>
                  <th style={{ textAlign: 'center' }}>Chuyên cần (10%)</th>
                  <th style={{ textAlign: 'center' }}>Giữa kỳ (30%)</th>
                  <th style={{ textAlign: 'center' }}>Cuối kỳ (60%)</th>
                  <th style={{ textAlign: 'center' }}>Tổng kết</th>
                  <th style={{ textAlign: 'center' }}>Xếp loại</th>
                  {riskData.length > 0 && <th style={{ textAlign: 'center' }}>Cảnh báo AI</th>}
                  <th style={{ textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {students.map((reg, idx) => {
                  const isEditing = editingId === reg.student._id;
                  const total = reg.totalGrade;
                  return (
                    <tr key={reg._id}>
                      <td style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{idx + 1}</td>
                      <td>
                        <span style={{
                          background: '#f0fdf4', color: '#16a34a',
                          padding: '3px 10px', borderRadius: 8,
                          fontWeight: 700, fontSize: '0.85rem'
                        }}>
                          {reg.student?.studentId}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, color: '#0f172a' }}>
                        {reg.student?.fullName}
                      </td>

                      {/* Chuyên cần */}
                      <td style={{ textAlign: 'center' }}>
                        {isEditing ? (
                          <input type="number" min="0" max="10" step="0.1"
                            style={{ width: 64, textAlign: 'center' }}
                            value={editForm.attendanceGrade}
                            onChange={e => setEditForm({ ...editForm, attendanceGrade: e.target.value })}
                          />
                        ) : (
                          reg.attendanceGrade !== null
                            ? <span style={{ color: '#475569' }}>{reg.attendanceGrade}</span>
                            : <span style={{ color: '#cbd5e1' }}>—</span>
                        )}
                      </td>
                      {/* Giữa kỳ */}
                      <td style={{ textAlign: 'center' }}>
                        {isEditing ? (
                          <input type="number" min="0" max="10" step="0.1"
                            style={{ width: 64, textAlign: 'center' }}
                            value={editForm.midtermGrade}
                            onChange={e => setEditForm({ ...editForm, midtermGrade: e.target.value })}
                          />
                        ) : (
                          reg.midtermGrade !== null
                            ? <span style={{ color: '#475569' }}>{reg.midtermGrade}</span>
                            : <span style={{ color: '#cbd5e1' }}>—</span>
                        )}
                      </td>

                      {/* Cuối kỳ */}
                      <td style={{ textAlign: 'center' }}>
                        {isEditing ? (
                          <input type="number" min="0" max="10" step="0.1"
                            style={{ width: 64, textAlign: 'center' }}
                            value={editForm.finalGrade}
                            onChange={e => setEditForm({ ...editForm, finalGrade: e.target.value })}
                          />
                        ) : (
                          reg.finalGrade !== null
                            ? <span style={{ color: '#475569' }}>{reg.finalGrade}</span>
                            : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <span style={{ color: '#cbd5e1' }}>—</span>
                              {reg.attendanceGrade !== null && reg.midtermGrade !== null && (
                                <span style={{
                                  fontSize: '0.7rem',
                                  color: '#f59e0b',
                                  marginTop: '2px',
                                  fontWeight: 500
                                }}>
                                  Mục tiêu: {Math.max(0, Math.ceil((4.0 - (reg.attendanceGrade * 0.1) - (reg.midtermGrade * 0.3)) / 0.6 * 10) / 10)}
                                </span>
                              )}
                            </div>
                        )}
                      </td>

                      {/* Tổng kết */}
                      <td style={{ textAlign: 'center' }}>
                        {total !== null ? (
                          <strong style={{ color: getGradeColor(total), fontSize: '1rem' }}>
                            {total}
                          </strong>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>—</span>
                        )}
                      </td>

                      {/* Xếp loại */}
                      <td style={{ textAlign: 'center' }}>
                        {total !== null ? (
                          <span style={{
                            display: 'inline-block', padding: '3px 12px',
                            borderRadius: 20, fontSize: '0.8rem', fontWeight: 700,
                            color: '#fff', background: getGradeColor(total),
                          }}>
                            {getGradeLabel(total)}
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-block', padding: '3px 10px',
                            borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
                            color: '#94a3b8', background: '#f1f5f9',
                          }}>
                            Chờ nhập
                          </span>
                        )}
                      </td>

                      {/* Cảnh báo AI */}
                      {riskData.length > 0 && (
                        <td style={{ textAlign: 'center' }}>
                          {(() => {
                            const ai = riskData.find(r => r.student_id === reg.student._id);
                            if (!ai) return <span style={{ color: '#cbd5e1' }}>—</span>;
                            let badgeColor = '#94a3b8';
                            if (ai.risk_level.includes('Nguy cơ cao')) badgeColor = '#ef4444';
                            if (ai.risk_level.includes('Cần chú ý')) badgeColor = '#eab308';
                            if (ai.risk_level.includes('An toàn')) badgeColor = '#22c55e';
                            return (
                              <span style={{
                                color: badgeColor, border: `1px solid ${badgeColor}`,
                                padding: '2px 8px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 600
                              }}>
                                {ai.risk_level}
                              </span>
                            );
                          })()}
                        </td>
                      )}

                      {/* Thao tác */}
                      <td style={{ textAlign: 'center' }}>
                        {!isOpenPeriod ? (
                          <span title="Kỳ đã đóng, không thể sửa điểm" style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                            🔒
                          </span>
                        ) : isEditing ? (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button
                              onClick={() => handleSave(reg.student._id)}
                              disabled={saving}
                              style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                            >
                              {saving ? '...' : 'Lưu'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="delete-btn"
                              style={{ padding: '6px 14px' }}
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => handleEditClick(reg)}>
                            ✏️ Sửa điểm
                          </button>
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
