import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import {
  BookOpen,
  FileText,
  ClipboardList,
  Wallet,
  Clock,
  Sparkles,
  ChevronRight,
  Eye,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { getSeriesStatusConfig } from '../../series';
import { formatVND } from '../../wallet';
import { StatCard } from '../index';
import { useMangakaDashboard, getGreeting } from '../hooks/useMangakaDashboard';
import { ChartCard, TrendAreaChart, DonutChart, CHART_COLORS, formatCompactVND } from './charts';
import { TrendingUp, PieChart } from 'lucide-react';
import { useRankingList } from '../../ranking';
import { getRankingRecordTitle } from '../../ranking/utils/ranking.utils';

export const MangakaDashboardFeature = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const greeting = getGreeting();
  const { stats, activities, seriesOverview, charts, isLoading: isDashboardLoading, error } = useMangakaDashboard();
  
  const { data: rankingList = [] } = useRankingList({ period: 'month' });
  
  const myRankedRecords = rankingList
    .filter((r) => r.series?.mangakaId !== undefined && String(r.series.mangakaId) === String(user?.id));
  
  let bestRecord = null;
  if (myRankedRecords.length > 0) {
    bestRecord = myRankedRecords.reduce((prev, curr) => 
      (prev.rankPosition ?? 999) < (curr.rankPosition ?? 999) ? prev : curr
    );
  }
  
  const bestRank = bestRecord ? bestRecord.rankPosition : null;
  const bestSeriesTitle = bestRecord ? getRankingRecordTitle(bestRecord) : '';
  const rankDisplay = bestRank ? `#${bestRank} - ${bestSeriesTitle}` : 'Chưa xếp hạng';
  const totalRanked = rankingList.length;
  const trendText = bestRank ? `trên tổng số ${totalRanked} truyện` : undefined;

  const isLoading = isDashboardLoading;


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
        <p className="text-text-muted">Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Welcome Banner ─── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand/[0.08] via-bg-secondary to-secondary/[0.06] border border-brand/10 rounded-2xl p-6 lg:p-8">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-secondary/5 rounded-full blur-3xl translate-y-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">👋</span>
            <span className="text-sm text-text-secondary">{greeting}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
            {user?.fullName || 'Tác giả'}
          </h1>
          <p className="text-sm text-text-muted mt-2 max-w-lg">
            Bạn có <span className="text-warning font-semibold">{stats.pendingChapters} chương chờ duyệt</span> và{' '}
            <span className="text-info font-semibold">{stats.activeTasks} công việc đang xử lý</span>. Hãy kiểm tra ngay!
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => navigate('/mangaka/series/create')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-medium transition-all shadow-brand hover:shadow-brand-hover border-none cursor-pointer hover:-translate-y-0.5"
            >
              <Sparkles size={14} />
              Tạo bộ truyện mới
            </button>
            <button
              onClick={() => navigate('/mangaka/manuscripts')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-bg-surface hover:bg-bg-surface/80 text-text-primary rounded-xl text-sm font-medium transition-all border border-border-custom hover:border-brand/20 cursor-pointer"
            >
              <FileText size={14} />
              Nộp bản thảo
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3" data-stagger>
        <StatCard
          label="Bộ truyện đang hoạt động"
          value={stats.activeSeries}
          icon={BookOpen}
          color="text-brand"
          navigateTo="/mangaka/series"
        />
        <StatCard
          label="Chương chờ duyệt"
          value={stats.pendingChapters}
          icon={Clock}
          color="text-warning"
          navigateTo="/mangaka/manuscripts"
        />
        <StatCard
          label="Công việc đang xử lý"
          value={stats.activeTasks}
          icon={ClipboardList}
          color="text-info"
          navigateTo="/mangaka/tasks"
        />
        <StatCard
          label="Số dư ví"
          value={formatVND(stats.walletBalance)}
          icon={Wallet}
          color="text-success"
          navigateTo="/mangaka/wallet"
          trend={`+${formatVND(stats.monthlyGenkouryo)} tháng này`}
        />
        <StatCard
          label="Thứ hạng tốt nhất"
          value={rankDisplay}
          icon={BarChart3}
          color="text-brand"
          navigateTo="/mangaka/ranking"
          trend={trendText}
        />
      </div>

      {/* ─── Charts ─── */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-stagger>
          <ChartCard
            title="Nhuận bút 6 tháng gần đây"
            subtitle="Tổng nhuận bút nhận theo tháng"
            icon={TrendingUp}
            className="lg:col-span-2"
            action={
              <span className="text-sm font-bold text-success">{formatVND(stats.monthlyGenkouryo)}</span>
            }
          >
            <TrendAreaChart
              data={charts.revenueTrend}
              color={CHART_COLORS.success}
              name="Nhuận bút"
              valueFormatter={formatCompactVND}
            />
          </ChartCard>

          <ChartCard title="Trạng thái bộ truyện" subtitle="Phân bố theo tình trạng" icon={PieChart}>
            {charts.seriesStatus.length > 0 ? (
              <DonutChart
                data={charts.seriesStatus}
                centerValue={stats.activeSeries}
                centerLabel="Bộ truyện"
              />
            ) : (
              <div className="flex items-center justify-center h-[200px] text-xs text-text-muted">
                Chưa có bộ truyện nào
              </div>
            )}
          </ChartCard>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ─── Recent Activity ─── */}
        <div className="lg:col-span-3">
          <div className="bg-bg-secondary border border-border-custom rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-custom">
              <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Clock size={16} className="text-text-muted" />
                Hoạt động gần đây
              </h2>
            </div>
            <div className="divide-y divide-border-custom">
              {activities.length === 0 && (
                <div className="px-5 py-10 text-center text-xs text-text-muted">
                  Chưa có hoạt động nào gần đây
                </div>
              )}
              {activities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-bg-surface/30 transition-colors cursor-pointer"
                  >
                    <div className={`w-8 h-8 rounded-lg ${activity.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon size={15} className={activity.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary leading-snug">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-text-muted">{activity.series}</span>
                        <span className="text-text-muted">·</span>
                        <span className="text-[11px] text-text-muted">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Series Overview ─── */}
        <div className="lg:col-span-2">
          <div className="bg-bg-secondary border border-border-custom rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-custom">
              <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <BarChart3 size={16} className="text-text-muted" />
                Bộ truyện của tôi
              </h2>
              <button
                onClick={() => navigate('/mangaka/series')}
                className="text-[11px] text-brand hover:text-brand-hover font-medium flex items-center gap-0.5 bg-transparent border-none cursor-pointer transition-colors"
              >
                Xem tất cả
                <ChevronRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-border-custom">
              {seriesOverview.length === 0 && (
                <div className="px-5 py-10 text-center text-xs text-text-muted">
                  Chưa có bộ truyện nào
                </div>
              )}
              {seriesOverview.map((series) => {
                const statusCfg = getSeriesStatusConfig(series.status);
                return (
                  <div
                    key={series.id}
                    onClick={() => navigate(`/mangaka/series/${series.id}`)}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-bg-surface/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-text-primary truncate group-hover:text-brand transition-colors">
                          {series.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-text-muted">{series.chapters} chương</span>
                        <span className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.bg.replace('bg-', 'bg-').replace('/10', '')}`} />
                          <span className={`text-[11px] font-medium ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-text-muted">{series.trend}</span>
                    </div>
                    <Eye size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats Mini */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-text-primary">{stats.completedTasks}</div>
              <div className="text-[10px] text-text-muted mt-0.5">Công việc hoàn thành</div>
            </div>
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-success">{formatVND(stats.monthlyGenkouryo)}</div>
              <div className="text-[10px] text-text-muted mt-0.5">Nhuận bút tháng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
