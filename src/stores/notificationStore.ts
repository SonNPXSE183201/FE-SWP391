import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  type: 'TaskUpdate' | 'WalletUpdate' | 'SystemAlert' | 'Review';
  createdAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isDropdownOpen: boolean;
}

interface NotificationActions {
  setNotifications: (items: NotificationItem[], unreadCount: number) => void;
  addNotification: (item: NotificationItem) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setUnreadCount: (count: number) => void;
  toggleDropdown: () => void;
  closeDropdown: () => void;
  openDropdown: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

// ─── Store ───────────────────────────────────────────────────

export const useNotificationStore = create<NotificationStore>()((set) => ({
  notifications: [],
  unreadCount: 0,
  isDropdownOpen: false,

  setNotifications: (items, unreadCount) =>
    set({ notifications: items, unreadCount }),

  addNotification: (item) =>
    set((state) => ({
      notifications: [item, ...state.notifications],
      unreadCount: state.unreadCount + (item.isRead ? 0 : 1),
    })),

  markAsRead: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (!notification || notification.isRead) return state;
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  setUnreadCount: (count) => set({ unreadCount: count }),

  toggleDropdown: () => set((state) => ({ isDropdownOpen: !state.isDropdownOpen })),
  closeDropdown: () => set({ isDropdownOpen: false }),
  openDropdown: () => set({ isDropdownOpen: true }),
}));
