import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, NotificationDto as SchemaNotificationDto } from '../../../api/generated/types';
import type { Notification } from '../../../types/entities';

// ─── Toggle this to false when backend notification API is ready ───
const USE_MOCK = false;

// ─── Mock Data ───────────────────────────────────────────────
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    title: 'Task hoàn thành',
    message: 'Assistant Minh đã nộp bài cho Region #3 — Chapter 5',
    isRead: false,
    link: '/mangaka/tasks',
    type: 'TaskUpdate',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    title: 'Nạp tiền thành công',
    message: 'Bạn đã nạp thành công 500.000₫ vào ví',
    isRead: false,
    link: '/mangaka/wallet',
    type: 'WalletUpdate',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    title: 'Review bản thảo',
    message: 'Editor Tanaka đã gửi nhận xét về Chapter 4',
    isRead: false,
    link: '/mangaka/series',
    type: 'Review',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    title: 'Series được duyệt',
    message: 'Hội đồng đã phê duyệt series "Kaze no Tsubasa" để xuất bản',
    isRead: true,
    link: '/mangaka/series',
    type: 'SystemAlert',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-5',
    userId: 'user-1',
    title: 'Task quá hạn',
    message: 'Task "Tô màu trang 12" đã quá hạn 2 ngày — sẽ tự động hủy sau 24h',
    isRead: true,
    link: '/mangaka/tasks',
    type: 'TaskUpdate',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-6',
    userId: 'user-1',
    title: 'Thanh toán nhuận bút',
    message: 'Genkoūryō cho Chapter 3 đã được chuyển: 1.200.000₫',
    isRead: true,
    link: '/mangaka/wallet',
    type: 'WalletUpdate',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Mock helper ─────────────────────────────────────────────
const mockDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

const createMockAxiosResponse = <T>(data: T, message = 'Success') => ({
  data: {
    success: true,
    statusCode: 200,
    message,
    data,
  } satisfies ApiResponse<T>,
});

// ─── Response DTOs ───────────────────────────────────────────
export interface NotificationListResponse {
  items: SchemaNotificationDto[];
  totalCount: number;
  unreadCount: number;
}

// ─── Mappers (mock camelCase → schema PascalCase) ────────────
const toSchemaNotificationDto = (n: Notification): SchemaNotificationDto => ({
  id: Number(n.id.replace(/\D/g, '') || 0),
  content: n.message,
  type: n.type,
  isRead: n.isRead,
  createAt: n.createdAt,
  title: n.title,
  link: n.link,
});

// Keep a mutable copy for mock state
const mockState = MOCK_NOTIFICATIONS.map(n => ({ ...n }));

// ─── Notification API ────────────────────────────────────────
export const notificationApi = {
  /**
   * GET /api/notifications
   * Returns paginated notification list with unread count.
   */
  getAll: async (page: number = 1, pageSize: number = 20) => {
    if (USE_MOCK) {
      await mockDelay(250);
      const items = mockState.map(toSchemaNotificationDto);
      return createMockAxiosResponse(items);
    }
    return axiosInstance.get<ApiResponse<SchemaNotificationDto[]>>('/api/notifications', {
      params: { page, pageSize },
    });
  },

  /**
   * GET /api/notifications/unread-count
   * Returns just the unread count for the badge.
   */
  getUnreadCount: async () => {
    if (USE_MOCK) {
      await mockDelay(100);
      return createMockAxiosResponse(mockState.filter(n => !n.isRead).length);
    }
    return axiosInstance.get<ApiResponse<number>>('/api/notifications/unread-count');
  },

  /**
   * PATCH /api/notifications/:id/read
   * Marks a single notification as read.
   */
  markAsRead: async (notificationId: string) => {
    if (USE_MOCK) {
      await mockDelay(150);
      const notifIndex = mockState.findIndex(n => n.id === notificationId);
      if (notifIndex >= 0) mockState.splice(notifIndex, 1);
      return createMockAxiosResponse(true, 'Đã đánh dấu đã đọc');
    }
    return axiosInstance.patch<ApiResponse<boolean>>(`/api/notifications/${notificationId}/read`);
  },

  /**
   * POST /api/notifications/mark-all-read
   * Marks all notifications as read.
   */
  markAllAsRead: async () => {
    if (USE_MOCK) {
      await mockDelay(200);
      for (let i = mockState.length - 1; i >= 0; i -= 1) {
        if (!mockState[i].isRead) mockState.splice(i, 1);
      }
      return createMockAxiosResponse(true, 'Đã đánh dấu tất cả đã đọc');
    }
    return axiosInstance.post<ApiResponse<boolean>>('/api/notifications/mark-all-read');
  },
};
