/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/refs */
import React, { useEffect, useRef, useCallback } from 'react';
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
  HubConnectionState,
} from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import type { NotificationItem } from '../stores/notificationStore';

// Emoji icon per notification type for realtime toasts.
const TYPE_ICON: Record<NotificationItem['type'], string> = {
  TaskUpdate: '📋',
  WalletUpdate: '💰',
  Review: '✅',
  SystemAlert: '🔔',
};

const notifyToast = (item: NotificationItem) =>
  toast(
    () => React.createElement('div', { className: 'flex flex-col gap-1' },
      React.createElement('span', { className: 'font-semibold text-sm text-text-primary leading-tight' }, item.title),
      item.message ? React.createElement('span', { className: 'text-xs text-text-secondary leading-snug break-words' }, item.message) : null
    ),
    { icon: TYPE_ICON[item.type] ?? '🔔', duration: 5000 }
  );

/**
 * SignalR hub URL — connects to ASP.NET Core Notification Hub.
 * Uses the same base URL from env, with the hub path appended.
 */
const getHubUrl = () => {
  if (import.meta.env.VITE_SIGNALR_URL) {
    return import.meta.env.VITE_SIGNALR_URL;
  }
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5010';
  // If routing through Gateway (port 5000), upstream expects /api/v1/ prefix
  if (base.includes('5000') || base.includes('5001')) {
    return `${base}/api/v1/hubs/notification`;
  }
  return `${base}/hubs/notification`;
};

/**
 * Maps a SignalR notification event payload to our NotificationItem type.
 * Backend sends PascalCase properties.
 */
const mapSignalRPayload = (payload: any): NotificationItem => ({
  id: payload.Id || payload.id || crypto.randomUUID(),
  title: payload.Title || payload.title || 'Thông báo mới',
  message: payload.Message || payload.message || '',
  isRead: false,
  link: payload.Link || payload.link,
  type: payload.Type || payload.type || 'SystemAlert',
  createdAt: payload.CreateAt || payload.createdAt || new Date().toISOString(),
});

/**
 * Hook kết nối WebSockets qua SignalR với ASP.NET Core Backend.
 * 
 * Events lắng nghe:
 * - `NewNotification`     — Thông báo mới (tất cả loại)
 * - `TaskStatusChanged`   — Cập nhật trạng thái Task real-time
 * - `WalletUpdated`       — Biến động số dư ví
 * 
 * Auto-reconnect with exponential backoff: 0s → 2s → 10s → 30s
 */
export const useSignalR = () => {
  const connectionRef = useRef<HubConnection | null>(null);
  const { token } = useAuthStore();
  const { addNotification, setUnreadCount } = useNotificationStore();
  const queryClient = useQueryClient();

  // ─── Build & Connect ────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const connection = new HubConnectionBuilder()
      .withUrl(getHubUrl(), {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(LogLevel.Information)
      .build();

    connectionRef.current = connection;

    // ─── Register event handlers ──────────────────────────────

    // NewNotification: generic notification from server
    connection.on('NewNotification', (payload: any) => {
      console.log('[SignalR] NewNotification received:', payload);
      const item = mapSignalRPayload(payload);
      addNotification(item);
      notifyToast(item);

      // Invalidate admin users query to reflect new registrations immediately
      if (item.type === 'SystemAlert') {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      }
    });

    // ReceiveNotification: older generic notification format (content, type)
    connection.on('ReceiveNotification', (content: string, type: string) => {
      console.log('[SignalR] ReceiveNotification received:', { content, type });
      const item: NotificationItem = {
        id: crypto.randomUUID(),
        title: 'Thông báo',
        message: content || '',
        isRead: false,
        type: (type as NotificationItem['type']) || 'SystemAlert',
        createdAt: new Date().toISOString(),
      };
      addNotification(item);
      notifyToast(item);
    });

    // TaskStatusChanged: task status update → notify + refresh task data (F1.6)
    connection.on('TaskStatusChanged', (payload: any) => {
      console.log('[SignalR] TaskStatusChanged received:', payload);
      const item: NotificationItem = {
        id: crypto.randomUUID(),
        title: 'Cập nhật Task',
        message: payload.Message || payload.message || `Task "${payload.TaskName || payload.taskName || ''}" đã chuyển sang ${payload.NewStatus || payload.newStatus || 'trạng thái mới'}`,
        isRead: false,
        link: payload.Link || payload.link || '/mangaka/tasks',
        type: 'TaskUpdate',
        createdAt: new Date().toISOString(),
      };
      addNotification(item);
      notifyToast(item);
      // Refresh any task list/detail so the new status shows immediately.
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    });

    // WalletUpdated: wallet balance change → notify + refresh wallet data (F1.6)
    connection.on('WalletUpdated', (payload: any) => {
      console.log('[SignalR] WalletUpdated received:', payload);
      const item: NotificationItem = {
        id: crypto.randomUUID(),
        title: 'Cập nhật ví',
        message: payload.Message || payload.message || 'Số dư ví của bạn đã thay đổi',
        isRead: false,
        link: payload.Link || payload.link || '/mangaka/wallet',
        type: 'WalletUpdate',
        createdAt: new Date().toISOString(),
      };
      addNotification(item);
      notifyToast(item);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    });

    // UnreadCountUpdated: server pushes fresh unread count
    connection.on('UnreadCountUpdated', (payload: any) => {
      console.log('[SignalR] UnreadCountUpdated received:', payload);
      const newCount = payload.Count ?? payload.count ?? 0;
      setUnreadCount(newCount);
    });

    // ─── Lifecycle logging ────────────────────────────────────
    connection.onreconnecting((error) => {
      console.warn('[SignalR] Đang kết nối lại...', error);
    });

    connection.onreconnected((connectionId) => {
      console.log('[SignalR] Đã kết nối lại thành công! ConnectionId:', connectionId);
    });

    connection.onclose((error) => {
      console.warn('[SignalR] Mất kết nối.', error);
    });

    // ─── Start connection ─────────────────────────────────────
    connection
      .start()
      .then(() => {
        console.log('[SignalR] Đã kết nối thành công với Hub!');
      })
      .catch((err) => {
        console.error('[SignalR] Lỗi kết nối:', err);
      });

    // ─── Cleanup ──────────────────────────────────────────────
    return () => {
      if (connection.state !== HubConnectionState.Disconnected) {
        connection.stop().then(() => {
          console.log('[SignalR] Đã ngắt kết nối.');
        });
      }
      connectionRef.current = null;
    };
  }, [token, addNotification, setUnreadCount, queryClient]);

  // ─── Public API ─────────────────────────────────────────────
  const isConnected = connectionRef.current?.state === HubConnectionState.Connected;

  const invoke = useCallback(
    async (methodName: string, ...args: any[]) => {
      if (connectionRef.current?.state === HubConnectionState.Connected) {
        return connectionRef.current.invoke(methodName, ...args);
      }
      console.warn(`[SignalR] Không thể gọi ${methodName} — chưa kết nối`);
    },
    []
  );

  const on = useCallback(
    (eventName: string, callback: (...args: any[]) => void) => {
      connectionRef.current?.on(eventName, callback);
    },
    []
  );

  const off = useCallback(
    (eventName: string, callback: (...args: any[]) => void) => {
      connectionRef.current?.off(eventName, callback);
    },
    []
  );

  return {
    isConnected,
    invoke,
    on,
    off,
    connection: connectionRef.current,
  };
};
