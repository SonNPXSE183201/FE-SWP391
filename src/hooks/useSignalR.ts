/* eslint-disable react-hooks/refs */
import { useEffect, useRef, useCallback } from 'react';
import { generateUUID } from '../utils/uuid';
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
import type {
  SignalRNotificationPayload,
  SignalRTaskStatusChangedPayload,
  SignalRUnreadCountPayload,
  SignalRWalletUpdatedPayload,
} from './signalr.types';
import { getNotificationRawType, getUnreadCount } from './signalr.types';

const isDev = import.meta.env.DEV;

const logSignalR = (...args: unknown[]) => {
  if (isDev) console.log('[SignalR]', ...args);
};

const warnSignalR = (...args: unknown[]) => {
  if (isDev) console.warn('[SignalR]', ...args);
};

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
const mapSignalRPayload = (payload: SignalRNotificationPayload): NotificationItem => {
  const rawType = getNotificationRawType(payload);
  const rawMessage = payload.Message ?? payload.message ?? payload.Content ?? payload.content ?? '';
  return {
    id: String(payload.Id ?? payload.id ?? generateUUID()),
    title: payload.Title ?? payload.title ?? getNotificationTitle(rawType),
    message: stripSeriesIdPrefix(rawMessage),
    isRead: false,
    link: payload.Link ?? payload.link,
    rawType,
    type: normalizeNotificationType(rawType),
    createdAt: toApiDateIso(payload.CreateAt ?? payload.createAt),
  };
};

const normalizeNotificationType = (type: string): NotificationItem['type'] => {
  if (
    type === 'Series_Pending_Review'
    || type === 'Series_Submitted'
    || type === 'Series_Submitted_To_Board'
    || type === 'Chapter_Submitted'
    || type === 'Chapter_Rejected'
    || type === 'Chapter_Revision_Required'
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
  type === 'Series_Pending_Review' || type === 'Review' || type === 'Series_Cancel_Vote_Warning' || link?.includes('/editor/review');

const SERIES_DATA_REFRESH_TYPES = new Set([
  'Series_Submitted',
  'Series_Submitted_To_Board',
  'Series_Revision_Required',
  'Series_Approved',
  'Series_Fund_Approved',
  'Series_Rejected',
  'Series_Approved_Manual',
  'Series_Rejected_Manual',
  'Series_Pending_Review',
  'Series_Team_Accepted',
  'Series_Team_Declined',
  'Series_Axing_Warning',
]);

const CHAPTER_DATA_REFRESH_TYPES = new Set([
  'Chapter_Submitted',
  'Chapter_Rejected',
  'Chapter_Revision_Required',
]);

const refreshSeriesQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['series'] });
  queryClient.refetchQueries({ queryKey: ['series'], type: 'active' });
};

const refreshActiveQueries = (queryClient: QueryClient, queryKey: readonly unknown[]) => {
  queryClient.invalidateQueries({ queryKey });
  queryClient.refetchQueries({ queryKey, type: 'active' });
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

const refreshChapterQueries = (queryClient: QueryClient) => {
  refreshActiveQueries(queryClient, ['chapters']);
  refreshActiveQueries(queryClient, ['chapter']);
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
      .configureLogging(isDev ? LogLevel.Information : LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // ─── Register event handlers ──────────────────────────────

    // NewNotification: generic notification from server
    connection.on('NewNotification', (payload: SignalRNotificationPayload) => {
      logSignalR('NewNotification received:', payload);
      const rawType = getNotificationRawType(payload);
      const item = mapSignalRPayload(payload);
      addNotification(item);
      if (shouldShowNotificationToast(rawType)) {
        showNotificationToast(item.title, item.message);
      }
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (SERIES_DATA_REFRESH_TYPES.has(rawType)) {
        refreshSeriesQueries(queryClient);
      }
      if (CHAPTER_DATA_REFRESH_TYPES.has(rawType)) {
        refreshChapterQueries(queryClient);
        refreshEditorReviewQueries(queryClient);
        queryClient.invalidateQueries({ queryKey: ['chapter-revision-annotations'] });
      }
      if (rawType === WITHDRAW_ADMIN_PENDING) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'withdraw-pending'] });
      }
      if (item.type === 'WalletUpdate') {
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
      }
      if (rawType === 'Fund_Accepted' || rawType === 'Contract_Ready_To_Create') {
        refreshActiveQueries(queryClient, ['contracts']);
        refreshSeriesQueries(queryClient);
      }
      if (rawType === 'Contract_Created') {
        refreshSeriesQueries(queryClient);
        refreshActiveQueries(queryClient, ['contracts']);
      }
      if (rawType === 'Contract_Signed') {
        refreshSeriesQueries(queryClient);
        refreshActiveQueries(queryClient, ['contracts']);
        refreshActiveQueries(queryClient, ['wallet']);
      }
      if (rawType.startsWith('Task_')) {
        refreshActiveQueries(queryClient, ['tasks']);
      }

      if (rawType === 'Series_Team_Invite' || rawType === 'Series_Team_Role_Assigned') {
        queryClient.invalidateQueries({ queryKey: ['assistant-invites'] });
        queryClient.refetchQueries({ queryKey: ['assistant-invites'], type: 'active' });
        queryClient.invalidateQueries({ queryKey: ['series'] });
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
      logSignalR('ReceiveNotification received:', { content, type });
      const normalizedType = normalizeNotificationType(type);
      const item: NotificationItem = {
        id: generateUUID(),
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
      if (CHAPTER_DATA_REFRESH_TYPES.has(type)) {
        refreshChapterQueries(queryClient);
        refreshEditorReviewQueries(queryClient);
        queryClient.invalidateQueries({ queryKey: ['chapter-revision-annotations'] });
      }
      if (type === 'Fund_Accepted' || type === 'Contract_Ready_To_Create' || type === 'Contract_Created') {
        refreshSeriesQueries(queryClient);
        refreshActiveQueries(queryClient, ['contracts']);
      }
      if (type === 'Contract_Signed') {
        refreshSeriesQueries(queryClient);
        refreshActiveQueries(queryClient, ['contracts']);
        refreshActiveQueries(queryClient, ['wallet']);
      }
      if (type.startsWith('Task_')) {
        refreshActiveQueries(queryClient, ['tasks']);
      }

      if (type === 'Series_Team_Invite' || type === 'Series_Team_Role_Assigned') {
        queryClient.invalidateQueries({ queryKey: ['assistant-invites'] });
        queryClient.refetchQueries({ queryKey: ['assistant-invites'], type: 'active' });
        queryClient.invalidateQueries({ queryKey: ['series'] });
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
    connection.on('TaskStatusChanged', (payload: SignalRTaskStatusChangedPayload) => {
      logSignalR('TaskStatusChanged received (refreshing queries):', payload);
      refreshActiveQueries(queryClient, ['tasks']);
      queryClient.invalidateQueries({ queryKey: ['canvas'] });
    });

    // WalletUpdated: wallet balance change → notify + refresh wallet data (F1.6)
    connection.on('WalletUpdated', (payload: SignalRWalletUpdatedPayload) => {
      logSignalR('WalletUpdated received:', payload);
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'withdraw-pending'] });
    });

    // UnreadCountUpdated: server pushes fresh unread count
    connection.on('UnreadCountUpdated', (payload: SignalRUnreadCountPayload) => {
      logSignalR('UnreadCountUpdated received:', payload);
      setUnreadCount(getUnreadCount(payload));
    });

    // BoardDataChanged: vote, config, or board membership changed
    connection.on('BoardDataChanged', () => {
      logSignalR('BoardDataChanged received (refreshing queries)');
      queryClient.invalidateQueries({ queryKey: ['voting'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'board-voting'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'board-members'] });
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['review'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.refetchQueries({ queryKey: ['series'], type: 'active' });
      queryClient.refetchQueries({ queryKey: ['review'], type: 'active' });
      queryClient.refetchQueries({ queryKey: ['contracts'], type: 'active' });
    });

    // ─── Lifecycle logging ────────────────────────────────────
    connection.onreconnecting((error) => {
      warnSignalR('Đang kết nối lại...', error);
    });

    connection.onreconnected((connectionId) => {
      logSignalR('Đã kết nối lại thành công! ConnectionId:', connectionId);
    });

    connection.onclose((error) => {
      warnSignalR('Mất kết nối.', error);
    });

    // ─── Start connection ─────────────────────────────────────
    connection
      .start()
      .then(() => {
        logSignalR('Đã kết nối thành công với Hub!');
      })
      .catch((err) => {
        const msg = err.message || '';
        if (err.name === 'AbortError' || msg.includes('stopped during negotiation') || msg.includes('stop() was called')) {
          logSignalR('Kết nối bị hủy sớm (thường do React Strict Mode unmount).');
        } else if (isDev) {
          console.error('[SignalR] Lỗi kết nối:', err);
        }
      });

    // ─── Cleanup ──────────────────────────────────────────────
    return () => {
      if (connection.state !== HubConnectionState.Disconnected) {
        connection.stop().then(() => {
          logSignalR('Đã ngắt kết nối.');
        });
      }
      connectionRef.current = null;
    };
  }, [token, addNotification, setUnreadCount, queryClient]);

  // ─── Public API ─────────────────────────────────────────────
  const isConnected = connectionRef.current?.state === HubConnectionState.Connected;

  const invoke = useCallback(
    async (methodName: string, ...args: unknown[]) => {
      if (connectionRef.current?.state === HubConnectionState.Connected) {
        return connectionRef.current.invoke(methodName, ...args);
      }
      warnSignalR(`Không thể gọi ${methodName} — chưa kết nối`);
    },
    []
  );

  const on = useCallback(
    (eventName: string, callback: (...args: unknown[]) => void) => {
      connectionRef.current?.on(eventName, callback);
    },
    []
  );

  const off = useCallback(
    (eventName: string, callback: (...args: unknown[]) => void) => {
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
