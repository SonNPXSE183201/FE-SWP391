import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/generated/types';

export const profileApi = {
  getAssistantProfile: async () => {
    return axiosInstance.get<ApiResponse<any>>('/api/assistant/profile'); // eslint-disable-line @typescript-eslint/no-explicit-any
  },

  updateAssistantProfile: async (payload: { portfolioUrl: string; skills: string[] }) => {
    return axiosInstance.put<ApiResponse<boolean>>('/api/assistant/profile', {
      portfolioUrl: payload.portfolioUrl,
      skills: payload.skills.join(','),
    });
  }
};
