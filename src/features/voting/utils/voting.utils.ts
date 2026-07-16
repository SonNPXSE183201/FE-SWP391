import type { BoardVoteDto, SeriesDto } from '../../../api/generated/types';

/** Series pending vote — may include boardVotes when BE expands SeriesDto */
export type VotingSeriesDto = SeriesDto & {
  boardVotes?: BoardVoteDto[] | null;
  editorRecommendedBudget?: number | null;
};

export type VotingListFilter = 'All' | 'Pending' | 'Voted' | 'Closed';

/** UI-only label for vote buttons — not sent to API */
export type VoteUiChoice = 'Approve' | 'Reject';

export type VoteResultSummary = {
  approve: number;
  reject: number;
  total: number;
};

const PENDING_STATUSES = new Set(['Pending_Board_Vote']);

export const parseSeriesGenres = (genre?: string | null): string[] =>
  genre ? genre.split(/[,;]/).map((g) => g.trim()).filter(Boolean) : [];

export const summarizeBoardVotes = (boardVotes?: BoardVoteDto[] | null): VoteResultSummary => {
  const votes = boardVotes ?? [];
  let approve = 0;
  let reject = 0;

  for (const vote of votes) {
    const type = (vote.voteType ?? '').toLowerCase();
    if (type === 'approve' || type === 'approved') approve += 1;
    else if (type === 'reject' || type === 'rejected') reject += 1;
  }

  return { approve, reject, total: votes.length };
};

const normalizeMemberId = (id?: number | string | null): number | null => {
  if (id == null || id === '') return null;
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
};

export const findMyBoardVote = (
  boardVotes: BoardVoteDto[] | null | undefined,
  boardMemberId?: number | string | null,
): BoardVoteDto | undefined => {
  const id = normalizeMemberId(boardMemberId);
  if (id == null || !boardVotes?.length) return undefined;
  return boardVotes.find((v) => normalizeMemberId(v.boardMemberId) === id);
};

export const boardVoteToUiChoice = (vote?: BoardVoteDto): VoteUiChoice | undefined => {
  if (!vote?.voteType) return undefined;
  const type = vote.voteType.toLowerCase();
  if (type === 'approve' || type === 'approved') return 'Approve';
  if (type === 'reject' || type === 'rejected') return 'Reject';
  return undefined;
};

export const isClosedVotingStatus = (status?: string | null): boolean =>
  status === 'Closed' || status === 'Cancelled';

export const isPendingVotingStatus = (status?: string | null): boolean =>
  !!status && PENDING_STATUSES.has(status);

export const getVotingUiStatus = (
  series: VotingSeriesDto,
  boardMemberId?: number | string | null,
): 'Pending' | 'Voted' | 'Closed' => {
  if (isClosedVotingStatus(series.status)) return 'Closed';
  if (findMyBoardVote(series.boardVotes, boardMemberId)) return 'Voted';
  return 'Pending';
};

export const matchesVotingFilter = (
  series: VotingSeriesDto,
  filter: VotingListFilter,
  boardMemberId?: number | string | null,
): boolean => {
  if (filter === 'All') return true;
  const uiStatus = getVotingUiStatus(series, boardMemberId);
  return uiStatus === filter;
};

export const uiChoiceToVoteSeriesRequest = (
  choice: VoteUiChoice,
  comment: string,
  recommendedBudget?: number,
  publicationSchedule?: string,
) => ({
  voteChoice: choice,
  approved: choice === 'Approve',
  comment: comment || undefined,
  recommendedBudget,
  publicationSchedule: choice === 'Approve' ? publicationSchedule : undefined,
});

export const getSeriesIdString = (series: SeriesDto): string => String(series.id ?? '');

/** ceil(N × % / 100) — phép nguyên, tránh lỗi float (6×67% → 5, không phải 4). */
export const calcBoardVotesRequired = (memberCount: number, percent: number): number => {
  const n = Math.max(memberCount, 1);
  const p = Math.min(100, Math.max(1, percent));
  return Math.max(1, Math.floor((n * p + 99) / 100));
};

/** % thực tế tối thiểu khi đạt đủ số phiếu yêu cầu */
export const calcEffectiveThresholdPercent = (required: number, memberCount: number): number => {
  const n = Math.max(memberCount, 1);
  return Math.round((required * 100) / n);
};

/** Kiểm tra ngân sách đề xuất nằm trong 50%–150% so với ngân sách Mangaka */
export const isRecommendedBudgetInRange = (
  recommended: number,
  estimatedBudget: number,
): boolean => {
  if (estimatedBudget <= 0) return recommended > 0;
  const min = estimatedBudget * 0.5;
  const max = estimatedBudget * 1.5;
  return recommended >= min && recommended <= max;
};

export const getRecommendedBudgetRange = (estimatedBudget: number) => ({
  min: estimatedBudget * 0.5,
  max: estimatedBudget * 1.5,
});
