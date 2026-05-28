# ĐẶC TẢ CHI TIẾT CƠ SỞ DỮ LIỆU (DATABASE SCHEMA) - UNITECH

Hệ thống UniTech được thiết kế theo mô hình Cơ sở dữ liệu phi cấu trúc (NoSQL - MongoDB) nhưng vẫn đảm bảo tính toàn vẹn dữ liệu thông qua cơ chế tham chiếu (Reference). Dưới đây là đặc tả chi tiết của 9 Collection cốt lõi.

---

### 1. Collection: Users (Tài khoản & Xác thực)
| Trường | Kiểu dữ liệu | Vai trò | Mô tả |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | **PK** | Khóa chính duy nhất |
| `email` | String | Index | Email dùng để đăng nhập (Unique) |
| `password` | String | | Mật khẩu đã được băm (Bcrypt) |
| `role` | String | | Vai trò: admin, teacher, student |

### 2. Collection: Students (Hồ sơ Sinh viên)
| Trường | Kiểu dữ liệu | Vai trò | Mô tả |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | **PK** | Khóa chính |
| `user` | ObjectId | **FK** | Tham chiếu sang bảng Users |
| `studentId` | String | Index | Mã số sinh viên (Duy nhất) |
| `fullName` | String | | Họ và tên sinh viên |
| `major` | String | | Tên ngành học |
| `year` | Number | | Khóa học (Năm nhập học) |

### 3. Collection: Teachers (Hồ sơ Giảng viên)
| Trường | Kiểu dữ liệu | Vai trò | Mô tả |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | **PK** | Khóa chính |
| `user` | ObjectId | **FK** | Tham chiếu sang bảng Users |
| `teacherId` | String | Index | Mã giảng viên (Duy nhất) |
| `fullName` | String | | Họ và tên giảng viên |
| `department` | String | | Khoa/Bộ môn công tác |

### 4. Collection: Majors (Ngành đào tạo)
| Trường | Kiểu dữ liệu | Vai trò | Mô tả |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | **PK** | Khóa chính |
| `code` | String | | Mã ngành (Ví dụ: IT, KT...) |
| `name` | String | | Tên ngành đầy đủ |

### 5. Collection: Courses (Học phần/Môn học)
| Trường | Kiểu dữ liệu | Vai trò | Mô tả |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | **PK** | Khóa chính |
| `code` | String | Index | Mã học phần (Ví dụ: THDC01) |
| `title` | String | | Tên môn học |
| `credits` | Number | | Số tín chỉ của môn học |
| `prerequisites`| Array | **FK** | Mảng chứa các ID môn tiên quyết |

### 6. Collection: Classes (Lớp học phần thực tế)
| Trường | Kiểu dữ liệu | Vai trò | Mô tả |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | **PK** | Khóa chính |
| `classCode` | String | Index | Mã lớp (Ví dụ: L01, L02...) |
| `course` | ObjectId | **FK** | Tham chiếu bảng Courses |
| `teacher` | ObjectId | **FK** | Tham chiếu bảng Teachers |
| `room` | String | | Phòng học |
| `schedule` | String | | Lịch học (Thứ, Ca học) |

### 7. Collection: Periods (Học kỳ & Đợt đăng ký)
| Trường | Kiểu dữ liệu | Vai trò | Mô tả |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | **PK** | Khóa chính |
| `name` | String | | Tên đợt (Ví dụ: Học kỳ 1 2024) |
| `status` | String | | Trạng thái: open (đang mở) / closed |

### 8. Collection: Registrations (Đăng ký & Bảng điểm)
| Trường | Kiểu dữ liệu | Vai trò | Mô tả |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | **PK** | Khóa chính |
| `student` | ObjectId | **FK** | Tham chiếu bảng Students |
| `class` | ObjectId | **FK** | Tham chiếu bảng Classes |
| `period` | ObjectId | **FK** | Tham chiếu bảng Periods |
| `attendanceGrade`| Number | | Điểm chuyên cần (10%) |
| `midtermGrade` | Number | | Điểm giữa kỳ (30%) |
| `finalGrade` | Number | | Điểm cuối kỳ (60%) |
| `totalGrade` | Number | | Điểm tổng kết hệ 10 |

### 9. Collection: Notifications (Thông báo hệ thống)
| Trường | Kiểu dữ liệu | Vai trò | Mô tả |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | **PK** | Khóa chính |
| `title` | String | | Tiêu đề thông báo |
| `message` | String | | Nội dung thông báo chi tiết |
| `targets` | Array | | Đối tượng nhận (student, teacher...) |

---

## GIẢI THÍCH KIẾN TRÚC & TÍNH TOÀN VẸN DỮ LIỆU

1. **Khóa chính (PK - Primary Key):** Mỗi tài liệu trong MongoDB đều có một trường `_id` mặc định là duy nhất toàn cục. Điều này đảm bảo không có sự trùng lặp dữ liệu.
2. **Khóa ngoại (FK - Foreign Key):** Hệ thống sử dụng `ObjectId` để liên kết giữa các bảng. 
   - *Ví dụ:* Bảng `Registrations` là bảng trung gian phức tạp nhất, nó liên kết cùng lúc 3 bảng (`Student`, `Class`, `Period`). Điều này cho phép truy vấn: "Sinh viên X học lớp Y vào học kỳ Z đạt bao nhiêu điểm?" chỉ qua một bản ghi.
3. **Cơ chế Index (Chỉ mục):** Các trường như `email`, `studentId`, `classCode` được đánh Index để tối ưu tốc độ tìm kiếm. Thay vì quét toàn bộ dữ liệu (O(n)), hệ thống chỉ mất thời gian O(log n) để tìm ra bản ghi, giúp hệ thống không bị treo khi dữ liệu lên tới hàng chục nghìn sinh viên.
4. **Tính nhất quán:** Việc tách biệt `Users` và `Profiles` (Students/Teachers) giúp quản lý bảo mật tập trung. Khi một tài khoản bị khóa ở bảng `Users`, mọi quyền truy cập vào các bảng hồ sơ liên quan đều bị vô hiệu hóa ngay lập tức.
