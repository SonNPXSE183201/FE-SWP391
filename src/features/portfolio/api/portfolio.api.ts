import { axiosInstance } from '../../../api/axios';
import type {
  CreatePortfolioSampleDto,
  PortfolioSampleDto,
} from '../../../api/generated/types';

export type { PortfolioSampleDto, CreatePortfolioSampleDto };

export const portfolioApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post<{ success: boolean; data: string; message: string }>('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getPortfolioStats: async (assistantId?: number) => {
    return axiosInstance.get('/api/assistant/portfolio/stats', {
      params: { assistantId }
    });
  },

  getSamples: async (assistantId?: number) => {
    return axiosInstance.get('/api/assistant/portfolio/samples', {
      params: { assistantId }
    });
  },

  uploadSample: async (payload: CreatePortfolioSampleDto) => {
    return axiosInstance.post('/api/assistant/portfolio/samples', payload);
  },

  deleteSample: async (id: number) => {
    return axiosInstance.delete(`/api/assistant/portfolio/samples/${id}`);
  },
};
