import {
  Users,
  CheckCircle,
  BookOpen,
  ArrowUpDown,
  Loader2,
  LayoutDashboard,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import { StatCard } from './StatCard';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import type { AdminRecentActivityDto } from '../api/dashboard.api';
import { ChartCard, TrendAreaChart, TrendBarChart, DonutChart, CHART_COLORS } from './charts';

export const AdminDashboardFeature = () => {
  const { stats, recentActivities, charts, isLoading, error } = useAdminDashboard();

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
            <h1 className="page-header__title">Dashboard Quản trị</h1>
            <p className="page-header__subtitle">Thống kê và tổng quan hệ thống</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng người dùng"
          value={stats.users}
          icon={Users}
          color="text-brand"
          navigateTo="/admin/users"
        />
        <StatCard
          label="Số series đã duyệt"
          value={stats.series}
          icon={BookOpen}
          color="text-info"
          navigateTo="/admin/contracts"
        />
        <StatCard
          label="Hồ sơ cần duyệt"
          value={stats.approvals}
          icon={CheckCircle}
          color="text-warning"
          navigateTo="/admin/contracts"
        />
        <StatCard
          label="Giao dịch trong tháng"
          value={stats.transactions}
          icon={ArrowUpDown}
          color="text-success"
          navigateTo="/admin/reconciliation"
        />
      </div>

      {/* Charts */}
      {charts && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard
              title="Tăng trưởng người dùng"
              subtitle="Tổng người dùng 6 tháng gần đây"
              icon={TrendingUp}
              className="lg:col-span-2"
              action={<span className="text-sm font-bold text-brand">{stats.users} người dùng</span>}
            >
              <TrendAreaChart data={charts.userGrowth} color={CHART_COLORS.brand} name="Người dùng" />
            </ChartCard>

            <ChartCard title="Phân bổ nội dung" subtitle="Series & hồ sơ" icon={PieChart}>
              {charts.contentBreakdown.length > 0 ? (
                <DonutChart data={charts.contentBreakdown} centerValue={stats.series} centerLabel="Series" />
              ) : (
                <div className="flex items-center justify-center h-[200px] text-xs text-text-muted">
                  Chưa có dữ liệu
                </div>
              )}
            </ChartCard>
          </div>

          <ChartCard
            title="Giao dịch theo tháng"
            subtitle="Số lượng giao dịch 6 tháng gần đây"
            icon={ArrowUpDown}
            action={<span className="text-sm font-bold text-success">{stats.transactions} giao dịch</span>}
          >
            <TrendBarChart data={charts.transactionTrend} color={CHART_COLORS.success} name="Giao dịch" />
          </ChartCard>
        </>
      )}

      {/* Recent Activity List */}
      <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border-custom flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Hoạt động hệ thống gần đây</h2>
        </div>
        <div className="divide-y divide-border-custom">
          {recentActivities.length === 0 && (
            <div className="px-5 py-10 text-center text-xs text-text-muted">Chưa có hoạt động nào gần đây</div>
          )}
          {recentActivities.map((act: AdminRecentActivityDto) => (
            <div key={act.id} className="p-4 flex items-center justify-between hover:bg-bg-surface/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  act.type === 'user' ? 'bg-brand/10 text-brand' :
                  act.type === 'contract' ? 'bg-info/10 text-info' :
                  'bg-success/10 text-success'
                }`}>
                  {act.type === 'user' ? <Users size={16} /> :
                   act.type === 'contract' ? <BookOpen size={16} /> :
                   <ArrowUpDown size={16} />}
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
