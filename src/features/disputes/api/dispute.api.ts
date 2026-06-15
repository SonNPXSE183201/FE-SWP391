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

// ─── Types ───
export interface DisputeListItem {
  id: string;
  taskId: string;
  taskTitle: string;
  seriesTitle: string;
  mangakaName: string;
  assistantName: string;
  lockedAmount: number;
  status: 'Open' | 'Resolved' | 'Closed';
  createdAt: string;
  resolvedAt?: string;
  resolution?: 'Partial_Payment' | 'Full_Refund' | 'Full_Payment';
}

export interface DisputeEvidence {
  id: string;
  submittedBy: 'Mangaka' | 'Assistant';
  submitterName: string;
  type: 'text' | 'image';
  content: string;
  createdAt: string;
}

export interface DisputeDetail {
  id: string;
  taskId: string;
  taskTitle: string;
  seriesTitle: string;
  chapterTitle: string;
  mangakaName: string;
  assistantName: string;
  lockedAmount: number;
  status: 'Open' | 'Resolved' | 'Closed';
  createdAt: string;
  resolvedAt?: string;
  resolution?: 'Partial_Payment' | 'Full_Refund' | 'Full_Payment';
  assistantPaymentPercent?: number;
  taskDeadline: string;
  taskSubmittedAt: string;
  regionInfo: string;
  mangakaReason: string;
  assistantReason: string;
  evidence: DisputeEvidence[];
}

// ─── Mock Data ───
const MOCK_DISPUTES: DisputeListItem[] = [
  {
    id: 'dispute-001',
    taskId: 'task-010',
    taskTitle: 'Lineart — Trang 5-8',
    seriesTitle: 'Huyền Thoại Samurai',
    mangakaName: 'Nguyễn Minh Đức',
    assistantName: 'Trần Thị Mai',
    lockedAmount: 450000,
    status: 'Open',
    createdAt: '2026-06-10T08:30:00Z',
  },
  {
    id: 'dispute-002',
    taskId: 'task-015',
    taskTitle: 'Background — Trang 12-14',
    seriesTitle: 'Tokyo Dreamers',
    mangakaName: 'Lê Thị Hương',
    assistantName: 'Phạm Quốc Huy',
    lockedAmount: 320000,
    status: 'Open',
    createdAt: '2026-06-09T14:00:00Z',
  },
  {
    id: 'dispute-003',
    taskId: 'task-008',
    taskTitle: 'Screentone — Trang 1-4',
    seriesTitle: 'Mecha Genesis',
    mangakaName: 'Hoàng Anh Tuấn',
    assistantName: 'Nguyễn Văn Long',
    lockedAmount: 280000,
    status: 'Resolved',
    createdAt: '2026-06-05T10:00:00Z',
    resolvedAt: '2026-06-07T16:30:00Z',
    resolution: 'Partial_Payment',
  },
  {
    id: 'dispute-004',
    taskId: 'task-022',
    taskTitle: 'Coloring — Trang 9-11',
    seriesTitle: 'Cyber Ronin',
    mangakaName: 'Trần Quốc Anh',
    assistantName: 'Lê Minh Tú',
    lockedAmount: 550000,
    status: 'Closed',
    createdAt: '2026-06-01T09:00:00Z',
    resolvedAt: '2026-06-03T11:00:00Z',
    resolution: 'Full_Refund',
  },
];

const MOCK_DISPUTE_DETAIL: Record<string, DisputeDetail> = {
  'dispute-001': {
    id: 'dispute-001',
    taskId: 'task-010',
    taskTitle: 'Lineart — Trang 5-8',
    seriesTitle: 'Huyền Thoại Samurai',
    chapterTitle: 'Chapter 3: Đêm trăng máu',
    mangakaName: 'Nguyễn Minh Đức',
    assistantName: 'Trần Thị Mai',
    lockedAmount: 450000,
    status: 'Open',
    createdAt: '2026-06-10T08:30:00Z',
    taskDeadline: '2026-06-08T23:59:59Z',
    taskSubmittedAt: '2026-06-09T02:15:00Z',
    regionInfo: 'Region A3 — Panel 2-5, Trang 5-8',
    mangakaReason: 'Chất lượng đường nét không đúng yêu cầu. Các chi tiết ở trang 6-7 bị thiếu, nhân vật phụ không đúng tham chiếu. Đã yêu cầu sửa nhưng bản Revision vẫn không đạt.',
    assistantReason: 'Tôi đã hoàn thành đúng theo brief ban đầu. Trang 6-7 đã được sửa theo feedback lần 1. Mangaka thay đổi yêu cầu ở lần revision mà không cập nhật brief.',
    evidence: [
      {
        id: 'ev-001',
        submittedBy: 'Mangaka',
        submitterName: 'Nguyễn Minh Đức',
        type: 'text',
        content: 'Nhân vật Kenji ở trang 6 panel 3 bị sai tỷ lệ. Đã gửi reference nhưng Assistant không tuân thủ. Bản revision vẫn sai.',
        createdAt: '2026-06-10T08:30:00Z',
      },
      {
        id: 'ev-002',
        submittedBy: 'Mangaka',
        submitterName: 'Nguyễn Minh Đức',
        type: 'image',
        content: 'https://placehold.co/800x600/1a1a2e/e94560?text=Evidence+Mangaka+1',
        createdAt: '2026-06-10T08:32:00Z',
      },
      {
        id: 'ev-003',
        submittedBy: 'Assistant',
        submitterName: 'Trần Thị Mai',
        type: 'text',
        content: 'Tôi đã vẽ đúng theo brief gốc. Trang 6 panel 3 có reference ban đầu khác với yêu cầu mới. Mangaka đã đổi yêu cầu sau khi tôi nộp bài lần 1 mà không cập nhật brief chính thức.',
        createdAt: '2026-06-10T09:00:00Z',
      },
      {
        id: 'ev-004',
        submittedBy: 'Assistant',
        submitterName: 'Trần Thị Mai',
        type: 'image',
        content: 'https://placehold.co/800x600/0f3460/e94560?text=Evidence+Assistant+1',
        createdAt: '2026-06-10T09:05:00Z',
      },
    ],
  },
  'dispute-002': {
    id: 'dispute-002',
    taskId: 'task-015',
    taskTitle: 'Background — Trang 12-14',
    seriesTitle: 'Tokyo Dreamers',
    chapterTitle: 'Chapter 5: Con đường mùa thu',
    mangakaName: 'Lê Thị Hương',
    assistantName: 'Phạm Quốc Huy',
    lockedAmount: 320000,
    status: 'Open',
    createdAt: '2026-06-09T14:00:00Z',
    taskDeadline: '2026-06-07T23:59:59Z',
    taskSubmittedAt: '2026-06-08T01:30:00Z',
    regionInfo: 'Region B1 — Background, Trang 12-14',
    mangakaReason: 'Background không đúng perspective. Phối cảnh Tokyo Tower ở trang 13 sai góc nhìn hoàn toàn so với storyboard.',
    assistantReason: 'Storyboard ban đầu không rõ ràng về góc nhìn. Tôi đã hỏi qua chat nhưng Mangaka trả lời trễ 2 ngày. Tôi phải tự quyết định để kịp deadline.',
    evidence: [
      {
        id: 'ev-005',
        submittedBy: 'Mangaka',
        submitterName: 'Lê Thị Hương',
        type: 'text',
        content: 'Góc nhìn Tokyo Tower phải từ dưới lên (worm eye view), nhưng Assistant vẽ bird eye view. Đã gửi storyboard rõ ràng.',
        createdAt: '2026-06-09T14:00:00Z',
      },
      {
        id: 'ev-006',
        submittedBy: 'Assistant',
        submitterName: 'Phạm Quốc Huy',
        type: 'text',
        content: 'Storyboard chỉ có sketch rất sơ, không rõ góc nhìn. Tôi đã gửi tin nhắn hỏi ngày 05/06 nhưng Mangaka trả lời ngày 07/06 — lúc đó tôi đã hoàn thành rồi.',
        createdAt: '2026-06-09T15:00:00Z',
      },
    ],
  },
};

export const disputeApi = {
  getDisputes: async () => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse(MOCK_DISPUTES);
    }
    return axiosInstance.get<ApiResponse<DisputeListItem[]>>('/api/disputes');
  },

  getDisputeDetail: async (disputeId: string) => {
    if (USE_MOCK) {
      await mockDelay(500);
      const detail = MOCK_DISPUTE_DETAIL[disputeId];
      if (detail) return mockResponse(detail);
      // Fallback for disputes without detailed mock
      const listItem = MOCK_DISPUTES.find(d => d.id === disputeId);
      if (listItem) {
        return mockResponse({
          ...listItem,
          chapterTitle: 'Chapter N/A',
          taskDeadline: '2026-06-08T23:59:59Z',
          taskSubmittedAt: '2026-06-09T02:00:00Z',
          regionInfo: 'Region — N/A',
          mangakaReason: 'Chất lượng không đạt yêu cầu.',
          assistantReason: 'Đã hoàn thành theo brief.',
          evidence: [],
        } as DisputeDetail);
      }
      return mockResponse(null);
    }
    return axiosInstance.get<ApiResponse<DisputeDetail>>(`/api/disputes/${disputeId}`);
  },

  resolveDispute: async (disputeId: string, payload: { assistantPaymentPercent: number; editorNote: string }) => {
    if (USE_MOCK) {
      await mockDelay(800);
      return mockResponse(true, 'Đã phân xử tranh chấp thành công');
    }
    return axiosInstance.post<ApiResponse<boolean>>(`/api/disputes/${disputeId}/resolve`, payload);
  },
};
