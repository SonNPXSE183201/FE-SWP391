import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useSignalR } from '../../../hooks/useSignalR';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type?: string;
  createdAt: string;
  read?: boolean;
}

export const useNotifications = () => {
  const [items, setItems] = useState<AppNotification[]>([]);
  const hubUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5010'}/hubs/notifications`;
  const { on } = useSignalR(hubUrl);

  useEffect(() => {
    // Subscribe to incoming notifications
    const dispose = on('ReceiveNotification', (payload: AppNotification) => {
      const n = { ...payload, read: false };
      setItems((prev) => [n, ...prev].slice(0, 50));
      // Show a toast for immediate feedback
      toast.custom(() => (
        <div className="rounded-lg bg-bg-secondary border border-border-custom p-3 shadow-md">
          <div className="font-semibold">{n.title}</div>
          <div className="text-sm text-text-muted mt-1">{n.message}</div>
        </div>
      ));
    });

    return () => { dispose(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, read: true } : i));
  }, []);

  return { items, unreadCount: items.filter((i) => !i.read).length, markAllRead, markRead };
};
