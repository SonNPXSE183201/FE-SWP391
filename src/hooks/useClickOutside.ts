import { useEffect, useRef } from 'react';

/**
 * Hook phát hiện sự kiện click chuột ra bên ngoài một khu vực/thẻ HTML nhất định.
 * Chức năng: Dùng để tự động đóng Dropdown, Modal, Pop-up khi người dùng bấm chuột ra khoảng trống bên ngoài.
 * 
 * @param callback Hàm sẽ được gọi khi phát hiện click ra ngoài (ví dụ: hàm đóng modal - setIsOpen(false))
 * @returns Trả về một `ref` để bạn gắn vào thẻ HTML (Component) mà bạn muốn làm ranh giới giám sát
 */
export const useClickOutside = (callback: () => void) => {
  const ref = useRef<any>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Nếu cái ref (cái hộp modal) có tồn tại VÀ vị trí click chuột KHÔNG nằm bên trong hộp đó
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(); // Kích hoạt hàm gọi lại (thường là hàm đóng)
      }
    };

    // Lắng nghe sự kiện click chuột hoặc chạm ngón tay (trên mobile)
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    // Dọn dẹp sự kiện khi component bị huỷ để tránh rò rỉ bộ nhớ (memory leak)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [callback]);

  return ref;
};
