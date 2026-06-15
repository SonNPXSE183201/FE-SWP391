import { axiosInstance } from '../../../api/axios';
import type { ApiResponse } from '../../../types';

// ─── Request DTOs ────────────────────────────────────────────

export interface CreateUserByAdminDto {
  roleId: number;
  userName: string;
  email: string;
  fullName: string;
  penName?: string;
  portfolioUrl?: string;
  skills?: string;
}

// ─── Response DTOs ───────────────────────────────────────────

export interface AssistantResponseDto {
  id: number;
  userName: string;
  email: string;
  fullName: string;
  status: string;
  portfolioUrl?: string;
  skills?: string;
}

export interface UserResponseDto {
  id: number;
  userName: string;
  email: string;
  fullName: string;
  roleId: number;
  status: string;
  penName?: string;
  message?: string;
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
  getUsers: (params?: { page?: number; pageSize?: number; role?: string; status?: string }) =>
    axiosInstance.get<any>('/api/admin/users', { params }), // For mock UI compatibility

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
