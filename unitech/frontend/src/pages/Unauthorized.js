import { Link } from 'react-router-dom';
export default function Unauthorized() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>403 – Bạn không có quyền truy cập trang này</h2>
      <p>
        <Link to="/">Quay về trang chính</Link>
      </p>
    </div>
  );
}
