import { axiosInstance } from '../../../api/axios';
import type {
  ApiResponse,
  AssistantProfileDto,
  UpdateAssistantProfileDto,
} from '../../../api/generated/types';

export type { AssistantProfileDto, UpdateAssistantProfileDto };

export const profileApi = {
  getAssistantProfile: async () => {
    return axiosInstance.get<ApiResponse<AssistantProfileDto>>('/api/assistant/profile');
  },

  updateAssistantProfile: async (payload: { portfolioUrl: string; skills: string[] }) => {
    const body: UpdateAssistantProfileDto = {
      portfolioUrl: payload.portfolioUrl,
      skills: payload.skills.join(','),
    };
    return axiosInstance.put<ApiResponse<AssistantProfileDto>>('/api/assistant/profile', body);
  },
};
