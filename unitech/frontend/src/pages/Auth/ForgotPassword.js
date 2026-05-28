// src/pages/Auth/ForgotPassword.js
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import '../../App.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await API.post('/auth/forgot', { email });
      // thành công => chuyển sang reset, truyền email qua state
      navigate('/reset', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.msg || 'Gửi OTP thất bại');
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Quên mật khẩu</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email của bạn"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">Gửi OTP</button>
        <p className="links">
          <Link to="/login">← Quay lại đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}
