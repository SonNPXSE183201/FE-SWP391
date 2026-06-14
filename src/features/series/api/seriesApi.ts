import type { Series, Chapter } from '../../../types/entities';
import { axiosInstance, ApiResponse } from '../../../api/axios';

export const fetchSeries = async (): Promise<Series[]> => {
  const res = await axiosInstance.get<ApiResponse<Series[]>>('/api/series');
  return res.data?.Data ?? [];
};

export const fetchSeriesById = async (id: string): Promise<Series | null> => {
  const res = await axiosInstance.get<ApiResponse<Series>>(`/api/series/${id}`);
  return res.data?.Data ?? null;
};

export const fetchChaptersBySeriesId = async (seriesId: string): Promise<Chapter[]> => {
  const res = await axiosInstance.get<ApiResponse<Chapter[]>>(`/api/series/${seriesId}/chapters`);
  return res.data?.Data ?? [];
};
