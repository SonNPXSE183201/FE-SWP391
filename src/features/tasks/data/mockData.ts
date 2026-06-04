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
  {
    id: 't-9', regionLabel: 'Panel A4', pageName: 'Trang 2', chapterTitle: 'Ch.1: Tín hiệu cuối cùng',
    seriesTitle: 'Lạc Giữa Ngân Hà', assignedAssistantName: 'Thiên Kim',
    status: 'In_Progress', amount: 420000, deadline: '2026-06-09T23:59:59Z',
    extensionUsed: false, createdAt: '2026-06-02T09:00:00Z', updatedAt: '2026-06-03T11:00:00Z',
  },
  {
    id: 't-10', regionLabel: 'Background B3', pageName: 'Trang 6', chapterTitle: 'Ch.2: Cuộc gặp gỡ định mệnh',
    seriesTitle: 'Huyền Thoại Samurai', assignedAssistantName: 'Đức Minh',
    status: 'Approved', amount: 290000, deadline: '2026-05-29T23:59:59Z',
    extensionUsed: false, createdAt: '2026-05-19T08:00:00Z', updatedAt: '2026-05-28T14:00:00Z',
  },
  {
    id: 't-11', regionLabel: 'Effect D2', pageName: 'Trang 10', chapterTitle: 'Ch.3: Bí mật của ngôi làng',
    seriesTitle: 'Huyền Thoại Samurai', assignedAssistantName: 'Minh Anh',
    status: 'Pending_Review', amount: 310000, deadline: '2026-06-07T23:59:59Z',
    extensionUsed: false, createdAt: '2026-06-01T14:00:00Z', updatedAt: '2026-06-04T09:00:00Z',
  },
  {
    id: 't-12', regionLabel: 'Character C3', pageName: 'Trang 9', chapterTitle: 'Ch.4: Trận chiến đầu tiên',
    seriesTitle: 'Huyền Thoại Samurai', assignedAssistantName: null,
    status: 'Pending', amount: 460000, deadline: '2026-06-12T23:59:59Z',
    extensionUsed: false, createdAt: '2026-06-04T07:00:00Z', updatedAt: '2026-06-04T07:00:00Z',
  },
  {
    id: 't-13', regionLabel: 'Panel A5', pageName: 'Trang 11', chapterTitle: 'Ch.3: Bí mật của ngôi làng',
    seriesTitle: 'Huyền Thoại Samurai', assignedAssistantName: 'Thiên Kim',
    status: 'In_Progress', amount: 370000, deadline: '2026-06-08T23:59:59Z',
    extensionUsed: true, createdAt: '2026-05-30T10:00:00Z', updatedAt: '2026-06-03T16:00:00Z',
  },
  {
    id: 't-14', regionLabel: 'Background B4', pageName: 'Trang 3', chapterTitle: 'Ch.2: Cuộc gặp gỡ định mệnh',
    seriesTitle: 'Lạc Giữa Ngân Hà', assignedAssistantName: 'Đức Minh',
    status: 'Approved', amount: 340000, deadline: '2026-05-31T23:59:59Z',
    extensionUsed: false, createdAt: '2026-05-22T08:00:00Z', updatedAt: '2026-05-30T12:00:00Z',
  },
  {
    id: 't-15', regionLabel: 'Effect D3', pageName: 'Trang 14', chapterTitle: 'Ch.4: Trận chiến đầu tiên',
    seriesTitle: 'Huyền Thoại Samurai', assignedAssistantName: 'Minh Anh',
    status: 'Pending_Review', amount: 330000, deadline: '2026-06-06T23:59:59Z',
    extensionUsed: false, createdAt: '2026-06-01T12:00:00Z', updatedAt: '2026-06-04T08:00:00Z',
  },
  {
    id: 't-16', regionLabel: 'Panel A6', pageName: 'Trang 7', chapterTitle: 'Ch.1: Khởi đầu mùa đông',
    seriesTitle: 'Vườn Hoa Mùa Đông', assignedAssistantName: 'Thiên Kim',
    status: 'In_Progress', amount: 390000, deadline: '2026-06-11T23:59:59Z',
    extensionUsed: false, createdAt: '2026-06-03T10:00:00Z', updatedAt: '2026-06-04T06:00:00Z',
  },
  {
    id: 't-17', regionLabel: 'Character C4', pageName: 'Trang 2', chapterTitle: 'Ch.1: Khởi đầu mùa đông',
    seriesTitle: 'Vườn Hoa Mùa Đông', assignedAssistantName: null,
    status: 'Pending', amount: 410000, deadline: '2026-06-13T23:59:59Z',
    extensionUsed: false, createdAt: '2026-06-04T08:00:00Z', updatedAt: '2026-06-04T08:00:00Z',
  },
  {
    id: 't-18', regionLabel: 'Background B5', pageName: 'Trang 5', chapterTitle: 'Ch.1: Khởi đầu mùa đông',
    seriesTitle: 'Vườn Hoa Mùa Đông', assignedAssistantName: 'Minh Anh',
    status: 'In_Progress', amount: 480000, deadline: '2026-06-10T23:59:59Z',
    extensionUsed: false, createdAt: '2026-06-02T14:00:00Z', updatedAt: '2026-06-03T18:00:00Z',
  },
  {
    id: 't-19', regionLabel: 'Panel A7', pageName: 'Trang 8', chapterTitle: 'Ch.2: Cuộc gặp gỡ định mệnh',
    seriesTitle: 'Lạc Giữa Ngân Hà', assignedAssistantName: 'Đức Minh',
    status: 'Revision', amount: 360000, deadline: '2026-06-05T23:59:59Z',
    extensionUsed: true, createdAt: '2026-05-26T08:00:00Z', updatedAt: '2026-06-03T20:00:00Z',
  },
  {
    id: 't-20', regionLabel: 'Effect D4', pageName: 'Trang 13', chapterTitle: 'Ch.4: Trận chiến đầu tiên',
    seriesTitle: 'Huyền Thoại Samurai', assignedAssistantName: 'Thiên Kim',
    status: 'Approved', amount: 270000, deadline: '2026-05-27T23:59:59Z',
    extensionUsed: false, createdAt: '2026-05-17T08:00:00Z', updatedAt: '2026-05-26T08:00:00Z',
  },
  {
    id: 't-21', regionLabel: 'Character C5', pageName: 'Trang 6', chapterTitle: 'Ch.2: Cuộc gặp gỡ định mệnh',
    seriesTitle: 'Lạc Giữa Ngân Hà', assignedAssistantName: 'Minh Anh',
    status: 'Pending_Review', amount: 440000, deadline: '2026-06-08T23:59:59Z',
    extensionUsed: false, createdAt: '2026-06-02T08:00:00Z', updatedAt: '2026-06-04T10:00:00Z',
  },
  {
    id: 't-22', regionLabel: 'Panel A8', pageName: 'Trang 4', chapterTitle: 'Ch.1: Khởi đầu mùa đông',
    seriesTitle: 'Vườn Hoa Mùa Đông', assignedAssistantName: 'Đức Minh',
    status: 'In_Progress', amount: 350000, deadline: '2026-06-09T23:59:59Z',
    extensionUsed: false, createdAt: '2026-06-03T12:00:00Z', updatedAt: '2026-06-04T05:00:00Z',
  },
  {
    id: 't-23', regionLabel: 'Background B6', pageName: 'Trang 10', chapterTitle: 'Ch.2: Cuộc gặp gỡ định mệnh',
    seriesTitle: 'Lạc Giữa Ngân Hà', assignedAssistantName: 'Thiên Kim',
    status: 'Cancelled', amount: 300000, deadline: '2026-05-25T23:59:59Z',
    extensionUsed: false, createdAt: '2026-05-15T08:00:00Z', updatedAt: '2026-05-23T10:00:00Z',
  },
  {
    id: 't-24', regionLabel: 'Effect D5', pageName: 'Trang 16', chapterTitle: 'Ch.4: Trận chiến đầu tiên',
    seriesTitle: 'Huyền Thoại Samurai', assignedAssistantName: null,
    status: 'Pending', amount: 520000, deadline: '2026-06-15T23:59:59Z',
    extensionUsed: false, createdAt: '2026-06-04T09:00:00Z', updatedAt: '2026-06-04T09:00:00Z',
  },
];
