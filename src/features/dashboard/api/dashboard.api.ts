import { axiosInstance } from '../../../api/axios';
import type { ApiResponse, SeriesDto, TasksDto, TransactionDto, WalletDetailsDto } from '../../../api/generated/types';
import type { components } from '../../../api/generated/schema';

type DashboardStatsDto = components['schemas']['DashboardStatsResponseDto'];
type AdminDashboardDto = components['schemas']['AdminDashboardResponseDto'];

// SeriesStatus from entities.ts — kept as string literal since dashboard uses it for UI display
type SeriesStatus = 'Draft' | 'PendingApproval' | 'Approved' | 'Published' | 'OnHold' | 'Cancelled';

const USE_MOCK = false;

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

export interface MangakaDashboardResponse {
  stats: MangakaDashboardStatsDto;
  recentActivities: RecentActivityDto[];
  seriesOverview: SeriesOverviewDto[];
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

export interface AssistantDashboardResponse {
  stats: AssistantDashboardStatsDto;
  recentTasks: AssistantRecentTaskDto[];
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

export interface AdminDashboardResponse {
  stats: AdminDashboardStatsDto;
  recentActivities: AdminRecentActivityDto[];
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

export interface EditorDashboardResponse {
  stats: EditorDashboardStatsDto;
  recentActivities: EditorRecentActivityDto[];
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

export interface BoardDashboardResponse {
  stats: BoardDashboardStatsDto;
  recentActivities: BoardRecentActivityDto[];
}

// ─── Mock helpers ────────────────────────────────────────────
const mockDelay = (ms: number = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const createMockAxiosResponse = <T>(data: T, message = 'Success') => ({
  data: {
    IsSuccess: true,
    Message: message,
    Data: data,
  },
});

const unwrapData = <T>(payload: ApiResponse<T> | undefined, fallbackMessage: string): T => {
  if (!payload?.IsSuccess && payload?.success !== true) {
    throw new Error(payload?.Message || fallbackMessage);
  }
  if (payload.Data === undefined || payload.Data === null) {
    throw new Error(fallbackMessage);
  }
  return payload.Data;
};

const fetchDashboardStats = async (): Promise<DashboardStatsDto> => {
  const res = await axiosInstance.get<ApiResponse<DashboardStatsDto>>('/api/dashboard/stats');
  return unwrapData(res.data, 'Không tải được thống kê dashboard');
};

const extractTaskItems = (data: unknown): TasksDto[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'Items' in data) {
    return ((data as { Items?: TasksDto[] }).Items) ?? [];
  }
  return [];
};

const extractSeriesItems = (data: unknown): SeriesDto[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'Items' in data) {
    return ((data as { Items?: SeriesDto[] }).Items) ?? [];
  }
  return [];
};

const getMonthStart = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1);

/** BE serializes PascalCase; OpenAPI schema may use camelCase — read both. */
const statNum = (
  dto: DashboardStatsDto,
  camel: keyof DashboardStatsDto,
  pascal: string,
): number => {
  const raw = dto as Record<string, unknown>;
  const val = raw[camel] ?? raw[pascal];
  return val == null ? 0 : Number(val);
};

// ─── Mock Data (moved from mockData.ts & AssistantDashboardFeature) ─

const MOCK_MANGAKA_STATS: MangakaDashboardStatsDto = {
  activeSeries: 3,
  pendingChapters: 2,
  activeTasks: 5,
  walletBalance: 12500000,
  monthlyGenkouryo: 3200000,
  completedTasks: 18,
};

const MOCK_RECENT_ACTIVITIES: RecentActivityDto[] = [
  {
    id: '1',
    type: 'chapter_approved',
    title: 'Chapter 3 "Bí mật của ngôi làng" đã được duyệt',
    series: 'Huyền Thoại Samurai',
    time: '2 giờ trước',
  },
  {
    id: '2',
    type: 'task_submitted',
    title: 'Assistant Minh Anh đã nộp bài Task #12',
    series: 'Huyền Thoại Samurai',
    time: '5 giờ trước',
  },
  {
    id: '3',
    type: 'chapter_revision',
    title: 'Chapter 1 "Tín hiệu cuối cùng" cần chỉnh sửa',
    series: 'Lạc Giữa Ngân Hà',
    time: '1 ngày trước',
  },
  {
    id: '4',
    type: 'wallet_received',
    title: 'Nhận nhuận bút 1.200.000₫ cho Chapter 2',
    series: 'Huyền Thoại Samurai',
    time: '2 ngày trước',
  },
  {
    id: '5',
    type: 'series_approved',
    title: 'Series "Vườn Hoa Mùa Đông" đã được Board duyệt',
    series: 'Vườn Hoa Mùa Đông',
    time: '3 ngày trước',
  },
];

const MOCK_SERIES_OVERVIEW: SeriesOverviewDto[] = [
  { id: '1', title: 'Huyền Thoại Samurai', chapters: 12, status: 'Published', trend: '+2 chương/tuần' },
  { id: '2', title: 'Lạc Giữa Ngân Hà', chapters: 5, status: 'Approved', trend: '+1 chương/tuần' },
  { id: '3', title: 'Vườn Hoa Mùa Đông', chapters: 3, status: 'PendingApproval', trend: 'Mới tạo' },
];

const MOCK_ASSISTANT_STATS: AssistantDashboardStatsDto = {
  inProgress: 2,
  completed: 15,
  averageRating: 4.8,
  monthlyIncome: 15500000,
};

const MOCK_ASSISTANT_RECENT_TASKS: AssistantRecentTaskDto[] = [
  { id: '1', title: 'One Piece - Ch. 1102 (Lineart)', status: 'Approved', amount: 500000, date: '2026-06-04' },
  { id: '2', title: 'Naruto - Ch. 500 (Background)', status: 'In_Progress', amount: 300000, date: '2026-06-05' },
  { id: '3', title: 'Bleach - Ch. 420 (Screentone)', status: 'Pending_Review', amount: 250000, date: '2026-06-05' },
];

const MOCK_ADMIN_STATS: AdminDashboardStatsDto = {
  users: 154,
  approvals: 12,
  series: 48,
  transactions: 89,
};

const MOCK_ADMIN_RECENT: AdminRecentActivityDto[] = [
  { id: '1', title: 'Người dùng mới đăng ký: phucplh (Mangaka)', date: '2026-06-12 10:30', type: 'user' },
  { id: '2', title: 'Hợp đồng mới đã được ký với Nguyễn Văn A', date: '2026-06-12 09:15', type: 'contract' },
  { id: '3', title: 'Giao dịch VNPay đối soát thành công: #TX10928', date: '2026-06-11 18:45', type: 'transaction' },
];

const MOCK_EDITOR_STATS: EditorDashboardStatsDto = {
  reviewing: 5,
  pending: 3,
  disputes: 2,
  completed: 24,
};

const MOCK_EDITOR_RECENT: EditorRecentActivityDto[] = [
  { id: '1', title: 'Chapter 5 "Huyền Thoại Samurai" đang chờ review', date: '2026-06-12 11:20', type: 'chapter' },
  { id: '2', title: 'Tranh chấp phát sinh tại Task #42 (Mangaka khiếu nại)', date: '2026-06-12 08:30', type: 'dispute' },
  { id: '3', title: 'Đã hoàn thành đánh giá Series "Vườn Hoa Mùa Đông"', date: '2026-06-11 15:10', type: 'review' },
];

const MOCK_BOARD_STATS: BoardDashboardStatsDto = {
  votes: 18,
  active: 14,
  cancelled: 2,
  budget: 450000000,
};

const MOCK_BOARD_RECENT: BoardRecentActivityDto[] = [
  { id: '1', title: 'Bỏ phiếu xét duyệt thành công Series "Lạc Giữa Ngân Hà"', date: '2026-06-12 14:00', type: 'vote' },
  { id: '2', title: 'Đề xuất tăng ngân sách sản xuất cho "Samurai" lên 50tr', date: '2026-06-12 10:00', type: 'budget' },
  { id: '3', title: 'Lịch xuất bản mới được cập nhật cho tuần sau', date: '2026-06-11 16:30', type: 'schedule' },
];

// ─── Dashboard API ───────────────────────────────────────────
export const dashboardApi = {
  /**
   * Get Mangaka dashboard data.
   * Aggregates from: GET /api/series/my, GET /api/tasks/mangaka-list, GET /api/wallets/me
   */
  getMangakaDashboard: async () => {
    if (USE_MOCK) {
      await mockDelay(300);
      return createMockAxiosResponse<MangakaDashboardResponse>({
        stats: MOCK_MANGAKA_STATS,
        recentActivities: MOCK_RECENT_ACTIVITIES,
        seriesOverview: MOCK_SERIES_OVERVIEW,
      });
    }

    // Real API: BE stats + series list + wallet transactions
    const [statsDto, seriesRes, walletRes] = await Promise.all([
      fetchDashboardStats(),
      axiosInstance.get<ApiResponse<SeriesDto[] | { Items?: SeriesDto[] }>>('/api/series/my-list', {
        params: { pageSize: 100 },
      }),
      axiosInstance.get<ApiResponse<WalletDetailsDto>>('/api/wallets/me'),
    ]);

    const seriesList = extractSeriesItems(unwrapData(seriesRes.data, 'Không tải được danh sách series'));
    const walletData = unwrapData(walletRes.data, 'Không tải được ví');
    const wallet = walletData.wallet ?? {};
    const transactions = walletData.transactions ?? [];

    const walletBalance =
      Number(wallet.setupFundBalance ?? 0) + Number(wallet.withdrawableBalance ?? 0);

    const monthlyGenkouryo = transactions
      .filter((tx: TransactionDto) => tx.type === 'Genkouryo' && tx.createAt && new Date(tx.createAt) >= getMonthStart())
      .reduce((sum: number, tx: TransactionDto) => sum + Number(tx.amount ?? 0), 0);

    const stats: MangakaDashboardStatsDto = {
      activeSeries: statNum(statsDto, 'inProductionSeries', 'InProductionSeries') || statNum(statsDto, 'mySeries', 'MySeries') || seriesList.length,
      pendingChapters: 0, // TODO: chapters API
      activeTasks: statNum(statsDto, 'openTasks', 'OpenTasks'),
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

    return createMockAxiosResponse<MangakaDashboardResponse>({
      stats,
      recentActivities: [],
      seriesOverview,
    });
  },

  /**
   * Get Assistant dashboard data.
   * Aggregates from: GET /api/tasks/my, GET /api/wallets/me
   */
  getAssistantDashboard: async () => {
    if (USE_MOCK) {
      await mockDelay(300);
      return createMockAxiosResponse<AssistantDashboardResponse>({
        stats: MOCK_ASSISTANT_STATS,
        recentTasks: MOCK_ASSISTANT_RECENT_TASKS,
      });
    }

    const [tasksRes, walletRes] = await Promise.all([
      axiosInstance.get<ApiResponse<TasksDto[] | { Items?: TasksDto[] }>>('/api/tasks/my-tasks', {
        params: { PageNumber: 1, PageSize: 100 },
      }),
      axiosInstance.get<ApiResponse<WalletDetailsDto>>('/api/wallets/me'),
    ]);

    const tasksList = extractTaskItems(unwrapData(tasksRes.data, 'Không tải được danh sách task'));
    const walletData = unwrapData(walletRes.data, 'Không tải được ví');
    const transactions = walletData.transactions ?? [];

    const inProgress = tasksList.filter((t: TasksDto) => t.status === 'In_Progress').length;
    const completed = tasksList.filter((t: TasksDto) => t.status === 'Approved').length;

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

    return createMockAxiosResponse<AssistantDashboardResponse>({
      stats,
      recentTasks,
    });
  },

  getAdminDashboard: async () => {
    if (USE_MOCK) {
      await mockDelay(300);
      return createMockAxiosResponse<AdminDashboardResponse>({
        stats: MOCK_ADMIN_STATS,
        recentActivities: MOCK_ADMIN_RECENT,
      });
    }
    const data = unwrapData(
      (await axiosInstance.get<ApiResponse<AdminDashboardDto>>('/api/dashboard/admin')).data,
      'Không tải được dashboard admin',
    );

    return createMockAxiosResponse<AdminDashboardResponse>({
      stats: {
        users: data.stats?.users ?? (data.stats as Record<string, number> | undefined)?.Users ?? 0,
        approvals: data.stats?.approvals ?? (data.stats as Record<string, number> | undefined)?.Approvals ?? 0,
        series: data.stats?.series ?? (data.stats as Record<string, number> | undefined)?.Series ?? 0,
        transactions: data.stats?.transactions ?? (data.stats as Record<string, number> | undefined)?.Transactions ?? 0,
      },
      recentActivities: (data.recentActivities ?? []).map((item) => {
        const row = item as Record<string, string | null | undefined>;
        return {
          id: item.id ?? row.Id ?? '',
          title: item.title ?? row.Title ?? '',
          date: item.date ?? row.Date ?? '',
          type: item.type ?? row.Type ?? '',
        };
      }),
    });
  },

  getEditorDashboard: async () => {
    if (USE_MOCK) {
      await mockDelay(300);
      return createMockAxiosResponse<EditorDashboardResponse>({
        stats: MOCK_EDITOR_STATS,
        recentActivities: MOCK_EDITOR_RECENT,
      });
    }
    const statsDto = await fetchDashboardStats();

    return createMockAxiosResponse<EditorDashboardResponse>({
      stats: {
        reviewing: statNum(statsDto, 'seriesAwaitingReview', 'SeriesAwaitingReview'),
        pending: statNum(statsDto, 'pendingSeries', 'PendingSeries'),
        disputes: 0, // TODO: GET /api/disputes
        completed: statNum(statsDto, 'inProductionSeries', 'InProductionSeries'),
      },
      recentActivities: [],
    });
  },

  getBoardDashboard: async () => {
    if (USE_MOCK) {
      await mockDelay(300);
      return createMockAxiosResponse<BoardDashboardResponse>({
        stats: MOCK_BOARD_STATS,
        recentActivities: MOCK_BOARD_RECENT,
      });
    }
    const statsDto = await fetchDashboardStats();

    return createMockAxiosResponse<BoardDashboardResponse>({
      stats: {
        votes: statNum(statsDto, 'pendingSeries', 'PendingSeries'),
        active: statNum(statsDto, 'inProductionSeries', 'InProductionSeries') || statNum(statsDto, 'approvedSeries', 'ApprovedSeries'),
        cancelled: 0, // TODO: series cancelled count from BE
        budget: 0, // TODO: aggregate budget from contracts/series
      },
      recentActivities: [],
    });
  },
};
