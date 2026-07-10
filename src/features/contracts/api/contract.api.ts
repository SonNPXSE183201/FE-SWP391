import { axiosInstance } from '../../../api/axios';
import type {
  ApiResponse,
  ApprovedSeriesContractDto,
  CreateContractRequestDto,
  UpdateContractRequestDto,
  CreateContractResponseDto,
} from '../../../api/generated/types';

export type { ApprovedSeriesContractDto, ContractAddendumDto } from '../../../api/generated/types';

export const contractApi = {
  getApprovedSeries: async (): Promise<ApprovedSeriesContractDto[]> => {
    const res = await axiosInstance.get<ApiResponse<ApprovedSeriesContractDto[]>>(
      '/api/admin/contracts/series',
    );
    return res.data?.data ?? [];
  },

  createContract: async (seriesId: string, baseGenkouryoPrice: number) => {
    const payload: CreateContractRequestDto = { seriesId, baseGenkouryoPrice };
    const res = await axiosInstance.post<ApiResponse<CreateContractResponseDto>>(
      '/api/admin/contracts',
      payload,
    );
    return res.data;
  },

  updateContract: async (payload: UpdateContractRequestDto) => {
    const contractId = payload.contractId;
    const body: UpdateContractRequestDto = {
      contractId,
      genkouryoPrice: payload.genkouryoPrice,
      endDate: payload.endDate
        ? new Date(payload.endDate.includes('T') ? payload.endDate : `${payload.endDate}T00:00:00`).toISOString()
        : undefined,
    };

    const res = await axiosInstance.put<ApiResponse<unknown>>(
      `/api/admin/contracts/${contractId}`,
      body,
    );
    return res.data;
  },
};
