import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentById, createStudent, updateStudent } from "../../api/axios";

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    studentId: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    major: "",
    year: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) loadStudent();
  }, [id]);

  const loadStudent = async () => {
    try {
      const res = await getStudentById(id);
      const s = res.data;
      setForm({
        studentId: s.studentId,
        fullName: s.fullName,
        email: s.user?.email || "",
        phone: s.phone || "",
        address: s.address || "",
        major: s.major?.name || s.major || "",
        year: s.year?.toString() || "",
      });
    } catch (err) {
      console.error("Failed to load student", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) await updateStudent(id, form);
      else await createStudent(form);
      navigate("/admin/students");
    } catch (err) {
      setError(err.response?.data?.msg || "Lỗi khi lưu");
    }
  };

  const containerStyle = {
    maxWidth: "500px",
    margin: "0 auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  };

  const formGroupStyle = {
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
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  const buttonStyle = {
    padding: "10px 16px",
    marginRight: "10px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#6c757d",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center" }}>
        {isEdit ? "Sửa sinh viên" : "Thêm sinh viên"}
      </h2>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        {[
          { label: "Mã SV", name: "studentId" },
          { label: "Họ tên", name: "fullName" },
          { label: "Email", name: "email", type: "email" },
          { label: "Phone", name: "phone" },
          { label: "Địa chỉ", name: "address" },
          { label: "Ngành", name: "major", placeholder: "Nhập ngành" },
          { label: "Khóa (năm)", name: "year", type: "number" },
        ].map(({ label, name, type = "text", placeholder }) => (
          <div key={name} style={formGroupStyle}>
            <label style={labelStyle}>{label}:</label>
            <input
              style={inputStyle}
              name={name}
              type={type}
              value={form[name]}
              onChange={handleChange}
              required={name !== "phone" && name !== "address"}
              placeholder={placeholder}
            />
          </div>
        ))}

        <div style={{ textAlign: "center" }}>
          <button type="submit" style={buttonStyle}>
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </button>
          <button
            type="button"
            style={cancelButtonStyle}
            onClick={() => navigate("/admin/students")}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
