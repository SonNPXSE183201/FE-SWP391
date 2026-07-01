import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  ClipboardList,
  AlertCircle,
  Wallet,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SeriesStatus } from '../../../types/entities';
import {
  dashboardApi,
  type ActivityType,
  type MangakaDashboardCharts,
  type RecentActivityDto,
  type SeriesOverviewDto,
} from '../api/dashboard.api';

// ─── Hook return types (with UI concerns: icons, colors) ─────

export interface DashboardStats {
  activeSeries: number;
  pendingChapters: number;
  activeTasks: number;
  walletBalance: number;
  monthlyGenkouryo: number;
  completedTasks: number;
}

export interface DashboardActivity {
  id: string;
  type: ActivityType;
  title: string;
  series: string;
  time: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export interface DashboardSeriesOverview {
  id: string;
  title: string;
  chapters: number;
  status: SeriesStatus;
  trend: string;
}

// ─── Activity type → icon/color mapping ──────────────────────
const ACTIVITY_ICON_MAP: Record<
  ActivityType,
  { icon: LucideIcon; color: string; bg: string }
> = {
  chapter_approved: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  task_submitted: { icon: ClipboardList, color: 'text-info', bg: 'bg-info/10' },
  chapter_revision: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10' },
  wallet_received: { icon: Wallet, color: 'text-brand', bg: 'bg-brand/10' },
  series_approved: { icon: Sparkles, color: 'text-success', bg: 'bg-success/10' },
};

// ─── Greeting helper ─────────────────────────────────────────
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng,';
  if (hour < 18) return 'Chào buổi chiều,';
  return 'Chào buổi tối,';
};

// ─── Hook ────────────────────────────────────────────────────
export const useMangakaDashboard = () => {
  const query = useQuery<
    {
      stats: DashboardStats;
      activities: DashboardActivity[];
      seriesOverview: DashboardSeriesOverview[];
      charts: MangakaDashboardCharts;
    },
    Error
  >({
    queryKey: ['dashboard', 'mangaka'],
    queryFn: async () => {
      const data = await dashboardApi.getMangakaDashboard();

      // Map stats (direct passthrough — shape matches)
      const stats: DashboardStats = { ...data.stats };

      // Map activities — add icons & colors from mapping
      const activities: DashboardActivity[] = data.recentActivities.map(
        (activity: RecentActivityDto) => {
          const iconCfg = ACTIVITY_ICON_MAP[activity.type] || ACTIVITY_ICON_MAP.task_submitted;
          return {
            ...activity,
            icon: iconCfg.icon,
            color: iconCfg.color,
            bg: iconCfg.bg,
          };
        }
      );

      // Map series overview (direct passthrough)
      const seriesOverview: DashboardSeriesOverview[] = data.seriesOverview.map(
        (s: SeriesOverviewDto) => ({
          ...s,
          trend: (s.trend ?? '')
            .replace(/\bchapters?\b/gi, 'chương')
            .replace(/\bseries\b/gi, 'bộ truyện'),
        })
      );

      return { stats, activities, seriesOverview, charts: data.charts };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return {
    stats: query.data?.stats ?? null,
    activities: query.data?.activities ?? [],
    seriesOverview: query.data?.seriesOverview ?? [],
    charts: query.data?.charts ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
};
