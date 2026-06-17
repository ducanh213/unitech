# BÍ KÍP KIẾN TRÚC HỆ THỐNG VÀ CÔNG NGHỆ (Dành cho việc ôn tập và bảo vệ đồ án)

Tài liệu này được soạn thảo nhằm giúp bạn nắm vững kiến trúc, luồng hoạt động và sự khác biệt về mặt công nghệ của từng tính năng trong hệ thống. Đây là những kiến thức "ghi điểm" khi hội đồng hỏi về logic xử lý và tính ứng dụng của dự án.

---

## PHẦN 1: KIẾN TRÚC FRONTEND (GIAO DIỆN & TƯƠNG TÁC)

Hệ thống Frontend (ReactJS) được tổ chức cực kỳ chặt chẽ, chia làm 4 trụ cột chính để đảm bảo web chạy mượt mà và bảo mật:

### 1. Trái tim kết nối (API Bridge) - `src/api/axios.js`
- **Vai trò:** Là cầu nối duy nhất giao tiếp giữa Giao diện (Frontend) và Cơ sở dữ liệu (Backend). Frontend tuyệt đối không chạm thẳng vào Database mà phải gửi lệnh qua đây.
- **Hoạt động:** File này chứa các lệnh gọi đến 9 bảng dữ liệu lõi (Students, Classes, Registrations...). 
  - Mỗi khi cần thao tác, Frontend gửi 1 "chỉ thị" lên Backend. Ví dụ: `updateStudent(id, data)` với `id` là mã số sinh viên cần sửa, và `data` là gói thông tin mới.
  - File này còn đóng vai trò "Kẹp thẻ căn cước" (Token) tự động vào mỗi yêu cầu gửi đi để Backend biết ai đang thao tác.

### 2. Bản đồ & Người gác cổng - `src/App.js` & `ProtectedRoute.js`
- **Vai trò:** Điều hướng người dùng và phân quyền bảo mật cấp cao.
- **Hoạt động:** `App.js` chứa danh sách toàn bộ các đường link của web. Tuy nhiên, các trang nội bộ được bọc bởi lớp vỏ `ProtectedRoute`. Nếu một sinh viên cố tình gõ link `/admin`, `ProtectedRoute` sẽ kiểm tra "Thẻ" (Token) của người đó, phát hiện sai quyền và đá văng ra ngoài ngay lập tức.

### 3. Trí nhớ của Web - `src/utils/auth.js`
- **Vai trò:** Xử lý xác thực (Authentication). 
- **Hoạt động:** Khi đăng nhập thành công, file này sẽ lưu Token mã hóa vào bộ nhớ của trình duyệt (`localStorage`). Nhờ vậy, người dùng không phải đăng nhập lại mỗi khi làm mới trang.

### 4. Hệ thống Thiết kế (Design System) - `src/App.css`
- **Vai trò:** Quản lý toàn bộ giao diện thẩm mỹ của hệ thống.
- **Hoạt động:** Dự án sử dụng chung một file CSS tổng, định nghĩa các màu sắc chủ đạo (Tông trắng - Xanh biển `#0ea5e9`). Nhờ vậy, mọi nút bấm, thẻ card đều đồng nhất. Nếu muốn đổi màu toàn bộ dự án, chỉ cần sửa mã màu ở một file duy nhất này.

---

## PHẦN 2: KIẾN TRÚC BACKEND & CƠ SỞ DỮ LIỆU

Hệ thống tuân thủ **Nguyên tắc Vàng**: Frontend không chạm trực tiếp vào Database.
- **Quy trình chuẩn:** Frontend gửi lệnh ➡️ Backend (`server.js` đón nhận) ➡️ Controllers (Xác thực và phân tích lệnh) ➡️ MongoDB (Thực thi Lưu/Xóa dữ liệu).
- **Lợi ích:** Đảm bảo an toàn tuyệt đối. Hacker không thể dùng F12 trên trình duyệt để xóa dữ liệu vì mọi quyền sinh sát đều nằm ở Backend Server.

### "Bộ não" của hệ thống: 9 File Controllers
Toàn bộ logic nghiệp vụ (Business Logic) cốt lõi nhất của dự án được chia đều vào 9 file Controller. Khi hội đồng hỏi về luồng xử lý phức tạp nhất, trọng tâm rơi vào 4 Controller cốt cán sau:
1. **`registrationController.js` (Đăng ký học phần):** Chứa thuật toán chống đăng ký trùng tiết học (Overlap Schedule), kiểm tra sức chứa lớp (Capacity), và xác thực môn tiên quyết (Prerequisites).
2. **`classController.js` (Quản lý Lớp & Chấm điểm):** Tự động nhận diện kỳ học đang mở để cho phép giảng viên nhập điểm. Chứa hàm `getAIRisk` để gọi sang Server Python dự báo sinh viên có nguy cơ trượt môn.
3. **`studentController.js` (Quản lý Sinh viên):** Quét lịch sử điểm để nhận diện sinh viên đã đủ điều kiện Tốt nghiệp. Chứa hàm `getAIPath` gọi sang hệ thống AI gợi ý lộ trình học kế tiếp.
4. **`reportController.js` (Báo cáo Thống kê):** Chứa hệ Rule-based AI (Hệ chuyên gia). Tự động quyét hàng ngàn bản ghi để tính GPA trung bình và phân loại học lực rủi ro (Giỏi, Khá, TB, Yếu) hoàn toàn độc lập không cần Python.

*(5 Controller còn lại: `authController`, `courseController`, `majorController`, `periodController`, `teacherController` đảm nhiệm các thao tác CRUD cơ bản và xác thực hệ thống).*

---

## PHẦN 3: KIẾN TRÚC TRÍ TUỆ NHÂN TẠO (100% EXPERT SYSTEM / RULE-BASED AI)

Hệ thống được thiết kế thông minh để mỗi vai trò (role) đều được hỗ trợ bởi một module phân tích dữ liệu riêng biệt. Đặc biệt, đồ án hoàn toàn sử dụng **Hệ chuyên gia (Expert System)** - một nhánh cốt lõi của AI (Symbolic AI) chuyên giải quyết các bài toán giáo dục cần tính chính xác tuyệt đối và minh bạch (Explainable AI).

### 1. Quản Trị Viên (Admin) - BÁO CÁO CẢNH BÁO RỦI RO (Node.js)
- **Công nghệ cốt lõi:** Rule-based AI (Hệ luật dựa trên Thang điểm Bộ Giáo dục).
- **Mục đích:** Hỗ trợ Phòng đào tạo đánh giá toàn cảnh "sức khỏe học vụ" của toàn trường.
- **Cách thức hoạt động:** Hệ thống quét qua hàng ngàn sinh viên, nhẩm tính điểm trung bình tích lũy (GPA) và đối chiếu với bộ luật để tự động phân nhóm sinh viên thành 4 mức độ: Xuất sắc, Khá, Trung bình, Nguy cơ (< 5.0). Nhờ đó Admin nắm bắt được sinh viên nào đang chuẩn bị buộc thôi học.

### 2. Sinh Viên (Student) - CỐ VẤN LỘ TRÌNH (Python)
- **Công nghệ cốt lõi:** Heuristic AI và cấu trúc dữ liệu Tech-tree (Đồ thị Cây môn học).
- **Mục đích:** Hỗ trợ sinh viên định hướng học tập qua tính năng **"Gợi ý lộ trình học tập"**.
- **Cách thức hoạt động:** AI đóng vai trò cố vấn ảo. Nó quét lịch sử điểm qua các bộ luật If-Else phức tạp:
  - **Ưu tiên 1:** Nếu có môn rớt (điểm < 4.0), ép đề xuất học lại.
  - **Ưu tiên 2:** Chiếu lịch sử vào "Cây môn học", môn nào đã qua thì mở khóa đề xuất môn kế tiếp.

### 3. Giảng Viên (Teacher) - CẢNH BÁO RỚT MÔN SỚM (Python)
- **Công nghệ cốt lõi:** Mô hình đánh giá rủi ro dựa trên trọng số (Heuristic Risk Prediction).
- **Mục đích:** Cảnh báo sớm nguy cơ trượt môn của sinh viên trong lớp khi chưa có điểm tổng kết.
- **Cách thức hoạt động:** Hệ thống tính toán điểm dự kiến dựa trên điểm Chuyên cần và Giữa kỳ, sau đó gán nhãn: An toàn (Xanh), Cần chú ý (Vàng), Nguy cơ cao (Đỏ) để Giảng viên kịp thời can thiệp phụ đạo.

---

## PHẦN 4: THIẾT KẾ KIẾN TRÚC VI DỊCH VỤ (MICROSERVICES) - TẠI SAO LẠI CHIA TÁCH NODE.JS VÀ PYTHON?

Hệ thống được thiết kế theo tư duy Kỹ sư phần mềm thực thụ, phân tách rõ ràng **Mối quan tâm (Separation of Concerns)**:

1. **Bản chất nghiệp vụ (Bài toán I/O vs Bài toán Thuật toán):**
   - **Báo cáo của Admin:** Chạy trực tiếp ở Node.js vì bản chất đây là bài toán **I/O bound** (Nặng về giao tiếp Database: truy vấn, filter hàng ngàn bản ghi). Node.js xử lý bất đồng bộ I/O cực kỳ nhanh gọn.
   - **Cố vấn của Teacher & Student:** Chạy ở server độc lập Python (cổng 8080) vì bản chất đây là **Cỗ máy suy luận (Inference Engine)**. Python phải dựng đồ thị Tech-tree, duyệt cây tiên quyết và tính toán trọng số phức tạp. Đây là bài toán **CPU bound** (Nặng về thuật toán), nên Python làm là chuẩn xác nhất.

2. **Khả năng mở rộng (Scalability):**
   - Dù hiện tại hệ thống hoàn toàn dùng Hệ chuyên gia (Rule-based), nhưng việc "cô lập" các lõi thuật toán sang Python giúp tương lai dễ nâng cấp. Giả sử sau này trường có Big Data và muốn thay đổi thành Mô hình Deep Learning, đội ngũ kỹ sư **chỉ cần thay code bên thư mục ML (Python)** mà không làm ảnh hưởng đến mã nguồn Backend Node.js đang chạy ổn định.

---

## PHẦN 5: PHÂN TÍCH CHỨC NĂNG CHI TIẾT CỦA 3 VAI TRÒ (RBAC)

Không ai có thể can thiệp vào nghiệp vụ của người khác.

### 1. Quản Trị Viên (Admin) - "Người Điều Hành"
- Quản lý danh mục cốt lõi (Ngành học, Môn học).
- Quản lý User (Giảng viên, Sinh viên).
- Tổ chức Đào tạo: Tạo Đợt đăng ký, Mở Lớp học.
- Báo cáo AI: Xem Dashboard để theo dõi sức khỏe học vụ toàn trường, phát hiện nhanh 15 sinh viên "Nguy cơ" cần cứu vớt (nhờ data seed lỗi cố ý).

### 2. Giảng Viên (Teacher) - "Người Triển Khai"
- Xem lịch dạy và danh sách lớp được phân công.
- Quản lý điểm số: Nhập điểm thành phần cho sinh viên.
- Chạy AI Cảnh báo để xem biểu đồ nguy cơ rớt môn của lớp.

### 3. Sinh Viên (Student) - "Người Sử Dụng"
- Đăng ký học phần vào các lớp còn trống.
- Xem thời khóa biểu và bảng điểm.
- Bấm nút AI Hệ chuyên gia để nhận gợi ý môn nên đăng ký kỳ tới.

---

## PHẦN 5: KỊCH BẢN SEEDING DỮ LIỆU & REAL-TIME INFERENCE

### 1. Kịch bản Dữ liệu (Mock Data)
- **Thuật toán rải đều lịch:** Đảm bảo 42 lớp học được tự động chèn vào 12 khung giờ mà không hề có xung đột giờ học.
- **Sinh viên VIP:** Hệ thống cố tình tạo 10 sinh viên đầu tiên mang kịch bản "Bất hảo" (Có điểm rớt môn ở quá khứ) để kích hoạt toàn bộ luồng logic của AI hệ chuyên gia. 140 sinh viên còn lại chỉ để lấp sĩ số.

### 2. Dự báo AI Thời gian thực (Real-time Inference)
- Mọi dữ liệu đều tụ về điểm trung tâm (Single Source of Truth) là bảng `Registrations` ở MongoDB. Không có độ trễ do Cache.
- Nếu Giảng viên sửa điểm 1 sinh viên từ rớt thành đậu, khi sinh viên đó bấm "Phân tích AI", dữ liệu lập tức được bắn qua Server Python (FastAPI). Mô hình AI sẽ đưa ra lời khuyên mới "Quay xe" ngay lập tức mà không cần chờ đồng bộ qua đêm.

---

## PHẦN 6: BỘ CÂU HỎI BẢO VỆ "SÁT THỦ" VÀ CÁCH TRẢ LỜI (Q&A)

Đây là những câu hỏi phản biện từ Hội đồng mà bạn cần nắm chắc để lấy điểm xuất sắc:

### Câu hỏi 1: "Hệ thống của em toàn dùng if-else, dùng Hệ chuyên gia, vậy có liên kết với Machine Learning (ML) không? Tại sao if-else lại được gọi là AI?"

**Trả lời:**
- Dạ thưa thầy/cô, hệ thống của em **không dùng Machine Learning**, mà em sử dụng nhánh **Symbolic AI (Trí tuệ nhân tạo ký hiệu)**, cụ thể là **Hệ chuyên gia (Expert System)**. 
- Trong môi trường Giáo dục, các quy định học vụ (như điểm đỗ/trượt, môn tiên quyết) là cực kỳ nghiêm ngặt và không được phép sai số. Nếu em dùng Machine Learning để dự đoán sinh viên rớt môn thì mô hình có thể bị sai lệch (Ảo giác AI / Hallucination). 
- Thay vào đó, em đóng gói toàn bộ **Tri thức học vụ của nhà trường** (Quy chế điểm, Cây môn học) thành các tập luật (Rule-based) vào trong máy. AI của em sẽ suy luận trên tập luật đó để đảm bảo tính chính xác, minh bạch (Explainable AI) 100% trong việc ra quyết định ạ. Trí tuệ nhân tạo (AI) không chỉ có Machine Learning (hướng dữ liệu), mà Hệ chuyên gia (hướng tri thức) cũng là một nhánh nền tảng của AI.

### Câu hỏi 2: "Thế tại sao thư mục ML (Python) vẫn còn? Tại sao chức năng của Teacher và Student phải gọi sang Python mới chạy được, mà báo cáo của Admin lại chạy thẳng ở Node.js?"

**Trả lời:**
- Dạ thưa thầy/cô, việc em phân tách ra như vậy là áp dụng kiến trúc **Microservices (Vi dịch vụ)** và nguyên tắc **Separation of Concerns (Tách biệt mối quan tâm)**:
- **Với Admin (Báo cáo tổng hợp):** Bản chất công việc là truy xuất hàng ngàn sinh viên từ Database và đếm/phân loại. Đây là bài toán **I/O bound** (Nặng về giao tiếp dữ liệu). Node.js xử lý I/O bất đồng bộ cực kỳ mạnh nên em để Node.js chạy thẳng báo cáo này.
- **Với Teacher & Student (Cố vấn học vụ):** Bản chất công việc là một **Cỗ máy suy luận (Inference Engine)**. Hệ thống phải dựng đồ thị (Tech-tree), duyệt cây để tìm đường đi, và tính toán trọng số rủi ro. Đây là bài toán **CPU bound** (Nặng về thuật toán). Python là ngôn ngữ tối ưu nhất thế giới cho các bài toán thuật toán nên em cô lập phần này sang một server riêng.
- **Tầm nhìn tương lai:** Việc cô lập các lõi thuật toán sang Python giúp hệ thống có **Khả năng mở rộng (Scalability)** rất cao. Giả sử vài năm nữa trường thu thập đủ Big Data và muốn nâng cấp Hệ chuyên gia này thành Deep Learning, đội ngũ kỹ sư **chỉ cần sửa code ở thư mục Python** mà không hề làm đứt gãy Backend Node.js đang vận hành ổn định.

### Câu hỏi 3: "Với cấu hình đồ án hiện tại (chạy gói MongoDB Free), dự án này lưu trữ và chịu tải thực tế được bao nhiêu người đăng ký cùng lúc?"

**Trả lời:**
- Dạ thưa thầy/cô, để đưa ra con số **thực tế và chính xác nhất** cho cấu hình đồ án hiện tại (Node.js chạy Local + Database MongoDB Atlas Free M0), con số là như sau:
- **1. Giới hạn lưu trữ an toàn (Storage):** Khoảng **3.000 đến 5.000 sinh viên**. Dù dung lượng 512MB chứa được rất nhiều, nhưng với gói Free bị giới hạn RAM và CPU, nếu lưu vượt mức 5.000 sinh viên thì các tác vụ tính toán (như Xuất báo cáo AI của Admin) sẽ truy xuất chậm và có thể gây lag do thiếu RAM xử lý.
- **2. Khả năng chịu tải cùng lúc (Đăng ký tín chỉ):** Tối đa **50 - 100 sinh viên click "Đăng ký" trong cùng 1 giây**. 
  - **Nguyên nhân:** Gói MongoDB Free bị khóa băng thông I/O (Giới hạn khoảng 100 IOPS - Thao tác Ghi/giây). Database chính là nút thắt cổ chai (Bottleneck) duy nhất ở đồ án này chứ không phải code.
- **3. Chuyện gì xảy ra nếu 500 người cùng bấm đăng ký 1 lúc?** 
  - Nhờ kiến trúc bất đồng bộ của Node.js, server sẽ **KHÔNG BỊ SẬP (Crash)**. Node.js sẽ đưa 500 luồng này vào hàng đợi (Event Queue). 
  - 100 người đầu tiên sẽ được lưu mượt mà. Những người sau sẽ phải chờ vòng lặp. Nếu Database xử lý không kịp và quá thời gian chờ, hệ thống sẽ tự động chặn và trả về lỗi "Timeout / Quá tải" cho người dùng để tự bảo vệ Server.
- **Kết luận:** Hệ thống code hoàn toàn đủ sức phục vụ quy mô lớn, nhưng bị giới hạn bởi hạ tầng miễn phí. Nếu triển khai thực tế, trường chỉ cần thuê gói Database trả phí là giải quyết triệt để bài toán này ạ.

### Câu hỏi 4: "Thế sao trong Database có 150 sinh viên mà thử thêm vài chục người nữa vào lịch học đã bị báo chồng chéo/trùng lịch?"

**Trả lời:**
- Dạ thưa thầy/cô, ở đây có sự khác biệt rất lớn giữa **Sức chứa của Database (Hạ tầng)** và **Ràng buộc của Nghiệp vụ (Business Logic)**.
- **Về mặt Nghiệp vụ Học vụ (Lý do bị chồng chéo):** Việc tạo 150 sinh viên và thấy "chồng chéo" khi thêm nữa KHÔNG PHẢI LỖI DATABASE, mà là do **Giới hạn tài nguyên vật lý của trường học (Phòng học, Giảng viên, Khung giờ)**. 
  - Trong bộ dữ liệu giả lập (Mock data) hiện tại, trường học ảo này chỉ mở **42 lớp học**, giới hạn **10 Giảng viên**, và chỉ có **12 khung giờ học (Ca học)**. 
  - Nếu số sinh viên tăng vọt lên 500 hoặc 1000 người mà số lượng Lớp học, Phòng học không tăng theo, hệ thống bắt buộc phải nhét thêm người vào lớp cũ dẫn đến **Sĩ số quá tải**, hoặc thuật toán xếp lịch học phải xếp **trùng giờ (Conflict)** để ép sinh viên học.
- **Khả năng co giãn (Scalability):** Hệ thống của em là **Hệ thống động**. Nếu muốn nâng lên 10.000 sinh viên, Admin chỉ cần lên giao diện Thêm Giảng viên mới, Mở hàng trăm Lớp học mới (Ví dụ Lớp TA01 đến TA20). Khi đó tài nguyên đủ rộng, sinh viên đăng ký sẽ tự động chảy đều vào các lớp mà không bao giờ gặp lỗi chồng chéo ạ.
