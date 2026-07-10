import { axiosInstance } from '../../../api/axios';
import type {
  ApiResponse,
  AuthResponseDto,
  RegisterResponseDto,
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ChangePasswordDto,
  ForgotPasswordRequestDto,
  ForgotPasswordResetDto,
  LogoutDto,
} from '../../../api/generated/types';

export type {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ChangePasswordDto,
  ForgotPasswordRequestDto,
  ForgotPasswordResetDto,
  LogoutDto,
};

export const authApi = {
  registerAssistant: async (data: RegisterDto): Promise<ApiResponse<RegisterResponseDto>> => {
    const response = await axiosInstance.post<ApiResponse<RegisterResponseDto>>('/api/auth/register', data);
    return response.data;
  },

  login: async (credentials: LoginDto): Promise<ApiResponse<AuthResponseDto>> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponseDto>>('/api/auth/login', credentials);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenDto): Promise<ApiResponse<AuthResponseDto>> => {
    const response = await axiosInstance.post<ApiResponse<AuthResponseDto>>('/api/auth/refresh-token', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordDto): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post<ApiResponse<null>>('/api/auth/change-password', data);
    return response.data;
  },

  forgotPasswordRequest: async (data: ForgotPasswordRequestDto): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post<ApiResponse<null>>('/api/auth/forgot-password/request', data);
    return response.data;
  },

  resetPassword: async (data: ForgotPasswordResetDto): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post<ApiResponse<null>>('/api/auth/forgot-password/reset', data);
    return response.data;
  },

  logout: async (data: LogoutDto): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post<ApiResponse<null>>('/api/auth/logout', data);
    return response.data;
  },
};
