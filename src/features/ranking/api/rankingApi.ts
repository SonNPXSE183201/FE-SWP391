import axios from 'axios';
import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, RankingRecord } from '../../../api/generated/types';
import type { components } from '../../../api/generated/schema';
import { filterRankingByGenre, sortRankingByPosition } from '../ranking.utils';

/** BE VoteRankingRequestDto — field voteType (not action) */
type VoteRankingRequestDto = components['schemas'] extends { VoteRankingRequestDto: infer T }
  ? T
  : {
      seriesId?: number;
      voteType?: string | null;
      comment?: string | null;
    };

/** Dev fallback khi BE chưa deploy POST /api/ranking/votes */
const USE_MOCK_BOARD_VOTE = false;
const mockDelay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

const MOCK_RANKING: RankingRecord[] = [
  {
    id: 1,
    seriesId: 1,
    rankPosition: 1,
    voteCount: 94,
    series: {
      title: 'Huyền Thoại Samurai',
      coverArtworkUrl:
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=60',
      genre: 'Action, Adventure',
      status: 'In Production',
    },
  },
  {
    id: 2,
    seriesId: 2,
    rankPosition: 2,
    voteCount: 88,
    series: {
      title: 'Lạc Giữa Ngân Hà',
      coverArtworkUrl:
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=60',
      genre: 'Sci-Fi, Mystery',
      status: 'In Production',
    },
  },
  {
    id: 3,
    seriesId: 3,
    rankPosition: 3,
    voteCount: 52,
    series: {
      title: 'Vườn Hoa Mùa Đông',
      coverArtworkUrl:
        'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=150&auto=format&fit=crop&q=60',
      genre: 'Romance, Drama',
      status: 'UnderReview',
    },
  },
  {
    id: 4,
    seriesId: 4,
    rankPosition: 4,
    voteCount: 35,
    series: {
      title: 'Bóng Đêm Đô Thị',
      coverArtworkUrl:
        'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=150&auto=format&fit=crop&q=60',
      genre: 'Action, Thriller',
      status: 'ProposedCancel',
    },
  },
];

const applyDevRankingSubmit = (payload: components['schemas']['CreateRankingsDto']) => {
  payload.records?.forEach((record) => {
    const id = record.seriesId;
    if (!id) return;
    const existing = MOCK_RANKING.find((item) => item.seriesId === id);
    if (existing) {
      existing.voteCount = record.voteCount ?? existing.voteCount;
    } else {
      MOCK_RANKING.push({
        id: MOCK_RANKING.length + 1,
        seriesId: id,
        rankPosition: MOCK_RANKING.length + 1,
        voteCount: record.voteCount ?? 0,
        series: { title: `Series #${id}`, genre: '', status: 'In Production' },
      });
    }
  });
};

const getDevMockRanking = (genre?: string): RankingRecord[] => {
  const items = sortRankingByPosition(MOCK_RANKING);
  return filterRankingByGenre(items, genre).map((item, index) => ({
    ...item,
    rankPosition: index + 1,
  }));
};

const toRankingVoteType = (action: 'maintain' | 'cancel'): string =>
  action === 'cancel' ? 'Cancel' : 'Maintain';

export type { RankingRecord, VoteRankingRequestDto };

export const rankingApi = {
  fetchRanking: async (params?: { period?: string; genre?: string }): Promise<RankingRecord[]> => {
    const period = params?.period ?? 'month';
    let items: RankingRecord[] = [];

    try {
      const res = await axiosInstance.get<ApiResponse<RankingRecord[]>>('/api/rankings', {
        params: { period },
      });
      items = sortRankingByPosition(res.data?.data ?? []);
    } catch {
      if (!import.meta.env.DEV) throw new Error('Không tải được bảng xếp hạng');
    }

    if (items.length === 0 && import.meta.env.DEV) {
      items = getDevMockRanking(params?.genre);
    } else if (params?.genre) {
      items = filterRankingByGenre(items, params.genre);
    }

    return items.map((item, index) => ({ ...item, rankPosition: index + 1 }));
  },

  submitRankingVote: async (payload: VoteRankingRequestDto) => {
    if (!USE_MOCK_BOARD_VOTE) {
      try {
        const res = await axiosInstance.post<ApiResponse<unknown>>('/api/ranking/votes', payload);
        const data = res.data;
        return {
          success: !!(data?.success ?? (data as ApiResponse<unknown> & { IsSuccess?: boolean }).IsSuccess),
          message: data?.message ?? (data as ApiResponse<unknown> & { Message?: string }).Message ?? '',
        };
      } catch (error) {
        if (!import.meta.env.DEV) {
          throw new Error(getApiErrorMessage(error, 'Bỏ phiếu thất bại'), { cause: error });
        }
      }
    }

    await mockDelay(400);
    const seriesId = payload.seriesId;
    const item = MOCK_RANKING.find((s) => s.seriesId === seriesId);
    if (item?.series) {
      const voteType = (payload.voteType ?? '').toLowerCase();
      if (voteType === 'cancel') {
        item.series.status = 'ProposedCancel';
        item.voteCount = Math.max(0, (item.voteCount ?? 0) - 1);
      } else {
        item.series.status = 'In Production';
        item.voteCount = (item.voteCount ?? 0) + 1;
      }
    }
    return {
      success: true,
      message: import.meta.env.DEV
        ? 'Dev mock: BE chưa có /api/ranking/votes — đã cập nhật local'
        : 'Bỏ phiếu thành công',
    };
  },

  /** F4.4 — Board nhập liệu vote count thủ công (ưu tiên API thật; dev fallback khi BE lỗi) */
  submitRankingData: async (payload: components['schemas']['CreateRankingsDto']) => {
    try {
      const res = await axiosInstance.post<ApiResponse<unknown>>('/api/rankings', payload);
      const ok = res.data?.success;
      if (ok === false) {
        throw new Error(res.data?.message || 'API từ chối nhập liệu');
      }
      return res.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        await mockDelay(400);
        applyDevRankingSubmit(payload);
        return {
          success: true,
          message: 'Dev mock: BE từ chối/lỗi — đã lưu ranking local để test UI',
        };
      }
      throw new Error(getApiErrorMessage(error, 'Nhập dữ liệu thất bại'), { cause: error });
    }
  },
};

/** @deprecated Use submitRankingVote with VoteRankingRequestDto */
export const submitRankingVoteByAction = (
  seriesId: string,
  action: 'maintain' | 'cancel',
  comment?: string,
) =>
  rankingApi.submitRankingVote({
    seriesId: Number(seriesId) || undefined,
    voteType: toRankingVoteType(action),
    comment,
  });

export { rankingApi as default };
