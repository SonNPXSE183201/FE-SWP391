import { axiosInstance, type ApiResponse } from '../../../api/axios';
import type { ScheduleItem } from '../types';

const getText = (value: unknown, fallback: string) => {
  if (typeof value === 'string' && value.trim()) return value;
  return fallback;
};

const mapScheduleItem = (ch: Record<string, unknown>): ScheduleItem => {
  const publishDate = getText(ch.publishDate ?? ch.submissionDeadline, new Date().toISOString());
  const chapterNumber = ch.chapterNumber ? String(ch.chapterNumber) : '';
  const chapterTitle = getText(ch.chapterTitle ?? ch.title, '').trim();

  return {
    id: String(ch.id ?? ''),
    seriesId: String(ch.seriesId ?? ''),
    seriesTitle: getText(
      ch.seriesTitle ?? (ch.series as Record<string, unknown> | undefined)?.title,
      'Chưa rõ bộ truyện',
    ),
    chapterLabel: chapterTitle
      ? `Chương ${chapterNumber}: ${chapterTitle}`
      : `Chương ${chapterNumber}`,
    mangakaName: getText(
      ch.mangakaName ??
        ((ch.series as Record<string, unknown> | undefined)?.mangaka as Record<string, unknown> | undefined)?.fullName,
      'Chưa rõ tác giả',
    ),
    coverUrl: getText(
      ch.coverUrl ??
        ch.coverArtworkUrl ??
        (ch.series as Record<string, unknown> | undefined)?.coverArtworkUrl ??
        (ch.series as Record<string, unknown> | undefined)?.coverUrl,
      '',
    ) || undefined,
    publishDate,
    status:
      ch.status === 'Published'
        ? 'Published'
        : new Date(publishDate) < new Date()
          ? 'Delayed'
          : 'Scheduled',
    genres: [],
  };
};

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
        message: 'Thành công',
        data: items,
      } satisfies ApiResponse<ScheduleItem[]>,
    };
  },

  reschedule: async (id: string, publishDate: string) =>
    axiosInstance.put<ApiResponse<boolean>>(`/api/publishing/schedule/${id}`, { deadline: publishDate }),

  markPublished: async (id: string) =>
    axiosInstance.post<ApiResponse<boolean>>(`/api/publishing/schedule/${id}/publish`),
};
