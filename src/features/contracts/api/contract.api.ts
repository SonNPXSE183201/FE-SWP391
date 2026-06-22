import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../api/generated/types';
import type { components } from '../../../api/generated/schema';

type ApprovedSeriesContractDto = components['schemas']['ApprovedSeriesContractDto'];
type CreateContractRequestDto = components['schemas']['CreateContractRequestDto'];

/** UI view model mapped from ApprovedSeriesContractDto */
export interface ApprovedSeries {
  id: string;
  title: string;
  mangakaName: string;
  approvedAt: string;
  approvedBudget: number;
  publishSchedule: string;
  hasContract: boolean;
  contractId?: string;
  genkouryoPrice?: number;
  endDate?: string;
  genres: string[];
}

const mapApprovedSeriesContractDto = (dto: ApprovedSeriesContractDto): ApprovedSeries => ({
  id: dto.id ?? '',
  title: dto.title ?? '',
  mangakaName: dto.mangakaName ?? '',
  approvedAt: dto.approvedAt ?? '',
  approvedBudget: dto.approvedBudget ?? 0,
  publishSchedule: dto.publishSchedule ?? '',
  hasContract: dto.hasContract ?? false,
  contractId: dto.contractId ?? undefined,
  genres: dto.genres ?? [],
});

/** Dev-only sample data when BE is unavailable — for UI testing (F5.5 Phụ lục). */
let devMockApprovedSeries: ApprovedSeries[] = [
  {
    id: 'series-001',
    title: 'Huyền Thoại Samurai',
    mangakaName: 'Nguyễn Minh Đức',
    approvedAt: '2026-06-02T15:00:00Z',
    approvedBudget: 2_300_000,
    publishSchedule: 'Hàng tuần (Weekly)',
    hasContract: false,
    genres: ['Shōnen', 'Action', 'Historical'],
  },
  {
    id: 'series-002',
    title: 'Tokyo Dreamers',
    mangakaName: 'Lê Thị Hương',
    approvedAt: '2026-06-03T11:00:00Z',
    approvedBudget: 1_500_000,
    publishSchedule: '2 tuần 1 lần (Bi-weekly)',
    hasContract: false,
    genres: ['Shōjo', 'Romance', 'Slice of Life'],
  },
  {
    id: 'series-003',
    title: 'Cyber Ronin',
    mangakaName: 'Trần Quốc Anh',
    approvedAt: '2026-05-28T09:00:00Z',
    approvedBudget: 2_800_000,
    publishSchedule: 'Hàng tuần (Weekly)',
    hasContract: true,
    contractId: 'contract-003',
    genres: ['Seinen', 'Sci-Fi', 'Action'],
  },
  {
    id: 'series-004',
    title: 'Mecha Genesis',
    mangakaName: 'Hoàng Anh Tuấn',
    approvedAt: '2026-06-04T10:00:00Z',
    approvedBudget: 3_000_000,
    publishSchedule: 'Hàng tháng (Monthly)',
    hasContract: false,
    genres: ['Seinen', 'Mecha', 'Sci-Fi'],
  },
];

const isDevMockContractId = (contractId?: string | null) =>
  import.meta.env.DEV && !!contractId?.startsWith('contract-');

const mockDelay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const getDevMockSeries = () => [...devMockApprovedSeries];

export const contractApi = {
  getApprovedSeries: async (): Promise<ApprovedSeries[]> => {
    try {
      const res = await axiosInstance.get<ApiResponse<ApprovedSeriesContractDto[]>>(
        '/api/admin/contracts/series',
      );
      const items = (res.data?.data ?? []).map(mapApprovedSeriesContractDto);
      if (items.length > 0) return items;
    } catch (err) {
      if (!import.meta.env.DEV) throw err;
      console.warn('[contracts] API lỗi — dùng mock dev để test UI', err);
      return getDevMockSeries();
    }
    if (import.meta.env.DEV) {
      console.warn('[contracts] API trả rỗng — dùng mock dev để test UI');
      return getDevMockSeries();
    }
    return [];
  },

  createContract: async (seriesId: string, baseGenkouryoPrice: number) => {
    const payload: CreateContractRequestDto = { seriesId, baseGenkouryoPrice };
    const res = await axiosInstance.post<ApiResponse<components['schemas']['CreateContractResponseDto']>>(
      '/api/admin/contracts',
      payload,
    );
    return res.data;
  },

  updateContract: async (payload: components['schemas']['UpdateContractRequestDto']) => {
    const contractId = payload.contractId;
    const body: components['schemas']['UpdateContractRequestDto'] = {
      contractId,
      genkouryoPrice: payload.genkouryoPrice,
      endDate: payload.endDate
        ? new Date(payload.endDate.includes('T') ? payload.endDate : `${payload.endDate}T00:00:00`).toISOString()
        : undefined,
    };

    if (isDevMockContractId(contractId)) {
      await mockDelay();
      devMockApprovedSeries = devMockApprovedSeries.map((s) =>
        s.contractId === contractId
          ? {
              ...s,
              genkouryoPrice: body.genkouryoPrice ?? s.genkouryoPrice,
              endDate: body.endDate ?? s.endDate,
            }
          : s,
      );
      return { success: true, message: 'Cập nhật phụ lục (mock dev)' };
    }

    const res = await axiosInstance.put<ApiResponse<unknown>>(
      `/api/admin/contracts/${contractId}`,
      body,
    );
    return res.data;
  },
};
