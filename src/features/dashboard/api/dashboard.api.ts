import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, SeriesDto, TasksDto, TransactionDto, WalletDetailsDto } from '../../../api/generated/types';
import type { components } from '../../../api/generated/schema';
import { unwrapApiData, getPagedItems } from '../../../api/apiResponse';
import {
  buildTrend,
  lastMonthLabels,
  nonEmptySlices,
  type ChartPoint,
  type ChartSlice,
} from '../utils/chartData';

type DashboardStatsDto = components['schemas']['DashboardStatsResponseDto'];
type AdminDashboardDto = components['schemas']['AdminDashboardResponseDto'];

// SeriesStatus from entities.ts — kept as string literal since dashboard uses it for UI display
type SeriesStatus = 'Draft' | 'PendingApproval' | 'PendingBoardVote' | 'Approved' | 'Published' | 'OnHold' | 'Cancelled';

// Donut slice colors (hex mirrors the theme palette in charts/chartTheme.ts).
const C = {
  brand: '#6C5CE7',
  info: '#4DABF7',
  success: '#00D68F',
  warning: '#FFAA00',
  danger: '#FF4757',
  secondary: '#00CECE',
} as const;

// ─── Response DTOs (no UI concerns — icons are mapped in hooks) ─
export interface MangakaDashboardStatsDto {
  activeSeries: number;
  pendingChapters: number;
  activeTasks: number;
  walletBalance: number;
  monthlyGenkouryo: number;
  completedTasks: number;
}

export type ActivityType =
  | 'chapter_approved'
  | 'task_submitted'
  | 'chapter_revision'
  | 'wallet_received'
  | 'series_approved';

export interface RecentActivityDto {
  id: string;
  type: ActivityType;
  title: string;
  series: string;
  time: string;
}

export interface SeriesOverviewDto {
  id: string;
  title: string;
  chapters: number;
  status: SeriesStatus;
  trend: string;
}

export interface MangakaDashboardCharts {
  revenueTrend: ChartPoint[];
  seriesStatus: ChartSlice[];
}

export interface MangakaDashboardResponse {
  stats: MangakaDashboardStatsDto;
  recentActivities: RecentActivityDto[];
  seriesOverview: SeriesOverviewDto[];
  charts: MangakaDashboardCharts;
}

export interface AssistantDashboardStatsDto {
  inProgress: number;
  completed: number;
  averageRating: number;
  monthlyIncome: number;
}

export interface AssistantRecentTaskDto {
  id: string;
  title: string;
  status: string;
  amount: number;
  date: string;
}

export interface AssistantDashboardCharts {
  incomeTrend: ChartPoint[];
  taskStatus: ChartSlice[];
}

export interface AssistantDashboardResponse {
  stats: AssistantDashboardStatsDto;
  recentTasks: AssistantRecentTaskDto[];
  charts: AssistantDashboardCharts;
}

export interface AdminDashboardStatsDto {
  users: number;
  approvals: number;
  series: number;
  transactions: number;
}

export interface AdminRecentActivityDto {
  id: string;
  title: string;
  date: string;
  type: string;
}

export interface AdminDashboardCharts {
  userGrowth: ChartPoint[];
  transactionTrend: ChartPoint[];
  contentBreakdown: ChartSlice[];
}

export interface AdminDashboardResponse {
  stats: AdminDashboardStatsDto;
  recentActivities: AdminRecentActivityDto[];
  charts: AdminDashboardCharts;
}

export interface EditorDashboardStatsDto {
  reviewing: number;
  pending: number;
  disputes: number;
  completed: number;
}

export interface EditorRecentActivityDto {
  id: string;
  title: string;
  date: string;
  type: string;
}

export interface EditorDashboardCharts {
  reviewTrend: ChartPoint[];
  workload: ChartSlice[];
}

export interface EditorDashboardResponse {
  stats: EditorDashboardStatsDto;
  recentActivities: EditorRecentActivityDto[];
  charts: EditorDashboardCharts;
}

export interface BoardDashboardStatsDto {
  votes: number;
  active: number;
  cancelled: number;
  budget: number;
}

export interface BoardRecentActivityDto {
  id: string;
  title: string;
  date: string;
  type: string;
}

export interface BoardDashboardCharts {
  votingTrend: ChartPoint[];
  seriesStatus: ChartSlice[];
}

export interface BoardDashboardResponse {
  stats: BoardDashboardStatsDto;
  recentActivities: BoardRecentActivityDto[];
  charts: BoardDashboardCharts;
}

// ─── Helpers ─────────────────────────────────────────────────
const fetchDashboardStats = async (): Promise<DashboardStatsDto> => {
  const res = await axiosInstance.get<ApiResponse<DashboardStatsDto>>('/api/dashboard/stats');
  return unwrapApiData(res.data, 'Không tải được thống kê dashboard');
};

const extractTaskItems = (data: unknown): TasksDto[] => getPagedItems(data as TasksDto[] | { items?: TasksDto[] });

const extractSeriesItems = (data: unknown): SeriesDto[] => getPagedItems(data as SeriesDto[] | { items?: SeriesDto[] });

const getMonthStart = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1);

const statNum = (dto: DashboardStatsDto, key: keyof DashboardStatsDto): number => {
  const val = dto[key];
  return val == null ? 0 : Number(val);
};

import { normalizeSeriesStatus } from '../../../utils/status';

// Map SeriesStatus → human label + slice color for status donuts.
const SERIES_STATUS_SLICE: Record<SeriesStatus, { label: string; color: string }> = {
  Draft: { label: 'Bản nháp', color: C.secondary },
  PendingApproval: { label: 'Chờ duyệt', color: C.warning },
  PendingBoardVote: { label: 'Chờ hội đồng', color: C.brand },
  Approved: { label: 'Đã duyệt', color: C.info },
  Published: { label: 'Đã xuất bản', color: C.success },
  OnHold: { label: 'Tạm dừng', color: '#8B8B9E' },
  Cancelled: { label: 'Đã hủy', color: C.danger },
};

const buildSeriesStatusSlices = (series: { status?: string | null }[]): ChartSlice[] => {
  const counts = new Map<SeriesStatus, number>();
  for (const s of series) {
    const status = normalizeSeriesStatus(s.status);
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  return nonEmptySlices(
    Array.from(counts.entries()).map(([status, value]) => ({
      label: SERIES_STATUS_SLICE[status]?.label ?? status,
      value,
      color: SERIES_STATUS_SLICE[status]?.color,
    })),
  );
};

const buildEditorCharts = (s: EditorDashboardStatsDto): EditorDashboardCharts => ({
  reviewTrend: buildTrend(s.completed, lastMonthLabels(6), { seed: 41 }),
  workload: nonEmptySlices([
    { label: 'Đang đánh giá', value: s.reviewing, color: C.info },
    { label: 'Chờ duyệt', value: s.pending, color: C.warning },
    { label: 'Tranh chấp', value: s.disputes, color: C.danger },
    { label: 'Hoàn thành', value: s.completed, color: C.success },
  ]),
});

const buildBoardCharts = (s: BoardDashboardStatsDto): BoardDashboardCharts => ({
  votingTrend: buildTrend(s.votes, lastMonthLabels(6), { seed: 53 }),
  seriesStatus: nonEmptySlices([
    { label: 'Đang hoạt động', value: s.active, color: C.success },
    { label: 'Chờ vote', value: s.votes, color: C.brand },
    { label: 'Tạm dừng/hủy', value: s.cancelled, color: C.danger },
  ]),
});

const buildAdminCharts = (s: AdminDashboardStatsDto): AdminDashboardCharts => ({
  userGrowth: buildTrend(s.users, lastMonthLabels(6), { seed: 31, startRatio: 0.6, volatility: 0.08 }),
  transactionTrend: buildTrend(s.transactions, lastMonthLabels(6), { seed: 37 }),
  contentBreakdown: nonEmptySlices([
    { label: 'Series đã duyệt', value: s.series, color: C.info },
    { label: 'Hồ sơ chờ duyệt', value: s.approvals, color: C.warning },
  ]),
});

// ─── Dashboard API ───────────────────────────────────────────
// Each method returns the aggregated dashboard data, or throws if any
// underlying API fails (callers surface the error message — no mock fallback).
export const dashboardApi = {
  /**
   * Mangaka dashboard — aggregates GET /api/dashboard/stats, /api/series/my-list, /api/wallets/me.
   */
  getMangakaDashboard: async (): Promise<MangakaDashboardResponse> => {
    const [statsDto, seriesRes, walletRes] = await Promise.all([
      fetchDashboardStats(),
      axiosInstance.get<ApiResponse<SeriesDto[] | { Items?: SeriesDto[] }>>('/api/series/my-list', {
        params: { pageSize: 100 },
      }),
      axiosInstance.get<ApiResponse<WalletDetailsDto>>('/api/wallets/me'),
    ]);

    const seriesList = extractSeriesItems(unwrapApiData(seriesRes.data, 'Không tải được danh sách series'));
    const walletData = unwrapApiData(walletRes.data, 'Không tải được ví');
    const wallet = walletData.wallet ?? {};
    const transactions = walletData.transactions ?? [];

    const walletBalance =
      Number(wallet.setupFundBalance ?? 0) + Number(wallet.withdrawableBalance ?? 0);

    const monthlyGenkouryo = transactions
      .filter((tx: TransactionDto) => tx.type === 'Genkouryo' && tx.createAt && new Date(tx.createAt) >= getMonthStart())
      .reduce((sum: number, tx: TransactionDto) => sum + Number(tx.amount ?? 0), 0);

    const stats: MangakaDashboardStatsDto = {
      activeSeries: statNum(statsDto, 'inProductionSeries') || statNum(statsDto, 'mySeries') || seriesList.length,
      pendingChapters: 0, // TODO: chapters API
      activeTasks: statNum(statsDto, 'openTasks'),
      walletBalance,
      monthlyGenkouryo,
      completedTasks: seriesList.filter((s: SeriesDto) => s.status === 'Published' || s.status === 'Approved').length,
    };

    const seriesOverview: SeriesOverviewDto[] = seriesList.slice(0, 5).map((s: SeriesDto) => ({
      id: String(s.id ?? ''),
      title: s.title ?? '',
      chapters: 0,
      status: (s.status as SeriesStatus) || 'Draft',
      trend: '',
    }));

    return {
      stats,
      recentActivities: [],
      seriesOverview,
      charts: {
        revenueTrend: buildTrend(monthlyGenkouryo, lastMonthLabels(6), { seed: 11 }),
        seriesStatus: buildSeriesStatusSlices(seriesList),
      },
    };
  },

  /**
   * Assistant dashboard — aggregates GET /api/tasks/my-tasks, /api/wallets/me.
   */
  getAssistantDashboard: async (): Promise<AssistantDashboardResponse> => {
    const [tasksRes, walletRes] = await Promise.all([
      axiosInstance.get<ApiResponse<TasksDto[] | { Items?: TasksDto[] }>>('/api/tasks/my-tasks', {
        params: { PageNumber: 1, PageSize: 100 },
      }),
      axiosInstance.get<ApiResponse<WalletDetailsDto>>('/api/wallets/me'),
    ]);

    const tasksList = extractTaskItems(unwrapApiData(tasksRes.data, 'Không tải được danh sách task'));
    const walletData = unwrapApiData(walletRes.data, 'Không tải được ví');
    const transactions = walletData.transactions ?? [];

    const inProgress = tasksList.filter((t: TasksDto) => t.status === 'In_Progress').length;
    const completed = tasksList.filter((t: TasksDto) => t.status === 'Approved').length;
    const pendingReview = tasksList.filter((t: TasksDto) => t.status === 'Submitted').length;

    const monthlyIncome = transactions
      .filter(
        (tx: TransactionDto) =>
          tx.type === 'Transfer' &&
          Number(tx.amount ?? 0) > 0 &&
          tx.createAt &&
          new Date(tx.createAt) >= getMonthStart(),
      )
      .reduce((sum: number, tx: TransactionDto) => sum + Number(tx.amount ?? 0), 0);

    const stats: AssistantDashboardStatsDto = {
      inProgress,
      completed,
      averageRating: 0, // TODO: AssistantProfile endpoint
      monthlyIncome,
    };

    const recentTasks: AssistantRecentTaskDto[] = tasksList
      .sort(
        (a: TasksDto, b: TasksDto) =>
          new Date(b.updateAt ?? b.createAt ?? 0).getTime() -
          new Date(a.updateAt ?? a.createAt ?? 0).getTime(),
      )
      .slice(0, 5)
      .map((t: TasksDto) => ({
        id: String(t.id ?? ''),
        title: t.description || `Task #${t.id}`,
        status: t.status ?? 'Pending',
        amount: Number(t.paymentAmount ?? 0),
        date: t.updateAt || t.createAt || '',
      }));

    return {
      stats,
      recentTasks,
      charts: {
        incomeTrend: buildTrend(monthlyIncome, lastMonthLabels(6), { seed: 23 }),
        taskStatus: nonEmptySlices([
          { label: 'Đang làm', value: inProgress, color: C.info },
          { label: 'Hoàn thành', value: completed, color: C.success },
          { label: 'Chờ duyệt', value: pendingReview, color: C.warning },
        ]),
      },
    };
  },

  /**
   * Admin dashboard — GET /api/dashboard/admin.
   */
  getAdminDashboard: async (): Promise<AdminDashboardResponse> => {
    const data = unwrapApiData(
      (await axiosInstance.get<ApiResponse<AdminDashboardDto>>('/api/dashboard/admin')).data,
      'Không tải được dashboard admin',
    );

    const adminStats: AdminDashboardStatsDto = {
      users: data.stats?.users ?? (data.stats as Record<string, number> | undefined)?.Users ?? 0,
      approvals: data.stats?.approvals ?? (data.stats as Record<string, number> | undefined)?.Approvals ?? 0,
      series: data.stats?.series ?? (data.stats as Record<string, number> | undefined)?.Series ?? 0,
      transactions:
        data.stats?.transactions ?? (data.stats as Record<string, number> | undefined)?.Transactions ?? 0,
    };

    return {
      stats: adminStats,
      charts: buildAdminCharts(adminStats),
      recentActivities: (data.recentActivities ?? []).map((item) => {
        const row = item as Record<string, string | null | undefined>;
        return {
          id: item.id ?? row.Id ?? '',
          title: item.title ?? row.Title ?? '',
          date: item.date ?? row.Date ?? '',
          type: item.type ?? row.Type ?? '',
        };
      }),
    };
  },

  /**
   * Editor dashboard — derived from GET /api/dashboard/stats.
   */
  getEditorDashboard: async (): Promise<EditorDashboardResponse> => {
    const statsDto = await fetchDashboardStats();
    const editorStats: EditorDashboardStatsDto = {
      reviewing: statNum(statsDto, 'seriesAwaitingReview'),
      pending: statNum(statsDto, 'pendingSeries'),
      disputes: 0, // TODO: GET /api/disputes
      completed: statNum(statsDto, 'inProductionSeries'),
    };

    return {
      stats: editorStats,
      charts: buildEditorCharts(editorStats),
      recentActivities: [],
    };
  },

  /**
   * Board dashboard — derived from GET /api/dashboard/stats.
   */
  getBoardDashboard: async (): Promise<BoardDashboardResponse> => {
    const statsDto = await fetchDashboardStats();
    const boardStats: BoardDashboardStatsDto = {
      votes: statNum(statsDto, 'pendingSeries'),
      active: statNum(statsDto, 'inProductionSeries') || statNum(statsDto, 'approvedSeries'),
      cancelled: 0, // TODO: series cancelled count from BE
      budget: 0, // TODO: aggregate budget from contracts/series
    };

    return {
      stats: boardStats,
      charts: buildBoardCharts(boardStats),
      recentActivities: [],
    };
  },
};
