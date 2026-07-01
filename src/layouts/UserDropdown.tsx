import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useClickOutside } from '../hooks/useClickOutside';
import type { UserRole } from '../stores/authStore';

const roleDisplayNames: Record<UserRole, string> = {
  Mangaka: 'Mangaka',
  Assistant: 'Trợ lý vẽ',
  Editor: 'Biên tập viên',
  Board: 'Hội đồng BT',
  Admin: 'Quản trị viên',
};

export const UserDropdown = () => {
  const { user, logout, refreshToken } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useClickOutside(() => setIsOpen(false));

  if (!user) return null;

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        const { authApi } = await import('../features/auth/api/auth.api');
        await authApi.logout({ refreshToken });
      }
    } catch (error) {
      console.error('Failed to logout from server:', error);
    } finally {
      logout();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-bg-surface transition-colors border-none cursor-pointer bg-transparent"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-secondary flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-bg-primary">
          {initials}
        </div>
        <div className="hidden md:flex flex-col items-start text-left">
          <span className="text-[13px] font-semibold text-text-primary leading-tight">{user.fullName}</span>
          <span className="text-[11px] text-text-muted leading-tight">{roleDisplayNames[user.role] || user.role}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-bg-secondary border border-border-custom rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-border-custom mb-1 flex items-center gap-3 md:hidden">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-secondary flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-bg-primary">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-semibold text-text-primary truncate">{user.fullName}</span>
              <span className="text-[12px] text-text-muted truncate">{roleDisplayNames[user.role] || user.role}</span>
            </div>
          </div>
          
          <NavLink
            to={`/${user.role.toLowerCase()}/settings`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors no-underline"
          >
            <Settings size={16} />
            <span>Cài đặt</span>
          </NavLink>
          
          <div className="h-px bg-border-custom my-1" />
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors border-none cursor-pointer bg-transparent text-left"
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  );
};
