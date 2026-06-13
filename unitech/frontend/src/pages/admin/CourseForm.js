import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCourseById, createCourse, updateCourse } from "../../api/axios";

export default function CourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    code: "",
    title: "",
    credits: 3,
    theoryHours: 0,
    practiceHours: 0,
    prerequisites: [],
    isGeneral: false,
    majors: [],
    semesterOffered: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    try {
      const { data } = await getCourseById(id);
      setForm({
        code: data.code,
        title: data.title,
        credits: data.credits,
        theoryHours: data.theoryHours,
        practiceHours: data.practiceHours,
        prerequisites: data.prerequisites.map((p) => p.code),
        isGeneral: data.isGeneral,
        majors: data.majors.map((m) => m.code),
        semesterOffered: data.semesterOffered || "",
      });
    } catch (err) {
      console.error(err);
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) await updateCourse(id, form);
      else await createCourse(form);
      navigate("/admin/courses");
    } catch (err) {
      setError(err.response?.data?.msg || "Lỗi khi lưu");
    }
  };

  const containerStyle = {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    backgroundColor: "#fdfdfd",
    fontFamily: "Arial, sans-serif",
  };

  const fieldStyle = {
    marginBottom: "15px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
  };

  const inputStyle = {
    width: "100%",
    padding: "8px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  };

  const buttonGroup = {
    marginTop: "20px",
    display: "flex",
    gap: "10px",
  };

  const buttonStyle = {
    padding: "10px 20px",
    fontSize: "14px",
    cursor: "pointer",
    borderRadius: "4px",
    border: "none",
  };

  return (
    <div style={containerStyle}>
      <h2>{isEdit ? "Sửa Học phần" : "Thêm Học phần"}</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Code:</label>
          <input
            name="code"
            value={form.code}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Tiêu đề:</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Tín chỉ:</label>
          <input
            type="number"
            name="credits"
            min="1"
            value={form.credits}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Số tiết LT:</label>
          <input
            type="number"
            name="theoryHours"
            min="0"
            value={form.theoryHours}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Số tiết BT:</label>
          <input
            type="number"
            name="practiceHours"
            min="0"
            value={form.practiceHours}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Học kỳ (HK1, HK2...):</label>
          <input
            name="semesterOffered"
            value={form.semesterOffered}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Đại cương?</label>
          <input
            type="checkbox"
            name="isGeneral"
            checked={form.isGeneral}
            onChange={handleChange}
          />
        </div>
        {!form.isGeneral && (
          <div style={fieldStyle}>
            <label style={labelStyle}>
              Áp dụng cho Majors (ID, cách nhau dấu phẩy):
            </label>
            <input
              name="majors"
              value={form.majors.join(",")}
              onChange={(e) => {
                const arr = e.target.value.split(",").map((x) => x.trim());
                setForm((f) => ({ ...f, majors: arr }));
              }}
              style={inputStyle}
            />
          </div>
        )}
        <div style={fieldStyle}>
          <label style={labelStyle}>Prerequisites (IDs, comma):</label>
          <input
            name="prerequisites"
            value={form.prerequisites.join(",")}
            onChange={(e) => {
              const arr = e.target.value.split(",").map((x) => x.trim());
              setForm((f) => ({ ...f, prerequisites: arr }));
            }}
            style={inputStyle}
          />
        </div>

        <div style={buttonGroup}>
          <button
            type="submit"
            style={{
              ...buttonStyle,
              backgroundColor: "#28a745",
              color: "#fff",
            }}
          >
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/courses")}
            style={{
              ...buttonStyle,
              backgroundColor: "#6c757d",
              color: "#fff",
            }}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
