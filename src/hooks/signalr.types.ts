/** ASP.NET SignalR hub payloads — backend may send PascalCase or camelCase. */

export interface SignalRNotificationPayload {
  Id?: string | number;
  id?: string | number;
  Type?: string;
  type?: string;
  Title?: string;
  title?: string;
  Message?: string;
  message?: string;
  Content?: string;
  content?: string;
  Link?: string;
  link?: string;
  CreateAt?: string;
  createAt?: string;
}

export interface SignalRUnreadCountPayload {
  Count?: number;
  count?: number;
}

export interface SignalRTaskStatusChangedPayload {
  TaskId?: number;
  taskId?: number;
  Status?: string;
  status?: string;
}

export interface SignalRWalletUpdatedPayload {
  WalletId?: number;
  walletId?: number;
}

export const getNotificationRawType = (payload: SignalRNotificationPayload): string =>
  payload.Type ?? payload.type ?? 'SystemAlert';

export const getUnreadCount = (payload: SignalRUnreadCountPayload): number =>
  payload.Count ?? payload.count ?? 0;
