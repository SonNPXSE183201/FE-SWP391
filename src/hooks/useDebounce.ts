import { useState, useEffect } from 'react';

/**
 * Hook trì hoãn việc cập nhật giá trị (Debounce).
 * Chức năng: Ngăn chặn việc gọi API liên tục khi người dùng đang gõ phím.
 * Thay vì gọi API ngay lập tức, nó sẽ chờ một khoảng thời gian (delay) sau khi người dùng ngừng gõ mới cập nhật giá trị cuối cùng.
 * 
 * @param value Giá trị cần trì hoãn (ví dụ: chữ đang gõ trong ô Search)
 * @param delay Thời gian chờ (mặc định 500 mili-giây)
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Đặt bộ đếm thời gian: Chỉ cập nhật debouncedValue sau khi hết 'delay' ms
    const timer = setTimeout(() => setDebouncedValue(value), delay);

    // Dọn dẹp (Cleanup): Nếu 'value' thay đổi trước khi hết giờ (tức là user chưa ngừng gõ mà gõ tiếp chữ mới),
    // thì huỷ cái timer cũ đi và bắt đầu đếm lại thời gian chờ từ đầu.
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Chạy lại mỗi khi 'value' hoặc 'delay' thay đổi

  return debouncedValue;
};
