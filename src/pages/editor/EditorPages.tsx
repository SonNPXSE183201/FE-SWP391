import { LayoutDashboard, FileText, Sparkles, Shield, Settings } from 'lucide-react';

const EditorPageScaffold = ({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: typeof LayoutDashboard }) => (
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

export const EditorDashboardPage = () => (
  <EditorPageScaffold title="Dashboard Biên tập" subtitle="Tổng quan công việc biên tập" icon={LayoutDashboard} />
);

export const ReviewPage = () => (
  <EditorPageScaffold title="Review bản thảo" subtitle="Soi lỗi và nhận xét bản thảo chapters" icon={FileText} />
);

export const AnnotationsPage = () => (
  <EditorPageScaffold title="Annotation Tool" subtitle="Công cụ đánh dấu QC trên Canvas" icon={Sparkles} />
);

export const DisputesPage = () => (
  <EditorPageScaffold title="Phân xử tranh chấp" subtitle="Xử lý dispute giữa Mangaka và Assistant" icon={Shield} />
);

export const EditorSettingsPage = () => (
  <EditorPageScaffold title="Cài đặt" subtitle="Quản lý tài khoản và tùy chỉnh" icon={Settings} />
);
