import { axiosInstance } from '../../../api/axios';
import type {
  CreatePortfolioSampleDto,
  PortfolioSampleDto,
} from '../../../api/generated/types';

export type { PortfolioSampleDto, CreatePortfolioSampleDto };

export const portfolioApi = {
  getPortfolioStats: async () => {
    return axiosInstance.get('/api/assistant/portfolio/stats');
  },

  getSamples: async () => {
    return axiosInstance.get('/api/assistant/portfolio/samples');
  },

  uploadSample: async (payload: CreatePortfolioSampleDto) => {
    return axiosInstance.post('/api/assistant/portfolio/samples', payload);
  },
};
