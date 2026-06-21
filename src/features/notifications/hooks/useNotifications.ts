import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notification.api';
import { useNotificationStore } from '../../../stores/notificationStore';
import type { NotificationItem } from '../../../stores/notificationStore';
import type { NotificationDto } from '../../../api/generated/types';

// ─── Mapper ──────────────────────────────────────────────────

const mapDtoToItem = (dto: NotificationDto): NotificationItem => ({
  id: String(dto.id ?? 0),
  title: dto.title ?? '',
  message: dto.content ?? '',
  isRead: dto.isRead ?? false,
  link: dto.link ?? undefined,
  type: (dto.type as NotificationItem['type']) ?? 'SystemAlert',
  createdAt: dto.createAt ?? new Date().toISOString(),
});

// ─── Query Keys ──────────────────────────────────────────────

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (page: number) => ['notifications', 'list', page] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

// ─── Hooks ───────────────────────────────────────────────────

/**
 * Fetch notification list and sync to Zustand store.
 */
export const useNotificationList = (page: number = 1, pageSize: number = 20) => {
  const { setNotifications } = useNotificationStore();

  return useQuery({
    queryKey: notificationKeys.list(page),
    queryFn: async () => {
      const response = await notificationApi.getAll(page, pageSize);
      const payload = response.data;

      if (payload.IsSuccess && payload.Data) {
        const items = payload.Data.Items.map(mapDtoToItem);
        setNotifications(items, payload.Data.UnreadCount);
        return {
          items,
          totalCount: payload.Data.TotalCount,
          unreadCount: payload.Data.UnreadCount,
        };
      }

      throw new Error(payload.Message || 'Không thể tải thông báo');
    },
    refetchInterval: 30_000, // Poll every 30s as fallback
    staleTime: 10_000,
  });
};

/**
 * Fetch only unread count — lightweight polling for badge.
 */
export const useUnreadCount = () => {
  const { setUnreadCount } = useNotificationStore();

  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: async () => {
      const response = await notificationApi.getUnreadCount();
      const payload = response.data;

      if (payload?.IsSuccess && payload?.Data !== undefined) {
        const count = typeof payload.Data === 'number' ? payload.Data : 0;
        setUnreadCount(count);
        return count;
      }

      return 0;
    },
    refetchInterval: 15_000, // Poll every 15s
    staleTime: 5_000,
  });
};

/**
 * Mark a single notification as read.
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { markAsRead } = useNotificationStore();

  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.markAsRead(notificationId),
    onMutate: (notificationId) => {
      // Optimistic update
      markAsRead(notificationId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

/**
 * Mark all notifications as read.
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { markAllAsRead } = useNotificationStore();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onMutate: () => {
      // Optimistic update
      markAllAsRead();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
