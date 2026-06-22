import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, SeriesDto } from '../../../api/generated/types';
import type { components } from '../../../api/generated/schema';

const USE_MOCK = false;
const mockDelay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Types (UI-specific — BE: SeriesDto + VoteSeriesRequestDto) ─

export type VoteDecision = 'Approve' | 'Reject' | 'Abstain';
export type VotingStatus = 'Pending' | 'Voted' | 'Closed';

export interface VotingSeriesItem {
  id: string;
  seriesId: string;
  title: string;
  mangakaName: string;
  synopsis: string;
  coverImageUrl: string;
  genres: string[];
  requestedBudget: number;
  editorName: string;
  editorRecommendation: string;
  submittedAt: string;
  deadline: string;
  status: VotingStatus;
  myVote?: VoteDecision;
  voteResults: {
    approve: number;
    reject: number;
    abstain: number;
    total: number;
  };
}

export interface SubmitVotePayload {
  votingId: string;
  decision: VoteDecision;
  comment: string;
}

type VoteSeriesRequestDto = components['schemas']['VoteSeriesRequestDto'];

// ─── Mock Data (dev fallback) ────────────────────────────────

const MOCK_VOTING_SERIES: VotingSeriesItem[] = [
  {
    id: '1',
    seriesId: '1',
    title: 'Huyền Thoại Samurai',
    mangakaName: 'Nguyễn Minh Hùng',
    synopsis: 'Câu chuyện về một samurai trẻ tuổi lưu lạc qua nhiều vùng đất.',
    coverImageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=60',
    genres: ['Action', 'Adventure'],
    requestedBudget: 150000000,
    editorName: 'Trần Văn Editor',
    editorRecommendation: 'Tiềm năng lớn. Đề xuất phê duyệt.',
    submittedAt: '2026-06-10T08:00:00Z',
    deadline: '2026-06-20T23:59:59Z',
    status: 'Pending',
    voteResults: { approve: 0, reject: 0, abstain: 0, total: 0 },
  },
];

const mapSeriesDtoToVotingItem = (dto: SeriesDto): VotingSeriesItem => {
  const genres = dto.genre
    ? dto.genre.split(/[,;]/).map((g) => g.trim()).filter(Boolean)
    : [];

  return {
    id: String(dto.id ?? ''),
    seriesId: String(dto.id ?? ''),
    title: dto.title ?? '',
    mangakaName: dto.mangakaName ?? '',
    synopsis: dto.synopsis ?? '',
    coverImageUrl: dto.coverArtworkUrl ?? '',
    genres,
    requestedBudget: dto.estimatedProductionBudget ?? 0,
    editorName: dto.editorName ?? '',
    editorRecommendation: '',
    submittedAt: dto.createAt ?? new Date().toISOString(),
    deadline: dto.updateAt ?? dto.createAt ?? new Date().toISOString(),
    status: dto.status === 'Closed' ? 'Closed' : 'Pending',
    voteResults: { approve: 0, reject: 0, abstain: 0, total: 0 },
  };
};

const extractSeriesList = (body: ApiResponse<SeriesDto[]> | undefined): SeriesDto[] => {
  if (!body) return [];
  return (body.data ?? (body as ApiResponse<SeriesDto[]> & { Data?: SeriesDto[] }).Data ?? []) as SeriesDto[];
};

const decisionToDto = (decision: VoteDecision, comment: string): VoteSeriesRequestDto => {
  if (decision === 'Abstain') {
    return { approved: false, comment: `[Abstain] ${comment}`.trim() };
  }
  return {
    approved: decision === 'Approve',
    comment: comment || undefined,
  };
};

// ─── API Functions ───────────────────────────────────────────

export const votingApi = {
  fetchVotingList: async (filter?: VotingStatus | 'All'): Promise<VotingSeriesItem[]> => {
    if (USE_MOCK) {
      await mockDelay();
      if (!filter || filter === 'All') return [...MOCK_VOTING_SERIES];
      return MOCK_VOTING_SERIES.filter((item) => item.status === filter);
    }

    try {
      const res = await axiosInstance.get<ApiResponse<SeriesDto[]>>('/api/votes/pending');
      let items = extractSeriesList(res.data).map(mapSeriesDtoToVotingItem);
      if (filter && filter !== 'All') {
        items = items.filter((item) => item.status === filter);
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

  fetchVotingDetail: async (votingId: string): Promise<VotingSeriesItem | null> => {
    const list = await votingApi.fetchVotingList('All');
    return list.find((item) => item.id === votingId || item.seriesId === votingId) ?? null;
  },

  submitVote: async (payload: SubmitVotePayload): Promise<{ success: boolean; message: string }> => {
    if (USE_MOCK) {
      await mockDelay(500);
      const item = MOCK_VOTING_SERIES.find((s) => s.id === payload.votingId);
      if (item) {
        item.myVote = payload.decision;
        item.status = 'Voted';
      }
      return { success: true, message: 'Bỏ phiếu thành công!' };
    }

    const seriesId = payload.votingId;
    const body = decisionToDto(payload.decision, payload.comment);
    const res = await axiosInstance.post<ApiResponse<unknown>>(
      `/api/series/${seriesId}/vote`,
      body,
    );
    const data = res.data;
    return {
      success: !!(data?.success ?? (data as ApiResponse<unknown> & { IsSuccess?: boolean }).IsSuccess),
      message: data?.message ?? (data as ApiResponse<unknown> & { Message?: string }).Message ?? '',
    };
  },
};
