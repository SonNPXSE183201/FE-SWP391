import type { TaskStatus } from '../../../types/entities';

// TODO: Replace with React Query hooks when backend API is ready
export interface MockTask {
  id: string;
  regionLabel: string;
  pageName: string;
  chapterTitle: string;
  seriesTitle: string;
  assignedAssistantName: string | null;
  status: TaskStatus;
  amount: number;
  deadline: string;
  extensionUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_TASKS: MockTask[] = [
  {
    id: 't-1', regionLabel: 'Panel A1', pageName: 'Trang 5', chapterTitle: 'Ch.4: Trận chiến đầu tiên',
    seriesTitle: 'Huyền Thoại Samurai', assignedAssistantName: 'Minh Anh',
    status: 'Pending_Review', amount: 350000, deadline: '2026-06-07T23:59:59Z',
    extensionUsed: false, createdAt: '2026-06-01T08:00:00Z', updatedAt: '2026-06-03T14:00:00Z',
  },
  {
    id: 't-2', regionLabel: 'Background B2', pageName: 'Trang 8', chapterTitle: 'Ch.4: Trận chiến đầu tiên',
    seriesTitle: 'Huyền Thoại Samurai', assignedAssistantName: 'Thiên Kim',
    status: 'In_Progress', amount: 500000, deadline: '2026-06-08T23:59:59Z',
    extensionUsed: false, createdAt: '2026-06-01T10:00:00Z', updatedAt: '2026-06-02T09:00:00Z',
  },
  {
    id: 't-3', regionLabel: 'Character C1', pageName: 'Trang 3', chapterTitle: 'Ch.4: Trận chiến đầu tiên',
    seriesTitle: 'Huyền Thoại Samurai', assignedAssistantName: 'Đức Minh',
    status: 'In_Progress', amount: 450000, deadline: '2026-06-06T23:59:59Z',
    extensionUsed: true, createdAt: '2026-05-28T08:00:00Z', updatedAt: '2026-06-01T12:00:00Z',
  },
  {
    id: 't-4', regionLabel: 'Panel A2', pageName: 'Trang 12', chapterTitle: 'Ch.3: Bí mật của ngôi làng',
    seriesTitle: 'Huyền Thoại Samurai', assignedAssistantName: 'Minh Anh',
    status: 'Approved', amount: 300000, deadline: '2026-05-30T23:59:59Z',
    extensionUsed: false, createdAt: '2026-05-20T08:00:00Z', updatedAt: '2026-05-29T10:00:00Z',
  },
  {
    id: 't-5', regionLabel: 'Background B1', pageName: 'Trang 1', chapterTitle: 'Ch.1: Tín hiệu cuối cùng',
    seriesTitle: 'Lạc Giữa Ngân Hà', assignedAssistantName: null,
    status: 'Pending', amount: 400000, deadline: '2026-06-10T23:59:59Z',
    extensionUsed: false, createdAt: '2026-06-03T08:00:00Z', updatedAt: '2026-06-03T08:00:00Z',
  },
  {
    id: 't-6', regionLabel: 'Effect D1', pageName: 'Trang 7', chapterTitle: 'Ch.2: Cuộc gặp gỡ định mệnh',
    seriesTitle: 'Huyền Thoại Samurai', assignedAssistantName: 'Thiên Kim',
    status: 'Revision', amount: 280000, deadline: '2026-06-05T23:59:59Z',
    extensionUsed: false, createdAt: '2026-05-25T08:00:00Z', updatedAt: '2026-06-02T16:00:00Z',
  },
  {
    id: 't-7', regionLabel: 'Panel A3', pageName: 'Trang 15', chapterTitle: 'Ch.3: Bí mật của ngôi làng',
    seriesTitle: 'Huyền Thoại Samurai', assignedAssistantName: 'Đức Minh',
    status: 'Cancelled', amount: 320000, deadline: '2026-05-28T23:59:59Z',
    extensionUsed: false, createdAt: '2026-05-18T08:00:00Z', updatedAt: '2026-05-26T10:00:00Z',
  },
  {
    id: 't-8', regionLabel: 'Character C2', pageName: 'Trang 4', chapterTitle: 'Ch.4: Trận chiến đầu tiên',
    seriesTitle: 'Huyền Thoại Samurai', assignedAssistantName: 'Minh Anh',
    status: 'Disputed', amount: 380000, deadline: '2026-06-04T23:59:59Z',
    extensionUsed: false, createdAt: '2026-05-28T10:00:00Z', updatedAt: '2026-06-03T08:00:00Z',
  },
];
