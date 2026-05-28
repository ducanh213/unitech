// src/pages/admin/CourseList.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getCourses, deleteCourse } from '../../api/axios';

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  

  const [aiResult, setAiResult] = useState(null); 
  const [isPredicting, setIsPredicting] = useState(false);

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

  // HÀM GỌI AI CHUẨN REACT
  const handleAIPredict = async (id) => {
    setIsPredicting(true);
    setAiResult(null); 

    try {

        const token = localStorage.getItem('token'); 


        const res = await axios.get(`http://localhost:5000/api/courses/${id}/ai-predict`, {
            headers: {
                'Authorization': `Bearer ${token}` 
            }
        });


        setAiResult(res.data);

    } catch (err) {
        console.error(err);
        alert("Lỗi khi gọi dự báo AI. Kiểm tra xem Node.js (5000) và Python (8000) đã chạy chưa, hoặc bạn có quyền Admin không.");
    } finally {
        setIsPredicting(false);
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
      <h2>Quản lý Học phần</h2>
      <button onClick={() => navigate('new')} style={{ marginBottom: '15px' }}>Thêm học phần</button>

      {/* VÙNG HIỂN THỊ KẾT QUẢ AI (Chỉ hiện khi có kết quả) */}
      {isPredicting && <p style={{ color: 'blue', fontStyle: 'italic' }}>Đang phân tích dữ liệu AI...</p>}
      
      {aiResult && (
        <div style={{ padding: '15px', marginBottom: '20px', backgroundColor: '#e9f7ef', borderLeft: '5px solid #28a745', borderRadius: '5px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>Kết quả dự báo (Môn: {aiResult.course_name})</h4>
            <ul style={{ margin: 0, color: '#155724' }}>
                <li>Số lượng sinh viên dự kiến đăng ký: <strong>{aiResult.predicted_students} SV</strong></li>
                <li>Khuyến nghị từ AI: <strong>Cần mở {aiResult.suggested_classes} lớp</strong></li>
            </ul>
            <button onClick={() => setAiResult(null)} style={{ marginTop: '10px', padding: '5px 10px', cursor: 'pointer' }}>Đóng</button>
        </div>
      )}

      <table
        border="1"
        cellPadding="5"
        style={{ marginTop: 10, width: '100%', borderCollapse: 'collapse' }}
      >
        <thead>
          <tr>
            <th>Code</th><th>Tiêu đề</th><th>Tín chỉ</th>
            <th>Th.uyết</th><th>Bài tập</th><th>Học kỳ</th>
            <th>Đại cương?</th>
            <th>Áp dụng cho Majors</th>
            <th>Prerequisites</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(c => (
            <tr key={c._id}>
              <td>{c.code}</td>
              <td>{c.title}</td>
              <td>{c.credits}</td>
              <td>{c.theoryHours}</td>
              <td>{c.practiceHours}</td>
              <td>{c.semesterOffered || '—'}</td>
              <td style={{ textAlign: 'center' }}>{c.isGeneral ? '✔︎' : '—'}</td>
              <td>
                {Array.isArray(c.majors) && c.majors.length > 0 ? (
                  c.majors.map(m => m.name || m.code || m).join(', ')
                ) : '—'}
              </td>
              <td>
                {Array.isArray(c.prerequisites) && c.prerequisites.length > 0 ? (
                  c.prerequisites.map(p => p.title || p.code || p).join(', ')
                ) : '—'}
              </td>
              <td>
                <button 
                  style={{ backgroundColor: '#17a2b8', color: 'white', marginRight: '5px', padding: '5px', border: 'none', borderRadius: '3px', cursor: 'pointer' }} 
                  onClick={() => handleAIPredict(c._id)}
                  disabled={isPredicting}
                >
                  🤖 Dự báo AI
                </button>
                <button onClick={() => navigate(`${c._id}/edit`)} style={{ marginRight: '5px' }}>Sửa</button>
                <button onClick={() => handleDelete(c._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}