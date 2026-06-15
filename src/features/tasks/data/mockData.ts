import type { TaskStatus } from '../../../types/entities';

// ─── Mock Task — aligned with ERD: Region → Task ─────────────
// Flow: Series(s-1) → Chapter(ch-1) → Page(page-1..4) → Region(region-1..5) → Task
export interface MockTask {
  id: string;
  taskName: string;
  // ─── ERD relationships (FK chain) ───
  regionId: string;       // FK → Region (REQUIRED by ERD)
  regionLabel: string;    // Denormalized for display
  pageId: string;         // FK → Page (via Region.pageId)
  pageName: string;       // Denormalized
  chapterId: string;      // FK → Chapter (via Page.chapterId)
  chapterTitle: string;   // Denormalized
  seriesId: string;       // FK → Series (via Chapter.seriesId)
  seriesTitle: string;    // Denormalized
  // ─── Task fields ───
  assignedAssistantName: string | null; // null = chưa có ai nhận (đang trên Task Queue)
  status: TaskStatus;
  amount: number;
  deadline: string; // ISO
  extensionUsed: boolean;
  feedbackComment?: string;
  resultImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Dữ liệu xuyên suốt chuỗi ERD ──────────────────────────
// s-1 "Huyền Thoại Samurai" → ch-1 "Khởi đầu" → page-1..4 → region-1..5 → task-1..5
//
// page-1 (InProgress): region-1 "Nền bầu trời" (task-1), region-2 "Đổ bóng nhân vật" (task-2), region-3 "Speech bubble" (chưa gán)
// page-2 (Pending):    chưa có region
// page-3 (Completed):  region-4 "Background layer" (task-3), region-5 "Character shading" (task-4)
// page-4 (NeedsRevision): chưa có region gắn task

export const MOCK_TASKS: MockTask[] = [
  // ═══ page-1 / region-1: Nền bầu trời ═══
  {
    id: 'task-1',
    taskName: 'Vẽ nền bầu trời hoàng hôn',
    regionId: 'region-1', regionLabel: 'Nền bầu trời',
    pageId: 'page-1', pageName: 'Trang 1',
    chapterId: 'ch-1', chapterTitle: 'Ch.1: Khởi đầu',
    seriesId: 's-1', seriesTitle: 'Huyền Thoại Samurai',
    assignedAssistantName: 'Minh Anh',  // đã nhận từ Queue
    status: 'Pending_Review', amount: 350000,
    deadline: '2026-06-20T23:59:59Z',
    extensionUsed: false,
    createdAt: '2026-06-01T08:00:00Z', updatedAt: '2026-06-10T14:00:00Z',
  },
  // ═══ page-1 / region-2: Đổ bóng nhân vật ═══
  {
    id: 'task-2',
    taskName: 'Đổ bóng nhân vật chính',
    regionId: 'region-2', regionLabel: 'Đổ bóng nhân vật',
    pageId: 'page-1', pageName: 'Trang 1',
    chapterId: 'ch-1', chapterTitle: 'Ch.1: Khởi đầu',
    seriesId: 's-1', seriesTitle: 'Huyền Thoại Samurai',
    assignedAssistantName: 'Thiên Kim',
    status: 'In_Progress', amount: 500000,
    deadline: '2026-06-22T23:59:59Z',
    extensionUsed: false,
    createdAt: '2026-06-01T10:00:00Z', updatedAt: '2026-06-08T09:00:00Z',
  },
  // ═══ page-3 / region-4: Background layer ═══
  {
    id: 'task-3',
    taskName: 'Vẽ nền cảnh làng quê',
    regionId: 'region-4', regionLabel: 'Background layer',
    pageId: 'page-3', pageName: 'Trang 3',
    chapterId: 'ch-1', chapterTitle: 'Ch.1: Khởi đầu',
    seriesId: 's-1', seriesTitle: 'Huyền Thoại Samurai',
    assignedAssistantName: 'Đức Minh',
    status: 'Approved', amount: 450000,
    deadline: '2026-06-15T23:59:59Z',
    extensionUsed: false,
    createdAt: '2026-05-28T08:00:00Z', updatedAt: '2026-06-12T12:00:00Z',
  },
  // ═══ page-3 / region-5: Character shading ═══
  {
    id: 'task-4',
    taskName: 'Tô bóng nhân vật phụ',
    regionId: 'region-5', regionLabel: 'Character shading',
    pageId: 'page-3', pageName: 'Trang 3',
    chapterId: 'ch-1', chapterTitle: 'Ch.1: Khởi đầu',
    seriesId: 's-1', seriesTitle: 'Huyền Thoại Samurai',
    assignedAssistantName: null,  // đang trên Task Queue, chưa ai nhận
    status: 'Pending', amount: 300000,
    deadline: '2026-06-25T23:59:59Z',
    extensionUsed: false,
    createdAt: '2026-06-05T08:00:00Z', updatedAt: '2026-06-05T08:00:00Z',
  },
  // ═══ page-1 / region-3: Speech bubble — CHƯA GÁN TASK ═══
  // region-3 tồn tại trong canvas mock nhưng chưa có task → Mangaka có thể tạo task mới từ đây
];

// ─── Helpers ─────────────────────────────────────────────────
export const getTasksByRegionId = (regionId: string) =>
  MOCK_TASKS.filter((t) => t.regionId === regionId);

export const getTasksByPageId = (pageId: string) =>
  MOCK_TASKS.filter((t) => t.pageId === pageId);

export const getTasksByChapterId = (chapterId: string) =>
  MOCK_TASKS.filter((t) => t.chapterId === chapterId);
