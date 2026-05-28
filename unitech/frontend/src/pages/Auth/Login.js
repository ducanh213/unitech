// src/pages/Auth/Login.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import '../../App.css'; // chắc chắn đã import

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      if (data.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (data.role === 'student') {
        navigate('/student', { replace: true });
      } else {
        navigate('/teacher', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="login-split-layout">
      <div className="login-visual">
        <div className="login-visual-overlay">
          <div className="visual-content">
            <span className="visual-badge">UNITECH</span>
            <h1>Hệ thống quản lý đào tạo</h1>
            <p>Giải pháp học tập hiện đại, chuyên nghiệp và thân thiện với người dùng.</p>
          </div>
        </div>
      </div>

      <div className="login-panel">
        <div className="login-card">
          <div className="logo-container">
            <img src="/logo.png" alt="UniTech Logo" className="app-logo" />
          </div>
          <h2>Đăng nhập hệ thống</h2>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit} className="login-form-inner">
            <label>
              <span>Tên đăng nhập</span>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              <span>Mật khẩu</span>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit">Đăng nhập</button>
          </form>

          <div className="login-footer">
            <Link to="/forgot" className="text-link">Quên mật khẩu?</Link>
            <p>
              Chưa có tài khoản? <Link to="/register" className="text-link">Đăng ký</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
