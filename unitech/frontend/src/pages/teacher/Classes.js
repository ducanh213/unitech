// src/pages/teacher/Classes.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClasses } from '../../api/axios';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await getClasses();
        const sortedData = res.data.sort((a, b) => {
          const dateA = a.gradingPeriod ? new Date(a.gradingPeriod.startDate).getTime() : 0;
          const dateB = b.gradingPeriod ? new Date(b.gradingPeriod.startDate).getTime() : 0;
          return dateA - dateB;
        });
        setClasses(sortedData);
      } catch (err) {
        console.error('Lỗi khi tải lớp dạy:', err);
      }
    })();
  }, []);

  return (
    <div className="main-content-card">
      <h2>Danh sách Lớp dạy</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Mã lớp</th>
              <th>Mã HP</th>
              <th>Tên học phần</th>
              <th>Phòng</th>
              <th>Lịch học</th>
              <th style={{ textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {classes.length > 0 ? (
              classes.map(cls => (
                <tr key={cls._id}>
                  <td>
                    <span style={{
                      background: '#eff6ff', color: '#2563eb',
                      padding: '3px 10px', borderRadius: 8,
                      fontWeight: 700, fontSize: '0.88rem'
                    }}>
                      {cls.classCode}
                    </span>
                  </td>
                  <td style={{ color: '#64748b' }}>{cls.course?.code}</td>
                  <td style={{ fontWeight: 500, color: '#0f172a' }}>
                    {cls.course?.title}
                    {cls.gradingPeriod?.name && (
                      <span style={{
                        marginLeft: '8px', padding: '2px 8px',
                        background: '#e0e7ff', color: '#4338ca',
                        borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                        border: '1px solid #c7d2fe'
                      }}>
                        {cls.gradingPeriod.name}
                      </span>
                    )}
                  </td>
                  <td>{cls.room}</td>
                  <td>{cls.schedule}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => navigate(`/teacher/classes/${cls._id}/grades`)}
                    >
                      ✏️ Nhập điểm
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Chưa có lớp nào được phân công
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
