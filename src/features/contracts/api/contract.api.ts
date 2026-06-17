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

export interface ApprovedSeries {
  id: string;
  title: string;
  mangakaName: string;
  approvedAt: string;
  approvedBudget: number;
  publishSchedule: string;
  hasContract: boolean;
  genres: string[];
}

export const contractApi = {
  getApprovedSeries: async () => {
    if (USE_MOCK) {
      await mockDelay();
      return mockResponse([
        {
          id: 'series-001',
          title: 'Huyền Thoại Samurai',
          mangakaName: 'Nguyễn Minh Đức',
          approvedAt: '2026-06-02T15:00:00Z',
          approvedBudget: 2300000,
          publishSchedule: 'Hàng tuần (Weekly)',
          hasContract: false,
          genres: ['Shōnen', 'Action', 'Historical'],
        },
        {
          id: 'series-002',
          title: 'Tokyo Dreamers',
          mangakaName: 'Lê Thị Hương',
          approvedAt: '2026-06-03T11:00:00Z',
          approvedBudget: 1500000,
          publishSchedule: '2 tuần 1 lần (Bi-weekly)',
          hasContract: false,
          genres: ['Shōjo', 'Romance', 'Slice of Life'],
        },
        {
          id: 'series-003',
          title: 'Cyber Ronin',
          mangakaName: 'Trần Quốc Anh',
          approvedAt: '2026-05-28T09:00:00Z',
          approvedBudget: 2800000,
          publishSchedule: 'Hàng tuần (Weekly)',
          hasContract: true,
          genres: ['Seinen', 'Sci-Fi', 'Action'],
        },
        {
          id: 'series-004',
          title: 'Mecha Genesis',
          mangakaName: 'Hoàng Anh Tuấn',
          approvedAt: '2026-06-04T10:00:00Z',
          approvedBudget: 3000000,
          publishSchedule: 'Hàng tháng (Monthly)',
          hasContract: false,
          genres: ['Seinen', 'Mecha', 'Sci-Fi'],
        },
      ]);
    }
    return axiosInstance.get<ApiResponse<ApprovedSeries[]>>('/api/admin/contracts/series');
  },

  createContract: async (seriesId: string, baseGenkouryoPrice: number) => {
    if (USE_MOCK) {
      await mockDelay(600);
      return mockResponse(true, 'Đã tạo Hợp đồng và thiết lập Nhuận bút thành công');
    }
    return axiosInstance.post<ApiResponse<boolean>>(`/api/admin/contracts`, { seriesId, baseGenkouryoPrice });
  }
};
