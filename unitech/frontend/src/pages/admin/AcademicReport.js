// src/pages/admin/AcademicReport.js
import React, { useState, useEffect, useCallback } from 'react';
import { getAcademicReport } from '../../api/axios';
import '../../App.css';

// ─── Cấu hình hiển thị theo nhóm ────────────────────────────────────────────
const GROUP_CONFIG = {
  excellent: { label: '🏆 Giỏi/Xuất sắc (≥8.0)', color: '#15803d', bg: '#dcfce7', border: '#86efac' },
  good:      { label: '📘 Khá (7–7.9)',   color: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd' },
  average:   { label: '📗 Trung bình (5–6.9)',color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' },
  weak:      { label: '🚨 Yếu/Nguy cơ (<5.0)', color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  no_data:   { label: '⬜ Chưa có điểm',      color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' },
};

const HEALTH_CONFIG = {
  good:     { label: '🟢 Tốt',            color: '#15803d', bg: '#dcfce7', border: '#86efac' },
  warning:  { label: '🟡 Cần cải thiện', color: '#b45309', bg: '#fef3c7', border: '#fcd34d' },
  critical: { label: '🔴 Vấn đề',        color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
};

// ─── Component nhỏ: Badge nhóm ───────────────────────────────────────────────
function GroupBadge({ group, count, onClick, isSelected }) {
  const cfg = GROUP_CONFIG[group];
  return (
    <span 
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '5px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700,
        color: cfg.color, 
        background: isSelected ? cfg.border : cfg.bg, 
        border: `1px solid ${cfg.border}`,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: isSelected ? `0 0 0 2px #fff, 0 0 0 3px ${cfg.border}` : 'none',
        transition: 'all 0.2s',
        opacity: isSelected === false ? 0.5 : 1
      }}>
      {cfg.label}: {count}
    </span>
  );
}

// ─── Component nhỏ: Summary card ─────────────────────────────────────────────
function SummaryCard({ label, value, color, sub }) {
  return (
    <div className="summary-card">
      <p>{label}</p>
      <h3 style={{ color: color || '#0f172a' }}>{value ?? '—'}</h3>
      {sub && <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AcademicReport() {
  const [report, setReport]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [selectedGroup, setSelectedGroup]   = useState({}); // { majorName: 'excellent' | 'good' | ... }

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getAcademicReport();
      setReport(res.data);
    } catch (err) {
      setError('Không tải được báo cáo. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const toggleGroup = (majorName, group) => {
    setSelectedGroup(prev => ({
      ...prev,
      [majorName]: prev[majorName] === group ? null : group
    }));
  };

  // ── Loading state ──
  if (loading) return (
    <div className="main-content-card" style={{ textAlign: 'center', padding: '60px 0' }}>
      <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>⏳</p>
      <p style={{ color: '#64748b' }}>Đang phân tích dữ liệu toàn trường...</p>
    </div>
  );

  // ── Error state ──
  if (error) return (
    <div className="main-content-card" style={{ textAlign: 'center', padding: '48px 0' }}>
      <p style={{ color: '#dc2626', marginBottom: 16 }}>⚠️ {error}</p>
      <button onClick={fetchReport} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}>
        Thử lại
      </button>
    </div>
  );

  if (!report) return null;

  const { overallStats, majorReports } = report;
  const generatedAt = new Date(report.generatedAt).toLocaleString('vi-VN');

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a' }}>📊 Báo cáo Chất lượng Đào tạo</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Phân tích AI dựa trên dữ liệu thực tế · Cập nhật lúc: <strong>{generatedAt}</strong>
          </p>
        </div>
        <button
          onClick={fetchReport}
          style={{ background: '#f1f5f9', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}
        >
          🔄 Làm mới
        </button>
      </div>

      {/* ── Summary Cards toàn trường ── */}
      <div className="teacher-summary-cards" style={{ marginBottom: 28 }}>
        <SummaryCard label="Tổng sinh viên" value={overallStats.totalStudents} color="#2563eb" />
        <SummaryCard
          label="GPA trung bình toàn trường"
          value={overallStats.overallGpa || '—'}
          color={overallStats.overallGpa >= 7 ? '#15803d' : overallStats.overallGpa >= 5 ? '#b45309' : '#dc2626'}
        />
        <SummaryCard
          label="🚨 Sinh viên nguy cơ"
          value={overallStats.atRiskTotal}
          color={overallStats.atRiskTotal > 20 ? '#dc2626' : '#b45309'}
          sub={`${Math.round(overallStats.atRiskTotal / overallStats.totalStudents * 100)}% tổng số SV`}
        />
        <SummaryCard
          label="Tỷ lệ đậu môn"
          value={overallStats.overallPassRate !== null ? `${overallStats.overallPassRate}%` : '—'}
          color={overallStats.overallPassRate >= 75 ? '#15803d' : overallStats.overallPassRate >= 55 ? '#b45309' : '#dc2626'}
        />
      </div>

      {/* ── Phân bố nhóm toàn trường ── */}
      <div className="main-content-card" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', color: '#0f172a', fontSize: '1rem' }}>
          🗂 Phân bố sinh viên toàn trường
        </h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(overallStats.groupCounts).map(([group, count]) => (
            <GroupBadge key={group} group={group} count={count} />
          ))}
        </div>
      </div>

      {/* ── Danh sách ngành ── */}
      <div className="main-content-card">
        <h3 style={{ margin: '0 0 20px', color: '#0f172a', fontSize: '1rem' }}>
          🏫 Phân tích theo Ngành học
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {majorReports.map(m => {
            const hCfg       = HEALTH_CONFIG[m.healthStatus];
            const activeGroup = selectedGroup[m.majorName];
            const weakCount   = m.groupCounts.weak || 0;

            return (
              <div key={m.majorName} style={{ border: `1px solid ${hCfg.border}`, borderRadius: 12, overflow: 'hidden' }}>

                {/* Row tóm tắt ngành */}
                <div style={{ background: hCfg.bg, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  
                  {/* Tên ngành + trạng thái */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{m.majorName}</strong>
                    <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, color: hCfg.color, background: '#fff', border: `1px solid ${hCfg.border}` }}>
                      {hCfg.label}
                    </span>
                  </div>

                  {/* Chỉ số chính */}
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.88rem', color: '#374151' }}>
                    <span>👥 <strong>{m.totalStudents}</strong> SV</span>
                    <span>📈 GPA TB: <strong style={{ color: m.avgGpa >= 7 ? '#15803d' : m.avgGpa >= 5 ? '#b45309' : '#dc2626' }}>{m.avgGpa || '—'}</strong></span>
                    <span>✅ Đậu môn: <strong>{m.passRate !== null ? `${m.passRate}%` : '—'}</strong></span>
                    <span>🚨 Nguy cơ: <strong style={{ color: weakCount > 0 ? '#dc2626' : '#15803d' }}>{weakCount} SV</strong></span>
                  </div>
                </div>

                {/* Badge nhóm */}
                <div style={{ padding: '14px 20px', background: '#fff', borderTop: `1px solid ${hCfg.border}`, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, marginRight: '4px' }}>Nhấp để xem danh sách:</span>
                  {Object.entries(m.groupCounts).map(([group, count]) => (
                    <GroupBadge 
                      key={group} 
                      group={group} 
                      count={count} 
                      onClick={() => toggleGroup(m.majorName, group)}
                      isSelected={activeGroup ? activeGroup === group : undefined}
                    />
                  ))}
                </div>

                {/* ── Accordion: Danh sách SV theo nhóm ── */}
                {activeGroup && m.groupCounts[activeGroup] > 0 && (
                  <div style={{ borderTop: `1px solid ${hCfg.border}` }}>
                    <div style={{ padding: '8px 20px', background: GROUP_CONFIG[activeGroup].bg, borderBottom: `1px solid ${GROUP_CONFIG[activeGroup].border}` }}>
                      <p style={{ margin: 0, color: GROUP_CONFIG[activeGroup].color, fontWeight: 600, fontSize: '0.85rem' }}>
                        📋 Danh sách sinh viên thuộc nhóm {GROUP_CONFIG[activeGroup].label.replace(/ \(.+\)/, '')} — {m.majorName}
                      </p>
                    </div>
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Mã SV</th>
                            <th>Họ tên</th>
                            <th style={{ textAlign: 'center' }}>GPA</th>
                            <th style={{ textAlign: 'center' }}>Môn rớt</th>
                            <th style={{ textAlign: 'center' }}>Môn đã đậu</th>
                            <th>Môn rớt chi tiết</th>
                          </tr>
                        </thead>
                        <tbody>
                          {m.studentsList.filter(stu => stu.group === activeGroup).map(stu => {
                            return (
                              <tr key={stu._id}>
                                <td>
                                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 6, fontWeight: 700, fontSize: '0.82rem' }}>
                                    {stu.studentId}
                                  </span>
                                </td>
                                <td style={{ fontWeight: 500, color: '#0f172a' }}>{stu.fullName}</td>
                                <td style={{ textAlign: 'center' }}>
                                  <strong style={{ color: stu.gpa >= 5 ? '#b45309' : '#dc2626', fontSize: '1rem' }}>
                                    {stu.gpa || '—'}
                                  </strong>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <span style={{ color: '#dc2626', fontWeight: 700 }}>{stu.failedCount}</span>
                                </td>
                                <td style={{ textAlign: 'center', color: '#475569' }}>{stu.passedCount}</td>
                                <td style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: 200 }}>
                                  {stu.failedCourses.length > 0
                                    ? stu.failedCourses.map(c => `${c.code} (${c.totalGrade}đ)`).join(', ')
                                    : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
