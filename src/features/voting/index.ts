// Voting feature — barrel export
export { VotingFeature } from './components/VotingFeature';
export { useVotingList, useVotingDetail, useSubmitBoardVote } from './hooks/useVoting';
export { votingApi } from './api/voting.api';
export type { VotingSeriesItem, VoteDecision, VotingStatus, SubmitVotePayload } from './api/voting.api';
