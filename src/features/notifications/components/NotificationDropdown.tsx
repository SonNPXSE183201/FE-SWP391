import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCircle2, AlertCircle, FileText, Wallet, Clock, Loader2 } from 'lucide-react';
import { useNotificationStore } from '../../../stores/notificationStore';
import { useNotificationList, useMarkAsRead, useMarkAllAsRead, useUnreadCount } from '../hooks/useNotifications';
import { useClickOutside } from '../../../hooks/useClickOutside';
import type { NotificationItem } from '../../../stores/notificationStore';

const NotificationIcon = ({ type }: { type: NotificationItem['type'] }) => {
  const baseClass = 'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border';

  switch (type) {
    case 'TaskUpdate':
      return (
        <div className={`${baseClass} bg-[#1D283A] border-[#2A3F5F] text-[#4F93F9]`}>
          <FileText size={18} />
        </div>
      );
    case 'WalletUpdate':
      return (
        <div className={`${baseClass} bg-[#162C26] border-[#1D4A39] text-[#10B981]`}>
          <Wallet size={18} />
        </div>
      );
    case 'Review':
      return (
        <div className={`${baseClass} bg-[#2E1E3A] border-[#4A2D5E] text-[#B76EFC]`}>
          <CheckCircle2 size={18} />
        </div>
      );
    case 'SystemAlert':
    default:
      return (
        <div className={`${baseClass} bg-[#3A1D1D] border-[#5F2A2A] text-[#F43F5E]`}>
          <AlertCircle size={18} />
        </div>
      );
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

export const NotificationDropdown = () => {
  const { notifications, unreadCount, isDropdownOpen, toggleDropdown, closeDropdown } = useNotificationStore();
  const dropdownRef = useClickOutside(closeDropdown);

  // Poll for just the badge count periodically
  useUnreadCount();

  // Load full list when opened
  const { isLoading, isFetching, refetch } = useNotificationList(1, 20);
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  // Fetch when dropdown is opened to get the freshest data
  useEffect(() => {
    if (isDropdownOpen) {
      refetch();
    }
  }, [isDropdownOpen, refetch]);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    closeDropdown();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className={`relative flex items-center justify-center w-[38px] h-[38px] rounded-lg-custom border-none cursor-pointer transition-all duration-200 ${
          isDropdownOpen
            ? 'bg-bg-surface text-brand shadow-[0_0_12px_rgba(var(--brand-rgb),0.3)]'
            : 'bg-transparent text-text-secondary hover:bg-bg-surface hover:text-text-primary'
        }`}
        aria-label="Thông báo"
      >
        <Bell size={20} className={unreadCount > 0 ? 'animate-wiggle' : ''} />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-full bg-danger text-white text-[10px] font-bold border-2 border-bg-primary">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-3 w-[380px] bg-bg-secondary border border-border-custom rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-custom bg-bg-primary/50">
            <h3 className="text-[15px] font-semibold text-text-primary m-0">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                disabled={isMarkingAll}
                className="flex items-center gap-1.5 text-[12px] text-brand hover:text-brand-light bg-transparent border-none cursor-pointer disabled:opacity-50 transition-colors"
              >
                {isMarkingAll ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                <Loader2 size={24} className="animate-spin mb-3 text-brand" />
                <span className="text-[13px]">Đang tải thông báo...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                <div className="w-16 h-16 rounded-full bg-bg-surface flex items-center justify-center mb-3">
                  <Bell size={24} className="opacity-30" />
                </div>
                <span className="text-[13px]">Bạn chưa có thông báo nào</span>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => {
                  const content = (
                    <div
                      className="flex gap-4 p-4 border-b border-border-custom/50 hover:bg-bg-surface transition-colors duration-200 cursor-pointer bg-[#182030]/30"
                      onClick={() => handleNotificationClick(notif.id)}
                    >
                      <NotificationIcon type={notif.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-[13px] font-medium m-0 truncate pr-3 text-text-primary">
                            {notif.title}
                          </h4>
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-brand mt-1.5" />
                        </div>
                        <p className="text-[13px] leading-relaxed m-0 line-clamp-2 text-text-secondary">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-text-muted">
                          <Clock size={12} />
                          <span>{formatTimeAgo(notif.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );

                  return notif.link ? (
                    <Link
                      key={notif.id}
                      to={notif.link}
                      className="no-underline text-inherit block"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={notif.id}>{content}</div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Footer loading indicator for background fetches */}
          {isFetching && !isLoading && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand/20 overflow-hidden">
              <div className="h-full bg-brand w-1/3 animate-progress-indeterminate"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
