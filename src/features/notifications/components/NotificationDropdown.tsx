import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const { items, unreadCount, markAllRead, markRead } = useNotifications();

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen((s) => !s); if (open) markAllRead(); }}
        className="relative flex items-center justify-center w-[38px] h-[38px] rounded-lg-custom bg-transparent text-text-secondary border-none cursor-pointer hover:bg-bg-surface hover:text-text-primary transition-all duration-200"
        aria-label="Thông báo"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger border-2 border-bg-primary" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-bg-secondary border border-border-custom rounded-xl shadow-lg z-50 p-2">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="text-sm font-semibold">Thông báo</div>
            <button className="text-xs text-text-muted" onClick={markAllRead}>Đánh dấu đã đọc</button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-text-muted">Không có thông báo</div>
            ) : items.map((n) => (
              <div key={n.id} className={`px-3 py-2 border-t border-border-custom ${n.read ? 'opacity-70' : ''}`}>
                <div className="text-sm font-medium">{n.title}</div>
                <div className="text-xs text-text-muted mt-1">{n.message}</div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-[10px] text-text-muted">{new Date(n.createdAt).toLocaleString()}</div>
                  {!n.read && <button className="text-[11px] text-brand" onClick={() => markRead(n.id)}>Đánh dấu</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
