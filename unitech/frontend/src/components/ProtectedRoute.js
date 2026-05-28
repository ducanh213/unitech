import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * roles: mảng các role được phép (vd: ['admin'], ['student'], ['teacher'])
 */
export default function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');
  const location = useLocation();

  // 2.1. Nếu chưa login thì redirect về /login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2.2. Nếu đã login nhưng role không nằm trong roles được cấp
  if (roles && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 2.3. Ngược lại, cho phép truy cập
  return children;
}
