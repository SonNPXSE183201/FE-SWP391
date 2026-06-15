import { useLocation } from 'react-router-dom';
import {
  Search,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { NotificationDropdown } from '../features/notifications';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

// Breadcrumb map — maps path segments to readable labels
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
  const location = useLocation();

  // Generate breadcrumbs from current path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    label: pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
    path: '/' + pathSegments.slice(0, index + 1).join('/'),
    isLast: index === pathSegments.length - 1,
  }));

  return (
    <header
      id="main-header"
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-bg-primary/85 backdrop-blur-xl border-b border-border-custom"
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        <button
          className="flex items-center justify-center w-[38px] h-[38px] rounded-lg-custom bg-transparent text-text-secondary border-none cursor-pointer lg:hidden hover:bg-bg-surface hover:text-text-primary transition-all duration-200"
          onClick={onMobileMenuToggle}
          aria-label="Mở menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.path} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight size={14} className="text-text-muted" />
              )}
              <span
                className={`transition-colors duration-150 ${
                  crumb.isLast
                    ? 'text-text-primary font-medium'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search (hidden on mobile) */}
        <button
          className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-bg-surface border border-border-custom rounded-lg-custom text-text-muted text-[13px] cursor-pointer min-w-[220px] hover:border-brand hover:bg-bg-secondary transition-all duration-200"
          aria-label="Tìm kiếm"
        >
          <Search size={16} />
          <span>Tìm kiếm...</span>
        </button>

        {/* Notifications */}
        <NotificationDropdown />
      </div>
    </header>
  );
};
