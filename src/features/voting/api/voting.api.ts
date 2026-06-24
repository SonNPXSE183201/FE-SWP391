import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, SeriesDto, VoteSeriesRequestDto } from '../../../api/generated/types';
import {
  matchesVotingFilter,
  type VotingListFilter,
  type VotingSeriesDto,
} from '../voting.utils';

const USE_MOCK = false;
const mockDelay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

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
    status: 'Pending_Approval',
    createAt: '2026-06-10T08:00:00Z',
    updateAt: '2026-06-20T23:59:59Z',
    boardVotes: [],
  },
];

const extractSeriesList = (body: ApiResponse<SeriesDto[]> | undefined): VotingSeriesDto[] => {
  if (!body) return [];
  return (body.data ?? (body as ApiResponse<SeriesDto[]> & { Data?: SeriesDto[] }).Data ?? []) as VotingSeriesDto[];
};

export type { VoteSeriesRequestDto, VotingListFilter, VotingSeriesDto };
export type { VoteUiChoice, VoteResultSummary } from '../voting.utils';

export const votingApi = {
  fetchVotingList: async (
    filter?: VotingListFilter,
    boardMemberId?: number | string | null,
  ): Promise<VotingSeriesDto[]> => {
    if (USE_MOCK) {
      await mockDelay();
      let items = [...MOCK_VOTING_SERIES];
      if (filter && filter !== 'All') {
        items = items.filter((item) => matchesVotingFilter(item, filter, boardMemberId));
      }
      return items;
    }

    try {
      const res = await axiosInstance.get<ApiResponse<SeriesDto[]>>('/api/votes/pending');
      let items = extractSeriesList(res.data);
      if (filter && filter !== 'All') {
        items = items.filter((item) => matchesVotingFilter(item, filter, boardMemberId));
      }
      if (items.length > 0) return items;
      if (import.meta.env.DEV) return MOCK_VOTING_SERIES;
      return items;
    } catch {
      if (import.meta.env.DEV) {
        await mockDelay();
        return MOCK_VOTING_SERIES;
      }
      throw new Error('Không tải được danh sách biểu quyết');
    }
  },

  fetchVotingDetail: async (
    votingId: string,
    boardMemberId?: number | string | null,
  ): Promise<VotingSeriesDto | null> => {
    const list = await votingApi.fetchVotingList('All', boardMemberId);
    return list.find((item) => String(item.id) === votingId) ?? null;
  },

  submitVote: async (
    seriesId: number | string,
    body: VoteSeriesRequestDto,
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
