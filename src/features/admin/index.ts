// Admin feature — barrel export
export { adminApi } from './api/admin.api';
export { boardVotingAdminApi } from './api/boardVoting.api';
export type { BoardVotingConfigDto } from './api/boardVoting.api';

export { AdminBoardVotingFeature } from './components/AdminBoardVotingFeature';

export {
  useBoardMembers,
  useBoardVotingConfig,
  useBoardVotingRules,
  useEscalatedVotes,
  useManualResolveVote,
  useUpdateBoardVotingConfig,
} from './hooks/useBoardVotingAdmin';
