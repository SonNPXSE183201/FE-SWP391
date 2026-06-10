import { useEffect, useState } from 'react';

/**
 * Hook kết nối WebSockets qua SignalR với ASP.NET Core Backend.
 * Chức năng: Nhận tin nhắn thông báo (Notification), cập nhật trạng thái Task (TaskStatusChanged),
 * biến động số dư ví (WalletUpdated) theo thời gian thực (Real-time).
 * 
 * LƯU Ý: Đây là khung sườn (scaffold) chuẩn bị sẵn. 
 * Trong tương lai khi ghép nối với Backend, bạn sẽ cài thư viện @microsoft/signalr và khởi tạo connection tại đây.
 */
export const useSignalR = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Khởi tạo kết nối SignalR với Server tại đây (Ví dụ: HubConnectionBuilder)
    console.log('[useSignalR] Đang khởi tạo kết nối WebSockets...');
    
    // Giả lập kết nối thành công sau 1 giây (Để test UI)
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      console.log('[useSignalR] Đã kết nối thành công với máy chủ!');
    }, 1000);

    return () => {
      // TODO: Đóng kết nối (connection.stop()) khi người dùng tắt web hoặc đăng xuất
      clearTimeout(connectTimer);
      console.log('[useSignalR] Đã ngắt kết nối WebSocket!');
      setIsConnected(false);
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    // Hàm này sau này dùng để gửi tin nhắn thẳng lên Server qua WebSocket
    sendMessage: (msg: string) => console.log('[useSignalR] Đang gửi tin nhắn lên Server: ', msg)
  };
};
