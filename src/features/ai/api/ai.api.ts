import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/generated/types';

export const suggestTags = async (synopsis: string): Promise<string[]> => {
  const res = await axiosInstance.post<ApiResponse<string[]>>('/api/ai/suggest-tags', {
    synopsis,
  });
  
  if (!res.data.success) {
    throw new Error(res.data.message || 'Lỗi khi lấy gợi ý thể loại');
  }
  
  return res.data.data ?? [];
};

export const colorizeImage = async (imageUrl: string): Promise<string> => {
  const res = await axiosInstance.post<ApiResponse<string>>('/api/ai/colorize', `"${imageUrl}"`, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!res.data.success) {
    throw new Error(res.data.message || 'Lỗi khi tô màu ảnh');
  }
  
  return res.data.data || '';
};

export const segmentImage = async (imageUrl: string): Promise<number[][]> => {
  const res = await axiosInstance.post<ApiResponse<{ panels: { x: number, y: number, width: number, height: number }[] }>>('/api/ai/segment', `"${imageUrl}"`, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!res.data.success) {
    throw new Error(res.data.message || 'Lỗi khi phân vùng ảnh');
  }
  
  const panels = res.data.data?.panels ?? [];
  return panels.map(p => [p.x, p.y, p.width, p.height]);
};

export const visualizeSegmentImage = async (imageUrl: string): Promise<string> => {
  const res = await axiosInstance.post<ApiResponse<string>>('/api/ai/segment/visualize', `"${imageUrl}"`, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!res.data.success) {
    throw new Error(res.data.message || 'Lỗi khi visualize phân vùng');
  }
  
  return res.data.data || '';
};

