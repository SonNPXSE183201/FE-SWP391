import { LayoutDashboard, Users, Shield, Receipt, Settings } from 'lucide-react';

const AdminPageScaffold = ({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: typeof LayoutDashboard }) => (
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

export const AdminDashboardPage = () => (
  <AdminPageScaffold title="Dashboard Quản trị" subtitle="Tổng quan hệ thống" icon={LayoutDashboard} />
);



export const AdminRolesPage = () => (
  <AdminPageScaffold title="Phân quyền RBAC" subtitle="Quản lý vai trò và quyền truy cập" icon={Shield} />
);

export const AdminReconciliationPage = () => (
  <AdminPageScaffold title="Đối soát giao dịch" subtitle="Đối chiếu giao dịch VNPay" icon={Receipt} />
);

export const AdminSettingsPage = () => (
  <AdminPageScaffold title="Cài đặt" subtitle="Cấu hình hệ thống" icon={Settings} />
);
