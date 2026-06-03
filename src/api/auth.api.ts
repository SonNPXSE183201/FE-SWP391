import { axiosInstance } from './axios';
import type { User } from '../stores/authStore';

// --- Register API ---
export interface RegisterAssistantRequest {
  userName: string;
  email: string;
  passwordHash: string;
  fullName: string;
  portfolioUrl: string;
  specialtyTags: string[];
}

export const authApi = {
  registerAssistant: (data: RegisterAssistantRequest) => 
    axiosInstance.post('/api/auth/register', data),
};

// --- Login API ---
export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export const loginApi = async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
  // TODO: Replace with real API call when backend is ready
  // const response = await axios.post('/api/auth/login', credentials);
  // return response.data;

  // Mock implementation for now
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock validation
      if (!credentials.email || !credentials.password) {
        reject({
          response: {
            data: { success: false, message: 'Email và mật khẩu là bắt buộc' }
          }
        });
        return;
      }
      
      if (credentials.password.length < 6) {
        reject({
          response: {
            data: { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
          }
        });
        return;
      }

      // Mock user generation based on email domain or just random role
      let role: User['role'] = 'Mangaka';
      if (credentials.email.includes('admin')) role = 'Admin';
      else if (credentials.email.includes('editor')) role = 'Editor';
      else if (credentials.email.includes('assistant')) role = 'Assistant';
      else if (credentials.email.includes('board')) role = 'Board';

      // Mock success response
      resolve({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          user: {
            id: 'mock-id-' + Math.random().toString(36).substring(7),
            email: credentials.email,
            fullName: 'Mock ' + role,
            role: role
          },
          token: 'mock-jwt-token-1234567890'
        }
      });
    }, 1500); // simulate network delay
  });
};
