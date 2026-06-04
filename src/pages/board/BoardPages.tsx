import { LayoutDashboard, Vote, BarChart3, Calendar, Settings } from 'lucide-react';

const BoardPageScaffold = ({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: typeof LayoutDashboard }) => (
  <div>
    <div className="page-header">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
          <Icon size={20} className="text-brand" />
        </div>
        <div>
          <h1 className="page-header__title">{title}</h1>
          <p className="page-header__subtitle">{subtitle}</p>
        </div>
      </div>
    </div>
    <div className="mt-6 bg-bg-secondary border border-border-custom rounded-xl p-8 flex flex-col items-center justify-center gap-4 min-h-[300px]">
      <Icon size={48} className="text-text-muted" />
      <p className="text-text-secondary text-sm">Nội dung sẽ hiển thị ở đây</p>
    </div>
  </div>
);

export const BoardDashboardPage = () => (
  <BoardPageScaffold title="Dashboard Hội đồng BT" subtitle="Tổng quan hoạt động xét duyệt" icon={LayoutDashboard} />
);

export const VotingPage = () => (
  <BoardPageScaffold title="Bỏ phiếu xét duyệt" subtitle="Duyệt hoặc từ chối Series đề xuất" icon={Vote} />
);

export const RankingPage = () => (
  <BoardPageScaffold title="Xếp hạng Series" subtitle="Bảng xếp hạng theo lượt đánh giá" icon={BarChart3} />
);

export const PublishSchedulePage = () => (
  <BoardPageScaffold title="Lịch xuất bản" subtitle="Quản lý lịch phát hành Series" icon={Calendar} />
);

export const BoardSettingsPage = () => (
  <BoardPageScaffold title="Cài đặt" subtitle="Quản lý tài khoản và tùy chỉnh" icon={Settings} />
);
