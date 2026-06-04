import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  BookOpen,
  FileText,
  ClipboardList,
  Wallet,
  TrendingUp,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Sparkles,
  ChevronRight,
  Eye,
} from 'lucide-react';

// ─── Mock Dashboard Data ─────────────────────────────────────
const STATS = {
  activeSeries: 3,
  pendingChapters: 2,
  activeTasks: 5,
  walletBalance: 12500000,
  monthlyGenkouryo: 3200000,
  completedTasks: 18,
};

const RECENT_ACTIVITIES = [
  {
    id: '1',
    type: 'chapter_approved' as const,
    title: 'Chapter 3 "Bí mật của ngôi làng" đã được duyệt',
    series: 'Huyền Thoại Samurai',
    time: '2 giờ trước',
    icon: CheckCircle2,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    id: '2',
    type: 'task_submitted' as const,
    title: 'Assistant Minh Anh đã nộp bài Task #12',
    series: 'Huyền Thoại Samurai',
    time: '5 giờ trước',
    icon: ClipboardList,
    color: 'text-info',
    bg: 'bg-info/10',
  },
  {
    id: '3',
    type: 'chapter_revision' as const,
    title: 'Chapter 1 "Tín hiệu cuối cùng" cần chỉnh sửa',
    series: 'Lạc Giữa Ngân Hà',
    time: '1 ngày trước',
    icon: AlertCircle,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    id: '4',
    type: 'wallet_received' as const,
    title: 'Nhận nhuận bút 1.200.000₫ cho Chapter 2',
    series: 'Huyền Thoại Samurai',
    time: '2 ngày trước',
    icon: Wallet,
    color: 'text-brand',
    bg: 'bg-brand/10',
  },
  {
    id: '5',
    type: 'series_approved' as const,
    title: 'Series "Vườn Hoa Mùa Đông" đã được Board duyệt',
    series: 'Vườn Hoa Mùa Đông',
    time: '3 ngày trước',
    icon: Sparkles,
    color: 'text-success',
    bg: 'bg-success/10',
  },
];

const SERIES_OVERVIEW = [
  { id: '1', title: 'Huyền Thoại Samurai', chapters: 12, status: 'Published' as const, trend: '+2 chương/tuần' },
  { id: '2', title: 'Lạc Giữa Ngân Hà', chapters: 5, status: 'Approved' as const, trend: '+1 chương/tuần' },
  { id: '3', title: 'Vườn Hoa Mùa Đông', chapters: 3, status: 'PendingApproval' as const, trend: 'Mới tạo' },
];

const STATUS_COLORS = {
  Published: { label: 'Đang XB', color: 'text-success', dot: 'bg-success' },
  Approved: { label: 'Đã duyệt', color: 'text-info', dot: 'bg-info' },
  PendingApproval: { label: 'Chờ duyệt', color: 'text-warning', dot: 'bg-warning' },
};

// ─── Format VND ──────────────────────────────────────────────
const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// ─── Stat Card Component ─────────────────────────────────────
const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  suffix,
  trend,
  onClick,
}: {
  label: string;
  value: string | number;
  icon: typeof BookOpen;
  color: string;
  suffix?: string;
  trend?: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`bg-bg-secondary border border-border-custom rounded-xl p-5 transition-all duration-300 hover:border-brand/20 hover:shadow-md-custom ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''} group`}
  >
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-xl ${color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
        <Icon size={20} className={color} />
      </div>
      {onClick && (
        <ArrowUpRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-brand transition-all" />
      )}
    </div>
    <div className="mt-3">
      <div className="text-2xl font-bold text-text-primary">
        {value}
        {suffix && <span className="text-sm font-normal text-text-muted ml-0.5">{suffix}</span>}
      </div>
      <div className="text-xs text-text-muted mt-0.5">{label}</div>
    </div>
    {trend && (
      <div className="flex items-center gap-1 mt-2">
        <TrendingUp size={12} className="text-success" />
        <span className="text-[11px] text-success font-medium">{trend}</span>
      </div>
    )}
  </div>
);

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
            Bạn có <span className="text-warning font-semibold">{STATS.pendingChapters} chapters chờ duyệt</span> và{' '}
            <span className="text-info font-semibold">{STATS.activeTasks} tasks đang xử lý</span>. Hãy kiểm tra ngay!
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

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Series đang hoạt động"
          value={STATS.activeSeries}
          icon={BookOpen}
          color="text-brand"
          onClick={() => navigate('/mangaka/series')}
        />
        <StatCard
          label="Chapters chờ duyệt"
          value={STATS.pendingChapters}
          icon={Clock}
          color="text-warning"
          onClick={() => navigate('/mangaka/manuscripts')}
        />
        <StatCard
          label="Tasks đang xử lý"
          value={STATS.activeTasks}
          icon={ClipboardList}
          color="text-info"
          onClick={() => navigate('/mangaka/tasks')}
        />
        <StatCard
          label="Số dư ví"
          value={formatVND(STATS.walletBalance)}
          icon={Wallet}
          color="text-success"
          onClick={() => navigate('/mangaka/wallet')}
          trend={`+${formatVND(STATS.monthlyGenkouryo)} tháng này`}
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
              {RECENT_ACTIVITIES.map((activity) => {
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
              {SERIES_OVERVIEW.map((series) => {
                const statusCfg = STATUS_COLORS[series.status];
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
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
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
              <div className="text-lg font-bold text-text-primary">{STATS.completedTasks}</div>
              <div className="text-[10px] text-text-muted mt-0.5">Tasks hoàn thành</div>
            </div>
            <div className="bg-bg-secondary border border-border-custom rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-success">{formatVND(STATS.monthlyGenkouryo)}</div>
              <div className="text-[10px] text-text-muted mt-0.5">Nhuận bút tháng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Helper ──────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng,';
  if (hour < 18) return 'Chào buổi chiều,';
  return 'Chào buổi tối,';
}
