// src/pages/admin/ClassForm.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getClassById,
  createClass,
  updateClass,
  getCourses,
  getTeachers,
} from "../../api/axios";

export default function ClassForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    classCode: "",
    course: "",
    teacher: "",
    room: "",
    schedule: "",
    capacityMin: 15,
    capacityMax: 35,
  });
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
    if (isEdit) loadClass();
  }, [id]);

  const fetchData = async () => {
    try {
      const [cRes, tRes] = await Promise.all([getCourses(), getTeachers()]);
      setCourses(cRes.data);
      setTeachers(tRes.data);
    } catch (err) {
      console.error("Lỗi khi tải courses hoặc teachers", err);
    }
  };

  const loadClass = async () => {
    try {
      const res = await getClassById(id);
      const cls = res.data;
      setForm({
        classCode: cls.classCode,
        course: cls.course._id,
        teacher: cls.teacher._id,
        room: cls.room,
        schedule: cls.schedule,
        capacityMin: cls.capacityMin,
        capacityMax: cls.capacityMax,
      });
    } catch (err) {
      console.error("Lỗi khi tải thông tin lớp học", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) await updateClass(id, form);
      else await createClass(form);
      navigate("/admin/classes");
    } catch (err) {
      setError(err.response?.data?.msg || "Lỗi khi lưu lớp học");
    }
  };

  const formGroupStyle = {
    marginBottom: "12px",
    display: "flex",
    flexDirection: "column",
  };

  const labelStyle = {
    marginBottom: "4px",
    fontWeight: "bold",
  };

  const inputStyle = {
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  const buttonStyle = {
    padding: "10px 16px",
    marginRight: "10px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#6c757d",
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>
        {isEdit ? "Sửa Lớp học" : "Thêm Lớp học"}
      </h2>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Mã lớp:</label>
          <input
            style={inputStyle}
            name="classCode"
            value={form.classCode}
            onChange={handleChange}
            required
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Học phần:</label>
          <select
            style={inputStyle}
            name="course"
            value={form.course}
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn học phần --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Giảng viên:</label>
          <select
            style={inputStyle}
            name="teacher"
            value={form.teacher}
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn giảng viên --</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.teacherId} - {t.fullName}
              </option>
            ))}
          </select>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Phòng học:</label>
          <input
            style={inputStyle}
            name="room"
            value={form.room}
            onChange={handleChange}
            required
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Lịch học:</label>
          <input
            style={inputStyle}
            name="schedule"
            value={form.schedule}
            onChange={handleChange}
            required
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Sĩ số tối thiểu:</label>
          <input
            style={inputStyle}
            type="number"
            name="capacityMin"
            min="1"
            value={form.capacityMin}
            onChange={handleChange}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Sĩ số tối đa:</label>
          <input
            style={inputStyle}
            type="number"
            name="capacityMax"
            min="1"
            value={form.capacityMax}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button type="submit" style={buttonStyle}>
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </button>
          <button
            type="button"
            style={cancelButtonStyle}
            onClick={() => navigate("/admin/classes")}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
