// src/utils/auth.js
import { jwtDecode } from 'jwt-decode';

/** Giải mã token, trả về payload (chứa id, username, role…) */
export function getUserFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

/** Xoá info khỏi localStorage và chuyển về login */
export function doLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = '/login';
}
