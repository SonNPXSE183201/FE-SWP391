import { axiosInstance, type ApiResponse } from '../../../api/axios';
import type { ScheduleItem } from '../types';
import { MOCK_SCHEDULE } from '../data/mockData';

const USE_MOCK = true;

const mockDelay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const mockResponse = <T>(data: T, message = 'Success') => ({
  data: {
    IsSuccess: true,
    Message: message,
    Data: data,
  },
});

export const scheduleApi = {
  getSchedule: async () => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse<ScheduleItem[]>(MOCK_SCHEDULE.map((s) => ({ ...s })));
    }
    return axiosInstance.get<ApiResponse<ScheduleItem[]>>('/api/publishing/schedule');
  },

  // Drag-drop / picker reschedule.
  reschedule: async (id: string, publishDate: string) => {
    if (USE_MOCK) {
      await mockDelay(250);
      const item = MOCK_SCHEDULE.find((s) => s.id === id);
      if (item) {
        item.publishDate = publishDate;
        if (item.status === 'Delayed') item.status = 'Scheduled';
      }
      return mockResponse(true, 'Đã dời lịch xuất bản');
    }
    return axiosInstance.put<ApiResponse<boolean>>(`/api/publishing/schedule/${id}`, { publishDate });
  },

  markPublished: async (id: string) => {
    if (USE_MOCK) {
      await mockDelay(250);
      const item = MOCK_SCHEDULE.find((s) => s.id === id);
      if (item) item.status = 'Published';
      return mockResponse(true, 'Đã đánh dấu xuất bản');
    }
    return axiosInstance.post<ApiResponse<boolean>>(`/api/publishing/schedule/${id}/publish`);
  },
};
