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

export const contractApi = {
  getApprovedSeries: async (): Promise<ApprovedSeries[]> => {
    const res = await axiosInstance.get<ApiResponse<ApprovedSeriesContractDto[]>>(
      '/api/admin/contracts/series',
    );
    return (res.data?.Data ?? []).map(mapApprovedSeriesContractDto);
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
    const res = await axiosInstance.put<ApiResponse<unknown>>(
      `/api/admin/contracts/${contractId}`,
      payload,
    );
    return res.data;
  },
};
