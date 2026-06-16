import { useState } from 'react';
import {
  Settings,
  User,
  Mail,
  Shield,
  KeyRound,
  Bell,
  BellRing,
  CreditCard,
  Monitor,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore, type UserRole } from '../../../stores/authStore';
import { ChangePasswordModal } from '../../auth';

// ─── Types ───────────────────────────────────────────────────
type TabId = 'profile' | 'password' | 'notifications';

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

interface NotificationPref {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

// ─── Constants ───────────────────────────────────────────────
const TABS: TabItem[] = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: User },
  { id: 'password', label: 'Đổi mật khẩu', icon: KeyRound },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
];

const ROLE_BADGE_STYLES: Record<UserRole, { bg: string; text: string; label: string }> = {
  Admin: { bg: 'bg-rose-500/10', text: 'text-rose-400', label: 'Quản trị viên' },
  Editor: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Biên tập viên' },
  Mangaka: { bg: 'bg-brand/10', text: 'text-brand', label: 'Mangaka' },
  Assistant: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Trợ lý' },
  Board: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Ban quản lý' },
};

const AVATAR_GRADIENTS: Record<UserRole, string> = {
  Admin: 'from-rose-500 to-rose-700',
  Editor: 'from-blue-500 to-blue-700',
  Mangaka: 'from-brand to-secondary',
  Assistant: 'from-emerald-500 to-emerald-700',
  Board: 'from-amber-500 to-amber-700',
};

const DEFAULT_NOTIFICATION_PREFS: NotificationPref[] = [
  {
    id: 'email',
    title: 'Thông báo Email',
    description: 'Nhận thông báo qua email khi có cập nhật quan trọng',
    icon: Mail,
    enabled: true,
  },
  {
    id: 'task',
    title: 'Thông báo Task mới',
    description: 'Nhận thông báo khi có task mới được giao hoặc cập nhật',
    icon: BellRing,
    enabled: true,
  },
  {
    id: 'payment',
    title: 'Thông báo thanh toán',
    description: 'Nhận thông báo về giao dịch, nhuận bút và số dư ví',
    icon: CreditCard,
    enabled: true,
  },
  {
    id: 'system',
    title: 'Thông báo hệ thống',
    description: 'Nhận thông báo bảo trì, cập nhật và tin tức hệ thống',
    icon: Monitor,
    enabled: false,
  },
];

// ─── Toggle Switch Component ─────────────────────────────────
interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
}

const ToggleSwitch = ({ enabled, onChange }: ToggleSwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    onClick={onChange}
    className={`
      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
      transition-colors duration-200 ease-in-out focus:outline-none
      ${enabled
        ? 'bg-brand shadow-[0_0_12px_rgba(108,92,231,0.3)]'
        : 'bg-bg-surface border border-border-custom'
      }
    `}
  >
    <span
      className={`
        pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white
        shadow-md ring-0 transition-transform duration-200 ease-in-out
        ${enabled ? 'translate-x-[22px] mt-[3px] ml-0' : 'translate-x-[3px] mt-[3px]'}
      `}
    />
  </button>
);

// ─── Main Component ──────────────────────────────────────────
export const SettingsFeature = () => {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPref[]>(
    DEFAULT_NOTIFICATION_PREFS
  );

  const role = user?.role ?? 'Mangaka';
  const roleBadge = ROLE_BADGE_STYLES[role];
  const avatarGradient = AVATAR_GRADIENTS[role];
  const initial = user?.fullName?.charAt(0)?.toUpperCase() || 'U';

  const handleToggleNotification = (id: string) => {
    setNotificationPrefs((prev) =>
      prev.map((pref) =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  // ─── Profile Tab ─────────────────────────────────────────
  const renderProfileTab = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Avatar + Basic Info Card */}
      <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
        {/* Banner gradient */}
        <div className="h-24 bg-gradient-to-r from-brand/20 via-bg-secondary to-secondary/10 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(108,92,231,0.1),transparent_50%)]" />
        </div>

        <div className="px-6 pb-6 -mt-10 relative z-10">
          {/* Avatar */}
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-bg-secondary`}>
            {initial}
          </div>

          <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                {user?.fullName || 'Chưa cập nhật'}
              </h2>
              <p className="text-sm text-text-muted mt-0.5">
                @{user?.userName || user?.email?.split('@')[0] || 'user'}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${roleBadge.bg} ${roleBadge.text} w-fit`}>
              <Shield size={12} />
              {roleBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Detail Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Email */}
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Email</p>
              <p className="text-sm text-text-primary font-medium truncate mt-0.5">
                {user?.email || 'Chưa cập nhật'}
              </p>
            </div>
          </div>
        </div>

        {/* Username */}
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-brand" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Tên đăng nhập</p>
              <p className="text-sm text-text-primary font-medium truncate mt-0.5">
                {user?.userName || 'Chưa cập nhật'}
              </p>
            </div>
          </div>
        </div>

        {/* Role */}
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${roleBadge.bg} flex items-center justify-center flex-shrink-0`}>
              <Shield size={18} className={roleBadge.text} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Vai trò</p>
              <p className={`text-sm font-medium mt-0.5 ${roleBadge.text}`}>
                {roleBadge.label}
              </p>
            </div>
          </div>
        </div>

        {/* User ID */}
        <div className="bg-bg-secondary border border-border-custom rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Settings size={18} className="text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Mã tài khoản</p>
              <p className="text-sm text-text-primary font-medium truncate mt-0.5 font-mono">
                #{String(user?.id || '—')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Password Tab ────────────────────────────────────────
  const renderPasswordTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-bg-secondary border border-border-custom rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Icon & Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand/20 to-brand-hover/10 flex items-center justify-center flex-shrink-0 border border-brand/20">
              <Lock size={24} className="text-brand" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Bảo mật tài khoản
              </h3>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                Thay đổi mật khẩu để bảo vệ tài khoản của bạn. Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
              </p>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-brand hover:shadow-brand-hover border-none cursor-pointer hover:-translate-y-0.5 flex-shrink-0"
          >
            <KeyRound size={16} />
            Đổi mật khẩu
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-bg-secondary border border-border-custom rounded-xl p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Shield size={16} className="text-text-muted" />
          Mẹo bảo mật
        </h3>
        <div className="space-y-3">
          {[
            'Sử dụng mật khẩu duy nhất cho tài khoản này',
            'Không chia sẻ mật khẩu với bất kỳ ai',
            'Đổi mật khẩu định kỳ 3-6 tháng một lần',
            'Không sử dụng thông tin cá nhân làm mật khẩu',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />
              <p className="text-sm text-text-secondary">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ChangePasswordModal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );

  // ─── Notifications Tab ───────────────────────────────────
  const renderNotificationsTab = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-custom">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Bell size={16} className="text-text-muted" />
            Tùy chọn thông báo
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Chọn loại thông báo bạn muốn nhận
          </p>
        </div>

        <div className="divide-y divide-border-custom">
          {notificationPrefs.map((pref) => {
            const Icon = pref.icon;
            return (
              <div
                key={pref.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-bg-surface/30 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    pref.enabled ? 'bg-brand/10' : 'bg-bg-surface'
                  } transition-colors duration-200`}>
                    <Icon
                      size={18}
                      className={`${pref.enabled ? 'text-brand' : 'text-text-muted'} transition-colors duration-200`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{pref.title}</p>
                    <p className="text-xs text-text-muted mt-0.5">{pref.description}</p>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={pref.enabled}
                  onChange={() => handleToggleNotification(pref.id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 p-4 bg-brand/5 border border-brand/10 rounded-xl">
        <Bell size={16} className="text-brand mt-0.5 flex-shrink-0" />
        <p className="text-xs text-text-secondary leading-relaxed">
          Các cài đặt thông báo sẽ được áp dụng cho cả thông báo trong ứng dụng và email. 
          Bạn vẫn sẽ nhận được các thông báo bảo mật quan trọng ngay cả khi tắt thông báo.
        </p>
      </div>
    </div>
  );

  // ─── Tab Content Renderer ────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'password':
        return renderPasswordTab();
      case 'notifications':
        return renderNotificationsTab();
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* ─── Page Header ─── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Settings size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Cài đặt</h1>
            <p className="page-header__subtitle">Quản lý tài khoản và tùy chỉnh</p>
          </div>
        </div>
      </div>

      {/* ─── Tab Navigation ─── */}
      <div className="mt-6 border-b border-border-custom">
        <nav className="flex gap-1 -mb-px" aria-label="Settings tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-3 text-sm font-medium
                  transition-all duration-200 border-b-2 bg-transparent cursor-pointer
                  ${isActive
                    ? 'text-brand border-brand'
                    : 'text-text-muted hover:text-text-secondary border-transparent hover:border-border-custom'
                  }
                `}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="mt-6 max-w-4xl">
        {renderTabContent()}
      </div>
    </div>
  );
};
