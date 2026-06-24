import { axiosInstance } from '../../../api/axios';

export interface PortfolioSample {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}

export const portfolioApi = {
  getPortfolioStats: async () => {
    return axiosInstance.get('/api/assistant/portfolio/stats');
  },

  getSamples: async () => {
    return axiosInstance.get('/api/assistant/portfolio/samples');
  },

  uploadSample: async (payload: { title: string; category: string; imageUrl: string }) => {
    return axiosInstance.post('/api/assistant/portfolio/samples', payload);
  }
};
