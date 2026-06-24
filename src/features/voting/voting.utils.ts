import type { BoardVote, SeriesDto } from '../../api/generated/types';

/** Series pending vote — may include boardVotes when BE expands SeriesDto */
export type VotingSeriesDto = SeriesDto & { boardVotes?: BoardVote[] | null };

export type VotingListFilter = 'All' | 'Pending' | 'Voted' | 'Closed';

/** UI-only label for vote buttons — not sent to API */
export type VoteUiChoice = 'Approve' | 'Reject' | 'Abstain';

export type VoteResultSummary = {
  approve: number;
  reject: number;
  abstain: number;
  total: number;
};

const PENDING_STATUSES = new Set(['Pending_Approval', 'Pending_Board_Vote', 'Fund_Pending']);

export const parseSeriesGenres = (genre?: string | null): string[] =>
  genre ? genre.split(/[,;]/).map((g) => g.trim()).filter(Boolean) : [];

export const summarizeBoardVotes = (boardVotes?: BoardVote[] | null): VoteResultSummary => {
  const votes = boardVotes ?? [];
  let approve = 0;
  let reject = 0;
  let abstain = 0;

  for (const vote of votes) {
    const type = (vote.voteType ?? '').toLowerCase();
    if (type === 'approve' || type === 'approved') approve += 1;
    else if (type === 'reject' || type === 'rejected') reject += 1;
    else if (type === 'abstain') abstain += 1;
  }

  return { approve, reject, abstain, total: votes.length };
};

export const findMyBoardVote = (
  boardVotes: BoardVote[] | null | undefined,
  boardMemberId?: number | string | null,
): BoardVote | undefined => {
  if (!boardMemberId || !boardVotes?.length) return undefined;
  const id = Number(boardMemberId);
  return boardVotes.find((v) => v.boardMemberId === id);
};

export const boardVoteToUiChoice = (vote?: BoardVote): VoteUiChoice | undefined => {
  if (!vote?.voteType) return undefined;
  const type = vote.voteType.toLowerCase();
  if (type === 'approve' || type === 'approved') return 'Approve';
  if (type === 'reject' || type === 'rejected') return 'Reject';
  if (type === 'abstain') return 'Abstain';
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
) => {
  if (choice === 'Abstain') {
    return { approved: false, comment: `[Abstain] ${comment}`.trim() };
  }
  return {
    approved: choice === 'Approve',
    comment: comment || undefined,
    recommendedBudget,
  };
};

export const getSeriesIdString = (series: SeriesDto): string => String(series.id ?? '');
