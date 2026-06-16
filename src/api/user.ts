import axios from 'axios';

// 1. Định nghĩa kiểu dữ liệu User theo cấu trúc hệ thống
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: 'Active' | 'Pending' | 'Rejected' | 'Locked'; // 4 trạng thái leader yêu cầu
  createdAt: string;
}

// 2. Định nghĩa kiểu dữ liệu trả về từ API (gồm danh sách và dữ liệu phân trang)
export interface UserListResponse {
  users: User[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
}

// 3. Hàm gọi API lấy danh sách User (đã cấu hình nhận vào page và limit để phân trang)
export const getUsersAPI = async (page: number, limit: number = 10): Promise<UserListResponse> => {
  // Đường dẫn mẫu, sau này bạn có thể sửa lại endpoint theo chuẩn của Backend nhóm bạn nhé
  const response = await axios.get(`https://api.example.com/admin/users?page=${page}&limit=${limit}`);
  return response.data;
};