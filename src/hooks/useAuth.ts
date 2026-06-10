import { useAuthStore } from '../stores/authStore';

/**
 * Hook dùng chung (Global Hook) để thao tác nhanh với quyền hạn của người dùng.
 * Thay vì phải gọi useAuthStore nhiều lần, hook này bọc lại và cung cấp các cờ (flags) tiện lợi.
 */
export const useAuth = () => {
  const { user, token, isAuthenticated, logout } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated: isAuthenticated(), // Gọi hàm để lấy giá trị boolean
    logout,
    
    // Các cờ kiểm tra Role nhanh gọn để dễ viết logic Ẩn/Hiện trên UI
    isAdmin: user?.role === 'Admin',
    isMangaka: user?.role === 'Mangaka',
    isAssistant: user?.role === 'Assistant',
    isEditor: user?.role === 'Editor',
    isBoard: user?.role === 'Board',
  };
};
