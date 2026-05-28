import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTeacherById, createTeacher, updateTeacher, getCourses } from "../../api/axios";

export default function TeacherForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    teacherId: "",
    fullName: "",
    email: "",
    password: "",
    department: "",
    degree: "Thạc sĩ",
    qualifiedSubjects: [],
  });
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
    if (isEdit) loadTeacher();
  }, [id]);

  const fetchCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  const loadTeacher = async () => {
    try {
      const res = await getTeacherById(id);
      const t = res.data;
      setForm({
        teacherId: t.teacherId,
        fullName: t.fullName,
        email: t.user?.email || "",
        password: "",
        department: t.department,
        degree: t.degree || "Thạc sĩ",
        qualifiedSubjects: t.qualifiedSubjects ? t.qualifiedSubjects.map(subj => subj._id || subj) : [],
      });
    } catch (err) {
      console.error("Failed to load teacher", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      let subjects = [...form.qualifiedSubjects];
      if (checked) {
        subjects.push(value);
      } else {
        subjects = subjects.filter(id => id !== value);
      }
      setForm(prev => ({ ...prev, qualifiedSubjects: subjects }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateTeacher(id, form);
      } else {
        await createTeacher(form);
      }
      navigate("/admin/teachers");
    } catch (err) {
      setError(err.response?.data?.msg || "Lỗi khi lưu");
    }
  };

  const containerStyle = {
    maxWidth: "500px",
    margin: "40px auto",
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
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
  };

  const submitButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#007bff",
    color: "white",
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#6c757d",
    color: "white",
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        {isEdit ? "Sửa giảng viên" : "Thêm giảng viên"}
      </h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Mã GV:</label>
          <input
            style={inputStyle}
            name="teacherId"
            value={form.teacherId}
            onChange={handleChange}
            required
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Họ tên:</label>
          <input
            style={inputStyle}
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Email:</label>
          <input
            style={inputStyle}
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {!isEdit && (
          <div style={formGroupStyle}>
            <label style={labelStyle}>Password:</label>
            <input
              style={inputStyle}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div style={formGroupStyle}>
          <label style={labelStyle}>Khoa/Phòng ban:</label>
          <input
            style={inputStyle}
            name="department"
            value={form.department}
            onChange={handleChange}
            required
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Trình độ chuyên môn:</label>
          <select 
            style={inputStyle} 
            name="degree" 
            value={form.degree} 
            onChange={handleChange}
          >
            <option value="Cử nhân">Cử nhân</option>
            <option value="Thạc sĩ">Thạc sĩ</option>
            <option value="Tiến sĩ">Tiến sĩ</option>
            <option value="Phó Giáo sư">Phó Giáo sư</option>
            <option value="Giáo sư">Giáo sư</option>
          </select>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Môn học đủ điều kiện giảng dạy:</label>
          <div style={{...inputStyle, maxHeight: '200px', overflowY: 'auto', backgroundColor: '#fff' }}>
            {courses.length === 0 ? <p style={{margin: '5px'}}>Chưa có môn học nào.</p> : courses.map(course => (
              <div key={course._id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <input 
                  type="checkbox"
                  id={`course-${course._id}`}
                  name="qualifiedSubjects"
                  value={course._id}
                  checked={form.qualifiedSubjects.includes(course._id)}
                  onChange={handleChange}
                  style={{ marginRight: '8px' }}
                />
                <label htmlFor={`course-${course._id}`} style={{ fontWeight: 'normal', cursor: 'pointer' }}>
                  {course.code} - {course.title}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <button type="submit" style={submitButtonStyle}>
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </button>
          <button
            type="button"
            style={cancelButtonStyle}
            onClick={() => navigate("/admin/teachers")}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
