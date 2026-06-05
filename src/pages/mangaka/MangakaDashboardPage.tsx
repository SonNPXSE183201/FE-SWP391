import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
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
} from 'lucide-react';

// ─── Import from features (Feature-Driven Architecture) ─────
import { SERIES_STATUS_CONFIG } from '../../features/series';
import { formatVND } from '../../features/wallet';
import {
  StatCard,
  MOCK_DASHBOARD_STATS,
  MOCK_RECENT_ACTIVITIES,
  MOCK_SERIES_OVERVIEW,
  getGreeting,
} from '../../features/dashboard';

// ─── Main Dashboard ──────────────────────────────────────────
export const MangakaDashboardPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const greeting = getGreeting();

  return (
    <div className="animate-fade-in space-y-6">
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
            {user?.fullName || 'Mangaka'}
          </h1>
          <p className="text-sm text-text-muted mt-2 max-w-lg">
            Bạn có <span className="text-warning font-semibold">{MOCK_DASHBOARD_STATS.pendingChapters} chapters chờ duyệt</span> và{' '}
            <span className="text-info font-semibold">{MOCK_DASHBOARD_STATS.activeTasks} tasks đang xử lý</span>. Hãy kiểm tra ngay!
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => navigate('/mangaka/series/create')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-medium transition-all shadow-brand hover:shadow-brand-hover border-none cursor-pointer hover:-translate-y-0.5"
            >
              <Sparkles size={14} />
              Tạo Series mới
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

      {/* ─── Stat Cards (Feature Component) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Series đang hoạt động"
          value={MOCK_DASHBOARD_STATS.activeSeries}
          icon={BookOpen}
          color="text-brand"
          navigateTo="/mangaka/series"
        />
        <StatCard
          label="Chapters chờ duyệt"
          value={MOCK_DASHBOARD_STATS.pendingChapters}
          icon={Clock}
          color="text-warning"
          navigateTo="/mangaka/manuscripts"
        />
        <StatCard
          label="Tasks đang xử lý"
          value={MOCK_DASHBOARD_STATS.activeTasks}
          icon={ClipboardList}
          color="text-info"
          navigateTo="/mangaka/tasks"
        />
        <StatCard
          label="Số dư ví"
          value={formatVND(MOCK_DASHBOARD_STATS.walletBalance)}
          icon={Wallet}
          color="text-success"
          navigateTo="/mangaka/wallet"
          trend={`+${formatVND(MOCK_DASHBOARD_STATS.monthlyGenkouryo)} tháng này`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ─── Recent Activity (3/5 width) ─── */}
        <div className="lg:col-span-3">
          <div className="bg-bg-secondary border border-border-custom rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-custom">
              <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Clock size={16} className="text-text-muted" />
                Hoạt động gần đây
              </h2>
            </div>
            <div className="divide-y divide-border-custom">
              {MOCK_RECENT_ACTIVITIES.map((activity) => {
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

        {/* ─── Series Overview (2/5 width) ─── */}
        <div className="lg:col-span-2">
          <div className="bg-bg-secondary border border-border-custom rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-custom">
              <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <BarChart3 size={16} className="text-text-muted" />
                Series của tôi
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
              {MOCK_SERIES_OVERVIEW.map((series) => {
                const statusCfg = SERIES_STATUS_CONFIG[series.status];
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
              <div className="text-lg font-bold text-text-primary">{MOCK_DASHBOARD_STATS.completedTasks}</div>
              <div className="text-[10px] text-text-muted mt-0.5">Tasks hoàn thành</div>
            </div>
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-success">{formatVND(MOCK_DASHBOARD_STATS.monthlyGenkouryo)}</div>
              <div className="text-[10px] text-text-muted mt-0.5">Nhuận bút tháng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
