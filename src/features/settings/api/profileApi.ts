import { axiosInstance } from '../../../api/axios';
import type { UpdateProfileDto } from '../../../api/generated/types';

export type { UpdateProfileDto };

export const profileApi = {
  updateProfile: (data: UpdateProfileDto) => {
    return axiosInstance.put('/api/profile', data);
  },
  uploadAvatar: (formData: FormData) => {
    return axiosInstance.post<{ success: boolean; data: string; message: string }>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
