import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, SeriesDto, VoteSeriesRequestDto } from '../../../api/generated/types';
import type { BoardVotingRulesDto } from '../../admin/api/boardVoting.api';
import {
  matchesVotingFilter,
  type VotingListFilter,
  type VotingSeriesDto,
} from '../utils/voting.utils';

type PendingBoardVotesPayload = {
  rules?: BoardVotingRulesDto;
  series?: VotingSeriesDto[];
};

const unwrap = <T>(body: ApiResponse<T> | undefined): T | undefined =>
  body?.data ?? (body as ApiResponse<T> & { Data?: T })?.Data;

const extractPendingPayload = (
  body: ApiResponse<PendingBoardVotesPayload | SeriesDto[]> | undefined,
): { rules: BoardVotingRulesDto | null; series: VotingSeriesDto[] } => {
  const raw = unwrap(body);
  if (!raw) return { rules: null, series: [] };

  if (Array.isArray(raw)) {
    return { rules: null, series: raw as VotingSeriesDto[] };
  }

  const payload = raw as PendingBoardVotesPayload;
  return {
    rules: payload.rules ?? null,
    series: (payload.series ?? []) as VotingSeriesDto[],
  };
};

export type VotingListResult = {
  rules: BoardVotingRulesDto | null;
  series: VotingSeriesDto[];
};

export type { VoteSeriesRequestDto, VotingListFilter, VotingSeriesDto };
export type { VoteUiChoice, VoteResultSummary } from '../utils/voting.utils';
export type { BoardVotingRulesDto };

export const votingApi = {
  fetchVotingList: async (
    filter?: VotingListFilter,
    boardMemberId?: number | string | null,
  ): Promise<VotingListResult> => {
    const res = await axiosInstance.get<ApiResponse<PendingBoardVotesPayload | SeriesDto[]>>(
      '/api/votes/pending',
    );
    const { rules, series } = extractPendingPayload(res.data);
    let items = series;
    if (filter && filter !== 'All') {
      items = items.filter((item) => matchesVotingFilter(item, filter, boardMemberId));
    }
    return { rules, series: items };
  },

  fetchVotingRules: async (): Promise<BoardVotingRulesDto | null> => {
    const res = await axiosInstance.get<ApiResponse<BoardVotingRulesDto>>('/api/votes/rules');
    return unwrap(res.data) ?? null;
  },

  fetchVotingDetail: async (
    votingId: string,
    boardMemberId?: number | string | null,
  ): Promise<VotingSeriesDto | null> => {
    const { series } = await votingApi.fetchVotingList('All', boardMemberId);
    return series.find((item) => String(item.id) === votingId) ?? null;
  },

  submitVote: async (
    seriesId: number | string,
    body: VoteSeriesRequestDto & { voteChoice?: string },
  ): Promise<{ success: boolean; message: string }> => {
    const res = await axiosInstance.post<ApiResponse<unknown>>(`/api/series/${seriesId}/vote`, body);
    const data = res.data;
    return {
      success: !!(data?.success ?? (data as ApiResponse<unknown> & { IsSuccess?: boolean }).IsSuccess),
      message: data?.message ?? (data as ApiResponse<unknown> & { Message?: string }).Message ?? '',
    };
  },
};
