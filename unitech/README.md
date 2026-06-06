# Dự án UniTech - Hệ thống quản lý Đại học

Dự án này bao gồm hai phần: Backend (Node.js/Express) và Frontend (React.js). Dưới đây là hướng dẫn chi tiết cách chạy dự án và thông tin các tài khoản đã được thiết lập sẵn trong cơ sở dữ liệu.

## 🚀 Hướng dẫn chạy dự án

Bạn cần mở 2 terminal (cửa sổ dòng lệnh) riêng biệt để chạy Backend và Frontend song song.

### 1. Khởi động Backend
Mở terminal 1 và chạy các lệnh sau:
```bash
cd backend
npm install
npm run dev
```
*(Backend sẽ chạy ở cổng 5000: `http://localhost:5000`)*

### 2. Khởi động Frontend
Mở terminal 2 và chạy các lệnh sau:
```bash
cd frontend
npm install
npm start
```
*(Frontend sẽ chạy ở cổng 3000: `http://localhost:3000` và tự động mở lên trong trình duyệt)*

---

## 🔐 Thông tin Đăng nhập (Tài khoản mẫu)

Dữ liệu hệ thống đã được tự động tạo (seed) bao gồm **1 Quản trị viên**, **10 Giảng viên**, và **150 Sinh viên** (với rất nhiều dữ liệu lớp học, điểm số). Dưới đây là thông tin đăng nhập:

### 👑 Quản trị viên (Admin)
- **Số lượng:** 1 tài khoản
- **Email:** `admin1@gmail.com`
- **Mật khẩu:** `123456`
- **Chức năng chính:** Quản lý toàn bộ hệ thống (Sinh viên, Giảng viên, Ngành học, Học phần, Lớp học, Đợt đăng ký).

### 👨‍🏫 Giảng viên (Teacher)
- **Số lượng:** 10 tài khoản
- **Email:** `teacher1@gmail.com` đến `teacher10@gmail.com`
- **Mật khẩu chung:** `123456`
- **Ví dụ tài khoản cụ thể:**
  - Email: `teacher1@gmail.com` / Pass: `123456`
  - Email: `teacher5@gmail.com` / Pass: `123456`
- **Chức năng chính:** Xem thông tin cá nhân, danh sách lớp học được phân công và thời khóa biểu.

### 🎓 Sinh viên (Student)
- **Số lượng:** 150 tài khoản
- **Email:** `student1@gmail.com` đến `student150@gmail.com`
- **Mật khẩu chung:** `123456`
- **Ví dụ tài khoản cụ thể:**
  - Email: `student1@gmail.com` / Pass: `123456`
  - Email: `student75@gmail.com` / Pass: `123456`
  - Email: `student150@gmail.com` / Pass: `123456`
- **Chức năng chính:** Đăng ký học phần, xem thời khóa biểu, xem điểm số và thông tin cá nhân.

---
**Lưu ý:**
- Tại màn hình đăng nhập, bạn có thể nhập trực tiếp Email ở ô tài khoản.
- Đảm bảo cơ sở dữ liệu MongoDB đã được kết nối thông qua file `.env` ở phần backend trước khi khởi động.

---

## 🤖 Hướng dẫn chạy chức năng Dự báo AI (Machine Learning)

Hệ thống có tích hợp một mô hình AI bằng Python để dự báo nhu cầu mở lớp cho Học phần (dành cho Admin). Để tính năng này hoạt động, bạn cần khởi động Server AI song song với Backend Node.js.

### Bước 1: Di chuyển vào thư mục chứa code AI
```bash
cd ML
```

### Bước 2: Kích hoạt môi trường ảo (Virtual Environment)
*Với hệ điều hành Windows:*
```bash
.\venv\Scripts\activate
```

### Bước 3: Cài đặt thư viện và Khởi động Server AI
Cài đặt thư viện (nâng cấp pip trước và dùng `--prefer-binary` để tránh lỗi biên dịch):
```bash
python.exe -m pip install --upgrade pip
pip install --prefer-binary -r requirements.txt
```
Chạy file main để khởi động server AI:
```bash
python main.py
```

Sau khi Server Python chạy thành công ở cổng `8080`, bạn có thể vào trang **Admin Dashboard -> Quản lý Học phần** và bấm nút **🤖 Dự báo AI** để xem kết quả phân tích.
