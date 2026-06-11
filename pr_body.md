## Mô tả

Pull Request này bao gồm 2 tính năng quan trọng được gộp chung để merge vào nhánh `dev`:

1. **Tích hợp Ví VNPay (`feature/vnpay-wallet-integration`)**:
   - Cấu trúc lại thư mục chuẩn Feature-based (Modules: `wallet`, `contracts`, `users`, `approvals`).
   - Xây dựng component `MangakaWalletFeature` và `AssistantWalletFeature` (tách riêng cho 2 role).
   - Tích hợp gọi VNPay API để nạp tiền vào quỹ.
   - Thêm các Hooks mới như `useWallet`, `useWalletActions`, `useDepositCallback`.

2. **Cơ chế xác thực Refresh Token (`feature/refresh-token-auth`)**:
   - Thêm Axios Interceptor bắt mã lỗi `401 Unauthorized`.
   - Ngưng đọng các API call đang dở dang, gọi ngầm endpoint `/api/auth/refresh-token` để lấy access token mới.
   - Cập nhật State Management (Zustand `authStore.ts`) để lưu `refreshToken` vào LocalStorage thông qua cơ chế persist.
   - Giúp cho người dùng không bị văng ra màn hình đăng nhập sau 15 phút.

## Thay đổi nổi bật
- Sửa đổi cơ chế gọi API trong `axios.ts` để áp dụng token queue khi refresh.
- Cập nhật API Login để trả về và xử lý trọn vẹn cả Token lẫn Refresh Token.

## Cách kiểm thử (How to verify)
- **Kiểm thử Wallet**: Truy cập vào Ví, nhấn nạp tiền, quá trình chuyển hướng tới sandbox VNPay và return URL cần hoạt động trơn tru.
- **Kiểm thử Token**: Đăng nhập, F12 thay đổi cố ý Access Token thành giá trị rác, sau đó gọi bất kỳ API nào, giao diện sẽ không đổi nhưng Network Tab sẽ có 1 request gọi `/api/auth/refresh-token` và request ban đầu được gọi lại thành công.

Vui lòng Review kĩ lại các code thay đổi trong PR này. Cảm ơn!
