import { axiosInstance, type ApiResponse } from '../../../api/axios';
import type { ScheduleItem } from '../types';

const mapScheduleItem = (ch: Record<string, unknown>): ScheduleItem => ({
  id: String(ch.id ?? ''),
  seriesId: String(ch.seriesId ?? ''),
  seriesTitle: String(
    (ch.series as Record<string, unknown> | undefined)?.title ?? ch.title ?? 'Unknown Series',
  ),
  chapterLabel: `Chapter ${String(ch.chapterNumber ?? '')}`,
  mangakaName: String(
    (ch.series as Record<string, unknown> | undefined)?.mangaka
      ? ((ch.series as Record<string, unknown>).mangaka as Record<string, unknown>).fullName
      : 'Unknown Mangaka',
  ),
  coverUrl: ((ch.series as Record<string, unknown> | undefined)?.coverUrl as string | undefined) || undefined,
  publishDate: String(ch.submissionDeadline ?? new Date().toISOString()),
  status:
    ch.status === 'Published'
      ? 'Published'
      : new Date(String(ch.submissionDeadline)) < new Date()
        ? 'Delayed'
        : 'Scheduled',
  genres: [],
});

export const scheduleApi = {
  getSchedule: async (month: string) => {
    const res = await axiosInstance.get<ApiResponse<Record<string, unknown>[]>>(
      '/api/publishing/schedule',
      { params: { month } },
    );
    const items: ScheduleItem[] = (res.data?.data || []).map(mapScheduleItem);
    return {
      data: {
        success: true,
        statusCode: 200,
        message: 'Success',
        data: items,
      } satisfies ApiResponse<ScheduleItem[]>,
    };
  },

  reschedule: async (id: string, publishDate: string) =>
    axiosInstance.put<ApiResponse<boolean>>(`/api/publishing/schedule/${id}`, { deadline: publishDate }),

  markPublished: async (id: string) =>
    axiosInstance.post<ApiResponse<boolean>>(`/api/publishing/schedule/${id}/publish`),
};
