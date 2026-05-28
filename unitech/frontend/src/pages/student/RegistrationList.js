// src/pages/student/RegistrationList.js
import React, { useState, useEffect } from "react";
import { getRegistrations, deleteRegistration } from "../../api/axios";
import "../../App.css";

export default function RegistrationList() {
  const [regs, setRegs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await getRegistrations();
      setRegs(data);
    } catch (err) {
      setError(err.response?.data?.msg || "Không tải được đăng ký");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy đăng ký?")) return;
    try {
      await deleteRegistration(id);
      setRegs(regs.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.response?.data?.msg || "Hủy đăng ký thất bại");
    }
  };

  if (loading) return (
    <div className="main-content-card" style={{ textAlign: 'center', padding: '60px' }}>
      <p style={{ color: '#64748b' }}>⏳ Đang tải...</p>
    </div>
  );

  if (error) return (
    <div className="main-content-card">
      <p className="error">⚠️ {error}</p>
    </div>
  );

  return (
    <div>
      {/* Thẻ tóm tắt */}
      <div className="teacher-summary-cards" style={{ marginBottom: 24 }}>
        <div className="summary-card">
          <p>Tổng môn đã đăng ký</p>
          <h3 style={{ color: '#2563eb' }}>{regs.length}</h3>
        </div>
        <div className="summary-card">
          <p>Tổng tín chỉ</p>
          <h3 style={{ color: '#16a34a' }}>
            {regs.reduce((sum, r) => sum + (r.class?.course?.credits ?? 0), 0)}
          </h3>
        </div>
      </div>

      <div className="main-content-card">
        <h2 style={{ marginTop: 0, marginBottom: 20 }}>Học phần đã đăng ký</h2>

        {regs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: '2.5rem', margin: '0 0 12px' }}>📚</p>
            <p>Bạn chưa đăng ký học phần nào.</p>
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
                  <th>Đợt</th>
                  <th style={{ textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {regs.map((r) => {
                  const cls    = r.class   || {};
                  const course = cls.course || {};
                  const period = r.period  || {};
                  return (
                    <tr key={r._id}>
                      <td>
                        <span style={{
                          background: '#eff6ff', color: '#2563eb',
                          padding: '3px 10px', borderRadius: 8,
                          fontWeight: 700, fontSize: '0.88rem'
                        }}>
                          {cls.classCode || "—"}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, color: '#0f172a' }}>
                        {course.title || "—"}
                      </td>
                      <td style={{ textAlign: 'center', color: '#475569' }}>
                        {course.credits ?? "—"}
                      </td>
                      <td style={{ color: '#475569' }}>{cls.schedule || "—"}</td>
                      <td style={{ color: '#475569' }}>{cls.room || "—"}</td>
                      <td style={{ color: '#64748b', fontSize: '0.88rem' }}>
                        {period.name || "—"}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="delete-btn"
                          onClick={() => handleCancel(r._id)}
                        >
                          Hủy
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
