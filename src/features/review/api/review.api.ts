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

export const reviewApi = {
  getReviewSeriesDetail: async (seriesId: string) => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse({
        id: seriesId,
        title: 'Huyền Thoại Samurai',
        synopsis: 'Trong thời đại Edo đầy biến động, một samurai trẻ tên Kenji phải tìm lại thanh kiếm bị đánh cắp của gia tộc trước khi thế lực bóng tối thống trị thiên hạ.',
        genres: ['Shōnen', 'Action', 'Historical'],
        coverUrl: '',
        mangakaName: 'Nguyễn Minh Đức',
        submittedAt: '2026-06-01T10:00:00Z',
        requestedBudget: 2500000,
        nameFileUrl: '#',
        nameFileName: 'samurai_name_v1.pdf',
        status: 'Pending_Review',
      });
    }
    return axiosInstance.get<ApiResponse<any>>(`/api/reviews/series/${seriesId}`);
  },

  submitToBoard: async (seriesId: string, notes: string) => {
    if (USE_MOCK) {
      await mockDelay(600);
      return mockResponse(true, 'Đã trình Hội đồng thành công');
    }
    return axiosInstance.post<ApiResponse<boolean>>(`/api/reviews/series/${seriesId}/submit-to-board`, { notes });
  },

  requireRevision: async (seriesId: string, reason: string) => {
    if (USE_MOCK) {
      await mockDelay(600);
      return mockResponse(true, 'Đã yêu cầu tác giả chỉnh sửa lại Bản thảo');
    }
    return axiosInstance.post<ApiResponse<boolean>>(`/api/reviews/series/${seriesId}/require-revision`, { reason });
  }
};
