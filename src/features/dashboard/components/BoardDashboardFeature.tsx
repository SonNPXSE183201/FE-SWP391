import {
  Vote,
  BookOpen,
  XCircle,
  Coins,
  Loader2,
  LayoutDashboard,
  PieChart,
} from 'lucide-react';
import { StatCard } from './StatCard';
import { useBoardDashboard } from '../hooks/useBoardDashboard';
import { formatVND } from '../../wallet';
import type { BoardRecentActivityDto } from '../api/dashboard.api';
import { ChartCard, TrendBarChart, DonutChart, CHART_COLORS } from './charts';

export const BoardDashboardFeature = () => {
  const { stats, recentActivities, charts, isLoading, error } = useBoardDashboard();

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <LayoutDashboard size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="page-header__title">Dashboard Hội đồng Biên tập</h1>
            <p className="page-header__subtitle">Quản lý hoạt động bỏ phiếu và ngân sách</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-stagger>
        <StatCard
          label="Đề xuất cần Vote"
          value={stats.votes}
          icon={Vote}
          color="text-brand"
          navigateTo="/board/voting"
        />
        <StatCard
          label="Series đang hoạt động"
          value={stats.active}
          icon={BookOpen}
          color="text-success"
          navigateTo="/board/ranking"
        />
        <StatCard
          label="Series tạm dừng/hủy"
          value={stats.cancelled}
          icon={XCircle}
          color="text-danger"
          navigateTo="/board/ranking"
        />
        <StatCard
          label="Tổng ngân sách sản xuất"
          value={formatVND(stats.budget)}
          icon={Coins}
          color="text-info"
          navigateTo="/board/voting"
        />
      </div>

      {/* Charts */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-stagger>
          <ChartCard
            title="Hoạt động bỏ phiếu"
            subtitle="Số đề xuất xét duyệt 6 tháng gần đây"
            icon={Vote}
            className="lg:col-span-2"
            action={<span className="text-sm font-bold text-brand">{stats.votes} đề xuất</span>}
          >
            <TrendBarChart data={charts.votingTrend} color={CHART_COLORS.brand} name="Đề xuất" />
          </ChartCard>

          <ChartCard title="Tình trạng Series" subtitle="Phân bố sản xuất" icon={PieChart}>
            {charts.seriesStatus.length > 0 ? (
              <DonutChart data={charts.seriesStatus} centerValue={stats.active} centerLabel="Hoạt động" />
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
          <h2 className="text-sm font-semibold text-text-primary">Hoạt động xét duyệt gần đây</h2>
        </div>
        <div className="divide-y divide-border-custom">
          {recentActivities.length === 0 && (
            <div className="px-5 py-10 text-center text-xs text-text-muted">Chưa có hoạt động nào gần đây</div>
          )}
          {recentActivities.map((act: BoardRecentActivityDto) => (
            <div key={act.id} className="p-4 flex items-center justify-between hover:bg-bg-surface/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  act.type === 'vote' ? 'bg-brand/10 text-brand' :
                  act.type === 'budget' ? 'bg-info/10 text-info' :
                  'bg-warning/10 text-warning'
                }`}>
                  {act.type === 'vote' ? <Vote size={16} /> :
                   act.type === 'budget' ? <Coins size={16} /> :
                   <BookOpen size={16} />}
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
