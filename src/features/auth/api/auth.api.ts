import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/axios';
import type { User } from '../../../stores/authStore';

// --- Register API ---
export interface RegisterAssistantRequest {
  userName: string;
  email: string;
  passwordHash?: string; // We map this to password for backend
  password?: string;
  fullName: string;
  portfolioUrl?: string;
  skills?: string;
  verificationCode?: string;
}

export interface RegisterResponseDto {
  RequiresVerification: boolean;
  Message: string;
}

export const authApi = {
  registerAssistant: (data: RegisterAssistantRequest) => {
    // Map passwordHash to password if needed, and send as is
    const payload = { ...data, password: data.passwordHash || data.password };
    delete payload.passwordHash;
    return axiosInstance.post<ApiResponse<RegisterResponseDto>>('/api/auth/register', payload);
  }
};

// --- Login API ---
export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface AuthResponseDto {
  UserId: number;
  UserName: string;
  Email: string;
  FullName: string;
  RoleName: string;
  Token: string;
}

export const loginApi = async (credentials: { email: string; password: string }): Promise<ApiResponse<AuthResponseDto>> => {
  const payload: LoginRequest = {
    identifier: credentials.email, // backend expects identifier
    password: credentials.password
  };
  const response = await axiosInstance.post<ApiResponse<AuthResponseDto>>('/api/auth/login', payload);
  return response.data;
};
