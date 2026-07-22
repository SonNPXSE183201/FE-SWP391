import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notification.api';
import { useNotificationStore } from '../../../stores/notificationStore';
import type { NotificationItem } from '../../../stores/notificationStore';
import type { NotificationDto } from '../../../api/generated/types';
import { isApiSuccess, getApiMessage } from '../../../api/apiResponse';
import { toApiDateIso } from '../../../utils/parseApiDate';
import { stripSeriesIdPrefix, getNotificationTitle } from '../../../utils/notificationLink';
import { useAuthStore } from '../../../stores/authStore';

// ─── Mapper ──────────────────────────────────────────────────

const mapDtoToItem = (dto: NotificationDto): NotificationItem => {
  const rawContent = dto.content ?? '';
  const rawType = dto.type ?? 'SystemAlert';
  const message = stripSeriesIdPrefix(rawContent);

  return {
    id: String(dto.id ?? 0),
    title: dto.title ?? getNotificationTitle(rawType),
    message,
    isRead: dto.isRead ?? false,
    link: dto.link ?? undefined,
    rawType,
    type:
      rawType === 'Series_Revision_Required'
      || rawType === 'Series_Pending_Review'
      || rawType === 'Series_Submitted_To_Board'
        ? 'Review'
        : ((dto.type as NotificationItem['type']) ?? 'SystemAlert'),
    createdAt: toApiDateIso(dto.createAt),
  };
};

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

      // Load local notifications from localStorage
      const currentUser = useAuthStore.getState().user;
      const localNotifsStr = localStorage.getItem('local_notifications');
      let localItems: NotificationItem[] = [];
      if (localNotifsStr) {
        try {
          const parsed = JSON.parse(localNotifsStr) as Array<{
            id: string;
            title: string;
            message: string;
            isRead: boolean;
            type?: string;
            rawType?: string;
            createdAt: string;
            targetUserId?: string;
          }>;
          if (Array.isArray(parsed)) {
            localItems = parsed
              .filter((item) => {
                if (item.isRead) return false;
                if (currentUser?.role === 'Editor') {
                  if (item.targetUserId) {
                    return String(item.targetUserId) === String(currentUser.id);
                  }
                  return true;
                }
                return false;
              })
              .map((item) => ({
                id: item.id,
                title: item.title,
                message: item.message,
                isRead: !!item.isRead,
                type: (item.type as NotificationItem['type']) || 'SystemAlert',
                rawType: item.rawType,
                createdAt: item.createdAt,
              }));
          }
        } catch (e) {
          console.error(e);
        }
      }

      if (isApiSuccess(payload) && payload.data) {
        const apiItems = payload.data
          .map(mapDtoToItem)
          .filter((n) => !n.isRead);
        
        const allItems = [...localItems, ...apiItems];
        const start = (page - 1) * pageSize;
        const items = allItems.slice(start, start + pageSize);
        const unreadCount = allItems.filter((n) => !n.isRead).length;
        setNotifications(items, unreadCount);
        return {
          items,
          totalCount: allItems.length,
          unreadCount,
        };
      }

      if (localItems.length > 0) {
        const start = (page - 1) * pageSize;
        const items = localItems.slice(start, start + pageSize);
        const unreadCount = localItems.length;
        setNotifications(items, unreadCount);
        return {
          items,
          totalCount: localItems.length,
          unreadCount,
        };
      }

      throw new Error(getApiMessage(payload, 'Không thể tải thông báo'));
    },
    refetchInterval: 30_000,
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

      let localUnreadCount = 0;
      const currentUser = useAuthStore.getState().user;
      const localNotifsStr = localStorage.getItem('local_notifications');
      if (localNotifsStr) {
        try {
          const parsed = JSON.parse(localNotifsStr) as Array<{
            id: string;
            isRead: boolean;
            targetUserId?: string;
          }>;
          if (Array.isArray(parsed)) {
            localUnreadCount = parsed.filter((item) => {
              if (item.isRead) return false;
              if (currentUser?.role === 'Editor') {
                if (item.targetUserId) {
                  return String(item.targetUserId) === String(currentUser.id);
                }
                return true;
              }
              return false;
            }).length;
          }
        } catch (e) {
          console.error(e);
        }
      }

      if (isApiSuccess(payload) && payload.data !== undefined) {
        const count = (typeof payload.data === 'number' ? payload.data : 0) + localUnreadCount;
        setUnreadCount(count);
        return count;
      }

      return localUnreadCount;
    },
    refetchInterval: 15_000,
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
    mutationFn: (notificationId: string) => {
      if (notificationId.startsWith('local_notif_')) {
        const localNotifsStr = localStorage.getItem('local_notifications');
        if (localNotifsStr) {
          try {
            const parsed = JSON.parse(localNotifsStr) as Array<{
              id: string;
              isRead: boolean;
            }>;
            if (Array.isArray(parsed)) {
              const updated = parsed.map((item) => {
                if (item.id === notificationId) {
                  return { ...item, isRead: true };
                }
                return item;
              });
              localStorage.setItem('local_notifications', JSON.stringify(updated));
            }
          } catch (e) {
            console.error(e);
          }
        }
        return Promise.resolve();
      }
      return notificationApi.markAsRead(notificationId);
    },
    onMutate: (notificationId) => {
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
    mutationFn: () => {
      const localNotifsStr = localStorage.getItem('local_notifications');
      if (localNotifsStr) {
        try {
          const parsed = JSON.parse(localNotifsStr) as Array<{
            isRead: boolean;
          }>;
          if (Array.isArray(parsed)) {
            const updated = parsed.map((item) => ({ ...item, isRead: true }));
            localStorage.setItem('local_notifications', JSON.stringify(updated));
          }
        } catch (e) {
          console.error(e);
        }
      }
      return notificationApi.markAllAsRead();
    },
    onMutate: () => {
      markAllAsRead();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
