import axios from 'axios';
import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/generated/types';
import type { components } from '../../../api/generated/schema';

/** Mock chỉ cho luồng Board vote maintain/cancel — chưa có endpoint BE riêng */
const USE_MOCK_BOARD_VOTE = true;
const mockDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { Message?: string; message?: string } | undefined;
    return data?.Message || data?.message || error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export interface RankingItem {
  id: string;
  rank: number;
  title: string;
  coverImageUrl: string;
  views: number;
  votes: number;
  genre: string[];
  period: string;
  status: 'Active' | 'UnderReview' | 'ProposedCancel';
}

type RankingRecord = components['schemas']['RankingRecord'];

const MOCK_RANKING: RankingItem[] = [
  { id: '1', rank: 1, title: 'Huyền Thoại Samurai', coverImageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=60', views: 125000, votes: 94, genre: ['Action', 'Adventure'], period: 'month', status: 'Active' },
  { id: '2', rank: 2, title: 'Lạc Giữa Ngân Hà', coverImageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=60', views: 98000, votes: 88, genre: ['Sci-Fi', 'Mystery'], period: 'month', status: 'Active' },
  { id: '3', rank: 3, title: 'Vườn Hoa Mùa Đông', coverImageUrl: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=150&auto=format&fit=crop&q=60', views: 45000, votes: 52, genre: ['Romance', 'Drama'], period: 'month', status: 'UnderReview' },
  { id: '4', rank: 4, title: 'Bóng Đêm Đô Thị', coverImageUrl: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=150&auto=format&fit=crop&q=60', views: 32000, votes: 35, genre: ['Action', 'Thriller'], period: 'month', status: 'ProposedCancel' },
];

const applyDevRankingSubmit = (payload: components['schemas']['CreateRankingsDto']) => {
  payload.Records?.forEach((record) => {
    const id = String(record.SeriesId ?? '');
    if (!id) return;
    const existing = MOCK_RANKING.find((item) => item.id === id);
    if (existing) {
      existing.votes = record.VoteCount ?? existing.votes;
    } else {
      MOCK_RANKING.push({
        id,
        rank: MOCK_RANKING.length + 1,
        title: `Series #${id}`,
        coverImageUrl: '',
        views: 0,
        votes: record.VoteCount ?? 0,
        genre: [],
        period: 'month',
        status: 'Active',
      });
    }
  });
};

const getDevMockRanking = (period: string, genre?: string): RankingItem[] => {
  let items = MOCK_RANKING.map((item, index) => ({ ...item, period, rank: index + 1 }));
  if (genre && genre !== 'All') {
    items = items.filter((item) => item.genre.includes(genre));
  }
  return items.map((item, index) => ({ ...item, rank: index + 1 }));
};
const mapSeriesStatus = (status?: string | null): RankingItem['status'] => {
  if (status === 'ProposedCancel' || status === 'Cancelled') return 'ProposedCancel';
  if (status === 'UnderReview' || status === 'Pending_Approval') return 'UnderReview';
  return 'Active';
};

const mapRankingRecordToItem = (
  record: RankingRecord,
  index: number,
  period: string,
): RankingItem => {
  const series = record.Series;
  const genres = series?.Genre
    ? series.Genre.split(/[,;]/).map((g) => g.trim()).filter(Boolean)
    : [];

  return {
    id: String(record.SeriesId ?? record.Id ?? index),
    rank: record.RankPosition ?? index + 1,
    title: series?.Title ?? `Series #${record.SeriesId ?? '—'}`,
    coverImageUrl: series?.CoverArtworkUrl ?? '',
    views: 0,
    votes: record.VoteCount ?? 0,
    genre: genres,
    period,
    status: mapSeriesStatus(series?.Status),
  };
};

export const rankingApi = {
  fetchRanking: async (params?: { period?: string; genre?: string }): Promise<RankingItem[]> => {
    const period = params?.period ?? 'month';
    let items: RankingItem[] = [];

    try {
      const res = await axiosInstance.get<ApiResponse<RankingRecord[]>>('/api/rankings', {
        params: { period },
      });
      items = (res.data?.Data ?? []).map((record, index) =>
        mapRankingRecordToItem(record, index, period),
      );
    } catch {
      if (!import.meta.env.DEV) throw new Error('Không tải được bảng xếp hạng');
    }

    if (items.length === 0 && import.meta.env.DEV) {
      items = getDevMockRanking(period, params?.genre);
    }

    if (params?.genre && params.genre !== 'All') {
      items = items.filter((item) => item.genre.includes(params.genre!));
    }

    return items.map((item, index) => ({ ...item, rank: index + 1 }));
  },

  submitRankingVote: async (seriesId: string, action: 'maintain' | 'cancel', comment?: string) => {
    if (USE_MOCK_BOARD_VOTE) {
      await mockDelay(400);
      const item = MOCK_RANKING.find((s) => s.id === seriesId);
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

  /** F4.4 — Board nhập liệu vote count thủ công (ưu tiên API thật; dev fallback khi BE lỗi) */
  submitRankingData: async (payload: components['schemas']['CreateRankingsDto']) => {
    try {
      const res = await axiosInstance.post<ApiResponse<unknown>>('/api/rankings', payload);
      const ok = res.data?.IsSuccess ?? res.data?.success;
      if (ok === false) {
        throw new Error(res.data?.Message || res.data?.message || 'API từ chối nhập liệu');
      }
      return res.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        await mockDelay(400);
        applyDevRankingSubmit(payload);
        return {
          IsSuccess: true,
          Message: 'Dev mock: BE từ chối/lỗi — đã lưu ranking local để test UI',
        };
      }
      throw new Error(getApiErrorMessage(error, 'Nhập dữ liệu thất bại'), { cause: error });
    }
  },
};

export { rankingApi as default };
