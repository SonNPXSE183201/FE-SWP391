import type { Page, Region, Annotation } from '../../../types/entities';

// ─── Mock Pages ──────────────────────────────────────────────
export const MOCK_CANVAS_PAGES: Page[] = [
  {
    id: 'page-1',
    chapterId: 'ch-1',
    pageNumber: 1,
    imageUrl: 'https://picsum.photos/seed/manga-page-1/1200/1800',
    compositeImageUrl: undefined,
    status: 'InProgress',
    regionCount: 3,
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-06-10T14:30:00Z',
  },
  {
    id: 'page-2',
    chapterId: 'ch-1',
    pageNumber: 2,
    imageUrl: 'https://picsum.photos/seed/manga-page-2/1200/1800',
    compositeImageUrl: undefined,
    status: 'Pending',
    regionCount: 0,
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-06-10T14:30:00Z',
  },
  {
    id: 'page-3',
    chapterId: 'ch-1',
    pageNumber: 3,
    imageUrl: 'https://picsum.photos/seed/manga-page-3/1200/1800',
    compositeImageUrl: undefined,
    status: 'Completed',
    regionCount: 2,
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-06-10T14:30:00Z',
  },
  {
    id: 'page-4',
    chapterId: 'ch-1',
    pageNumber: 4,
    imageUrl: 'https://picsum.photos/seed/manga-page-4/1200/1800',
    compositeImageUrl: undefined,
    status: 'NeedsRevision',
    regionCount: 1,
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-06-10T14:30:00Z',
  },
];

// ─── Mock Regions ────────────────────────────────────────────
export const MOCK_REGIONS: Region[] = [
  {
    id: 'region-1',
    pageId: 'page-1',
    x: 50,
    y: 100,
    width: 400,
    height: 300,
    label: 'Nền bầu trời',
    taskId: 'task-1',
    createdAt: '2026-05-15T10:00:00Z',
    updatedAt: '2026-05-15T10:00:00Z',
  },
  {
    id: 'region-2',
    pageId: 'page-1',
    x: 200,
    y: 500,
    width: 350,
    height: 250,
    label: 'Đổ bóng nhân vật',
    taskId: 'task-2',
    createdAt: '2026-05-15T11:00:00Z',
    updatedAt: '2026-05-15T11:00:00Z',
  },
  {
    id: 'region-3',
    pageId: 'page-1',
    x: 100,
    y: 900,
    width: 500,
    height: 200,
    label: 'Speech bubble',
    taskId: undefined,
    createdAt: '2026-05-15T12:00:00Z',
    updatedAt: '2026-05-15T12:00:00Z',
  },
  {
    id: 'region-4',
    pageId: 'page-3',
    x: 80,
    y: 200,
    width: 600,
    height: 400,
    label: 'Background layer',
    taskId: 'task-3',
    createdAt: '2026-05-16T10:00:00Z',
    updatedAt: '2026-05-16T10:00:00Z',
  },
  {
    id: 'region-5',
    pageId: 'page-3',
    x: 300,
    y: 700,
    width: 250,
    height: 350,
    label: 'Character shading',
    taskId: 'task-4',
    createdAt: '2026-05-16T11:00:00Z',
    updatedAt: '2026-05-16T11:00:00Z',
  },
];

// ─── Mock Annotations ────────────────────────────────────────
export const MOCK_ANNOTATIONS: Annotation[] = [
  {
    id: 'anno-1',
    pageId: 'page-1',
    regionId: 'region-1',
    editorId: 'editor-1',
    editorName: 'Tanaka Editor',
    type: 'Technical',
    x: 120,
    y: 180,
    comment: 'Đường nét chưa đều, cần chỉnh lại line weight ở góc trái',
    resolved: false,
    createdAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-06-01T09:00:00Z',
  },
  {
    id: 'anno-2',
    pageId: 'page-1',
    regionId: undefined,
    editorId: 'editor-1',
    editorName: 'Tanaka Editor',
    type: 'Art',
    x: 350,
    y: 650,
    comment: 'Tỷ lệ cơ thể nhân vật chưa chuẩn, tay dài hơn bình thường',
    resolved: false,
    createdAt: '2026-06-01T09:15:00Z',
    updatedAt: '2026-06-01T09:15:00Z',
  },
  {
    id: 'anno-3',
    pageId: 'page-1',
    regionId: undefined,
    editorId: 'editor-1',
    editorName: 'Tanaka Editor',
    type: 'Content',
    x: 500,
    y: 300,
    comment: 'Thoại không khớp với nội dung kịch bản chương 5, kiểm tra lại script',
    resolved: true,
    createdAt: '2026-06-01T09:30:00Z',
    updatedAt: '2026-06-05T10:00:00Z',
  },
  {
    id: 'anno-4',
    pageId: 'page-4',
    regionId: 'region-4',
    editorId: 'editor-1',
    editorName: 'Tanaka Editor',
    type: 'Technical',
    x: 200,
    y: 400,
    comment: 'Lỗi aliasing ở viền panel, cần anti-alias lại',
    resolved: false,
    createdAt: '2026-06-02T10:00:00Z',
    updatedAt: '2026-06-02T10:00:00Z',
  },
];

// ─── Helpers ─────────────────────────────────────────────────
export const getRegionsByPageId = (pageId: string) =>
  MOCK_REGIONS.filter((r) => r.pageId === pageId);

export const getAnnotationsByPageId = (pageId: string) =>
  MOCK_ANNOTATIONS.filter((a) => a.pageId === pageId);

export const getUnresolvedAnnotationCount = (pageId: string) =>
  MOCK_ANNOTATIONS.filter((a) => a.pageId === pageId && !a.resolved).length;
