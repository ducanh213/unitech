import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMajorById, createMajor, updateMajor } from "../../api/axios";

export default function MajorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) loadMajor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadMajor = async () => {
    try {
      const res = await getMajorById(id);
      setForm({
        code: res.data.code,
        name: res.data.name,
        description: res.data.description || "",
      });
    } catch (err) {
      console.error("Không tải được ngành", err);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateMajor(id, form);
      } else {
        await createMajor(form);
      }
      navigate("/admin/majors");
    } catch (err) {
      setError(err.response?.data?.msg || "Lỗi khi lưu ngành");
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        {isEdit ? "Sửa ngành" : "Thêm ngành"}
      </h2>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Mã ngành:</label>
          <input
            name="code"
            value={form.code}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Tên ngành:</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Mô tả:</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
        <div style={{ textAlign: "center" }}>
          <button type="submit" style={buttonStyle}>
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/majors")}
            style={{
              ...buttonStyle,
              backgroundColor: "#6c757d",
              marginLeft: "10px",
            }}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

const containerStyle = {
  maxWidth: "500px",
  margin: "40px auto",
  padding: "30px",
  border: "1px solid #ccc",
  borderRadius: "10px",
  backgroundColor: "#fefefe",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  fontFamily: "Arial, sans-serif",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const fieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  fontWeight: "bold",
  marginBottom: "5px",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

const buttonStyle = {
  padding: "10px 20px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px",
};
