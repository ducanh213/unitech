// src/components/ChangePasswordModal.js
import React, { useState, useEffect } from 'react';
import { changePassword } from '../api/axios';
import './ChangePasswordModal.css';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form mỗi khi modal mở
  useEffect(() => {
    if (isOpen) {
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  // Đóng modal khi bấm Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return setError('Mật khẩu mới và xác nhận không khớp');
    }
    if (form.newPassword.length < 6) {
      return setError('Mật khẩu mới phải có ít nhất 6 ký tự');
    }
    setLoading(true);
    try {
      const res = await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      setSuccess(res.data.msg || 'Đổi mật khẩu thành công!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.msg || 'Lỗi khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cpw-overlay" onClick={onClose}>
      <div className="cpw-modal" onClick={e => e.stopPropagation()}>
        <button className="cpw-close" onClick={onClose} aria-label="Đóng">✕</button>

        <div className="cpw-header">
          <div className="cpw-icon">🔒</div>
          <h2>Đổi mật khẩu</h2>
          <p>Nhập mật khẩu hiện tại và mật khẩu mới của bạn</p>
        </div>

        {error && <div className="cpw-alert cpw-error">{error}</div>}
        {success && <div className="cpw-alert cpw-success">{success}</div>}

        <form onSubmit={handleSubmit} className="cpw-form">
          <div className="cpw-field">
            <label>Mật khẩu hiện tại</label>
            <input
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu hiện tại"
              required
              autoFocus
            />
          </div>
          <div className="cpw-field">
            <label>Mật khẩu mới</label>
            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Ít nhất 6 ký tự"
              required
            />
          </div>
          <div className="cpw-field">
            <label>Xác nhận mật khẩu mới</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>

          <div className="cpw-actions">
            <button type="button" className="cpw-btn-cancel" onClick={onClose}>Huỷ</button>
            <button type="submit" className="cpw-btn-submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : '🔑 Xác nhận đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
