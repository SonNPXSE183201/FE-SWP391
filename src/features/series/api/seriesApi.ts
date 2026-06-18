import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, SeriesDto, ChapterDto } from '../../../api/generated/types';

export const fetchSeries = async (): Promise<SeriesDto[]> => {
  const res = await axiosInstance.get<ApiResponse<SeriesDto[]>>('/api/series');
  return res.data?.Data ?? [];
};

export const fetchSeriesById = async (id: string): Promise<SeriesDto | null> => {
  const res = await axiosInstance.get<ApiResponse<SeriesDto>>(`/api/series/${id}`);
  return res.data?.Data ?? null;
};

export const fetchChaptersBySeriesId = async (seriesId: string): Promise<ChapterDto[]> => {
  const res = await axiosInstance.get<ApiResponse<ChapterDto[]>>(`/api/series/${seriesId}/chapters`);
  return res.data?.Data ?? [];
};
