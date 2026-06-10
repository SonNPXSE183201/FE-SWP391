import { useState, useEffect } from 'react';

/**
 * Hook lắng nghe và lấy kích thước màn hình trình duyệt hiện tại.
 * Chức năng: Giúp giao diện linh hoạt thay đổi dựa trên độ rộng màn hình (Responsive).
 * Cực kì hữu ích cho màn hình vẽ Canvas (Chỉ hỗ trợ Desktop/Tablet), nếu màn hình quá nhỏ sẽ tự động khoá hoặc báo lỗi.
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Hàm cập nhật lại kích thước
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Lắng nghe sự kiện khi người dùng kéo giãn/thu nhỏ cửa sổ của trình duyệt
    window.addEventListener('resize', handleResize);
    
    // Gọi thử 1 lần ngay lúc đầu để lấy kích thước chuẩn xác
    handleResize();

    // Dọn dẹp sự kiện khi component bị gỡ bỏ để tối ưu hiệu năng
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};
