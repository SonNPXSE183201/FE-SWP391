import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/generated/types';

const USE_MOCK = true;

import { createMockApiResponse } from '../../../api/apiResponse';

const mockDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

const mockResponse = createMockApiResponse;

export const profileApi = {
  getAssistantProfile: async () => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse({
        portfolioUrl: 'https://behance.net/my-portfolio',
        skills: ['Lineart', 'Background', 'Screentone', 'Coloring'],
        stats: {
          rating: 4.8,
          tasksCompleted: 42,
          completionRate: 98,
          totalIncome: 155000000,
        }
      });
    }
    return axiosInstance.get<ApiResponse<any>>('/api/assistant/profile'); // eslint-disable-line @typescript-eslint/no-explicit-any
  },

  updateAssistantProfile: async (payload: { portfolioUrl: string; skills: string[] }) => {
    if (USE_MOCK) {
      await mockDelay(600);
      return mockResponse(true, 'Đã cập nhật hồ sơ thành công');
    }
    return axiosInstance.put<ApiResponse<boolean>>('/api/assistant/profile', payload);
  }
};
