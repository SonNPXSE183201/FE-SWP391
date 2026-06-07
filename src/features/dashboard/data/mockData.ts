import {
  CheckCircle2,
  ClipboardList,
  AlertCircle,
  Wallet,
  Sparkles,
} from 'lucide-react';

// ─── Dashboard Stats (Mock) ─────────────────────────────────
export const MOCK_DASHBOARD_STATS = {
  activeSeries: 3,
  pendingChapters: 2,
  activeTasks: 5,
  walletBalance: 12500000,
  monthlyGenkouryo: 3200000,
  completedTasks: 18,
};

// ─── Recent Activities (Mock) ────────────────────────────────
export const MOCK_RECENT_ACTIVITIES = [
  {
    id: '1',
    type: 'chapter_approved' as const,
    title: 'Chapter 3 "Bí mật của ngôi làng" đã được duyệt',
    series: 'Huyền Thoại Samurai',
    time: '2 giờ trước',
    icon: CheckCircle2,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    id: '2',
    type: 'task_submitted' as const,
    title: 'Assistant Minh Anh đã nộp bài Task #12',
    series: 'Huyền Thoại Samurai',
    time: '5 giờ trước',
    icon: ClipboardList,
    color: 'text-info',
    bg: 'bg-info/10',
  },
  {
    id: '3',
    type: 'chapter_revision' as const,
    title: 'Chapter 1 "Tín hiệu cuối cùng" cần chỉnh sửa',
    series: 'Lạc Giữa Ngân Hà',
    time: '1 ngày trước',
    icon: AlertCircle,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    id: '4',
    type: 'wallet_received' as const,
    title: 'Nhận nhuận bút 1.200.000₫ cho Chapter 2',
    series: 'Huyền Thoại Samurai',
    time: '2 ngày trước',
    icon: Wallet,
    color: 'text-brand',
    bg: 'bg-brand/10',
  },
  {
    id: '5',
    type: 'series_approved' as const,
    title: 'Series "Vườn Hoa Mùa Đông" đã được Board duyệt',
    series: 'Vườn Hoa Mùa Đông',
    time: '3 ngày trước',
    icon: Sparkles,
    color: 'text-success',
    bg: 'bg-success/10',
  },
];

// ─── Series Overview (Mock) ─────────────────────────────────
export const MOCK_SERIES_OVERVIEW = [
  { id: '1', title: 'Huyền Thoại Samurai', chapters: 12, status: 'Published' as const, trend: '+2 chương/tuần' },
  { id: '2', title: 'Lạc Giữa Ngân Hà', chapters: 5, status: 'Approved' as const, trend: '+1 chương/tuần' },
  { id: '3', title: 'Vườn Hoa Mùa Đông', chapters: 3, status: 'PendingApproval' as const, trend: 'Mới tạo' },
];

// ─── Greeting Helper ─────────────────────────────────────────
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng,';
  if (hour < 18) return 'Chào buổi chiều,';
  return 'Chào buổi tối,';
};
