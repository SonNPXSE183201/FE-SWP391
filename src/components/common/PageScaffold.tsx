import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
interface PageScaffoldProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  children?: ReactNode;
}

export const PageScaffold = ({ title, subtitle, icon: Icon, children }: PageScaffoldProps) => (
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
    {children ?? (
      <div className="mt-6 bg-bg-secondary border border-border-custom rounded-xl p-8 flex flex-col items-center justify-center gap-4 min-h-[300px]">
        <Icon size={48} className="text-text-muted" />
        <p className="text-text-secondary text-sm">Nội dung sẽ hiển thị ở đây</p>
      </div>
    )}
  </div>
);
