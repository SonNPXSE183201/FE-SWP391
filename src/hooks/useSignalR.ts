import { useEffect, useRef, useCallback } from 'react';
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
  HubConnectionState,
} from '@microsoft/signalr';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import type { NotificationItem } from '../stores/notificationStore';

/**
 * SignalR hub URL — connects to ASP.NET Core Notification Hub.
 * Uses the same base URL from env, with the hub path appended.
 */
const getHubUrl = () => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5010';
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
    });

    // TaskStatusChanged: task status update → show as notification
    connection.on('TaskStatusChanged', (payload: any) => {
      console.log('[SignalR] TaskStatusChanged received:', payload);
      const item: NotificationItem = {
        id: crypto.randomUUID(),
        title: 'Cập nhật Task',
        message: payload.Message || `Task "${payload.TaskName || ''}" đã chuyển sang ${payload.NewStatus || 'trạng thái mới'}`,
        isRead: false,
        link: payload.Link || '/mangaka/tasks',
        type: 'TaskUpdate',
        createdAt: new Date().toISOString(),
      };
      addNotification(item);
    });

    // WalletUpdated: wallet balance change → show as notification
    connection.on('WalletUpdated', (payload: any) => {
      console.log('[SignalR] WalletUpdated received:', payload);
      const item: NotificationItem = {
        id: crypto.randomUUID(),
        title: 'Cập nhật ví',
        message: payload.Message || 'Số dư ví của bạn đã thay đổi',
        isRead: false,
        link: payload.Link || '/mangaka/wallet',
        type: 'WalletUpdate',
        createdAt: new Date().toISOString(),
      };
      addNotification(item);
    });

    // UnreadCountUpdated: server pushes fresh unread count
    connection.on('UnreadCountUpdated', (payload: { count: number }) => {
      console.log('[SignalR] UnreadCountUpdated received:', payload);
      setUnreadCount(payload.count);
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
  }, [token, addNotification, setUnreadCount]);

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
