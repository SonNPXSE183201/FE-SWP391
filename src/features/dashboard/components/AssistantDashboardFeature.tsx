import {
  LayoutDashboard,
  TrendingUp,
  CheckCircle,
  Clock,
  Star,
  Loader2,
  PieChart,
} from 'lucide-react';
import { formatVND } from '../../wallet';
import { useAssistantDashboard } from '../hooks/useAssistantDashboard';
import { StatCard } from './StatCard';
import { ChartCard, TrendBarChart, DonutChart, CHART_COLORS, formatCompactVND } from './charts';

export const AssistantDashboardFeature = () => {
  const { stats, recentTasks, charts, isLoading, error } = useAssistantDashboard();

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
            <h1 className="page-header__title">Dashboard Trợ lý vẽ</h1>
            <p className="page-header__subtitle">Tổng quan công việc và thu nhập</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Công việc đang làm" value={stats.inProgress} icon={Clock} color="text-info" navigateTo="/assistant/tasks" />
        <StatCard label="Công việc hoàn thành" value={stats.completed} icon={CheckCircle} color="text-success" navigateTo="/assistant/tasks" />
        <StatCard label="Đánh giá trung bình" value={stats.averageRating} suffix="/ 5.0" icon={Star} color="text-warning" />
        <StatCard
          label="Thu nhập tháng"
          value={formatVND(stats.monthlyIncome)}
          icon={TrendingUp}
          color="text-brand"
          navigateTo="/assistant/wallet"
        />
      </div>

      {/* Charts */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Thu nhập 6 tháng gần đây"
            subtitle="Tiền công nhận theo tháng"
            icon={TrendingUp}
            className="lg:col-span-2"
            action={<span className="text-sm font-bold text-brand">{formatVND(stats.monthlyIncome)}</span>}
          >
            <TrendBarChart
              data={charts.incomeTrend}
              color={CHART_COLORS.brand}
              name="Thu nhập"
              valueFormatter={formatCompactVND}
            />
          </ChartCard>

          <ChartCard title="Phân bổ công việc" subtitle="Theo trạng thái công việc" icon={PieChart}>
            {charts.taskStatus.length > 0 ? (
              <DonutChart
                data={charts.taskStatus}
                centerValue={stats.inProgress + stats.completed}
                centerLabel="Tổng công việc"
              />
            ) : (
              <div className="flex items-center justify-center h-[200px] text-xs text-text-muted">
                Chưa có công việc nào
              </div>
            )}
          </ChartCard>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-custom flex items-center gap-2">
          <Clock size={16} className="text-text-muted" />
          <h2 className="text-sm font-semibold text-text-primary">Hoạt động gần đây</h2>
        </div>
        <div className="divide-y divide-border-custom">
          {recentTasks.length === 0 && (
            <div className="px-5 py-10 text-center text-xs text-text-muted">Chưa có công việc nào gần đây</div>
          )}
          {recentTasks.map((task) => (
            <div
              key={task.id}
              className="px-5 py-4 flex items-center justify-between hover:bg-bg-surface/30 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-medium text-text-primary mb-1 truncate">{task.title}</p>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span>{task.date ? new Date(task.date).toLocaleDateString('vi-VN') : '—'}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-medium ${
                      task.status === 'Approved'
                        ? 'bg-success/10 text-success'
                        : task.status === 'In_Progress'
                          ? 'bg-info/10 text-info'
                          : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="font-bold text-text-primary flex-shrink-0 ml-3">{formatVND(task.amount)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
