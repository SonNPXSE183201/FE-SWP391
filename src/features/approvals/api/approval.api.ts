import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/generated/types';

const USE_MOCK = true;

import { createMockApiResponse } from '../../../api/apiResponse';

const mockDelay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const mockResponse = createMockApiResponse;

export const approvalApi = {
  getPendingProposals: async () => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse([
        {
          id: 'series-001',
          title: 'Huyền Thoại Samurai',
          mangakaName: 'Nguyễn Minh Đức',
          submittedAt: '2026-06-01T10:00:00Z',
          requestedBudget: 2500000,
          genres: ['Shōnen', 'Action', 'Historical'],
          editorName: 'Trần Văn Nam',
          editorNote: 'Cốt truyện hấp dẫn, tiềm năng thương mại cao. Phác thảo chất lượng tốt. Ngân sách hợp lý cho một chapter đầu tiên.',
          synopsis: 'Trong thời đại Edo đầy biến động, một samurai trẻ tên Kenji phải tìm lại thanh kiếm bị đánh cắp...',
          coverUrl: '',
          nameFileName: 'samurai_name_v1.pdf',
        },
        {
          id: 'series-002',
          title: 'Tokyo Dreamers',
          mangakaName: 'Lê Thị Hương',
          submittedAt: '2026-06-02T14:30:00Z',
          requestedBudget: 1800000,
          genres: ['Shōjo', 'Romance', 'Slice of Life'],
          editorName: 'Phạm Quốc Bảo',
          editorNote: 'Thể loại romance phù hợp thị trường. Cần điều chỉnh ngân sách do scope nhỏ hơn dự kiến.',
          synopsis: 'Câu chuyện về những giấc mơ tuổi trẻ giữa Tokyo hoa lệ...',
          coverUrl: '',
          nameFileName: 'tokyo_dreamers_name_v1.pdf',
        },
        {
          id: 'series-003',
          title: 'Mecha Genesis',
          mangakaName: 'Hoàng Anh Tuấn',
          submittedAt: '2026-06-03T09:15:00Z',
          requestedBudget: 3200000,
          genres: ['Seinen', 'Mecha', 'Sci-Fi'],
          editorName: 'Trần Văn Nam',
          editorNote: 'Series Mecha khá độc đáo, ngân sách cao do yêu cầu chi tiết kỹ thuật. Tiềm năng xuất bản dài kỳ.',
          synopsis: 'Năm 2087, nhân loại đối mặt với mối đe dọa từ những cỗ máy tự tiến hóa...',
          coverUrl: '',
          nameFileName: 'mecha_genesis_name_v1.pdf',
        },
      ]);
    }
    return axiosInstance.get<ApiResponse<any[]>>('/api/approvals/proposals'); // eslint-disable-line @typescript-eslint/no-explicit-any
  },

  approveProposal: async (seriesId: string, payload: { approvedBudget: number; publishSchedule: string }) => {
    if (USE_MOCK) {
      await mockDelay(600);
      return mockResponse(true, 'Đã phê duyệt ngân sách và lịch xuất bản thành công');
    }
    return axiosInstance.post<ApiResponse<boolean>>(`/api/approvals/proposals/${seriesId}/approve`, payload);
  },

  rejectProposal: async (seriesId: string) => {
    if (USE_MOCK) {
      await mockDelay(600);
      return mockResponse(true, 'Đã từ chối dự án');
    }
    return axiosInstance.post<ApiResponse<boolean>>(`/api/approvals/proposals/${seriesId}/reject`);
  },
};
