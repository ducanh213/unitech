import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";

export default function Register() {
  const [username, setUsername] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      return setError("Mật khẩu không khớp");
    }
    try {
      await API.post("/auth/register", {
        username,
        email,
        password,
        extra: studentId,
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.msg || "Đăng ký thất bại");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Đăng ký</h2>
      {error && (
        <p style={{ color: "red", marginBottom: "15px", textAlign: "center" }}>
          {error}
        </p>
      )}
      <input
        type="text"
        placeholder="Họ và tên"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Mã số sinh viên"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        required
        style={inputStyle}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Xác nhận mật khẩu"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        style={inputStyle}
      />
      <button
        type="submit"
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "16px",
          marginTop: "10px",
        }}
      >
        Đăng ký
      </button>
      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Đã có tài khoản?{" "}
        <Link to="/login" style={{ color: "#007bff", textDecoration: "none" }}>
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  fontSize: "14px",
};
