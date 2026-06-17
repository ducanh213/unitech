import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourses, deleteCourse } from '../../api/axios';

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await getCourses();
      setCourses(res.data);
    } catch (err) {
      console.error('Không tải được danh sách học phần', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc muốn xóa học phần này?')) return;
    try {
      await deleteCourse(id);
      fetchCourses();
    } catch (err) {
      console.error('Xóa học phần thất bại', err);
    }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>Quản lý Học phần</h2>
        <button 
          onClick={() => navigate('new')} 
          style={{ 
            background: 'var(--primary)', color: 'white', border: 'none', 
            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
          }}
        >
          ✚ Thêm học phần
        </button>
      </div>

      <div className="main-content-card">
        <div className="table-scroll">
          <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse', borderColor: '#e2e8f0' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th>Code</th>
                <th>Tiêu đề</th>
                <th style={{ textAlign: 'center' }}>Tín chỉ</th>
                <th style={{ textAlign: 'center' }}>Th.uyết</th>
                <th style={{ textAlign: 'center' }}>Bài tập</th>
                <th style={{ textAlign: 'center' }}>Học kỳ</th>
                <th style={{ textAlign: 'center' }}>Phân loại</th>
                <th>Áp dụng cho ngành</th>
                <th>Điều kiện tiên quyết</th>
                <th style={{ textAlign: 'center' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c._id}>
                  <td>
                    <span style={{ 
                      background: '#f1f5f9', color: '#475569', 
                      padding: '3px 10px', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem'
                    }}>
                      {c.code}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: '#0f172a' }}>{c.title}</td>
                  <td style={{ textAlign: 'center', color: '#475569', fontWeight: 600 }}>{c.credits}</td>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>{c.theoryHours}</td>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>{c.practiceHours}</td>
                  <td style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>{c.semesterOffered || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', 
                      backgroundColor: c.isGeneral ? '#e0f2fe' : '#fef3c7', 
                      color: c.isGeneral ? '#0369a1' : '#b45309', 
                      fontWeight: 'bold', fontSize: '0.85em' 
                    }}>
                      {c.isGeneral ? 'Đại cương' : 'Chuyên ngành'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.9rem', color: '#475569' }}>
                    {Array.isArray(c.majors) && c.majors.length > 0 ? (
                      c.majors.map(m => m.name || m.code || m).join(', ')
                    ) : '—'}
                  </td>
                  <td style={{ fontSize: '0.9rem', color: '#475569' }}>
                    {Array.isArray(c.prerequisites) && c.prerequisites.length > 0 ? (
                      c.prerequisites.map(p => p.title || p.code || p).join(', ')
                    ) : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      <button onClick={() => navigate(`${c._id}/edit`)}>Sửa</button>
                      <button onClick={() => handleDelete(c._id)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}