import { axiosInstance } from '../../../api/axios';
import type { SeriesStatus } from '../../../types/entities';

// ─── Toggle this to false when backend APIs are ready ────────
const USE_MOCK = true;

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

    // Real API: aggregate from individual endpoints
    const [seriesRes, tasksRes, walletRes] = await Promise.all([
      axiosInstance.get('/api/series/my', { params: { pageSize: 100 } }),
      axiosInstance.get('/api/tasks/mangaka-list', { params: { pageSize: 100 } }),
      axiosInstance.get('/api/wallets/me'),
    ]);

    const seriesData = seriesRes.data?.Data || seriesRes.data?.data || [];
    const tasksData = tasksRes.data?.Data || tasksRes.data?.data || [];
    const walletData = walletRes.data?.Data || walletRes.data?.data || {};

    // Aggregate stats from individual API responses
    const seriesList = Array.isArray(seriesData) ? seriesData : seriesData.Items || [];
    const tasksList = Array.isArray(tasksData) ? tasksData : tasksData.Items || [];

    const activeSeries = seriesList.filter(
      (s: any) => s.Status === 'Published' || s.Status === 'Approved'
    ).length;

    const activeTasks = tasksList.filter(
      (t: any) => t.Status === 'In_Progress' || t.Status === 'Pending'
    ).length;

    const completedTasks = tasksList.filter(
      (t: any) => t.Status === 'Approved'
    ).length;

    const wallet = walletData.Wallet || walletData;
    const walletBalance =
      Number(wallet.SetupFundBalance || 0) +
      Number(wallet.WithdrawableBalance || 0);

    // Transactions for monthly genkouryo
    const transactions = walletData.Transactions || [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyGenkouryo = transactions
      .filter((tx: any) => tx.Type === 'Genkouryo' && new Date(tx.CreateAt) >= monthStart)
      .reduce((sum: number, tx: any) => sum + Number(tx.Amount || 0), 0);

    // Pending chapters — count from series with chapters data if available
    // Backend may not return chapters count directly, default to 0
    const pendingChapters = 0; // TODO: needs a dedicated endpoint or chapters API

    const stats: MangakaDashboardStatsDto = {
      activeSeries,
      pendingChapters,
      activeTasks,
      walletBalance,
      monthlyGenkouryo,
      completedTasks,
    };

    // Recent activities — build from task/transaction data
    // TODO: Replace with dedicated activity feed endpoint when available
    const recentActivities: RecentActivityDto[] = [];

    // Series overview — map from series list
    const seriesOverview: SeriesOverviewDto[] = seriesList
      .slice(0, 5)
      .map((s: any) => ({
        id: String(s.Id),
        title: s.Title,
        chapters: Number(s.ChapterCount || 0),
        status: s.Status as SeriesStatus,
        trend: '',
      }));

    return createMockAxiosResponse<MangakaDashboardResponse>({
      stats,
      recentActivities,
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

    // Real API: aggregate from individual endpoints
    const [tasksRes, walletRes] = await Promise.all([
      axiosInstance.get('/api/tasks/my', { params: { pageSize: 100 } }),
      axiosInstance.get('/api/wallets/me'),
    ]);

    const tasksData = tasksRes.data?.Data || tasksRes.data?.data || [];
    const walletData = walletRes.data?.Data || walletRes.data?.data || {};
    const tasksList = Array.isArray(tasksData) ? tasksData : tasksData.Items || [];

    const inProgress = tasksList.filter(
      (t: any) => t.Status === 'In_Progress'
    ).length;

    const completed = tasksList.filter(
      (t: any) => t.Status === 'Approved'
    ).length;

    // Monthly income from wallet transactions
    const transactions = walletData.Transactions || [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyIncome = transactions
      .filter((tx: any) => tx.Type === 'Transfer' && Number(tx.Amount) > 0 && new Date(tx.CreateAt) >= monthStart)
      .reduce((sum: number, tx: any) => sum + Number(tx.Amount || 0), 0);

    const stats: AssistantDashboardStatsDto = {
      inProgress,
      completed,
      averageRating: 0, // TODO: needs AssistantProfile endpoint
      monthlyIncome,
    };

    // Recent tasks — map from task list
    const recentTasks: AssistantRecentTaskDto[] = tasksList
      .sort((a: any, b: any) => new Date(b.UpdateAt || b.UpdatedAt).getTime() - new Date(a.UpdateAt || a.UpdatedAt).getTime())
      .slice(0, 5)
      .map((t: any) => ({
        id: String(t.Id),
        title: `${t.SeriesTitle || 'Task'} - ${t.RegionLabel || t.TaskName || ''}`,
        status: t.Status,
        amount: Number(t.Amount || 0),
        date: t.UpdateAt || t.UpdatedAt || t.CreateAt || '',
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
    const res = await axiosInstance.get('/api/dashboard/admin');
    return res;
  },

  getEditorDashboard: async () => {
    if (USE_MOCK) {
      await mockDelay(300);
      return createMockAxiosResponse<EditorDashboardResponse>({
        stats: MOCK_EDITOR_STATS,
        recentActivities: MOCK_EDITOR_RECENT,
      });
    }
    const res = await axiosInstance.get('/api/dashboard/editor');
    return res;
  },

  getBoardDashboard: async () => {
    if (USE_MOCK) {
      await mockDelay(300);
      return createMockAxiosResponse<BoardDashboardResponse>({
        stats: MOCK_BOARD_STATS,
        recentActivities: MOCK_BOARD_RECENT,
      });
    }
    const res = await axiosInstance.get('/api/dashboard/board');
    return res;
  },
};
