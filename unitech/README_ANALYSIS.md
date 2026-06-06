# BẢN PHÂN TÍCH HỆ THỐNG VÀ CÔNG NGHỆ AI/ML (Dành cho việc ôn tập và bảo vệ đồ án)

Tài liệu này được soạn thảo nhằm giúp bạn nắm vững kiến trúc, luồng hoạt động và sự khác biệt về mặt công nghệ của từng tính năng trong hệ thống. Đây là những kiến thức "ghi điểm" khi hội đồng hỏi về logic xử lý và tính ứng dụng của dự án.

---

## PHẦN 1: PHÂN TÍCH 3 MODULE AI / HỌC MÁY ĐƯỢC CÁ NHÂN HÓA THEO VAI TRÒ

Hệ thống được thiết kế thông minh để mỗi vai trò (role) đều được hỗ trợ bởi một module phân tích dữ liệu riêng biệt, giải quyết đúng bài toán nghiệp vụ của họ.

### 1. Sinh Viên (Student) - HỆ CHUYÊN GIA (Expert System)
- **Công nghệ cốt lõi:** Rule-based AI (Thuật toán trí tuệ nhân tạo dựa trên tập luật) và cấu trúc dữ liệu Tech-tree (Cây môn học).
- **Mục đích:** Hỗ trợ sinh viên định hướng học tập qua tính năng **"Gợi ý lộ trình học tập"**.
- **Cách thức hoạt động:** 
  Hệ thống đóng vai trò như một cố vấn học tập ảo. Thuật toán sẽ quét lịch sử điểm số của sinh viên thông qua các câu lệnh điều kiện (If-Else) khắt khe:
  - **Ưu tiên 1 (Xử lý nợ môn):** Nếu sinh viên có môn nào rớt (điểm tổng kết < 4.0), hệ thống sẽ ưu tiên đề xuất học lại môn đó ngay lập tức.
  - **Ưu tiên 2 (Học tiếp):** Hệ thống chiếu lịch sử các môn đã qua vào "Cây môn học" để xem môn tiên quyết nào đã hoàn thành, từ đó mở khóa và đề xuất môn tiếp theo (Ví dụ: Qua "Nhập môn Lập trình" sẽ được gợi ý "Cấu trúc dữ liệu & Thuật toán").
  - Trả về tối đa 3 môn học tối ưu nhất cho học kỳ tiếp theo.

### 2. Quản Trị Viên (Admin) - HỌC MÁY (Machine Learning)
- **Công nghệ cốt lõi:** Thuật toán **Random Forest** (Học máy có giám sát - Supervised Learning).
- **Mục đích:** Dự báo nhu cầu đăng ký học phần, hỗ trợ ra quyết định mở lớp.
- **Cách thức hoạt động:**
  - Admin cần biết môn nào sẽ đông người đăng ký để phân bổ giảng viên và phòng học hợp lý.
  - Mô hình Random Forest đã được huấn luyện (train) dựa trên dữ liệu quá khứ. Các "đặc trưng" (features) đầu vào bao gồm: Số lượng sinh viên trượt môn này kỳ trước, Số sinh viên đã qua môn tiên quyết (chuẩn bị học môn này), và Tính chất môn học (Môn đại cương hay chuyên ngành).
  - Kết quả đầu ra (Output) là con số dự đoán chính xác lượng sinh viên sẽ đăng ký môn học đó, kèm theo gợi ý cụ thể về số lượng lớp học nên mở (giả sử mỗi lớp tối đa 40-50 sinh viên).

### 3. Giảng Viên (Teacher) - MODULE AI CẢNH BÁO (Heuristic AI)
- **Công nghệ cốt lõi:** Mô hình đánh giá rủi ro dựa trên trọng số (Heuristic/Rule-based Risk Prediction).
- **Mục đích:** Cảnh báo sớm nguy cơ trượt môn của sinh viên trong lớp học.
- **Cách thức hoạt động:**
  - Giảng viên không có thời gian xem xét kỹ điểm của từng sinh viên. Khi nhấn nút phân tích AI, hệ thống sẽ đẩy toàn bộ điểm thành phần (chuyên cần, giữa kỳ) sang Server AI (Python).
  - Thuật toán sẽ tính toán trước điểm dự kiến dựa trên tỷ trọng điểm quá trình.
  - Sau đó gán nhãn cảnh báo trực quan:
    - 🟢 **An toàn:** Tiến độ học tập tốt.
    - 🟡 **Cần chú ý:** Có nguy cơ nếu điểm thi cuối kỳ thấp.
    - 🔴 **Nguy cơ cao:** Khả năng rớt môn rất lớn, giảng viên cần can thiệp hoặc nhắc nhở sinh viên này ngay.

---

## PHẦN 2: PHÂN TÍCH CHỨC NĂNG CHI TIẾT CỦA 3 VAI TRÒ (ROLES)

Hệ thống tuân thủ chặt chẽ nguyên tắc Phân quyền truy cập (RBAC - Role-Based Access Control). Không ai có thể can thiệp vào nghiệp vụ của người khác.

### 1. Quản Trị Viên (Admin) - "Người Điều Hành Hệ Thống"
Admin nắm quyền kiểm soát cao nhất về mặt cấu trúc và dữ liệu nền tảng.
- **Quản lý danh mục cốt lõi:** Thêm, sửa, xóa các Ngành học, Khóa học (Môn học).
- **Quản lý tài khoản (Users):** Quản lý hồ sơ của toàn bộ Giảng viên và Sinh viên trong trường. Có quyền đặt lại mật khẩu hoặc tạo mới tài khoản.
- **Tổ chức Đào tạo:** 
  - Tạo các Đợt đăng ký tín chỉ (Mở/đóng cổng đăng ký).
  - Khởi tạo Lớp học (chọn Môn học, gán Giảng viên, chọn phòng học, thiết lập sĩ số tối đa/tối thiểu).
- **Phân tích dự báo (ML):** Sử dụng nút dự báo (Random Forest) để quyết định sẽ tạo bao nhiêu lớp cho một môn cụ thể.

### 2. Giảng Viên (Teacher) - "Người Triển Khai Giảng Dạy"
Teacher chỉ tương tác với dữ liệu liên quan trực tiếp đến mình.
- **Theo dõi lớp học:** Xem danh sách các lớp học phần mà mình được Admin phân công giảng dạy.
- **Theo dõi thời khóa biểu:** Xem lịch dạy theo phòng và thứ trong tuần.
- **Quản lý điểm số:** 
  - Xem danh sách sinh viên trong lớp của mình.
  - Nhập điểm thành phần (Chuyên cần, Giữa kỳ, Cuối kỳ) cho từng sinh viên. Hệ thống tự động tính điểm tổng kết.
- **Theo dõi rủi ro sinh viên:** Sử dụng Module AI cảnh báo để xem biểu đồ nguy cơ trượt môn của lớp, nhằm nâng cao chất lượng đào tạo.

### 3. Sinh Viên (Student) - "Người Sử Dụng Dịch Vụ"
Trải nghiệm của sinh viên tập trung vào việc đăng ký, học tập và tra cứu.
- **Đăng ký học phần:** Truy cập hệ thống trong thời gian mở đợt đăng ký, xem danh sách các lớp học còn trống chỗ để đăng ký (đảm bảo không bị trùng lịch học).
- **Tra cứu Thời khóa biểu:** Xem lịch học chi tiết của các lớp đã đăng ký thành công.
- **Xem điểm số:** Tra cứu bảng điểm của bản thân ở tất cả các học kỳ.
- **Nhận gợi ý từ Hệ chuyên gia:** Xem danh sách các môn học được AI đề xuất cho học kỳ tiếp theo dựa trên tình trạng hoàn thành môn học của bản thân.
- **Thông báo cá nhân:** Nhận các thông báo từ nhà trường.

---
## PHẦN 3: KỊCH BẢN DỮ LIỆU ĐỂ DEMO (SEEDING MOCK DATA)

Để chứng minh hệ thống hoạt động thực tế với lượng dữ liệu lớn mà không làm quá tải hoặc rác Database, dự án đã triển khai thuật toán sinh dữ liệu (Seeding) cực kỳ thông minh:

1. **Thuật toán rải đều Thời khóa biểu (Anti-Collision Algorithm):** 
   Đảm bảo toàn bộ 42 lớp học của 12 giảng viên và 150 sinh viên được tự động chèn vào 12 khung giờ tiêu chuẩn. Kết quả kiểm thử thực tế: **0 xung đột (Conflicts)**. Không có Giảng viên hay Sinh viên nào bị đè lịch nhau.
2. **Kịch bản Sinh viên VIP (Deep History):**
   Thay vì rải đều lịch sử dài ngoằng cho 150 sinh viên, hệ thống thiết kế riêng **10 sinh viên đầu tiên (VIP)** mang thân phận là "Sinh viên năm cuối có quá khứ bất hảo". 
   - 10 bạn này được sinh ngẫu nhiên điểm **Trượt (Dưới 5.0)** ở các học kỳ trước.
   - Ở kỳ hiện tại, họ vừa phải học môn mới, vừa phải **đăng ký học lại** (Tổng cộng 3-4 môn/kỳ).
   - Tác dụng: Cung cấp lượng Dữ liệu Sâu (Deep Data) để kích hoạt toàn bộ luồng logic của hệ thống AI. Khi AI quét thấy sinh viên này có môn từng rớt, nó sẽ tự động chặn môn cấp cao và ép gợi ý học lại môn rớt trước.
3. **140 Sinh viên Bình thường:**
   Để máy tính chạy mượt mà, 140 sinh viên còn lại chỉ đóng vai trò lấp đầy sĩ số, học 2 môn/kỳ và có điểm từ 6-10. Đây là thủ thuật "Diễn" (Presentation Mockup) cực kỳ thông minh trong kỹ thuật làm Đồ án Tốt nghiệp.

---
## PHẦN 4: SỰ ĐỒNG BỘ DỮ LIỆU VÀ DỰ BÁO AI THỜI GIAN THỰC (REAL-TIME INFERENCE)

Một trong những điểm ấn tượng nhất của hệ thống là khả năng **Cập nhật và Dự báo AI theo thời gian thực**.

**Kịch bản thực tế:** 
Nếu một sinh viên đang bị điểm kém (4.3 - Trượt), AI sẽ ngay lập tức yêu cầu sinh viên đó học lại. Tuy nhiên, nếu Giảng viên đăng nhập và sửa điểm của sinh viên đó lên 7.0 (Khá), thì ngay lập tức ở màn hình của Sinh viên, điểm số sẽ được cập nhật và khi bấm lại nút "Phân tích AI", hệ thống sẽ **quay xe**, cho phép sinh viên học tiếp môn Nâng cao mà không cần học lại nữa.

**Công nghệ đằng sau (Sử dụng gì để dự báo thời gian thực?):**
1. **Single Source of Truth (MongoDB):** Toàn bộ 3 Role (Admin, Teacher, Student) đều giao tiếp với một mô hình lõi duy nhất là `Registration` (Bản ghi đăng ký học phần). Không có sự lưu trữ rời rạc hay bộ nhớ đệm (cache) làm chậm trễ dữ liệu.
2. **RESTful API & Real-time AI Inference (FastAPI):** 
   - Thay vì AI chạy định kỳ (batch processing) như các hệ thống cũ, AI của UniTech hoạt động theo cơ chế **Inference on-demand (Dự báo theo yêu cầu)**.
   - Mỗi khi Sinh viên hoặc Giảng viên bấm nút "Phân tích", Backend Node.js sẽ truy vấn trực tiếp cơ sở dữ liệu MongoDB để lấy **trạng thái điểm số mới nhất tính đến từng giây**.
   - Dữ liệu này lập tức được bắn qua HTTP POST request sang Server Python (FastAPI). FastAPI nổi tiếng với tốc độ phản hồi cực cao, giúp mô hình Học máy và Hệ chuyên gia trả về kết quả ngay lập tức lên giao diện ReactJS.

Đây là minh chứng cho một hệ thống **Sống (Live System)**, dữ liệu được luân chuyển và AI đưa ra quyết định thay đổi ngay lập tức dựa trên hành vi của con người.

---
**Lời khuyên khi bảo vệ đồ án:** 
Khi hội đồng hỏi *"Dự án của em AI ở chỗ nào, có phải đem giao diện gắn chữ AI vào cho oai không?"*, hãy lấy nội dung ở **Phần 1** ra trả lời. Nhấn mạnh việc nhóm đã **chia nhỏ bài toán** ra làm 3 phần, áp dụng 3 kỹ thuật khác nhau (Expert System, Machine Learning, Heuristic) cho 3 đối tượng khác nhau. 

Khi hội đồng hỏi *"Dữ liệu ở đâu ra mà test?"*, hãy tự tin kể về kỹ thuật tạo **Dữ liệu mồi (Seeding)** có kịch bản VIP và thuật toán chống đụng giờ như ở **Phần 3**.

Khi hội đồng hỏi *"Hệ thống AI này chạy ngầm hay chạy như thế nào?"*, hãy trình bày kiến trúc **Real-time AI Inference** kết nối giữa Node.js, MongoDB và Python FastAPI như ở **Phần 4**. Đây là điểm sáng thể hiện tư duy thiết kế hệ thống cực kỳ thực tế và hiện đại!
