// ============================================================
// Status union types — shared across features
// ============================================================

export type SeriesStatus =
  | 'Draft'
  | 'PendingApproval'
  | 'PendingBoardVote'
  | 'Approved'
  | 'Fund_Pending'
  | 'In Production'
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
  | 'Escrow_Release'
  | 'Transfer'
  | 'Deposit'
  | 'Withdraw'
  | 'Withdrawal'
  | 'Withdrawal_Refund'
  | 'Genkouryo'
  | 'Genkouryo_Payment'
  | 'Escrow_Refund'
  | 'Task_Payment';

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
