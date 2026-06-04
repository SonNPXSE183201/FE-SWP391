import { LayoutDashboard } from 'lucide-react';

export const AssistantDashboardPage = () => (
  <div>
    <div className="page-header">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
          <LayoutDashboard size={20} className="text-brand" />
        </div>
        <div>
          <h1 className="page-header__title">Dashboard Trợ lý vẽ</h1>
          <p className="page-header__subtitle">Tổng quan công việc và thu nhập</p>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {['Task đang thực hiện', 'Task hoàn thành', 'Đánh giá TB', 'Thu nhập tháng'].map((label) => (
        <div key={label} className="bg-bg-secondary border border-border-custom rounded-xl p-5 flex flex-col gap-2">
          <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</span>
          <span className="text-2xl font-bold text-text-primary">—</span>
        </div>
      ))}
    </div>
  </div>
);

