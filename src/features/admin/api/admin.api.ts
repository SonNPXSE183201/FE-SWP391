import { axiosInstance } from '../../api/axios';
import type { ApiResponse, PaginatedResponse } from '../../types';
import type { AssistantProfile } from '../../types';

// ─── Request DTOs ────────────────────────────────────────────

export interface ApproveAssistantRequest {
  userId: string;
  approved: boolean;
  reason?: string;
}

export interface UpdateContractRequest {
  contractId: string;
  genkouryoPrice?: number;
  endDate?: string;
}

export interface UserListItem {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
}

// ─── API Functions ───────────────────────────────────────────

export const adminApi = {
  // User management (F5.1, F5.2)
  getUsers: (params?: { page?: number; pageSize?: number; role?: string; status?: string }) =>
    axiosInstance.get<PaginatedResponse<UserListItem>>('/api/admin/users', { params }),

  approveAssistant: (data: ApproveAssistantRequest) =>
    axiosInstance.put<ApiResponse<AssistantProfile>>(`/api/admin/users/${data.userId}/approve`, data),

  // Contract management (F5.3, F5.5)
  updateContract: (data: UpdateContractRequest) =>
    axiosInstance.put<ApiResponse<null>>(`/api/admin/contracts/${data.contractId}`, data),

  // Reconciliation (F5.6)
  getReconciliation: (params?: { from?: string; to?: string }) =>
    axiosInstance.get('/api/admin/reconciliation', { params }),
};
