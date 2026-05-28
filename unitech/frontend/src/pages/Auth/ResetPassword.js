// src/pages/Auth/ResetPassword.js
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import '../../App.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  // Email được truyền từ ForgotPassword qua navigate(...)
  const emailFromState = state?.email || '';

  const [otp, setOtp]               = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu và xác nhận phải giống nhau');
      return;
    }
    try {
      await API.post('/auth/reset', {
        email: emailFromState,
        otp,
        newPassword
      });
      setSuccess('Đổi mật khẩu thành công! Chuyển về trang đăng nhập…');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setError(err.response?.data?.msg || 'Đổi mật khẩu thất bại');
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Đặt lại mật khẩu</h2>
        {error   && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <input
          type="email"
          placeholder="Email của bạn"
          value={emailFromState}
          disabled
        />

        <input
          type="text"
          placeholder="Mã OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit">Xác nhận</button>

        <p className="links">
          <Link to="/login">← Quay lại đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}
