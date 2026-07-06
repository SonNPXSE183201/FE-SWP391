import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

// ─── StatCard ────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: typeof BookOpen;
  color: string;
  suffix?: string;
  trend?: string;
  navigateTo?: string;
}

export const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  suffix,
  trend,
  navigateTo,
}: StatCardProps) => {
  const navigate = useNavigate();
  const handleClick = navigateTo ? () => navigate(navigateTo) : undefined;

  return (
    <div
      onClick={handleClick}
      className={`ui-card-interactive bg-bg-secondary border border-border-custom rounded-xl p-5 hover:border-brand/20 group ${
        handleClick ? '' : 'cursor-default hover:translate-y-0 hover:shadow-none active:scale-100'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
          <Icon size={20} className={color} />
        </div>
        {handleClick && (
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
};
