import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/generated/types';
import type { UpdateProfileDto as GeneratedUpdateProfileDto } from '../../../api/generated/types';

export type UpdateProfileDto = GeneratedUpdateProfileDto & {
  citizenId?: string | null;
  citizenIdIssueDate?: string | null;
  citizenIdIssuePlace?: string | null;
};

export type ProfileResponseDto = UpdateProfileDto & {
  id?: number;
  userName?: string | null;
  email?: string | null;
  fullName?: string | null;
  roleName?: string | null;
};

export const profileApi = {
  getProfile: () => {
    return axiosInstance.get<ApiResponse<ProfileResponseDto>>('/api/profile');
  },
  updateProfile: (data: UpdateProfileDto) => {
    return axiosInstance.put<ApiResponse<ProfileResponseDto>>('/api/profile', data);
  },
  uploadAvatar: (formData: FormData) => {
    return axiosInstance.post<{ success: boolean; data: string; message: string }>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
