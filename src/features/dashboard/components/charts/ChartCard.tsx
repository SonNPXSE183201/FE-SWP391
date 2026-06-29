import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Optional right-aligned slot (legend, filter, badge…). */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Consistent container for every dashboard chart. */
export const ChartCard = ({ title, subtitle, icon: Icon, action, className, children }: ChartCardProps) => {
  return (
    <div
      className={`bg-bg-secondary border border-border-custom rounded-xl p-5 transition-colors hover:border-brand/20 ${className ?? ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
              <Icon size={16} className="text-brand" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-primary truncate">{title}</h3>
            {subtitle && <p className="text-[11px] text-text-muted mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
};
