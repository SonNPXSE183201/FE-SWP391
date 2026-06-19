// ============================================================
// Domain Entity Types — Based on Manga.md & GEMINI.md
//
// @deprecated — These hand-crafted types are being phased out.
// For new code, import from '../api/generated/types' instead.
// These types remain for backward compatibility with mock data
// and will be removed once all features use real API endpoints.
// ============================================================

// ─── Enums ───────────────────────────────────────────────────

export type SeriesStatus =
  | 'Draft'
  | 'PendingApproval'
  | 'Approved'
  | 'Published'
  | 'OnHold'
  | 'Cancelled';

export type ChapterStatus =
  | 'Draft'
  | 'Submitted'
  | 'UnderReview'
  | 'Approved'
  | 'Revision'
  | 'Published';

export type PageStatus =
  | 'Pending'
  | 'InProgress'
  | 'Completed'
  | 'NeedsRevision';

export type TaskStatus =
  | 'Pending'
  | 'In_Progress'
  | 'Pending_Review'
  | 'Approved'
  | 'Revision'
  | 'Disputed'
  | 'Cancelled'
  | 'Closed';

export type TransactionType =
  | 'Funding'
  | 'Lock'
  | 'Unlock'
  | 'Escrow_Lock'
  | 'Escrow_Unlock'
  | 'Transfer'
  | 'Deposit'
  | 'Withdraw'
  | 'Genkouryo';

export type AnnotationType =
  | 'Technical'   // 🔴
  | 'Art'         // 🟡
  | 'Content';    // 🔵

export type DisputeResolution =
  | 'FullPayment'
  | 'PartialPayment'
  | 'NoPayment';

export type VoteType =
  | 'Approve'
  | 'Reject'
  | 'Abstain';

export type UserAccountStatus =
  | 'PendingApproval'
  | 'Active'
  | 'Suspended'
  | 'Deactivated';

// ─── Base Entity ─────────────────────────────────────────────

interface BaseEntity {
  id: string;
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
}

// ─── User & Auth ─────────────────────────────────────────────

export interface Contract extends BaseEntity {
  mangakaId: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  genkouryoPrice: number;      // Base price per page (VND)
  status: 'Active' | 'Expired' | 'Terminated';
}

export interface ContractAddendum extends BaseEntity {
  contractId: string;
  seriesId: string;
  adjustedGenkouryoPrice: number;
  effectiveDate: string;
  note: string;
}

export interface AssistantProfile extends BaseEntity {
  userId: string;
  portfolioUrl: string;
  specialtyTags: string[];
  totalTasksCompleted: number;
  averageRating: number;
  accountStatus: UserAccountStatus;
}

// ─── Series & Publication ────────────────────────────────────

export interface Series extends BaseEntity {
  title: string;
  synopsis: string;
  genre: string[];
  coverImageUrl: string;
  mangakaId: string;
  mangakaName: string;
  status: SeriesStatus;
  chapterCount: number;
  scheduledPublishDate?: string;
}

export interface Chapter extends BaseEntity {
  seriesId: string;
  seriesTitle: string;
  chapterNumber: number;
  title: string;
  status: ChapterStatus;
  pageCount: number;
  validPageCount: number;
  submittedAt?: string;
  approvedAt?: string;
}

export interface BoardVote extends BaseEntity {
  seriesId: string;
  boardMemberId: string;
  boardMemberName: string;
  voteType: VoteType;
  comment: string;
}

export interface RankingVote extends BaseEntity {
  seriesId: string;
  score: number;
  period: string; // e.g. "2026-Q2"
}

// ─── Production ──────────────────────────────────────────────

export interface Page extends BaseEntity {
  chapterId: string;
  pageNumber: number;
  imageUrl: string;
  compositeImageUrl?: string;
  status: PageStatus;
  regionCount: number;
}

export interface Region extends BaseEntity {
  pageId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  taskId?: string;
}

export interface Task extends BaseEntity {
  regionId: string;
  pageId: string;
  chapterId: string;
  seriesId: string;
  mangakaId: string;
  assignedAssistantId?: string;
  assignedAssistantName?: string;
  status: TaskStatus;
  amount: number;               // Lock amount (VND)
  deadline: string;
  extensionUsed: boolean;       // T08: max 1 extension
  extensionReason?: string;
  extensionStatus?: string;
  extensionRequestDays?: number;
  onLeave: boolean;             // T04: pause auto-approve
}

export interface TaskVersion extends BaseEntity {
  taskId: string;
  versionNumber: number;
  imageUrl: string;
  submittedAt: string;
  comment?: string;
}

export interface Annotation extends BaseEntity {
  pageId: string;
  regionId?: string;
  editorId: string;
  editorName: string;
  type: AnnotationType;
  x: number;
  y: number;
  comment: string;
  resolved: boolean;
}

// ─── Wallet & Finance ────────────────────────────────────────

export interface Wallet extends BaseEntity {
  userId: string;
  setupFundBalance: number;       // Board-funded balance (VND)
  withdrawableBalance: number;    // Genkouryo + self-deposit (VND)
  lockedAmount: number;           // Currently locked in tasks
  totalBalance: number;           // Calculated: setup + withdrawable
}

export interface Transaction extends BaseEntity {
  walletId: string;
  type: TransactionType;
  amount: number;
  setupFundAmount: number;        // How much came from SetupFund
  withdrawableAmount: number;     // How much came from Withdrawable
  referenceId?: string;           // TaskId / ChapterId etc.
  referenceCode: string;          // For reconciliation (F04)
  description: string;
}

// ─── Notification ────────────────────────────────────────────

export interface Notification extends BaseEntity {
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  type: 'TaskUpdate' | 'WalletUpdate' | 'SystemAlert' | 'Review';
}

// ─── Dispute ─────────────────────────────────────────────────

export interface DisputeLog extends BaseEntity {
  taskId: string;
  editorId: string;
  resolution: DisputeResolution;
  partialPercentage?: number;     // 0-100% for partial payment (T06)
  note: string;
}

// ─── API Response Wrappers ───────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
