import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { UserRole } from '../stores/authStore';
import { Logo } from '../components/common/Logo';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardList,
  Wallet,
  BarChart3,
  Vote,
  Calendar,
  Users,
  Shield,
  FileSignature,
  Receipt,
  PanelLeftClose,
  PanelLeft,
  Palette,
  BriefcaseBusiness,
  UserCircle,
  Sparkles,
  LogOut,
  Settings,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

interface NavItemConfig {
  label: string;
  path: string;
  icon: ReactNode;
  badge?: number;
}

interface NavSectionConfig {
  title: string;
  items: NavItemConfig[];
}

// Navigation configs per role
const getNavSections = (role: UserRole): NavSectionConfig[] => {
  switch (role) {
    case 'Mangaka':
      return [
        {
          title: 'Tổng quan',
          items: [
            { label: 'Dashboard', path: '/mangaka', icon: <LayoutDashboard size={20} /> },
          ],
        },
        {
          title: 'Sáng tác',
          items: [
            { label: 'Series của tôi', path: '/mangaka/series', icon: <BookOpen size={20} /> },
            { label: 'Bản thảo', path: '/mangaka/manuscripts', icon: <FileText size={20} /> },
            { label: 'Quản lý Task', path: '/mangaka/tasks', icon: <ClipboardList size={20} /> },
          ],
        },
        {
          title: 'Tài chính',
          items: [
            { label: 'Ví tiền', path: '/mangaka/wallet', icon: <Wallet size={20} /> },
          ],
        },
      ];

    case 'Assistant':
      return [
        {
          title: 'Tổng quan',
          items: [
            { label: 'Dashboard', path: '/assistant', icon: <LayoutDashboard size={20} /> },
          ],
        },
        {
          title: 'Công việc',
          items: [
            { label: 'Task Queue', path: '/assistant/tasks', icon: <ClipboardList size={20} /> },
            { label: 'Portfolio', path: '/assistant/portfolio', icon: <Palette size={20} /> },
            { label: 'Hồ sơ nghề nghiệp', path: '/assistant/profile', icon: <BriefcaseBusiness size={20} /> },
          ],
        },
        {
          title: 'Tài chính',
          items: [
            { label: 'Thu nhập', path: '/assistant/wallet', icon: <Wallet size={20} /> },
          ],
        },
      ];

    case 'Editor':
      return [
        {
          title: 'Tổng quan',
          items: [
            { label: 'Dashboard', path: '/editor', icon: <LayoutDashboard size={20} /> },
          ],
        },
        {
          title: 'Biên tập',
          items: [
            { label: 'Review bản thảo', path: '/editor/review', icon: <FileText size={20} /> },
            { label: 'Annotation', path: '/editor/annotations', icon: <Sparkles size={20} /> },
            { label: 'Phân xử tranh chấp', path: '/editor/disputes', icon: <Shield size={20} /> },
          ],
        },
      ];

    case 'Board':
      return [
        {
          title: 'Tổng quan',
          items: [
            { label: 'Dashboard', path: '/board', icon: <LayoutDashboard size={20} /> },
          ],
        },
        {
          title: 'Xuất bản',
          items: [
            { label: 'Bỏ phiếu', path: '/board/voting', icon: <Vote size={20} /> },
            { label: 'Xếp hạng', path: '/board/ranking', icon: <BarChart3 size={20} /> },
            { label: 'Lịch xuất bản', path: '/board/schedule', icon: <Calendar size={20} /> },
          ],
        },
      ];

    case 'Admin':
      return [
        {
          title: 'Tổng quan',
          items: [
            { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
          ],
        },
        {
          title: 'Quản trị',
          items: [
            { label: 'Quản lý người dùng', path: '/admin/users', icon: <Users size={20} /> },
            { label: 'Phân quyền RBAC', path: '/admin/roles', icon: <Shield size={20} /> },
            { label: 'Hợp đồng', path: '/admin/contracts', icon: <FileSignature size={20} /> },
            { label: 'Đối soát giao dịch', path: '/admin/reconciliation', icon: <Receipt size={20} /> },
          ],
        },
      ];

    default:
      return [];
  }
};

// Role display names
const roleDisplayNames: Record<UserRole, string> = {
  Mangaka: 'Mangaka',
  Assistant: 'Trợ lý vẽ',
  Editor: 'Biên tập viên',
  Board: 'Hội đồng BT',
  Admin: 'Quản trị viên',
};

export const Sidebar = ({ collapsed, mobileOpen, onToggleCollapse, onCloseMobile }: SidebarProps) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  const navSections = getNavSections(user.role);
  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sidebarClasses = [
    'sidebar',
    collapsed ? 'sidebar--collapsed' : '',
    mobileOpen ? 'sidebar--mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={onCloseMobile}
      />

      <aside className={sidebarClasses} id="main-sidebar">
        {/* Sidebar Header */}
        <div className="sidebar__header">
          {!collapsed && <Logo size="sm" showText />}
          <button
            className="sidebar__toggle"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {navSections.map((section) => (
            <div key={section.title} className="nav-section">
              <div className="nav-section__title">{section.title}</div>
              {section.items.map((item) => {
                const isActive =
                  item.path === `/${user.role.toLowerCase()}`
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
                    data-tooltip={item.label}
                    onClick={onCloseMobile}
                  >
                    <span className="nav-item__icon">{item.icon}</span>
                    <span className="nav-item__label">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="nav-item__badge">{item.badge > 99 ? '99+' : item.badge}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer — User + Settings + Logout */}
        <div className="sidebar__footer">
          <NavLink
            to={`/${user.role.toLowerCase()}/settings`}
            className={`nav-item ${location.pathname.includes('/settings') ? 'nav-item--active' : ''}`}
            data-tooltip="Cài đặt"
          >
            <span className="nav-item__icon"><Settings size={20} /></span>
            <span className="nav-item__label">Cài đặt</span>
          </NavLink>

          <div className="sidebar__user" onClick={() => { /* navigate to profile */ }}>
            <div className="sidebar__avatar">{initials}</div>
            <div className="sidebar__user-info">
              <div className="sidebar__user-name">{user.fullName}</div>
              <div className="sidebar__user-role">{roleDisplayNames[user.role]}</div>
            </div>
          </div>

          <button
            className="nav-item"
            onClick={() => logout()}
            data-tooltip="Đăng xuất"
            style={{ width: '100%', border: 'none', marginTop: '2px' }}
          >
            <span className="nav-item__icon"><LogOut size={20} /></span>
            <span className="nav-item__label" style={{ color: 'var(--color-danger)' }}>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
};
