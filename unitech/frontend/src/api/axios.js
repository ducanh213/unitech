// frontend/src/api/axios.js
import axios from "axios";
export const getStudentMe = () => {
  return instance.get("/students/me");
};
const instance = axios.create({
  baseURL: "http://localhost:5000/api", 
});


// tự động thêm bearer token
instance.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

export default instance;
// === Auth ===
export const login = (data) => instance.post("/auth/login", data);
export const register = (data) => instance.post("/auth/register", data);
export const forgotPassword = (data) => instance.post("/auth/forgot", data);
export const resetPassword = (data) => instance.post("/auth/reset", data);
export const updateMyProfile = (data) => instance.put("/auth/me", data);
export const changePassword = (data) => instance.put("/auth/me/password", data);

// === Students ===
export const getStudents = () => instance.get("/students");
export const getStudentById = (id) => instance.get(`/students/${id}`);
export const createStudent = (data) => instance.post("/students", data);
export const updateStudent = (id, data) =>
  instance.put(`/students/${id}`, data);
export const deleteStudent = (id) => instance.delete(`/students/${id}`);

// === Teachers ===
export const getTeachers = () => instance.get("/teachers");
export const getTeacherMe = () => instance.get("/teachers/me");
export const getTeacherById = (id) => instance.get(`/teachers/${id}`);
export const createTeacher = (data) => instance.post("/teachers", data);
export const updateTeacher = (id, data) =>
  instance.put(`/teachers/${id}`, data);
export const deleteTeacher = (id) => instance.delete(`/teachers/${id}`);

// === Majors ===
export const getMajors = () => instance.get("/majors");
export const getMajorById = (id) => instance.get(`/majors/${id}`);
export const createMajor = (data) => instance.post("/majors", data);
export const updateMajor = (id, data) => instance.put(`/majors/${id}`, data);
export const deleteMajor = (id) => instance.delete(`/majors/${id}`);

// === Courses ===
export const getCourses = () => instance.get("/courses");
export const getCourseById = (id) => instance.get(`/courses/${id}`);
export const createCourse = (data) => instance.post("/courses", data);
export const updateCourse = (id, data) => instance.put(`/courses/${id}`, data);
export const deleteCourse = (id) => instance.delete(`/courses/${id}`);

// === Classes ===
export const getClasses = () => instance.get("/classes");
export const getClassById = (id) => instance.get(`/classes/${id}`);
export const createClass = (data) => instance.post("/classes", data);
export const updateClass = (id, data) => instance.put(`/classes/${id}`, data);
export const deleteClass = (id) => instance.delete(`/classes/${id}`);
export const getClassStudents = (id) => instance.get(`/classes/${id}/students`);
export const updateStudentGrades = (classId, studentId, data) => instance.put(`/classes/${classId}/students/${studentId}/grades`, data);

// === Registration Periods ===
export const getRegistrations = () => instance.get("/registrations");
export const registerCourse = (data) => instance.post("/registrations", data);

// === Notifications ===
export const getNotifications = () => instance.get("/notifications");
export const createNotification = (data) => instance.post("/notifications", data);
export const deleteNotification = (id) => instance.delete(`/notifications/${id}`);
export const createRegistration = (data) =>
  instance.post("/registrations", data);
export const updateRegistration = (id, data) =>
  instance.put(`/registrations/${id}`, data);
export const deleteRegistration = (id) =>
  instance.delete(`/registrations/${id}`);

// === Periods ===
export const getPeriods = () => instance.get("/periods");
export const getPeriodById = (id) => instance.get(`/periods/${id}`);
export const createPeriod = (data) => instance.post("/periods", data);
export const updatePeriod = (id, data) => instance.put(`/periods/${id}`, data);
export const openPeriod = (id) => instance.patch(`/periods/${id}/open`);
export const closePeriod = (id) => instance.patch(`/periods/${id}/close`);
export const deletePeriod = (id) => instance.delete(`/periods/${id}`);

// === Reports (Admin AI) ===
export const getAcademicReport = () => instance.get('/reports/academic');
