import { LayoutDashboard } from 'lucide-react';

export const MangakaDashboardPage = () => {
  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <LayoutDashboard size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Dashboard Mangaka</h1>
            <p className="page-header__subtitle">Tổng quan hoạt động sáng tác</p>
          </div>
        </div>
      </div>
      {/* TODO: Stat cards, recent activity, series overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {['Series đang hoạt động', 'Chapters chờ duyệt', 'Tasks đang xử lý', 'Số dư ví'].map((label) => (
          <div key={label} className="bg-bg-secondary border border-border-custom rounded-xl p-5 flex flex-col gap-2">
            <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</span>
            <span className="text-2xl font-bold text-text-primary">—</span>
          </div>
        ))}
      </div>
    </div>
  );
};
