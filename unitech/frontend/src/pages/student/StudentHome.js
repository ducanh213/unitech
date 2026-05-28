import React from 'react';

export default function StudentHome() {
  return (
    <div>
      <h2>Chào mừng đến với trang sinh viên</h2>
      <p>Chọn một mục bên trái để xem hồ sơ, đăng ký học, điểm số hoặc thời khóa biểu.</p>
      <div style={{ display: 'grid', gap: '18px', marginTop: '24px' }}>
        <div style={{ padding: '22px', borderRadius: '24px', background: '#fff', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.06)', border: '1px solid #e2e8f0' }}>
          <h3>Hồ sơ sinh viên</h3>
          <p>Xem thông tin cá nhân, lớp và email.</p>
        </div>
        <div style={{ padding: '22px', borderRadius: '24px', background: '#fff', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.06)', border: '1px solid #e2e8f0' }}>
          <h3>Đăng ký học</h3>
          <p>Chọn lớp mới hoặc quản lý đăng ký hiện tại.</p>
        </div>
        <div style={{ padding: '22px', borderRadius: '24px', background: '#fff', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.06)', border: '1px solid #e2e8f0' }}>
          <h3>Điểm số</h3>
          <p>Xem danh sách điểm và theo dõi kết quả học tập.</p>
        </div>
      </div>
    </div>
  );
}
