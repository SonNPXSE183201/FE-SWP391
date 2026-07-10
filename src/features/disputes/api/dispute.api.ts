import { axiosInstance } from '../../../api/axios';
import type {
  ApiResponse,
  DisputeListItemDto,
  DisputeDetailDto,
  DisputeEvidenceDto,
} from '../../../api/generated/types';

export type { DisputeListItemDto, DisputeDetailDto, DisputeEvidenceDto };

export const disputeApi = {
  getDisputes: async (status?: string) => {
    const queryParam = status ? `?status=${status}` : '';
    return axiosInstance.get<ApiResponse<DisputeListItemDto[]>>(`/api/disputes${queryParam}`);
  },

  getDisputeDetail: async (taskId: number | string) => {
    const numId = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
    return axiosInstance.get<ApiResponse<DisputeDetailDto>>(`/api/disputes/${numId}`);
  },

  resolveDispute: async (
    taskId: number | string,
    payload: { assistantPaymentPercent: number; editorNote: string },
  ) => {
    const numId = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
    return axiosInstance.post<ApiResponse<boolean>>(`/api/disputes/${numId}/resolve`, {
      AssistantRate: payload.assistantPaymentPercent / 100,
    });
  },
};
