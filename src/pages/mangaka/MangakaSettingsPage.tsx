import { Settings } from 'lucide-react';

export const MangakaSettingsPage = () => {
  return (
    <div>
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
      {/* TODO: Profile settings, notification preferences, password change */}
      <div className="mt-6 bg-bg-secondary border border-border-custom rounded-xl p-8 flex flex-col items-center justify-center gap-4 min-h-[200px]">
        <Settings size={48} className="text-text-muted" />
        <p className="text-text-secondary text-sm">Cài đặt tài khoản sẽ hiển thị ở đây</p>
      </div>
    </div>
  );
};
