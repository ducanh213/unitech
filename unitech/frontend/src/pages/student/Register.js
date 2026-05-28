// src/pages/student/Register.js
import { useEffect, useState, useCallback } from "react";
import { getUserFromToken } from "../../utils/auth";
import {
  getPeriods,
  getClasses,
  getRegistrations,
  createRegistration,
  deleteRegistration,
} from "../../api/axios";
import "../../App.css";

export default function Register() {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setPeriod] = useState("");
  const [classes, setClasses] = useState([]);
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const studentId = getUserFromToken()?.id;

  // Lấy đợt đang open
  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        setLoading(true);
        const res = await getPeriods();
        const openPeriods = res.data.filter((p) => p.status === "open");
        setPeriods(openPeriods);

        if (openPeriods.length) {
          setPeriod(openPeriods[0]._id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError("Không tải được đợt đăng ký");
        setLoading(false);
      }
    };
    fetchPeriods();
  }, []);

  // Tải dữ liệu lớp học và đăng ký khi đợt được chọn
  useEffect(() => {
    if (!selectedPeriod) return;

    const fetchClassesAndRegistrations = async () => {
      try {
        setLoading(true);
        const [classesResponse, registrationsResponse] = await Promise.all([
          getClasses(),
          getRegistrations(),
        ]);

        setClasses(classesResponse.data);
        setRegs(
          registrationsResponse.data.filter(
            (r) => r.period._id === selectedPeriod
          )
        );
      } catch (err) {
        setError("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchClassesAndRegistrations();
  }, [selectedPeriod]);

  // Đăng ký lớp học
  const handleRegister = useCallback(
    async (classId) => {
      try {
        setError("");
        await createRegistration({
          class: classId,
          period: selectedPeriod,
          student: studentId,
        });

        // Chỉ tải lại đăng ký thay vì tải lại toàn bộ dữ liệu
        const { data } = await getRegistrations();
        setRegs(data.filter((r) => r.period._id === selectedPeriod));
      } catch (err) {
        setError(err.response?.data?.msg || "Đăng ký thất bại");
      }
    },
    [selectedPeriod, studentId]
  );

  // Hủy đăng ký
  const handleCancel = useCallback(async (regId) => {
    try {
      setError("");
      await deleteRegistration(regId);
      // Cập nhật state trực tiếp thay vì gọi API lại
      setRegs((prevRegs) => prevRegs.filter((r) => r._id !== regId));
    } catch (err) {
      setError("Hủy đăng ký thất bại");
    }
  }, []);

  if (loading && !periods.length) return <p>Đang tải...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h2>Đăng ký học</h2>

      {/* Chọn đợt */}
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="periodSelect">Chọn đợt: </label>
        <select
          id="periodSelect"
          value={selectedPeriod}
          onChange={(e) => setPeriod(e.target.value)}
          disabled={loading || periods.length === 0}
        >
          {periods.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.semester})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Đang tải dữ liệu lớp học...</p>
      ) : (
        <table
          border="1"
          cellPadding="6"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Mã lớp</th>
              <th>Môn học</th>
              <th>Lịch học</th>
              <th>Sĩ số</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => {
              // Lớp này học sinh đã đk chưa?
              const isRegistered = regs.find((r) => r.class?._id === cls._id);

              return (
                <tr key={cls._id}>
                  <td>{cls.classCode}</td>
                  <td>{cls.course?.title}</td>
                  <td>{cls.schedule}</td>
                  <td>
                    {/* (Optional) Nếu có api đếm sĩ số thì hiển thị đây */}
                    {cls.capacityMax}
                  </td>
                  <td>
                    {isRegistered ? (
                      <button
                        onClick={() => handleCancel(isRegistered._id)}
                        style={{ color: "red" }}
                      >
                        Hủy
                      </button>
                    ) : (
                      <button onClick={() => handleRegister(cls._id)}>
                        Đăng ký
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
