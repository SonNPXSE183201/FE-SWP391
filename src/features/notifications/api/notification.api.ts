import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, NotificationDto as SchemaNotificationDto } from '../../../api/generated/types';

export const notificationApi = {
  getAll: async (page: number = 1, pageSize: number = 20) =>
    axiosInstance.get<ApiResponse<SchemaNotificationDto[]>>('/api/notifications', {
      params: { page, pageSize },
    }),

  getUnreadCount: async () =>
    axiosInstance.get<ApiResponse<number>>('/api/notifications/unread-count'),

  markAsRead: async (notificationId: string) =>
    axiosInstance.patch<ApiResponse<boolean>>(`/api/notifications/${notificationId}/read`),

  markAllAsRead: async () =>
    axiosInstance.post<ApiResponse<boolean>>('/api/notifications/mark-all-read'),
};
