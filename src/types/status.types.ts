// ============================================================
// Status union types — shared across features
// ============================================================

export type SeriesStatus =
  | 'Draft'
  | 'PendingApproval'
  | 'PendingBoardVote'
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
  | 'Submitted'
  | 'Approved'
  | 'Revision'
  | 'Disputed'
  | 'Cancelled'
  | 'Closed';

export type TransactionType =
  | 'Funding'
  | 'Production_Funding'
  | 'Platform_TopUp'
  | 'Lock'
  | 'Unlock'
  | 'Escrow_Lock'
  | 'Escrow_Unlock'
  | 'Transfer'
  | 'Deposit'
  | 'Withdraw'
  | 'Withdrawal'
  | 'Genkouryo';

export type AnnotationType =
  | 'Technical'
  | 'Art'
  | 'Content';

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
