import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/axios';

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
  RefreshToken: string;
}

export interface RefreshTokenRequest {
  token: string;
  refreshToken: string;
}

export const loginApi = async (credentials: { email: string; password: string }): Promise<ApiResponse<AuthResponseDto>> => {
  const payload: LoginRequest = {
    identifier: credentials.email,
    password: credentials.password
  };
  const response = await axiosInstance.post<ApiResponse<AuthResponseDto>>('/api/auth/login', payload);
  return response.data;
};

export const refreshTokenApi = async (payload: RefreshTokenRequest): Promise<ApiResponse<AuthResponseDto>> => {
  const response = await axiosInstance.post<ApiResponse<AuthResponseDto>>('/api/auth/refresh-token', payload);
  return response.data;
};

// --- Change Password API (Requires Auth) ---
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const changePasswordApi = async (data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
  const response = await axiosInstance.post<ApiResponse<null>>('/api/auth/change-password', data);
  return response.data;
};

// --- Forgot Password Request API (Public) ---
export interface ForgotPasswordRequestDto {
  email: string;
}

export const forgotPasswordRequestApi = async (data: ForgotPasswordRequestDto): Promise<ApiResponse<null>> => {
  const response = await axiosInstance.post<ApiResponse<null>>('/api/auth/forgot-password/request', data);
  return response.data;
};

// --- Reset Password API (Public) ---
export interface ResetPasswordRequestDto {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const resetPasswordApi = async (data: ResetPasswordRequestDto): Promise<ApiResponse<null>> => {
  const response = await axiosInstance.post<ApiResponse<null>>('/api/auth/forgot-password/reset', data);
  return response.data;
};

// --- Logout API ---
export interface LogoutRequest {
  refreshToken: string;
}

export const logoutApi = async (data: LogoutRequest): Promise<ApiResponse<null>> => {
  const response = await axiosInstance.post<ApiResponse<null>>('/api/auth/logout', data);
  return response.data;
};