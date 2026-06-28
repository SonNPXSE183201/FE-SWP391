import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, SeriesDto, VoteSeriesRequestDto } from '../../../api/generated/types';
import type { BoardVotingRulesDto } from '../../admin/api/boardVoting.api';
import {
  matchesVotingFilter,
  type VotingListFilter,
  type VotingSeriesDto,
} from '../voting.utils';

const USE_MOCK = false;

const mockDelay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

type PendingBoardVotesPayload = {
  rules?: BoardVotingRulesDto;
  series?: VotingSeriesDto[];
};

const MOCK_RULES: BoardVotingRulesDto = {
  boardMemberCount: 6,
  approveRequired: 4,
  rejectRequired: 4,
  approvalThresholdPercent: 66,
  rejectionThresholdPercent: 66,
  tiePolicy: 'Escalate',
  autoResolveHours: 48,
  isEvenBoardSize: true,
  requireOddBoardSize: true,
  oddBoardSizeWarning: 'Hội đồng đang có 6 thành viên (số chẵn). Khuyến nghị số lẻ để tránh hòa phiếu.',
  rulesSummary:
    'Cần ≥4/6 phiếu Đồng ý (66%) hoặc ≥4/6 phiếu Từ chối (66%). Hòa → chuyển Admin xử lý thủ công. Tự chốt sau 48h.',
};

const MOCK_VOTING_SERIES: VotingSeriesDto[] = [
  {
    id: 1,
    title: 'Huyền Thoại Samurai',
    mangakaName: 'Nguyễn Minh Hùng',
    synopsis: 'Câu chuyện về một samurai trẻ tuổi lưu lạc qua nhiều vùng đất.',
    coverArtworkUrl:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=60',
    genre: 'Action, Adventure',
    estimatedProductionBudget: 150_000_000,
    editorName: 'Trần Văn Editor',
    status: 'Pending_Board_Vote',
    createAt: '2026-06-10T08:00:00Z',
    updateAt: '2026-06-20T23:59:59Z',
    boardVotes: [],
  },
];

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
export type { VoteUiChoice, VoteResultSummary } from '../voting.utils';
export type { BoardVotingRulesDto };

export const votingApi = {
  fetchVotingList: async (
    filter?: VotingListFilter,
    boardMemberId?: number | string | null,
  ): Promise<VotingListResult> => {
    if (USE_MOCK) {
      await mockDelay();
      let series = [...MOCK_VOTING_SERIES];
      if (filter && filter !== 'All') {
        series = series.filter((item) => matchesVotingFilter(item, filter, boardMemberId));
      }
      return { rules: MOCK_RULES, series };
    }

    try {
      const res = await axiosInstance.get<ApiResponse<PendingBoardVotesPayload | SeriesDto[]>>(
        '/api/votes/pending',
      );
      const { rules, series } = extractPendingPayload(res.data);
      let items = series;
      if (filter && filter !== 'All') {
        items = items.filter((item) => matchesVotingFilter(item, filter, boardMemberId));
      }
      if (items.length > 0 || rules) return { rules, series: items };
      if (import.meta.env.DEV) return { rules: MOCK_RULES, series: MOCK_VOTING_SERIES };
      return { rules, series: items };
    } catch {
      if (import.meta.env.DEV) {
        await mockDelay();
        return { rules: MOCK_RULES, series: MOCK_VOTING_SERIES };
      }
      throw new Error('Không tải được danh sách biểu quyết');
    }
  },

  fetchVotingRules: async (): Promise<BoardVotingRulesDto | null> => {
    try {
      const res = await axiosInstance.get<ApiResponse<BoardVotingRulesDto>>('/api/votes/rules');
      return unwrap(res.data) ?? null;
    } catch {
      return null;
    }
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
    if (USE_MOCK) {
      await mockDelay(500);
      return { success: true, message: 'Bỏ phiếu thành công!' };
    }

    const res = await axiosInstance.post<ApiResponse<unknown>>(`/api/series/${seriesId}/vote`, body);
    const data = res.data;
    return {
      success: !!(data?.success ?? (data as ApiResponse<unknown> & { IsSuccess?: boolean }).IsSuccess),
      message: data?.message ?? (data as ApiResponse<unknown> & { Message?: string }).Message ?? '',
    };
  },
};
