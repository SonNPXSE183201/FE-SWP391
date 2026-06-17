import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../types';
import type { components } from '../../../api/generated/schema';

// ─── DTOs from OpenAPI Schema ────────────────────────────────
export type CreateUserByAdminDto = components["schemas"]["CreateUserByAdminDto"];
export type AssistantResponseDto = components["schemas"]["AssistantResponseDto"];
export type UserResponseDto = components["schemas"]["UserResponseDto"];
export type UserResponseDtoApiResponse = components["schemas"]["UserResponseDtoApiResponse"];

export type UserResponseDtoPagedResultApiResponse = components["schemas"]["UserResponseDtoPagedResultApiResponse"];

// ─── API Functions ───────────────────────────────────────────

export const adminApi = {
  getUsers: (params?: { page?: number; pageSize?: number; role?: string; status?: string; search?: string }) =>
    axiosInstance.get<UserResponseDtoPagedResultApiResponse>('/api/admin/users', { params }), 

  createUser: (data: CreateUserByAdminDto) =>
    axiosInstance.post<ApiResponse<UserResponseDto>>('/api/admin/users', data),

  getPendingAssistants: () =>
    axiosInstance.get<ApiResponse<AssistantResponseDto[]>>('/api/admin/users/pending'),

  approveUser: (id: number | string) =>
    axiosInstance.post<ApiResponse<UserResponseDto>>(`/api/admin/users/${id}/approve`),

  rejectUser: (id: number | string) =>
    axiosInstance.post<ApiResponse<UserResponseDto>>(`/api/admin/users/${id}/reject`),

  lockUser: (id: number | string) =>
    axiosInstance.post<ApiResponse<UserResponseDto>>(`/api/admin/users/${id}/lock`),
};
