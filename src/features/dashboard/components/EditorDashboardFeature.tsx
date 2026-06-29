import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  LayoutDashboard,
  Activity,
  PieChart,
} from 'lucide-react';
import { StatCard } from './StatCard';
import { useEditorDashboard } from '../hooks/useEditorDashboard';
import type { EditorRecentActivityDto } from '../api/dashboard.api';
import { ChartCard, TrendAreaChart, DonutChart, CHART_COLORS } from './charts';

export const EditorDashboardFeature = () => {
  const { stats, recentActivities, charts, isLoading, error } = useEditorDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-muted">Không thể tải dữ liệu dashboard. Vui lòng thử lại.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <LayoutDashboard size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Dashboard Biên tập</h1>
            <p className="page-header__subtitle">Tổng quan công việc và đánh giá</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Đang đánh giá"
          value={stats.reviewing}
          icon={Clock}
          color="text-info"
          navigateTo="/editor/review"
        />
        <StatCard
          label="Yêu cầu chờ duyệt"
          value={stats.pending}
          icon={FileText}
          color="text-warning"
          navigateTo="/editor/review"
        />
        <StatCard
          label="Tranh chấp phát sinh"
          value={stats.disputes}
          icon={AlertTriangle}
          color="text-danger"
          navigateTo="/editor/disputes"
        />
        <StatCard
          label="Đã hoàn thành"
          value={stats.completed}
          icon={CheckCircle}
          color="text-success"
          navigateTo="/editor/review"
        />
      </div>

      {/* Charts */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Số series đã đánh giá"
            subtitle="6 tháng gần đây"
            icon={Activity}
            className="lg:col-span-2"
            action={<span className="text-sm font-bold text-success">{stats.completed} hoàn thành</span>}
          >
            <TrendAreaChart data={charts.reviewTrend} color={CHART_COLORS.info} name="Đã đánh giá" />
          </ChartCard>

          <ChartCard title="Khối lượng công việc" subtitle="Theo trạng thái" icon={PieChart}>
            {charts.workload.length > 0 ? (
              <DonutChart
                data={charts.workload}
                centerValue={stats.reviewing + stats.pending}
                centerLabel="Đang xử lý"
              />
            ) : (
              <div className="flex items-center justify-center h-[200px] text-xs text-text-muted">
                Chưa có dữ liệu
              </div>
            )}
          </ChartCard>
        </div>
      )}

      {/* Recent Activity List */}
      <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border-custom flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Lịch sử công việc gần đây</h2>
        </div>
        <div className="divide-y divide-border-custom">
          {recentActivities.length === 0 && (
            <div className="px-5 py-10 text-center text-xs text-text-muted">Chưa có hoạt động nào gần đây</div>
          )}
          {recentActivities.map((act: EditorRecentActivityDto) => (
            <div key={act.id} className="p-4 flex items-center justify-between hover:bg-bg-surface/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  act.type === 'chapter' ? 'bg-info/10 text-info' :
                  act.type === 'dispute' ? 'bg-danger/10 text-danger' :
                  'bg-success/10 text-success'
                }`}>
                  {act.type === 'chapter' ? <Clock size={16} /> :
                   act.type === 'dispute' ? <AlertTriangle size={16} /> :
                   <CheckCircle size={16} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{act.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{act.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
