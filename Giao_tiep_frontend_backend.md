# Giao Tiếp Frontend & Backend Theo Từng Chức Năng Cụ Thể

Tài liệu này mô tả chi tiết luồng giao tiếp giữa Frontend và Backend cho từng Module/Chức năng cốt lõi của dự án Manga B2B.

---

## 1. Chức Năng Đăng Nhập & Phân Quyền (Auth)
- **Frontend Gửi (Request):** Người dùng nhập form ở `LoginForm.tsx`. Dữ liệu `{ identifier, password }` được `auth.api.ts` gửi `POST` đến `/api/auth/login`.
- **Backend Xử lý:** `AuthController` tiếp nhận, `AuthService` tiến hành query Database và so khớp mật khẩu bằng thư viện BCrypt. Nếu đúng, `ITokenService` sinh ra mã JWT chứa `UserId` và `Role`.
- **Frontend Nhận:** Frontend nhận lại chuỗi token từ response. Lớp Logic sẽ trích xuất Role để chuẩn hóa (ví dụ "System Admin" -> "Admin"). Lưu Token và User Info vào `authStore` (Zustand) để duy trì phiên đăng nhập (tính năng persist localStorage).
- **Điều hướng:** Component `RoleGuard` tự động kiểm tra token/role để cấp quyền truy cập vào các giao diện tương ứng (Mangaka, Editor, Board...).

## 2. Quản Lý Truyện & Bản Thảo (Series & Manuscripts)
- **Frontend Gửi (Request):** Từ các trang như `SeriesDetailFeature.tsx` hoặc `ManuscriptsFeature.tsx`, Frontend dùng **React Query** gọi các hàm trong `seriesApi.ts` (`GET /api/series`, `GET /api/series/{id}/chapters`).
- **Backend Xử lý:** `SeriesController` nhận request. Kết nối Entity Framework để lấy danh sách Series, Chapter, đính kèm các số liệu thống kê (views, total pages...).
- **Frontend Nhận:** React Query nhận Data và lưu vào Cache. Giao diện render lại ngay lập tức. Khi người dùng tạo truyện mới, Frontend gọi hàm Invalidate Cache để tự động fetch lại bản cập nhật mới nhất.

## 3. Quản Lý Phân Công Công Việc (Task Management)
- **Frontend Gửi (Request):** Tác giả khoanh vùng trên Canvas và điền form phân công việc cho Trợ lý. Component `CreateTaskModal.tsx` gọi hàm `taskApi.createTask(...)`.
- **Backend Xử lý (Nghiệp vụ cốt lõi):** CRITICAL: Khi tạo Task, Backend không chỉ lưu Task vào DB, mà hệ thống Wallet còn tự động **Lock một khoản tiền** (Trừ `SetupFundBalance` ưu tiên, nếu thiếu sẽ trừ tiếp `WithdrawableBalance`). Giao dịch được bọc trong DB Transaction (ACID).
- **Frontend Nhận:** Nhận thông báo "Tạo Task thành công". UI cập nhật ngay danh sách Task. Đồng thời con số số dư ví của tác giả hiển thị trên màn hình bị giảm xuống tương ứng với phần tiền vừa Lock.

## 4. Quản Lý Ví & Thanh Toán (Wallet)
- **Frontend Gửi (Request):** Trợ lý/Tác giả yêu cầu Nạp tiền qua hệ thống VNPay, hoặc yêu cầu Rút tiền nội bộ trên trang Wallet thông qua `wallet.api.ts`.
- **Backend Xử lý:** 
  - Đảm bảo **KHÔNG CÓ SỐ DƯ ÂM**.
  - Khi Unlock (hoàn tiền) hoặc Transfer (chuyển tiền): Backend bắt buộc đọc Transaction Lock gốc để hoàn trả/chuyển chính xác vào đúng 2 ngăn quỹ (`SetupFund` và `Withdrawable`).
  - Nếu là Nạp tiền: Backend tạo URL thanh toán VNPay kèm chuỗi Checksum Signature bảo mật.
- **Frontend Nhận:** Nếu là nạp tiền, Frontend nhận URL VNPay và Redirect trình duyệt. Nếu là ví nội bộ, React Query cập nhật con số tiền hiển thị. Hệ thống SignalR sẽ gửi Toast Notification "Tiền đã vào ví".

## 5. Bảng Vẽ & Kiểm Duyệt Bản Thảo (Canvas & Review)
- **Frontend Gửi (Request):** Tác giả hoặc Biên tập viên (Editor) thao tác trên `CanvasViewer` (Thư viện Fabric.js). Các tọa độ khoanh vùng `{x, y, width, height}` của trợ lý, hoặc các ghim lỗi QC của Editor (Annotation: 🔴 Technical, 🟡 Art, 🔵 Content) được đóng gói và gửi qua `canvas.api.ts`.
- **Backend Xử lý:** Lưu trữ tọa độ vào Database. Nếu hệ thống nhận thấy tất cả các vùng (Region) trên một trang truyện đã hoàn tất, Backend tự động kích hoạt **AutoCompositeJob** (chạy Background) gọi sang AI Service (Python) để gộp ảnh tự động.
- **Frontend Nhận:** Dữ liệu tọa độ mới được trả về, Frontend dựa vào đó render lại các khung hình vẽ đè lên hình ảnh gốc của Canvas.

## 6. Giải Quyết Khiếu Nại (Dispute Management)
- **Frontend Gửi (Request):** Khi có bất đồng, Editor mở trang Disputes (`DisputeManagementFeature.tsx`), kéo thanh Slider để chốt tỷ lệ đền bù thanh toán (Partial Payment) giữa tác giả và trợ lý. Gọi `POST /api/disputes/{id}/resolve`.
- **Backend Xử lý:** Dựa vào quy định T06, hệ thống chia tỷ lệ tiền thanh toán từ khoản tiền đang bị Lock. Tiền sẽ được Unlock và Transfer cho các bên theo đúng % mà Editor đã chốt. Task kết thúc.
- **Frontend Nhận:** Trạng thái Dispute chuyển thành Resolved. Frontend đóng modal xử lý. SignalR gửi cảnh báo realtime cho cả Mangaka và Assistant về kết quả phân xử của Editor.

## 7. Hệ Thống Bỏ Phiếu Của Hội Đồng (Board Approval & Voting)
- **Frontend Gửi (Request):** Các thành viên Hội đồng (Editorial Board) bấm nút Approve/Reject/Abstain tại trang `VotingFeature.tsx` và gửi kết quả qua `voting.api.ts`.
- **Backend Xử lý:** Tính toán tỷ lệ phiếu bầu. Nếu kết quả là Approve (duyệt để xuất bản) và có đi kèm cấp vốn ban đầu, Backend sẽ sinh ra giao dịch **Cộng tiền vào quỹ SetupFundBalance** của Tác giả (sau khi tác giả xác nhận Accept Fund).
- **Frontend Nhận:** Bảng xếp hạng, tỷ lệ phiếu bầu (Thanh Bar %) hiển thị realtime trên UI được cập nhật.

## 8. Hệ Thống Thông Báo (Real-time Notification)
- **Frontend Gửi (Request):** Frontend chủ động thiết lập kênh kết nối Websocket ngay từ khi người dùng đăng nhập thông qua hook `useSignalR.ts`.
- **Backend Xử lý:** Bất cứ khi nào có sự kiện xảy ra ngầm (Ví dụ: Trợ lý nộp bài xong, Task bị trễ hạn 3 ngày dẫn đến Auto-Cancel...), Backend bắn Event `NewNotification` ra cổng Hub `/hubs/notification` kèm payload chi tiết.
- **Frontend Nhận:** Socket lắng nghe ở Frontend bắt được Payload, đẩy vào bộ nhớ `notificationStore` (Zustand). Chuông báo hiệu trên Header Navbar tự động rung và số đếm tin nhắn (Badge 🔴) tăng lên ngay lập tức mà không cần người dùng F5 tải lại trang.
