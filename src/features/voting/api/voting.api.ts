import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/generated/types';

const USE_MOCK = true;
const mockDelay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Types (UI-specific — backend uses BoardVote + VoteSeriesRequestDto) ─

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

// ─── Mock Data ───────────────────────────────────────────────

const MOCK_VOTING_SERIES: VotingSeriesItem[] = [
  {
    id: 'v1',
    seriesId: 's1',
    title: 'Huyền Thoại Samurai',
    mangakaName: 'Nguyễn Minh Hùng',
    synopsis: 'Câu chuyện về một samurai trẻ tuổi lưu lạc qua nhiều vùng đất, tìm kiếm sư phụ đã mất tích bí ẩn. Trên hành trình, anh phải đối mặt với các thế lực hắc ám đang âm mưu thống trị thiên hạ bằng một loại kiếm thuật cổ đại bị cấm.',
    coverImageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=60',
    genres: ['Action', 'Adventure', 'Historical'],
    requestedBudget: 150000000,
    editorName: 'Trần Văn Editor',
    editorRecommendation: 'Tiềm năng lớn. Cốt truyện hấp dẫn với yếu tố lịch sử Nhật Bản. Art style chất lượng cao, nên đầu tư phát triển dài hạn. Đề xuất phê duyệt với budget đầy đủ.',
    submittedAt: '2026-06-10T08:00:00Z',
    deadline: '2026-06-20T23:59:59Z',
    status: 'Pending',
    voteResults: { approve: 3, reject: 1, abstain: 0, total: 5 },
  },
  {
    id: 'v2',
    seriesId: 's2',
    title: 'Lạc Giữa Ngân Hà',
    mangakaName: 'Lê Thị Hoa',
    synopsis: 'Năm 2180, nhân loại đã mở rộng thuộc địa ra ngoài hệ Mặt Trời. Một nhóm phi hành gia trẻ bất ngờ mất liên lạc với Trái Đất giữa vùng sao xa lạ, và phát hiện ra một nền văn minh ngoài hành tinh cổ đại đang im lìm chờ đợi.',
    coverImageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=60',
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    requestedBudget: 200000000,
    editorName: 'Phạm Quốc Bảo',
    editorRecommendation: 'Đề tài Sci-Fi hiếm trên thị trường Manga Việt, có thể tạo phân khúc mới. Tuy nhiên budget cao, cần cân nhắc giảm 20% cho phase đầu. Đề xuất phê duyệt có điều kiện.',
    submittedAt: '2026-06-11T10:30:00Z',
    deadline: '2026-06-21T23:59:59Z',
    status: 'Pending',
    voteResults: { approve: 2, reject: 0, abstain: 1, total: 5 },
  },
  {
    id: 'v3',
    seriesId: 's3',
    title: 'Vườn Hoa Mùa Đông',
    mangakaName: 'Trần Thanh Tâm',
    synopsis: 'Câu chuyện tình cảm giữa hai học sinh cấp ba — cô gái yêu hoa cúc và chàng trai trầm lặng sống cạnh tiệm hoa gia đình. Một mùa đông, bí mật về quá khứ của cả hai dần được hé lộ, thử thách tình bạn và tình yêu vừa chớm nở.',
    coverImageUrl: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=300&auto=format&fit=crop&q=60',
    genres: ['Romance', 'Slice of Life'],
    requestedBudget: 80000000,
    editorName: 'Trần Văn Editor',
    editorRecommendation: 'Art phong cách shoujo đẹp mắt. Cốt truyện nhẹ nhàng, phù hợp nữ độc giả 16-25 tuổi. Budget thấp, ROI khả quan. Đề xuất phê duyệt.',
    submittedAt: '2026-06-08T14:00:00Z',
    deadline: '2026-06-18T23:59:59Z',
    status: 'Voted',
    myVote: 'Approve',
    voteResults: { approve: 4, reject: 0, abstain: 1, total: 5 },
  },
  {
    id: 'v4',
    seriesId: 's4',
    title: 'Bóng Đêm Đô Thị',
    mangakaName: 'Phạm Hữu Đức',
    synopsis: 'Một thám tử tư ở Sài Gòn theo dõi những vụ mất tích kỳ lạ liên tiếp trong khu phố cổ. Khi đào sâu vào vụ án, anh phát hiện ra một tổ chức ngầm đang kiểm soát thế giới ngầm bằng công nghệ thao túng tâm trí.',
    coverImageUrl: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=300&auto=format&fit=crop&q=60',
    genres: ['Thriller', 'Action', 'Noir'],
    requestedBudget: 120000000,
    editorName: 'Phạm Quốc Bảo',
    editorRecommendation: 'Đề tài noir detective rất có tiềm năng. Cần cải thiện nhịp kể chuyện ở 3 chapter đầu. Đề xuất phê duyệt với yêu cầu sửa đổi outline.',
    submittedAt: '2026-06-12T09:15:00Z',
    deadline: '2026-06-22T23:59:59Z',
    status: 'Pending',
    voteResults: { approve: 1, reject: 2, abstain: 0, total: 5 },
  },
  {
    id: 'v5',
    seriesId: 's5',
    title: 'Đảo Kỳ Bí',
    mangakaName: 'Hoàng Anh Tuấn',
    synopsis: 'Năm học sinh trung học bị cuốn vào một hòn đảo bí ẩn sau khi tàu du lịch gặp bão. Trên đảo, họ phải đối mặt với sinh vật huyền bí, giải các câu đố cổ đại để tìm đường về nhà, đồng thời phát hiện ra sức mạnh tiềm ẩn của bản thân.',
    coverImageUrl: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=300&auto=format&fit=crop&q=60',
    genres: ['Adventure', 'Fantasy', 'Mystery'],
    requestedBudget: 100000000,
    editorName: 'Trần Văn Editor',
    editorRecommendation: 'Thể loại phiêu lưu phù hợp mọi lứa tuổi. Đề tài tương tự "Lost" kết hợp fantasy. Art style sạch sẽ nhưng cần tăng chi tiết hơn cho background. Đề xuất phê duyệt.',
    submittedAt: '2026-06-09T16:45:00Z',
    deadline: '2026-06-19T23:59:59Z',
    status: 'Closed',
    myVote: 'Reject',
    voteResults: { approve: 1, reject: 3, abstain: 1, total: 5 },
  },
];

// ─── API Functions ───────────────────────────────────────────

export const votingApi = {
  /** Lấy danh sách series cần vote / đã vote */
  fetchVotingList: async (filter?: VotingStatus | 'All'): Promise<VotingSeriesItem[]> => {
    if (USE_MOCK) {
      await mockDelay();
      if (!filter || filter === 'All') return [...MOCK_VOTING_SERIES];
      return MOCK_VOTING_SERIES.filter((item) => item.status === filter);
    }
    const res = await axiosInstance.get<ApiResponse<VotingSeriesItem[]>>('/api/votes/pending', {
      params: filter && filter !== 'All' ? { status: filter } : undefined,
    });
    return res.data?.data ?? [];
  },

  /** Lấy chi tiết 1 voting item */
  fetchVotingDetail: async (votingId: string): Promise<VotingSeriesItem | null> => {
    if (USE_MOCK) {
      await mockDelay(200);
      return MOCK_VOTING_SERIES.find((item) => item.id === votingId) ?? null;
    }
    const res = await axiosInstance.get<ApiResponse<VotingSeriesItem>>(`/api/votes/${votingId}`);
    return res.data?.data ?? null;
  },

  /** Gửi phiếu bầu */
  submitVote: async (payload: SubmitVotePayload): Promise<{ success: boolean; message: string }> => {
    if (USE_MOCK) {
      await mockDelay(500);
      const item = MOCK_VOTING_SERIES.find((s) => s.id === payload.votingId);
      if (item) {
        item.myVote = payload.decision;
        item.status = 'Voted';
        if (payload.decision === 'Approve') item.voteResults.approve += 1;
        else if (payload.decision === 'Reject') item.voteResults.reject += 1;
        else item.voteResults.abstain += 1;
      }
      return { success: true, message: 'Bỏ phiếu thành công!' };
    }
    const res = await axiosInstance.post<ApiResponse<unknown>>('/api/votes', payload);
    return { success: res.data?.success ?? false, message: res.data?.message ?? '' };
  },
};
