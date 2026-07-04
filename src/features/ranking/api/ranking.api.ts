import axios from 'axios';
import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, RankingRecord } from '../../../api/generated/types';
import type { components } from '../../../api/generated/schema';
import { filterRankingByGenre, sortRankingByPosition } from '../ranking.utils';

type VoteRankingRequestDto = components['schemas'] extends { VoteRankingRequestDto: infer T }
  ? T
  : {
      seriesId?: number;
      voteType?: string | null;
      comment?: string | null;
    };

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export type { RankingRecord, VoteRankingRequestDto };

export const rankingApi = {
  fetchRanking: async (params?: { period?: string; genre?: string }): Promise<RankingRecord[]> => {
    const period = params?.period ?? 'month';
    const res = await axiosInstance.get<ApiResponse<RankingRecord[]>>('/api/rankings', {
      params: { period },
    });
    let items = sortRankingByPosition(res.data?.data ?? []);
    if (params?.genre) {
      items = filterRankingByGenre(items, params.genre);
    }
    return items.map((item, index) => ({ ...item, rankPosition: index + 1 }));
  },

  submitRankingVote: async (payload: VoteRankingRequestDto) => {
    try {
      const res = await axiosInstance.post<ApiResponse<unknown>>('/api/ranking/votes', payload);
      const data = res.data;
      return {
        success: !!(data?.success ?? (data as ApiResponse<unknown> & { IsSuccess?: boolean }).IsSuccess),
        message: data?.message ?? (data as ApiResponse<unknown> & { Message?: string }).Message ?? '',
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Bỏ phiếu thất bại'), { cause: error });
    }
  },

  submitRankingData: async (payload: components['schemas']['CreateRankingsDto']) => {
    const res = await axiosInstance.post<ApiResponse<unknown>>('/api/rankings', payload);
    const ok = res.data?.success;
    if (ok === false) {
      throw new Error(res.data?.message || 'API từ chối nhập liệu');
    }
    return res.data;
  },
};
