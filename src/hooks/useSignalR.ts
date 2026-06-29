/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/refs */
import { useEffect, useRef, useCallback } from 'react';
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
  HubConnectionState,
} from '@microsoft/signalr';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import type { NotificationItem } from '../stores/notificationStore';
import { toApiDateIso } from '../utils/parseApiDate';
import { getNotificationTitle, stripSeriesIdPrefix } from '../utils/notificationLink';
import { showNotificationToast } from '../utils/appToast';

/**
 * SignalR hub URL — connects to ASP.NET Core Notification Hub.
 * Uses the same base URL from env, with the hub path appended.
 */
const getHubUrl = () => {
  if (import.meta.env.VITE_SIGNALR_URL) {
    return import.meta.env.VITE_SIGNALR_URL;
  }
  const base = import.meta.env.VITE_API_URL;
  // Dev proxy: relative URL → Vite → Gateway
  if (import.meta.env.DEV && !base) {
    return '/api/v1/hubs/notification';
  }
  const resolvedBase = base || 'http://localhost:5010';
  // If routing through Gateway (port 5000), upstream expects /api/v1/ prefix
  if (resolvedBase.includes('5000') || resolvedBase.includes('5001')) {
    return `${resolvedBase}/api/v1/hubs/notification`;
  }
  return `${resolvedBase}/hubs/notification`;
};

/**
 * Maps a SignalR notification event payload to our NotificationItem type.
 * Backend sends PascalCase properties.
 */
const mapSignalRPayload = (payload: any): NotificationItem => {
  const rawType = payload.Type || payload.type || 'SystemAlert';
  const rawMessage = payload.Message || payload.message || payload.Content || payload.content || '';
  return {
    id: String(payload.Id || payload.id || crypto.randomUUID()),
    title: payload.Title || payload.title || getNotificationTitle(rawType),
    message: stripSeriesIdPrefix(rawMessage),
    isRead: false,
    link: payload.Link || payload.link,
    rawType,
    type: normalizeNotificationType(rawType),
    createdAt: toApiDateIso(payload.CreateAt || payload.createAt),
  };
};

const normalizeNotificationType = (type: string): NotificationItem['type'] => {
  if (
    type === 'Series_Pending_Review'
    || type === 'Series_Submitted'
    || type === 'Series_Submitted_To_Board'
    || type === 'Chapter_Submitted'
  ) {
    return 'Review';
  }
  if (type === 'Wallet_Withdrawal_Admin_Pending') return 'SystemAlert';
  if (type.startsWith('Task_')) return 'TaskUpdate';
  if (type.startsWith('Wallet')) return 'WalletUpdate';
  if (type === 'TaskUpdate' || type === 'WalletUpdate' || type === 'Review' || type === 'SystemAlert') {
    return type;
  }
  return 'SystemAlert';
};

const shouldRefreshAdminUsers = (type: string, link?: string) =>
  type === 'SystemAlert' || link?.includes('/admin/users');

const shouldRefreshEditorReview = (type: string, link?: string) =>
  type === 'Series_Pending_Review' || type === 'Review' || link?.includes('/editor/review');

const SERIES_DATA_REFRESH_TYPES = new Set([
  'Series_Submitted',
  'Series_Submitted_To_Board',
  'Series_Revision_Required',
  'Series_Approved',
  'Series_Rejected',
  'Series_Pending_Review',
]);

const refreshSeriesQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['series'] });
};

const WITHDRAW_ADMIN_PENDING = 'Wallet_Withdrawal_Admin_Pending';

const WALLET_NOTIFICATION_TYPES_SKIP_TOAST = new Set([
  'Wallet_Deposit_Success',
  'Wallet_Withdrawal_Pending',
  'Wallet_Withdrawal_Approve',
  'Wallet_Withdrawal_Reject',
]);

/** Hành động user vừa thực hiện — UI đã có toast inline, tránh hiện 2 lần qua SignalR. */
const SELF_ACTION_NOTIFICATION_TYPES_SKIP_TOAST = new Set([
  'Series_Submitted',
  'Wallet_Fund_Accepted',
]);

const shouldShowNotificationToast = (rawType: string) =>
  !WALLET_NOTIFICATION_TYPES_SKIP_TOAST.has(rawType)
  && !SELF_ACTION_NOTIFICATION_TYPES_SKIP_TOAST.has(rawType);

const refreshEditorReviewQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['review'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
};

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
      const rawType = payload.Type || payload.type || 'SystemAlert';
      const item = mapSignalRPayload(payload);
      addNotification(item);
      if (shouldShowNotificationToast(rawType)) {
        showNotificationToast(item.title, item.message);
      }
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (SERIES_DATA_REFRESH_TYPES.has(rawType)) {
        refreshSeriesQueries(queryClient);
      }
      if (rawType === WITHDRAW_ADMIN_PENDING) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'withdraw-pending'] });
      }
      if (item.type === 'WalletUpdate') {
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
      }
      if (rawType === 'Contract_Created') {
        queryClient.invalidateQueries({ queryKey: ['series'] });
      }
      if (rawType.startsWith('Task_')) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }

      if (shouldRefreshAdminUsers(item.type, item.link)) {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        queryClient.invalidateQueries({ queryKey: ['admin-editors'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
      }
      if (shouldRefreshEditorReview(item.type, item.link)) {
        refreshEditorReviewQueries(queryClient);
      }
    });

    // ReceiveNotification: older generic notification format (content, type)
    connection.on('ReceiveNotification', (content: string, type: string) => {
      console.log('[SignalR] ReceiveNotification received:', { content, type });
      const normalizedType = normalizeNotificationType(type);
      const item: NotificationItem = {
        id: crypto.randomUUID(),
        title: getNotificationTitle(type),
        message: stripSeriesIdPrefix(content || ''),
        isRead: false,
        rawType: type,
        type: normalizedType,
        createdAt: new Date().toISOString(),
      };
      addNotification(item);
      if (shouldShowNotificationToast(type)) {
        showNotificationToast(item.title, item.message);
      }
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (SERIES_DATA_REFRESH_TYPES.has(type)) {
        refreshSeriesQueries(queryClient);
      }

      if (shouldRefreshAdminUsers(item.type)) {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        queryClient.invalidateQueries({ queryKey: ['admin-editors'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
      }
      if (shouldRefreshEditorReview(type)) {
        refreshEditorReviewQueries(queryClient);
      }
    });

    // TaskStatusChanged: task status update → refresh task data (F1.6)
    connection.on('TaskStatusChanged', (payload: any) => {
      console.log('[SignalR] TaskStatusChanged received (refreshing queries):', payload);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['canvas'] });
    });

    // WalletUpdated: wallet balance change → notify + refresh wallet data (F1.6)
    connection.on('WalletUpdated', (payload: any) => {
      console.log('[SignalR] WalletUpdated received:', payload);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    });

    // UnreadCountUpdated: server pushes fresh unread count
    connection.on('UnreadCountUpdated', (payload: any) => {
      console.log('[SignalR] UnreadCountUpdated received:', payload);
      const newCount = payload.Count ?? payload.count ?? 0;
      setUnreadCount(newCount);
    });

    // BoardDataChanged: server notifies that Board Voting data has changed (someone voted or new series submitted)
    connection.on('BoardDataChanged', () => {
      console.log('[SignalR] BoardDataChanged received (refreshing queries)');
      queryClient.invalidateQueries({ queryKey: ['voting'] });
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
        const msg = err.message || '';
        if (err.name === 'AbortError' || msg.includes('stopped during negotiation') || msg.includes('stop() was called')) {
          console.log('[SignalR] Kết nối bị hủy sớm (thường do React Strict Mode unmount).');
        } else {
          console.error('[SignalR] Lỗi kết nối:', err);
        }
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
