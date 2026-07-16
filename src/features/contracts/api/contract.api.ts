import { axiosInstance } from '../../../api/axios';
import type {
  ApiResponse,
  ApprovedSeriesContractDto as GeneratedApprovedSeriesContractDto,
  CreateContractRequestDto,
  UpdateContractRequestDto,
  CreateContractResponseDto,
  ContractAddendumDto,
} from '../../../api/generated/types';

export type { ContractAddendumDto } from '../../../api/generated/types';

export type ApprovedSeriesContractDto = GeneratedApprovedSeriesContractDto & {
  contractFileUrl?: string | null;
  addendums?: ContractAddendumDto[] | null;
};

export type ContractTemplateDto = {
  id?: number;
  content?: string | null;
  version?: number;
  isActive?: boolean;
  createdByUserId?: number;
  createAt?: string;
  updateAt?: string | null;
};

type CreateContractWithTemplateRequestDto = CreateContractRequestDto & {
  templateId?: number;
};

export const contractApi = {
  getApprovedSeries: async (): Promise<ApprovedSeriesContractDto[]> => {
    const res = await axiosInstance.get<ApiResponse<ApprovedSeriesContractDto[]>>(
      '/api/admin/contracts/series',
    );
    return res.data?.data ?? [];
  },

  getContractTemplates: async (): Promise<ContractTemplateDto[]> => {
    const res = await axiosInstance.get<ApiResponse<ContractTemplateDto[]>>(
      '/api/contract-templates',
    );
    return res.data?.data ?? [];
  },

  createContract: async (seriesId: string, baseGenkouryoPrice: number, templateId: number) => {
    const payload: CreateContractWithTemplateRequestDto = { seriesId, baseGenkouryoPrice, templateId };
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

  rejectContract: async (contractId: number) => {
    const res = await axiosInstance.post<ApiResponse<unknown>>(
      `/api/contracts/${contractId}/reject`
    );
    return res.data;
  },

  createContractTemplate: async (content: string, isActive: boolean) => {
    const payload = { content, isActive };
    const res = await axiosInstance.post<ApiResponse<ContractTemplateDto>>(
      '/api/contract-templates',
      payload,
    );
    return res.data?.data;
  },

  updateContractTemplate: async (id: number, content: string, isActive: boolean) => {
    const payload = { content, isActive };
    const res = await axiosInstance.put<ApiResponse<ContractTemplateDto>>(
      `/api/contract-templates/${id}`,
      payload,
    );
    return res.data?.data;
  },

  deleteContractTemplate: async (id: number) => {
    const res = await axiosInstance.delete<ApiResponse<unknown>>(
      `/api/contract-templates/${id}`,
    );
    return res.data;
  },
};
