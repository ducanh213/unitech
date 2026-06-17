# BÍ KÍP THAO TÁC FRONTEND & BẢO VỆ ĐỒ ÁN

Tài liệu này dùng để "cứu nguy" trong lúc bảo vệ đồ án. Nếu hội đồng yêu cầu sửa giao diện hoặc thao tác với dữ liệu, hãy bình tĩnh đọc kỹ các nguyên tắc dưới đây để biết chính xác cần mở file nào ra sửa.

---

## 1. NGUYÊN TẮC CỐT LÕI: PHÂN BIỆT "GIAO DIỆN" VÀ "DỮ LIỆU"

Để không bị bối rối khi thầy cô yêu cầu sửa chữa, bạn phải phân biệt được yêu cầu đó thuộc về "Vỏ bọc" hay "Ruột".

| Loại thay đổi | Cách nhận biết | Nơi cần sửa |
| :--- | :--- | :--- |
| **Sửa Giao diện (UI)** | Đổi chữ tiêu đề (VD: đổi "Quản lý Sinh viên" thành "Hồ sơ SV"), đổi màu nút bấm, thêm icon, đổi màu nền. Đây là các "chữ cứng" được cố định trên web. | Mở code VS Code -> Tìm file `.js` ở thư mục Frontend -> Sửa code -> Bấm `Ctrl + S` để trình duyệt tự tải lại. |
| **Sửa Dữ liệu (Data)** | Thay đổi thông tin bên trong bảng (VD: Sửa tên sinh viên, sửa điểm từ 5 lên 8, đổi số tín chỉ môn học từ 3 lên 4). | **TUYỆT ĐỐI KHÔNG SỬA TRONG CODE .JS**. Bạn phải thao tác trực tiếp trên giao diện trình duyệt (Bấm nút **Sửa** -> Nhập vào Form -> Lưu), hoặc dùng Script chạy từ Backend để chọc vào Database. |

---

## 2. QUY TẮC TÌM FILE GIAO DIỆN ADMIN (MAPPING RULE)

Toàn bộ màn hình của vai trò Quản trị viên (Admin) nằm tại một địa chỉ duy nhất:
👉 **Đường dẫn:** `frontend/src/pages/admin/`

Khi muốn sửa giao diện của một tab bất kỳ trên Menu Admin, bạn áp dụng công thức sau:
- Trang hiển thị dạng cái bảng: Tên Tiếng Anh + `List.js`
- Khung nhập liệu (khi ấn Thêm/Sửa): Tên Tiếng Anh + `Form.js`

### BẢNG TRA CỨU FILE ADMIN NHANH:

| Tên Menu (Trên Web) | Nhiệm vụ | File hiển thị giao diện |
| :--- | :--- | :--- |
| **Khung sườn Web** | Chứa menu bên trái và thanh Header bên trên | `Dashboard.js` |
| **🏠 Trang Chủ** | Các thẻ thống kê số lượng (Overview) | `Overview.js` |
| **👨‍🎓 Sinh viên** | Bảng danh sách Sinh viên<br>Form Thêm/Sửa Sinh viên | `StudentList.js`<br>`StudentForm.js` |
| **👩‍🏫 Giảng viên** | Bảng danh sách Giảng viên<br>Form Thêm/Sửa Giảng viên | `TeacherList.js`<br>`TeacherForm.js` |
| **📚 Ngành học** | Bảng danh sách Ngành học<br>Form Thêm/Sửa Ngành học | `MajorList.js`<br>`MajorForm.js` |
| **📖 Học phần** | Bảng danh sách Môn học<br>Form Thêm/Sửa Môn học | `CourseList.js`<br>`CourseForm.js` |
| **🏫 Lớp học** | Bảng danh sách Lớp học<br>Form Thêm/Sửa Lớp học | `ClassList.js`<br>`ClassForm.js` |
| **⏱️ Đợt đăng ký** | Bảng danh sách Đợt đăng ký<br>Form Thêm/Sửa Đợt đăng ký | `PeriodList.js`<br>`PeriodForm.js` |
| **📊 Báo cáo AI** | Màn hình biểu đồ Thống kê học lực | `AcademicReport.js` (Không có Form) |
| **👤 Tài khoản** | Đổi mật khẩu Admin | `AdminProfile.js` |

### BẢNG TRA CỨU FILE SINH VIÊN (STUDENT):
👉 **Đường dẫn:** `frontend/src/pages/student/`

| Tên Menu (Trên Web) | Nhiệm vụ | File hiển thị giao diện |
| :--- | :--- | :--- |
| **Khung sườn Web** | Chứa menu bên trái và thanh Header | `Dashboard.js` |
| **🏠 Trang Chủ** | Bảng điều khiển chính của Sinh viên | `StudentHome.js` |
| **📅 Thời khóa biểu** | Xem lịch học trong tuần | `Schedule.js` |
| **📝 Đăng ký HP** | Chức năng Đăng ký môn (Nơi hiển thị Emoji môn học) | `Register.js` |
| **📋 Lịch sử Đăng ký**| Xem các môn đã đăng ký thành công | `RegistrationList.js` |
| **📖 Chương trình** | Xem Cấu trúc khung chương trình đào tạo | `Courses.js` |
| **📊 Kết quả học tập**| Bảng điểm cá nhân & **Nút gọi AI Gợi ý môn** | `Grades.js` |
| **👤 Hồ sơ** | Thông tin cá nhân Sinh viên | `Profile.js` |

### BẢNG TRA CỨU FILE GIẢNG VIÊN (TEACHER):
👉 **Đường dẫn:** `frontend/src/pages/teacher/`

| Tên Menu (Trên Web) | Nhiệm vụ | File hiển thị giao diện |
| :--- | :--- | :--- |
| **Khung sườn Web** | Chứa menu bên trái và thanh Header | `Dashboard.js` |
| **🏫 Lớp hành chính** | Quản lý sinh viên lớp chủ nhiệm (nếu có) | `Classes.js` |
| **📅 Lịch giảng dạy** | Các lớp học phần được phân công dạy | `Schedule.js` |
| **Quản lý Điểm** | (Bấm từ Lịch giảng dạy vào) **Nơi Nhập điểm & Nhấn nút AI Cảnh báo** | `ClassGrades.js` |
| **👤 Hồ sơ** | Thông tin cá nhân Giảng viên | `TeacherInfo.js` |

---

## 3. CÁC BƯỚC "LIVE CODING" (SỬA CODE TRỰC TIẾP LÚC BẢO VỆ)

Nếu thầy cô muốn thử thách bạn bằng cách bắt sửa màu một cái nút hoặc đổi chữ ngay lập tức:
1. **Bình tĩnh xác định file:** Nhìn xem mình đang ở Tab nào (Ví dụ: Tab Học phần -> Nghĩ ngay đến `CourseList.js`).
2. **Tìm file trong VS Code:** Mở thư mục `frontend/src/pages/admin/` và click vào `CourseList.js`.
3. **Tìm đến đoạn code cần sửa:** Bấm `Ctrl + F` để tìm kiếm cái chữ hiện tại trên nút đó (Ví dụ gõ chữ "Thêm học phần").
4. **Thay đổi và Lưu:** Sửa chữ hoặc mã màu (style), sau đó ấn **`Ctrl + S`**.

---

## 4. BẢNG TRA CỨU NHANH 9 CONTROLLER BACKEND (CHỨC NĂNG CỐT LÕI)

Toàn bộ logic xử lý dữ liệu của hệ thống nằm tại: `backend/controllers/`. Dưới đây là chức năng của từng file và các hàm nhỏ bên trong nó:

### 🛡️ Nhóm 1: Xác thực & Báo cáo
1. **`authController.js` (Bảo vệ cửa):**
   - `login`: Nhận Email/Pass từ Frontend, dò trong DB, tạo vé thông hành (Token).
   - `forgotPassword` / `resetPassword`: Logic gửi mã OTP và ghi đè mật khẩu mới.

2. **`reportController.js` (Hệ chuyên gia AI - Thống kê):**
   - `getAcademicReport`: Hàm lõi của Admin. Móc toàn bộ điểm của toàn trường ra, dùng thuật toán Rule-based để tự động phân loại Sinh viên thành các nhóm: *Xuất sắc, Khá, Trung bình, Nguy cơ*.

### 👤 Nhóm 2: Con người & AI Machine Learning
3. **`studentController.js` (Quản lý Sinh viên):**
   - `create`, `update`, `remove`, `getAll`: Các hàm CRUD cơ bản để thao tác với DB `students`.
   - **`getRecommendation`**: Nút "Gợi ý AI". Đóng vai trò cầu nối, gửi dữ liệu điểm của SV sang cho Python (`ML/main.py`) để Python dự đoán môn học tiếp theo.

4. **`teacherController.js` (Quản lý Giảng viên):**
   - `create`, `update`, `remove`, `getAll`: Các hàm CRUD cơ bản của DB `teachers`.

### 📚 Nhóm 3: Khung Đào tạo
5. **`majorController.js` (Ngành học):**
   - `create`, `update`, `remove`: CRUD cho bảng Ngành (VD: Công nghệ thông tin, Kinh tế).

6. **`courseController.js` (Học phần/Môn học):**
   - `create`, `update`, `remove`: CRUD cho bảng Môn học (Kèm điều kiện tiên quyết và số tín chỉ).

### ⚙️ Nhóm 4: Vận hành học tập (Luồng phức tạp nhất)
7. **`periodController.js` (Đợt đăng ký):**
   - `create`, `update`, `remove`: Thêm/sửa/xóa đợt thời gian học.
   - `open` / `close`: Khóa/Mở đợt đăng ký cho sinh viên.

8. **`classController.js` (Lớp học - Nơi CÀI ĐẶT SĨ SỐ):**
   - `create` / `update`: Nơi Admin tạo Lớp học và cấu hình Sĩ số tối đa (`capacityMax`). Số 20 hay 50 nằm ở trong Database do hàm này lưu xuống, chứ không ghi cứng (hardcode) trong code. Nếu muốn nâng/giảm sĩ số, Admin lên giao diện sửa, hàm `update` này sẽ lưu số mới vào DB.
   - `getTeacherClasses`: Lọc ra những lớp mà Giảng viên đang đăng nhập được phân công dạy.
   - **`getAIRisk`**: Nút "AI Cảnh báo". Gửi điểm quá trình của sinh viên trong lớp sang Python để dự đoán tỷ lệ rớt môn.

9. **`registrationController.js` (Đăng ký - Nơi BẢO VỆ CỔNG / KIỂM TRA SĨ SỐ):**
   - `registerClass`: Khi SV bấm Đăng ký, hàm này làm bảo vệ. Nó đếm số người đã vào lớp (`currentEnrollment`), rồi lôi cái sĩ số tối đa từ DB ra (`cls.capacityMax`) để so sánh. Nếu đầy thì nó văng ra chữ "Lớp đã đầy (20/20 chỗ)". Nó cũng kiểm tra luôn môn Tiên quyết và Đợt học.
   - `cancelRegistration`: Sinh viên hủy môn (Rút tên khỏi lớp).
   - **`updateGrade`**: Giảng viên nhập điểm. Nhận điểm từ Giáo viên, tính toán Điểm trung bình và lưu đè vào hồ sơ của Sinh viên.
