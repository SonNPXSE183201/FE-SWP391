import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, AuthResponseDto, RegisterResponseDto } from '../../../api/generated/types';
import type { components } from '../../../api/generated/schema';

// We define custom parameter types for our frontend functions to keep them camelCase
export interface RegisterAssistantParams {
  userName: string;
  email: string;
  password?: string;
  fullName: string;
  portfolioUrl?: string;
  skills?: string;
  verificationCode?: string;
}

export interface RefreshTokenParams {
  token: string;
  refreshToken: string;
}

export interface ChangePasswordParams {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

export interface ForgotPasswordRequestParams {
  email: string;
}

export interface ResetPasswordParams {
  email?: string;
  verificationCode?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

export interface LogoutParams {
  refreshToken: string;
}

export const authApi = {
  registerAssistant: async (data: RegisterAssistantParams): Promise<ApiResponse<RegisterResponseDto>> => {
    const payload: components["schemas"]["RegisterDto"] = {
      userName: data.userName,
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      portfolioUrl: data.portfolioUrl,
      skills: data.skills,
      verificationCode: data.verificationCode
    };
    const response = await axiosInstance.post<ApiResponse<RegisterResponseDto>>('/api/auth/register', payload);
    return response.data;
  },
  
  login: async (credentials: { email: string; password: string }): Promise<ApiResponse<AuthResponseDto>> => {
    const payload: components["schemas"]["LoginDto"] = {
      identifier: credentials.email,
      password: credentials.password
    };
    const response = await axiosInstance.post<ApiResponse<AuthResponseDto>>('/api/auth/login', payload);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenParams): Promise<ApiResponse<AuthResponseDto>> => {
    const payload: components["schemas"]["RefreshTokenDto"] = {
      accessToken: data.token,
      refreshToken: data.refreshToken
    };
    const response = await axiosInstance.post<ApiResponse<AuthResponseDto>>('/api/auth/refresh-token', payload);
    return response.data;
  },

  changePassword: async (data: ChangePasswordParams): Promise<ApiResponse<null>> => {
    const payload: components["schemas"]["ChangePasswordDto"] = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmNewPassword: data.confirmNewPassword
    };
    const response = await axiosInstance.post<ApiResponse<null>>('/api/auth/change-password', payload);
    return response.data;
  },

  forgotPasswordRequest: async (data: ForgotPasswordRequestParams): Promise<ApiResponse<null>> => {
    const payload: components["schemas"]["ForgotPasswordRequestDto"] = {
      email: data.email
    };
    const response = await axiosInstance.post<ApiResponse<null>>('/api/auth/forgot-password/request', payload);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordParams): Promise<ApiResponse<null>> => {
    const payload: components["schemas"]["ForgotPasswordResetDto"] = {
      email: data.email,
      verificationCode: data.verificationCode,
      newPassword: data.newPassword,
      confirmNewPassword: data.confirmNewPassword
    };
    const response = await axiosInstance.post<ApiResponse<null>>('/api/auth/forgot-password/reset', payload);
    return response.data;
  },

  logout: async (data: LogoutParams): Promise<ApiResponse<null>> => {
    const payload: components["schemas"]["LogoutDto"] = {
      refreshToken: data.refreshToken
    };
    const response = await axiosInstance.post<ApiResponse<null>>('/api/auth/logout', payload);
    return response.data;
  }
};