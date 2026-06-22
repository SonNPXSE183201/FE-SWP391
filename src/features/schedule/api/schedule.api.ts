import { axiosInstance, type ApiResponse } from '../../../api/axios';
import type { ScheduleItem } from '../types';
import { MOCK_SCHEDULE } from '../data/mockData';

const USE_MOCK = false;

const mockDelay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const mockResponse = <T>(data: T, message = 'Success') => ({
  data: {
    IsSuccess: true,
    Message: message,
    Data: data,
  },
});

export const scheduleApi = {
  getSchedule: async (month: string) => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse<ScheduleItem[]>(MOCK_SCHEDULE.map((s) => ({ ...s })));
    }
    const res = await axiosInstance.get<ApiResponse<Record<string, unknown>[]>>('/api/publishing/schedule', { params: { month } });
    const items: ScheduleItem[] = (res.data?.data || []).map((ch: Record<string, unknown>) => ({
      id: String(ch.id ?? ''),
      seriesId: String(ch.seriesId ?? ''),
      seriesTitle: String((ch.series as Record<string, unknown> | undefined)?.title ?? ch.title ?? 'Unknown Series'),
      chapterLabel: `Chapter ${String(ch.chapterNumber ?? '')}`,
      mangakaName: String((ch.series as Record<string, unknown> | undefined)?.mangaka ? ((ch.series as Record<string, unknown>).mangaka as Record<string, unknown>).fullName : 'Unknown Mangaka'),
      coverUrl: ((ch.series as Record<string, unknown> | undefined)?.coverUrl as string | undefined) || undefined,
      publishDate: String(ch.submissionDeadline ?? new Date().toISOString()),
      status: ch.status === 'Published' ? 'Published' : (new Date(String(ch.submissionDeadline)) < new Date() ? 'Delayed' : 'Scheduled'),
      genres: [],
    }));
    return { data: { IsSuccess: true, Message: 'Success', Data: items } };
  },

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
    return axiosInstance.put<ApiResponse<boolean>>(`/api/publishing/schedule/${id}`, { deadline: publishDate });
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
