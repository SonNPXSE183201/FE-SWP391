import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, SeriesDto } from '../../../api/generated/types';
import type { components } from '../../../api/generated/schema';

const USE_MOCK = true;
const mockDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export interface RankingItem {
  id: string;
  rank: number;
  title: string;
  coverImageUrl: string;
  views: number;
  votes: number;
  genre: string[];
  period: string; // "week" | "month" | "quarter"
  status: 'Active' | 'UnderReview' | 'ProposedCancel';
}

const MOCK_RANKING: RankingItem[] = [
  { id: '1', rank: 1, title: 'Huyền Thoại Samurai', coverImageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=60', views: 125000, votes: 94, genre: ['Action', 'Adventure'], period: 'month', status: 'Active' },
  { id: '2', rank: 2, title: 'Lạc Giữa Ngân Hà', coverImageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=60', views: 98000, votes: 88, genre: ['Sci-Fi', 'Mystery'], period: 'month', status: 'Active' },
  { id: '3', rank: 3, title: 'Vườn Hoa Mùa Đông', coverImageUrl: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=150&auto=format&fit=crop&q=60', views: 45000, votes: 52, genre: ['Romance', 'Drama'], period: 'month', status: 'UnderReview' },
  { id: '4', rank: 4, title: 'Bóng Đêm Đô Thị', coverImageUrl: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=150&auto=format&fit=crop&q=60', views: 32000, votes: 35, genre: ['Action', 'Thriller'], period: 'month', status: 'ProposedCancel' },
];

export const rankingApi = {
  fetchRanking: async (params?: { period?: string; genre?: string }): Promise<RankingItem[]> => {
    if (USE_MOCK) {
      await mockDelay();
      let filtered = [...MOCK_RANKING];
      if (params?.period) {
        filtered = filtered.filter(item => item.period === params.period || params.period === 'all');
      }
      if (params?.genre && params.genre !== 'All') {
        filtered = filtered.filter(item => item.genre.includes(params.genre!));
      }
      // Re-calculate ranks
      return filtered.map((item, index) => ({ ...item, rank: index + 1 }));
    }
    const res = await axiosInstance.get<ApiResponse<RankingItem[]>>('/api/ranking', { params });
    return res.data?.Data ?? [];
  },

  submitRankingVote: async (seriesId: string, action: 'maintain' | 'cancel', comment?: string) => {
    if (USE_MOCK) {
      await mockDelay(400);
      const item = MOCK_RANKING.find(s => s.id === seriesId);
      if (item) {
        if (action === 'cancel') {
          item.status = 'ProposedCancel';
          item.votes -= 1;
        } else {
          item.status = 'Active';
          item.votes += 1;
        }
      }
      return { IsSuccess: true, Message: 'Bỏ phiếu thành công' };
    }
    const res = await axiosInstance.post<ApiResponse<unknown>>('/api/ranking/votes', { seriesId, action, comment });
    return res.data;
  },

  /** F4.4 — Board nhập liệu vote count thủ công */
  submitRankingData: async (payload: components['schemas']['CreateRankingsDto']) => {
    if (USE_MOCK) {
      await mockDelay(500);
      return { IsSuccess: true, Message: `Đã nhập ${payload.Records?.length ?? 0} bản ghi ranking` };
    }
    const res = await axiosInstance.post<ApiResponse<unknown>>('/api/rankings', payload);
    return res.data;
  },

  // Retain legacy exports for compatibility
  fetchPendingProposals: async (): Promise<SeriesDto[]> => {
    const res = await axiosInstance.get<ApiResponse<SeriesDto[]>>('/api/board/pending');
    return res.data?.Data ?? [];
  },

  submitVote: async (seriesId: string, vote: number) => {
    const res = await axiosInstance.post<ApiResponse<unknown>>('/api/board/votes', { seriesId, vote });
    return res.data;
  },
};
export { rankingApi as default };
