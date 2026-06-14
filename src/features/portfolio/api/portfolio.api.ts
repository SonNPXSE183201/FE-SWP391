import { axiosInstance, type ApiResponse } from '../../../api/axios';

const USE_MOCK = true;
const mockDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));
const mockResponse = <T>(data: T, message = 'Success') => ({
  data: {
    IsSuccess: true,
    Message: message,
    Data: data,
  },
});

export interface PortfolioSample {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}

const MOCK_SAMPLES: PortfolioSample[] = [
  { id: '1', title: 'Samurai Action Scene', imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60', category: 'Lineart', createdAt: '2026-05-20' },
  { id: '2', title: 'Cyberpunk Background', imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60', category: 'Background', createdAt: '2026-05-25' },
  { id: '3', title: 'School Life Screentone', imageUrl: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=500&auto=format&fit=crop&q=60', category: 'Screentone', createdAt: '2026-06-01' },
];

export const portfolioApi = {
  getPortfolioStats: async () => {
    if (USE_MOCK) {
      await mockDelay(300);
      return mockResponse({
        tasksCompleted: 45,
        approveRate: 98,
        earnings: 15400000,
      });
    }
    const res = await axiosInstance.get('/api/assistant/portfolio/stats');
    return res;
  },

  getSamples: async () => {
    if (USE_MOCK) {
      await mockDelay(300);
      return mockResponse<PortfolioSample[]>(MOCK_SAMPLES);
    }
    const res = await axiosInstance.get('/api/assistant/portfolio/samples');
    return res;
  },

  uploadSample: async (payload: { title: string; category: string; imageUrl: string }) => {
    if (USE_MOCK) {
      await mockDelay(500);
      const newSample: PortfolioSample = {
        id: String(Date.now()),
        title: payload.title,
        imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60',
        category: payload.category,
        createdAt: new Date().toISOString().split('T')[0],
      };
      MOCK_SAMPLES.push(newSample);
      return mockResponse(newSample);
    }
    const res = await axiosInstance.post('/api/assistant/portfolio/samples', payload);
    return res;
  }
};
