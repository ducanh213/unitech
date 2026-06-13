// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized   from './pages/Unauthorized';

// Auth
import Login            from './pages/Auth/Login';
import AuthRegister     from './pages/Auth/Register';      // đổi tên import
import ForgotPassword   from './pages/Auth/ForgotPassword';
import ResetPassword    from './pages/Auth/ResetPassword';

// Admin
import AdminDashboard   from './pages/admin/Dashboard';
import Overview         from './pages/admin/Overview';
import AdminProfile     from './pages/admin/AdminProfile';
import StudentList      from './pages/admin/StudentList';
import StudentForm      from './pages/admin/StudentForm';
import TeacherList      from './pages/admin/TeacherList';
import TeacherForm      from './pages/admin/TeacherForm';
import MajorList        from './pages/admin/MajorList';
import MajorForm        from './pages/admin/MajorForm';
import CourseList       from './pages/admin/CourseList';
import CourseForm       from './pages/admin/CourseForm';
import ClassList        from './pages/admin/ClassList';
import ClassForm        from './pages/admin/ClassForm';
import PeriodList       from './pages/admin/PeriodList';
import PeriodForm       from './pages/admin/PeriodForm';
import AcademicReport  from './pages/admin/AcademicReport';

// Student
import StudentDashboard  from './pages/student/Dashboard';
import Profile           from './pages/student/Profile';
import StudentHome       from './pages/student/StudentHome';
import Courses           from './pages/student/Courses';
import Register       from './pages/student/Register';
import StudentSchedule   from './pages/student/Schedule';
import RegistrationList from './pages/student/RegistrationList';
import Grades            from './pages/student/Grades';

// Teacher
import TeacherDashboard from './pages/teacher/Dashboard';
import Classes          from './pages/teacher/Classes';
import ClassGrades      from './pages/teacher/ClassGrades';
import Schedule         from './pages/teacher/Schedule';
import TeacherInfo      from './pages/teacher/TeacherInfo';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<AuthRegister />} />
        <Route path="/forgot"   element={<ForgotPassword />} />
        <Route path="/reset"    element={<ResetPassword />} />

        {/* UNAUTHORIZED */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="students"      element={<StudentList  />} />
          <Route path="students/new"  element={<StudentForm  />} />
          <Route path="students/:id/edit" element={<StudentForm />} />
          <Route path="teachers"      element={<TeacherList  />} />
          <Route path="teachers/new"  element={<TeacherForm  />} />
          <Route path="teachers/:id/edit" element={<TeacherForm />} />
          <Route path="majors"        element={<MajorList    />} />
          <Route path="majors/new"    element={<MajorForm    />} />
          <Route path="majors/:id/edit" element={<MajorForm  />} />
          <Route path="courses"       element={<CourseList   />} />
          <Route path="courses/new"   element={<CourseForm   />} />
          <Route path="courses/:id/edit" element={<CourseForm />} />
          <Route path="classes"       element={<ClassList    />} />
          <Route path="classes/new"   element={<ClassForm    />} />
          <Route path="classes/:id/edit" element={<ClassForm  />} />
          <Route path="periods"       element={<PeriodList   />} />
          <Route path="periods/new"   element={<PeriodForm   />} />
          <Route path="periods/:id/edit" element={<PeriodForm />} />
          <Route path="profile"       element={<AdminProfile />} />
          <Route path="report"        element={<AcademicReport />} />
        </Route>

        {/* STUDENT */}
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="courses" element={<Courses />} />
          <Route path="registrations" element={<RegistrationList />} />
          <Route path="register" element={<Register/>} />
          <Route path="schedule" element={<StudentSchedule />} />
          <Route path="grades" element={<Grades />} />
        </Route>

        {/* TEACHER */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Classes />} />
          <Route path="classes/:classId/grades" element={<ClassGrades />} />
          <Route path="info" element={<TeacherInfo />} />
          <Route path="schedule" element={<Schedule />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
