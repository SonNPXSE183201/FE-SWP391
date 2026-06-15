# Báo Cáo Tiến Độ Dự Án Manga (Frontend)
**Ngày báo cáo:** 15/06/2026
**Phụ trách Frontend:** Hoàng Phúc & Duy Anh

## 1. Tổng quan tiến độ chung
- **Tiến độ tổng thể dự kiến:** Theo timeline trong `task.md`, tới 15/06 dự án kỳ vọng đạt ~70%.
- **Tiến độ thực tế:** Team đang bám sát và có phần vượt mức kỳ vọng ở các module cốt lõi. Mảng công việc của Phúc (các module chính và khó) đã hoàn tất gần như 100% trước thời hạn (19/06).
- **Mục tiêu tiếp theo:** Hoàn thiện nốt các giao diện hiển thị cho Admin, Editor, Board và Assistant (Duy Anh đang phụ trách) để đạt mục tiêu 85%.

## 2. Tiến độ chi tiết theo phân công

### A. Mảng công việc của Hoàng Phúc (Đã hoàn thành xuất sắc)
Bạn Phúc đã hoàn thiện và tích hợp thành công dữ liệu thật (API) cho toàn bộ các tính năng chính yếu (từ `P1` đến `P6`), bao gồm:
- **Tích hợp API & Loại bỏ Mock Data:**
  - **Dashboard:** Hoàn thành gọi API thật cho Mangaka/Assistant Dashboard (hiện tại tạm bật `USE_MOCK = true` để demo do chưa có dữ liệu báo cáo từ Backend).
  - **Series, Manuscripts & Tasks:** Các trang danh sách, chi tiết truyện, bảng quản lý Task đã gọi `seriesApi` và `taskApi` thành công. *(Lưu ý: Do Database hiện tại trống nên nhóm đang tạm thời bật lại `USE_MOCK = true` cho toàn bộ các module để hiển thị dữ liệu giả lập phục vụ demo).*
  - **Wallet & Canvas:** Tích hợp mượt mà `wallet.api.ts` cho Nạp/Rút/Chuyển tiền nội bộ, và `canvas.api.ts` cho thao tác cắt khung, ghim lỗi.
  - **Review & Approval:** Hoàn tất gọi API thật cho tính năng xét duyệt Series, Board Approval, Hợp đồng và Hồ sơ trợ lý (cũng đang bật mock để demo luồng duyệt).
- **Tính năng xây mới (Đã hoàn thành):**
  - **Disputes (Giải quyết khiếu nại - P5):** Đã xây dựng xong trang quản lý tranh chấp (`DisputeManagementFeature.tsx`), tích hợp thanh điều chỉnh mức thanh toán (Partial Payment) và đấu nối `dispute.api.ts`.
  - **Notification System (P6):** Đã cấu hình và kết nối thành công SignalR (`/hubs/notification`), xây dựng hoàn thiện chuông báo và State Zustand quản lý thông báo realtime.

### B. Mảng công việc của Duy Anh (Đang thực hiện)
Các trang do Duy Anh phụ trách chủ yếu xây dựng giao diện hiển thị dựa trên các mẫu có sẵn. Hiện tại các task này (từ `D1` đến `D6`) **vẫn chưa hoàn thành**, đang trong quá trình phát triển (sử dụng dữ liệu giả/stub để dàn Layout):
- **Cần hoàn thành gấp (Deadline 13-15/06):** Giao diện 5 trang Settings (`D1`), 3 trang Dashboards (`D2`), Trang Portfolio của Assistant (`D3`).
- **Sẽ thực hiện tiếp (Deadline 16-18/06):** Tính năng Ranking & Voting cho Board (`D4`, `D5`) và phần Đối soát giao dịch VNPay (`D6`).

## 3. Các chức năng ĐÃ GỌI API THẬT (Hoàn thành)
- **Module Dashboard:** Dashboard Tác giả, Dashboard Trợ lý *(tích hợp API thành công nhưng tạm dùng mock để demo)*.
- **Module Series & Task:** Quản lý Series, Quản lý Chapter, Chi tiết Bản thảo, Bảng Task tác giả, Modal tạo Task *(tích hợp API thành công nhưng tạm dùng mock để demo)*.
- **Module Tài chính (Wallet):** Nạp/Rút, Chuyển tiền (Transaction API) *(tích hợp API thành công nhưng tạm dùng mock để demo).*
- **Module Canvas & Review:** Editor ghim lỗi (Annotation), Tác giả cắt vùng (Region CRUD) *(tích hợp API thành công nhưng tạm dùng mock để demo).*
- **Module Giải quyết tranh chấp (Disputes):** Editor xử lý khiếu nại thanh toán *(tích hợp API thành công nhưng tạm dùng mock để demo).*
- **Module Hành chính:** Xét duyệt Series, Hợp đồng, Xét duyệt của Board *(tích hợp API thành công nhưng tạm dùng mock để demo).*
- **Module Thông báo (Real-time):** SignalR Hub tích hợp thành công.

## 4. Các chức năng VẪN ĐANG GIẢ DỮ LIỆU hoặc Chờ xử lý
- **File chờ Backend:** File `features/dashboard/data/mockData.ts` (Chờ Backend cung cấp các endpoint thống kê tổng hợp mới có thể xóa hoàn toàn).
- **Các trang hiển thị & phân quyền (Chưa có API / Đang dùng Mock):**
  - Settings cá nhân cho tất cả các Role.
  - Admin/Editor/Board Dashboards.
  - Trang Portfolio Assistant.
  - Hệ thống Bỏ phiếu & Xếp hạng (Voting/Ranking).
  - Bảng Đối soát (Reconciliation) cho Admin.
