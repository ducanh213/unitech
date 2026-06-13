// src/pages/student/Register.js
import { useEffect, useState, useCallback } from "react";
import { getPeriods, getClasses, getRegistrations, createRegistration, deleteRegistration } from "../../api/axios";
import "../../App.css";

export default function Register() {
  const [periods, setPeriods]             = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [classes, setClasses]             = useState([]);
  const [regs, setRegs]                   = useState([]);
  const [allRegs, setAllRegs]             = useState([]); // tất cả lịch sử đăng ký (để kiểm tra prerequisites)
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // classId đang thực hiện
  const [error, setError]                 = useState("");

  // ─── Load ban đầu ────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [periodsRes, allRegsRes] = await Promise.all([
          getPeriods(),
          getRegistrations(),
        ]);

        const openPeriods = periodsRes.data.filter(p => p.status === "open");
        setPeriods(openPeriods);
        setAllRegs(allRegsRes.data);

        if (openPeriods.length > 0) {
          setSelectedPeriodId(openPeriods[0]._id);
        }
      } catch (err) {
        setError("Không tải được dữ liệu. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ─── Load lớp học khi chọn đợt ───────────────────────────────────────────────
  useEffect(() => {
    if (!selectedPeriodId) return;
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const [classesRes, regsRes] = await Promise.all([
          getClasses(),
          getRegistrations(),
        ]);
        setClasses(classesRes.data);
        setRegs(regsRes.data.filter(r => r.period?._id === selectedPeriodId));
      } catch (err) {
        setError("Lỗi khi tải danh sách lớp học");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [selectedPeriodId]);

  // ─── Tính toán trạng thái của mỗi lớp học ────────────────────────────────────
  const getClassStatus = useCallback((cls) => {
    // Đã đăng ký trong đợt này
    const existingReg = regs.find(r => r.class?._id === cls._id);
    if (existingReg) return { type: "registered", regId: existingReg._id };

    // Lớp đã đầy
    if (cls.currentEnrollment >= cls.capacityMax) {
      return { type: "full", msg: `Lớp đầy (${cls.currentEnrollment}/${cls.capacityMax})` };
    }

    // Danh sách course đã PASS (totalGrade >= 4.0)
    const passedCourseIds = new Set(
      allRegs
        .filter(r => r.totalGrade !== null && r.totalGrade >= 4.0 && r.class?.course?._id)
        .map(r => r.class.course._id)
    );

    // Đã hoàn thành môn này rồi
    if (passedCourseIds.has(cls.course?._id)) {
      return { type: "passed", msg: "Đã hoàn thành môn này" };
    }

    // Kiểm tra điều kiện tiên quyết
    const prereqs = cls.course?.prerequisites || [];
    if (prereqs.length > 0) {
      const missing = prereqs.filter(p => !passedCourseIds.has(p._id || p));
      if (missing.length > 0) {
        const missingTitles = missing.map(p => p.title || p.code || "?").join(", ");
        return { type: "prereq", msg: `Cần học trước: ${missingTitles}` };
      }
    }

    // Kiểm tra trùng lịch với các lớp đã đăng ký trong đợt
    for (const reg of regs) {
      if (reg.class?.schedule && cls.schedule) {
        if (scheduleOverlap(cls.schedule, reg.class.schedule)) {
          return { type: "conflict", msg: `Trùng lịch với lớp ${reg.class.classCode}` };
        }
      }
    }

    return { type: "available" };
  }, [regs, allRegs]);

  // ─── Đăng ký lớp học ─────────────────────────────────────────────────────────
  const handleRegister = useCallback(async (classId) => {
    try {
      setActionLoading(classId);
      setError("");
      await createRegistration({ class: classId, period: selectedPeriodId });
      // Reload cả regs lẫn allRegs để đồng bộ
      const [regsRes, allRegsRes] = await Promise.all([getRegistrations(), getRegistrations()]);
      setRegs(regsRes.data.filter(r => r.period?._id === selectedPeriodId));
      setAllRegs(allRegsRes.data);
      // Reload classes để cập nhật currentEnrollment
      const classesRes = await getClasses();
      setClasses(classesRes.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Đăng ký thất bại");
    } finally {
      setActionLoading(null);
    }
  }, [selectedPeriodId]);

  // ─── Hủy đăng ký ─────────────────────────────────────────────────────────────
  const handleCancel = useCallback(async (regId, classId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đăng ký lớp này?\nViệc hủy sẽ xóa lớp khỏi thời khóa biểu.")) return;
    try {
      setActionLoading(classId);
      setError("");
      await deleteRegistration(regId);
      setRegs(prev => prev.filter(r => r._id !== regId));
      setAllRegs(prev => prev.filter(r => r._id !== regId));
      const classesRes = await getClasses();
      setClasses(classesRes.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Hủy đăng ký thất bại");
    } finally {
      setActionLoading(null);
    }
  }, []);

  // ─── Helper kiểm tra trùng lịch phía client ──────────────────────────────────
  function scheduleOverlap(schedA, schedB) {
    const parseSlots = s => {
      if (!s) return {};
      const m = s.match(/^((?:T[2-7],?)+)\s+(\d+):(\d+)\s*[-–]\s*(\d+):(\d+)$/i);
      if (!m) return {};
      const days = m[1].toUpperCase().split(",").map(d => d.trim());
      const sMin = parseInt(m[2]) * 60 + parseInt(m[3]);
      const eMin = parseInt(m[4]) * 60 + parseInt(m[5]);
      const result = {};
      days.forEach(d => result[d] = { s: sMin, e: eMin });
      return result;
    };
    const a = parseSlots(schedA), b = parseSlots(schedB);
    for (const day of Object.keys(a)) {
      if (b[day] && a[day].s < b[day].e && a[day].e > b[day].s) return true;
    }
    return false;
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (loading && !classes.length) {
    return (
      <div className="main-content-card" style={{ textAlign: "center", padding: 60 }}>
        <p style={{ color: "#64748b" }}>⏳ Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Không có đợt mở
  if (!loading && periods.length === 0) {
    return (
      <div className="main-content-card" style={{ textAlign: "center", padding: "60px 0" }}>
        <p style={{ fontSize: "3rem", margin: "0 0 16px" }}>🔒</p>
        <h3 style={{ color: "#374151", marginBottom: 8 }}>Hiện chưa có đợt đăng ký nào mở</h3>
        <p style={{ color: "#64748b" }}>
          Vui lòng chờ Admin mở đợt đăng ký học phần để tiếp tục.
        </p>
      </div>
    );
  }

  const selectedPeriod = periods.find(p => p._id === selectedPeriodId);
  const registeredCount = regs.length;
  const totalCredits = regs.reduce((sum, r) => sum + (r.class?.course?.credits || 0), 0);

  return (
    <div>
      {/* Thống kê nhanh */}
      <div className="teacher-summary-cards" style={{ marginBottom: 24 }}>
        <div className="summary-card">
          <p>Đợt đăng ký</p>
          <h3 style={{ color: "#7c3aed", fontSize: "1rem" }}>
            {selectedPeriod?.name}
          </h3>
        </div>
        <div className="summary-card">
          <p>Môn đã đăng ký</p>
          <h3 style={{ color: "#2563eb" }}>{registeredCount}</h3>
        </div>
        <div className="summary-card">
          <p>Tổng tín chỉ</p>
          <h3 style={{ color: "#16a34a" }}>{totalCredits}</h3>
        </div>
      </div>

      <div className="main-content-card">
        {/* Header + chọn đợt */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ margin: 0 }}>📋 Đăng ký học phần</h2>
          {periods.length > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontWeight: 600, color: "#374151" }}>Đợt đăng ký:</label>
              <select
                value={selectedPeriodId}
                onChange={e => setSelectedPeriodId(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.9rem" }}
              >
                {periods.map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.semester})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 16px", marginBottom: 16, color: "#dc2626", fontSize: "0.9rem" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Chú thích */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16, fontSize: "0.8rem" }}>
          {[
            { color: "#dcfce7", border: "#86efac", text: "✅ Có thể đăng ký" },
            { color: "#eff6ff", border: "#93c5fd", text: "🔵 Đã đăng ký" },
            { color: "#f1f5f9", border: "#cbd5e1", text: "🔒 Không khả dụng" },
          ].map(b => (
            <span key={b.text} style={{ background: b.color, border: `1px solid ${b.border}`, borderRadius: 6, padding: "3px 10px" }}>
              {b.text}
            </span>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: 24 }}>⏳ Đang tải danh sách lớp...</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Mã lớp</th>
                  <th>Môn học</th>
                  <th style={{ textAlign: "center" }}>TC</th>
                  <th>Lịch học</th>
                  <th>Phòng</th>
                  <th style={{ textAlign: "center" }}>Sĩ số</th>
                  <th style={{ textAlign: "center" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(cls => {
                  const status = getClassStatus(cls);
                  const isRegistered = status.type === "registered";
                  const isAvailable  = status.type === "available";
                  const isLoading    = actionLoading === cls._id;

                  let rowBg = "";
                  if (isRegistered) rowBg = "#eff6ff";
                  else if (!isAvailable) rowBg = "#f8fafc";

                  return (
                    <tr key={cls._id} style={{ background: rowBg }}>
                      <td>
                        <span style={{ background: isRegistered ? "#dbeafe" : "#f1f5f9", color: isRegistered ? "#1d4ed8" : "#475569", padding: "3px 10px", borderRadius: 8, fontWeight: 700, fontSize: "0.85rem" }}>
                          {cls.classCode}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, color: "#0f172a" }}>
                        {cls.course?.title || "—"}
                        {/* Hiển thị prerequisites nếu có */}
                        {cls.course?.prerequisites?.length > 0 && (
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2 }}>
                            Tiên quyết: {cls.course.prerequisites.map(p => p.code || p).join(", ")}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: "center", color: "#475569", fontWeight: 600 }}>
                        {cls.course?.credits || "—"}
                      </td>
                      <td style={{ color: "#475569", fontSize: "0.88rem" }}>{cls.schedule}</td>
                      <td style={{ color: "#475569" }}>{cls.room}</td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{
                          fontWeight: 700,
                          color: cls.currentEnrollment >= cls.capacityMax ? "#dc2626" : "#16a34a"
                        }}>
                          {cls.currentEnrollment}/{cls.capacityMax}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", minWidth: 130 }}>
                        {isRegistered ? (
                          <button
                            onClick={() => handleCancel(status.regId, cls._id)}
                            disabled={isLoading}
                            className="delete-btn"
                            style={{ minWidth: 90 }}
                          >
                            {isLoading ? "..." : "🗑 Hủy đăng ký"}
                          </button>
                        ) : isAvailable ? (
                          <button
                            onClick={() => handleRegister(cls._id)}
                            disabled={isLoading}
                            style={{ minWidth: 90, background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
                          >
                            {isLoading ? "..." : "✚ Đăng ký"}
                          </button>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "0.78rem", display: "block", maxWidth: 160 }}>
                            🔒 {status.msg}
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
