import { axiosInstance, type ApiResponse } from '../../../api/axios';

const USE_MOCK = true;

const mockDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

const mockResponse = <T>(data: T, message = 'Success') => ({
  data: {
    IsSuccess: true,
    Message: message,
    Data: data,
  },
});

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
    return axiosInstance.get<ApiResponse<any>>('/api/assistant/profile');
  },

  updateAssistantProfile: async (payload: { portfolioUrl: string; skills: string[] }) => {
    if (USE_MOCK) {
      await mockDelay(600);
      return mockResponse(true, 'Đã cập nhật hồ sơ thành công');
    }
    return axiosInstance.put<ApiResponse<boolean>>('/api/assistant/profile', payload);
  }
};
