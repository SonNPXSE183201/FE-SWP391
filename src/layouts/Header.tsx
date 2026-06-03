import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  Bell,
  Search,
  Menu,
  ChevronRight,
} from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

// Breadcrumb map — maps paths to readable labels
const pathLabels: Record<string, string> = {
  mangaka: 'Mangaka',
  assistant: 'Trợ lý vẽ',
  editor: 'Biên tập viên',
  board: 'Hội đồng BT',
  admin: 'Quản trị viên',
  series: 'Series',
  manuscripts: 'Bản thảo',
  tasks: 'Quản lý Task',
  wallet: 'Ví tiền',
  portfolio: 'Portfolio',
  profile: 'Hồ sơ',
  review: 'Review',
  annotations: 'Annotation',
  disputes: 'Tranh chấp',
  voting: 'Bỏ phiếu',
  ranking: 'Xếp hạng',
  schedule: 'Lịch XB',
  users: 'Người dùng',
  roles: 'Phân quyền',
  contracts: 'Hợp đồng',
  reconciliation: 'Đối soát',
  settings: 'Cài đặt',
};

export const Header = ({ onMobileMenuToggle }: HeaderProps) => {
  const { user } = useAuthStore();
  const location = useLocation();

  // Generate breadcrumbs from current path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    label: pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
    path: '/' + pathSegments.slice(0, index + 1).join('/'),
    isLast: index === pathSegments.length - 1,
  }));

  return (
    <header className="main-header" id="main-header">
      <div className="header__left">
        {/* Mobile hamburger */}
        <button
          className="header__mobile-toggle"
          onClick={onMobileMenuToggle}
          aria-label="Mở menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <nav className="header__breadcrumb" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.path} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {index > 0 && (
                <ChevronRight size={14} className="header__breadcrumb-separator" />
              )}
              <span
                className={`header__breadcrumb-item ${
                  crumb.isLast ? 'header__breadcrumb-item--active' : ''
                }`}
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="header__right">
        {/* Search (desktop) */}
        <button className="header__search" aria-label="Tìm kiếm">
          <Search size={16} />
          <span>Tìm kiếm...</span>
          <span className="header__search-shortcut">⌘K</span>
        </button>

        {/* Notifications */}
        <button
          className="header__icon-btn"
          aria-label="Thông báo"
          id="notification-bell"
        >
          <Bell size={20} />
          {/* Notification dot — conditionally rendered */}
          <span className="header__notification-dot" />
        </button>

        {/* User avatar — visible only on small screens where sidebar is hidden */}
        {user && (
          <div
            className="header__icon-btn"
            style={{ display: 'none' }}
            aria-label="Tài khoản"
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6C5CE7, #00CECE)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
