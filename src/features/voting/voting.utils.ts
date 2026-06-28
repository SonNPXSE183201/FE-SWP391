import type { BoardVoteDto, SeriesDto } from '../../api/generated/types';

/** Series pending vote — may include boardVotes when BE expands SeriesDto */
export type VotingSeriesDto = SeriesDto & { boardVotes?: BoardVoteDto[] | null };

export type VotingListFilter = 'All' | 'Pending' | 'Voted' | 'Closed';

/** UI-only label for vote buttons — not sent to API */
export type VoteUiChoice = 'Approve' | 'Reject' | 'Abstain';

export type VoteResultSummary = {
  approve: number;
  reject: number;
  abstain: number;
  total: number;
};

const PENDING_STATUSES = new Set(['Pending_Board_Vote']);

export const parseSeriesGenres = (genre?: string | null): string[] =>
  genre ? genre.split(/[,;]/).map((g) => g.trim()).filter(Boolean) : [];

export const summarizeBoardVotes = (boardVotes?: BoardVoteDto[] | null): VoteResultSummary => {
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
  boardVotes: BoardVoteDto[] | null | undefined,
  boardMemberId?: number | string | null,
): BoardVoteDto | undefined => {
  if (!boardMemberId || !boardVotes?.length) return undefined;
  const id = Number(boardMemberId);
  return boardVotes.find((v) => v.boardMemberId === id);
};

export const boardVoteToUiChoice = (vote?: BoardVoteDto): VoteUiChoice | undefined => {
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
) => ({
  voteChoice: choice,
  approved: choice === 'Approve',
  comment: comment || undefined,
  recommendedBudget,
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

export const getTiePolicyShortLabel = (policy?: string | null): string => {
  switch (policy) {
    case 'Reject':
      return 'Hòa → Từ chối';
    case 'ChairDecides':
      return 'Hòa → Chủ tịch';
    case 'Escalate':
    default:
      return 'Hòa → Admin';
  }
};

export const getTiePolicyDetail = (policy?: string | null, chairName?: string | null): string => {
  switch (policy) {
    case 'Reject':
      return 'Khi số phiếu Đồng ý bằng Từ chối và tất cả TV đã vote, series bị từ chối tự động.';
    case 'ChairDecides':
      return chairName
        ? `Khi hòa phiếu, hệ thống theo vote Đồng ý/Từ chối của Chủ tịch HĐ (${chairName}).`
        : 'Khi hòa phiếu, hệ thống theo vote Đồng ý/Từ chối của Chủ tịch HĐ đã chỉ định.';
    case 'Escalate':
    default:
      return 'Khi hòa phiếu hoặc không đạt ngưỡng, chuyển Quản trị viên quyết định thủ công.';
  }
};
