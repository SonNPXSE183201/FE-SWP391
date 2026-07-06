import { useState } from 'react';
import { toast } from 'react-hot-toast';
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
  Pencil,
  Copy,
  Check,
  AlertCircle,
  Camera,
  Save,
  X,
  Loader2,
} from 'lucide-react';
import { useAuthStore, type UserRole } from '../../../stores/authStore';
import { ChangePasswordModal } from '../../auth';
import { useMangakaOnLeave } from '../hooks/useMangakaOnLeave';
import { axiosInstance } from '../../../api/axios';

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

const NOTIFICATION_PREFS_STORAGE_PREFIX = 'inku-notification-prefs';

const getNotificationPrefsStorageKey = (userId: string | number | undefined) =>
  `${NOTIFICATION_PREFS_STORAGE_PREFIX}-${userId ?? 'guest'}`;

const loadNotificationPrefs = (userId: string | number | undefined): NotificationPref[] => {
  try {
    const raw = localStorage.getItem(getNotificationPrefsStorageKey(userId));
    if (!raw) return DEFAULT_NOTIFICATION_PREFS;

    const saved = JSON.parse(raw) as Record<string, boolean>;
    return DEFAULT_NOTIFICATION_PREFS.map((pref) => ({
      ...pref,
      enabled: saved[pref.id] ?? pref.enabled,
    }));
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
};

const saveNotificationPrefs = (userId: string | number | undefined, prefs: NotificationPref[]) => {
  const saved = Object.fromEntries(prefs.map((pref) => [pref.id, pref.enabled]));
  localStorage.setItem(getNotificationPrefsStorageKey(userId), JSON.stringify(saved));
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


const getProfileCompletion = (user: { fullName?: string; email?: string; penName?: string; avatarUrl?: string; phoneNumber?: string } | null) => {
  const fields = [user?.fullName, user?.email, user?.penName, user?.avatarUrl, user?.phoneNumber];
  const filled = fields.filter(Boolean).length;
  return { filled, total: fields.length, percent: Math.round((filled / fields.length) * 100) };
};

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
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || '',
    penName: user?.penName || '',
    skills: user?.skills || '',
    portfolioUrl: user?.portfolioUrl || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const { isOnLeave, toggleOnLeave, isPending: isOnLeavePending } = useMangakaOnLeave();
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPref[]>(() =>
    loadNotificationPrefs(user?.id)
  );

  const role = user?.role ?? 'Mangaka';
  const roleBadge = ROLE_BADGE_STYLES[role];
  const avatarGradient = AVATAR_GRADIENTS[role];
  const initial = user?.fullName?.charAt(0)?.toUpperCase() || 'U';
  const profileCompletion = getProfileCompletion(user);
  const displayUserName = user?.userName || user?.email?.split('@')[0];

  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      toast.success('Đã sao chép');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Không thể sao chép');
    }
  };

  const handleToggleNotification = (id: string) => {
    setNotificationPrefs((prev) => {
      const next = prev.map((pref) =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      );
      saveNotificationPrefs(user?.id, next);
      return next;
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await axiosInstance.post<{ success: boolean; data: string; message: string }>('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (res.data.success) {
        const newAvatarUrl = res.data.data;
        
        // Gọi API cập nhật ngay lập tức cho ảnh đại diện
        await axiosInstance.put('/api/profile', {
          fullName: user?.fullName,
          penName: user?.penName,
          portfolioUrl: user?.portfolioUrl,
          skills: user?.skills,
          phoneNumber: user?.phoneNumber,
          avatarUrl: newAvatarUrl
        });

        updateUser({ avatarUrl: newAvatarUrl });
        toast.success('Cập nhật ảnh đại diện thành công!');
      }
    } catch (error) {
      toast.error('Lỗi khi tải ảnh lên');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      // Gọi API thật để lưu thông tin xuống Database
      await axiosInstance.put('/api/profile', {
        fullName: editForm.fullName,
        penName: editForm.penName,
        portfolioUrl: editForm.portfolioUrl,
        skills: editForm.skills,
        phoneNumber: editForm.phoneNumber,
        avatarUrl: user?.avatarUrl
      });

      // Update local state in Zustand
      updateUser(editForm);
      toast.success('Đã cập nhật thông tin hồ sơ thành công!');
      setIsEditingProfile(false);
    } catch (error) {
      toast.error('Lỗi khi lưu thông tin. Vui lòng thử lại!');
      console.error(error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ─── Profile Hero ──────────────────────────────────────────
  const renderProfileHero = () => (
    <div className="bg-bg-secondary border border-border-custom rounded-2xl overflow-hidden mb-6 w-full max-w-7xl">
      <div className="h-20 sm:h-24 bg-gradient-to-r from-brand/25 via-bg-secondary to-secondary/15 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(108,92,231,0.2),transparent_55%)]" />
      </div>

      <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-10 sm:-mt-11 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
          <div className="relative group">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-20 h-20 sm:w-[5.5rem] sm:h-[5.5rem] rounded-2xl object-cover shadow-lg border-4 border-bg-secondary ring-1 ring-white/10 flex-shrink-0" />
            ) : (
              <div className={`w-20 h-20 sm:w-[5.5rem] sm:h-[5.5rem] rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg border-4 border-bg-secondary ring-1 ring-white/10 flex-shrink-0`}>
                {initial}
              </div>
            )}
            
            {/* Avatar upload overlay */}
            <label className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center text-white border-4 border-transparent">
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Camera size={20} className="mb-1" />
                  <span className="text-[10px] font-medium">Thay đổi</span>
                </>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
            </label>
          </div>

          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight truncate">
                  {user?.fullName || 'Chưa cập nhật'}
                </h2>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${roleBadge.bg} ${roleBadge.text}`}>
                  <Shield size={12} />
                  {roleBadge.label}
                </span>
              </div>
              <p className="text-sm text-text-secondary mt-1 truncate">
                {displayUserName ? `@${displayUserName}` : 'Chưa có tên đăng nhập'}
              </p>
            </div>

              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand/10 hover:bg-brand/20 border border-brand/25 rounded-xl text-sm font-medium text-brand transition-colors flex-shrink-0 cursor-pointer"
                >
                  <Pencil size={14} />
                  Chỉnh sửa hồ sơ
                </button>
              )}
            </div>
        </div>

        {profileCompletion.percent < 100 && (
          <div className="mt-5 pt-4 border-t border-border-custom/60">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <AlertCircle size={14} className="text-warning flex-shrink-0" />
                <span>Hoàn thiện hồ sơ ({profileCompletion.filled}/{profileCompletion.total})</span>
              </div>
              <span className="text-xs font-semibold text-warning">{profileCompletion.percent}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-secondary transition-all duration-500"
                style={{ width: `${profileCompletion.percent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ─── Profile Tab ─────────────────────────────────────────
  const renderProfileTab = () => {
    if (isEditingProfile) {
      return (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-bg-secondary border border-border-custom rounded-2xl overflow-hidden p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Chỉnh sửa hồ sơ</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-surface transition-colors border-none cursor-pointer bg-transparent"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Họ và tên</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Bút danh / Tên hiển thị</label>
                <input
                  type="text"
                  value={editForm.penName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, penName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                  placeholder="Nhập bút danh"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Số điện thoại</label>
                <input
                  type="tel"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              {role === 'Assistant' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-primary">Kỹ năng chuyên môn</label>
                    <input
                      type="text"
                      value={editForm.skills}
                      onChange={(e) => setEditForm(prev => ({ ...prev, skills: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                      placeholder="VD: Lineart, Đổ bóng, Tô màu..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text-primary">Link Portfolio / Mẫu vẽ</label>
                    <input
                      type="url"
                      value={editForm.portfolioUrl}
                      onChange={(e) => setEditForm(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-border-custom mt-6">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface rounded-xl transition-colors border-none cursor-pointer bg-transparent"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-brand/20 border-none cursor-pointer"
              >
                {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5 animate-fade-in">
        {/* Detail info grid */}
        <div className="bg-bg-secondary border border-border-custom rounded-2xl overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-border-custom">
            <h3 className="text-sm font-semibold text-text-primary">Thông tin chi tiết</h3>
            <p className="text-xs text-text-muted mt-0.5">Thông tin tài khoản được quản lý bởi hệ thống</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-custom">
            {/* Email */}
            <div className="group flex items-center justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-bg-surface/25 transition-colors">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Địa chỉ Email</p>
                  <p className="text-sm text-text-primary mt-0.5 truncate">{user?.email || 'Chưa cập nhật'}</p>
                </div>
              </div>
              {user?.email && (
                <button
                  type="button"
                  onClick={() => handleCopy(user.email, 'email')}
                  className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer bg-transparent border-none"
                  aria-label="Sao chép email"
                >
                  {copiedField === 'email' ? <Check size={15} className="text-success" /> : <Copy size={15} />}
                </button>
              )}
            </div>

            {/* PenName / Username */}
            <div className="group flex items-center justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-bg-surface/25 transition-colors md:border-t-0 md:border-l border-border-custom">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-brand" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Bút danh</p>
                  {user?.penName || user?.userName ? (
                    <p className="text-sm text-text-primary mt-0.5 truncate">{user?.penName || `@${user?.userName}`}</p>
                  ) : (
                    <p className="text-sm text-text-muted mt-0.5 italic">Chưa cập nhật</p>
                  )}
                </div>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3.5 px-5 sm:px-6 py-4 hover:bg-bg-surface/25 transition-colors border-t border-border-custom">
              <div className={`w-10 h-10 rounded-xl ${roleBadge.bg} flex items-center justify-center flex-shrink-0`}>
                <Shield size={18} className={roleBadge.text} />
              </div>
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Vai trò</p>
                <p className={`text-sm mt-0.5 font-medium ${roleBadge.text}`}>{roleBadge.label}</p>
              </div>
            </div>

            {/* User ID */}
            <div className="group flex items-center justify-between gap-4 px-5 sm:px-6 py-4 hover:bg-bg-surface/25 transition-colors border-t md:border-l border-border-custom">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Settings size={18} className="text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Mã tài khoản</p>
                  <p className="text-sm text-text-primary mt-0.5 font-mono truncate">#{String(user?.id || '—')}</p>
                </div>
              </div>
              {user?.id && (
                <button
                  type="button"
                  onClick={() => handleCopy(String(user.id), 'id')}
                  className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer bg-transparent border-none"
                  aria-label="Sao chép mã tài khoản"
                >
                  {copiedField === 'id' ? <Check size={15} className="text-success" /> : <Copy size={15} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* On Leave Status (Only for Mangaka) */}
        {role === 'Mangaka' && (
          <div className="bg-bg-secondary border border-border-custom rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isOnLeave ? 'bg-amber-500/10' : 'bg-bg-surface'} transition-colors`}>
                  <Monitor size={20} className={isOnLeave ? 'text-amber-500' : 'text-text-muted'} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">Trạng thái Tạm nghỉ (On Leave)</h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed max-w-xl">
                    Khi bật, hệ thống tạm dừng tính thời gian tự động duyệt Task. Dùng khi bạn cần nghỉ phép dài ngày.
                  </p>
                  {isOnLeavePending && (
                    <p className="text-[11px] text-text-muted mt-2">Đang cập nhật...</p>
                  )}
                </div>
              </div>
              <ToggleSwitch enabled={isOnLeave} onChange={toggleOnLeave} />
            </div>
          </div>
        )}
      </div>
    );
  };

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
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${pref.enabled ? 'bg-brand/10' : 'bg-bg-surface'
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
      <div className="page-header mb-6">
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

      {renderProfileHero()}

      {/* ─── Tab Navigation ─── */}
      <div>
        <nav
          className="inline-flex p-1 gap-1 bg-bg-secondary border border-border-custom rounded-xl"
          aria-label="Settings tabs"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium
                  rounded-lg transition-all duration-200 cursor-pointer border-none
                  ${isActive
                    ? 'bg-brand/15 text-brand shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/60'
                  }
                `}
              >
                <Icon size={16} className={isActive ? 'text-brand' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="mt-6 w-full max-w-7xl">
        {renderTabContent()}
      </div>
    </div>
  );
};
