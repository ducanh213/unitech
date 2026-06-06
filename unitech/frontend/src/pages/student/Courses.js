// src/pages/student/Courses.js
import { useState, useEffect } from 'react';
import {
  getPeriods,
  getCourses,
  getRegistrations,
  createRegistration,
  deleteRegistration
} from '../../api/axios';

export default function Courses() {
  const [periods, setPeriods]         = useState([]);
  const [courses, setCourses]         = useState([]);
  const [regs, setRegs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    (async () => {
      try {
        // 1. Lấy các đợt đang mở
        const p = await getPeriods();
        setPeriods(p.data);

        // 2. Nếu có ít nhất 1 đợt open mới fetch courses + regs
        if (p.data.length > 0) {
          const [cRes, rRes] = await Promise.all([
            getCourses(),
            getRegistrations()
          ]);
          setCourses(cRes.data);
          setRegs(rRes.data);
        } else {
          setError('Chưa có đợt đăng ký mở hoặc đã đóng.');
        }
      } catch (err) {
        setError(err.response?.data?.msg || 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRegister = async courseId => {
    await createRegistration({ course: courseId });
    // reload đăng ký
    const updated = await getRegistrations();
    setRegs(updated.data);
  };

  const handleCancel = async regId => {
    await deleteRegistration(regId);
    const updated = await getRegistrations();
    setRegs(updated.data);
  };

  if (loading) return <p>Đang tải...</p>;
  if (error)   return <p style={{ color:'red' }}>{error}</p>;

  return (
    <div>
      <h2>Danh sách Học phần</h2>
      <table>
        <thead>
          <tr>
            <th>Mã HP</th><th>Tên học phần</th><th>TC</th>
            <th>Phân loại</th><th>Áp dụng chuyên ngành</th>
            <th>Kỳ</th><th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => {
            const already = regs.some(r => r.course === course._id);
            return (
              <tr key={course._id}>
                <td>{course.code}</td>
                <td>{course.title}</td>
                <td>{course.credits}</td>
                <td><span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: course.isGeneral ? '#e0f2fe' : '#fef3c7', color: course.isGeneral ? '#0369a1' : '#b45309', fontWeight: 'bold', fontSize: '0.85em' }}>{course.isGeneral ? 'Đại cương' : 'Chuyên ngành'}</span></td>
                <td>
                  {course.majors.map(m=>m.code).join(', ')}
                </td>
                <td>{course.semesterOffered}</td>
                <td>
                  {already
                    ? <button onClick={()=>handleCancel(
                        regs.find(r=>r.course===course._id)._id
                      )}>Hủy</button>
                    : <button onClick={()=>handleRegister(course._id)}>Đăng ký</button>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
