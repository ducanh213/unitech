// src/pages/admin/PeriodForm.js
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPeriodById, createPeriod, updatePeriod } from "../../api/axios";

export default function PeriodForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    semester: "",
    startDate: "",
    endDate: "",
    isSupplementary: false,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) load();
  }, [id]);

  async function load() {
    const { data } = await getPeriodById(id);
    setForm({
      name: data.name,
      semester: data.semester,
      startDate: data.startDate.slice(0, 10),
      endDate: data.endDate.slice(0, 10),
      isSupplementary: data.isSupplementary,
    });
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) await updatePeriod(id, form);
      else await createPeriod(form);
      navigate("/admin/periods");
    } catch (err) {
      setError(err.response?.data?.msg || "Lỗi khi lưu");
    }
  };

  const formStyle = {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    background: "#f9f9f9",
  };

  const fieldStyle = {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
  };

  const labelStyle = {
    marginBottom: "5px",
    fontWeight: "bold",
  };

  const inputStyle = {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  };

  const buttonStyle = {
    padding: "10px 20px",
    marginRight: "10px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer",
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#6c757d",
  };

  return (
    <div style={formStyle}>
      <h2 style={{ textAlign: "center" }}>{isEdit ? "Sửa đợt" : "Thêm đợt"}</h2>
      {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Tên đợt:</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Kỳ (semester):</label>
          <input
            name="semester"
            value={form.semester}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Ngày bắt đầu:</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Ngày kết thúc:</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>
        <div
          style={{ ...fieldStyle, flexDirection: "row", alignItems: "center" }}
        >
          <label style={{ ...labelStyle, marginRight: "10px" }}>
            Đợt bổ sung?
          </label>
          <input
            type="checkbox"
            name="isSupplementary"
            checked={form.isSupplementary}
            onChange={handleChange}
          />
        </div>
        <div style={{ marginTop: "20px" }}>
          <button type="submit" style={buttonStyle}>
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/periods")}
            style={cancelButtonStyle}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
