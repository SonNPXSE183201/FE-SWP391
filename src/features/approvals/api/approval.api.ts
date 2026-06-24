import { createMockApiResponse } from '../../../api/apiResponse';
import type { SeriesDto, VoteSeriesRequestDto } from '../../../api/generated/types';
import { votingApi } from '../../voting/api/voting.api';

/** @deprecated BE không có /api/approvals — delegate sang voting.api (GET /votes/pending, POST /series/{id}/vote) */

export const approvalApi = {
  getPendingProposals: async () => {
    const items = await votingApi.fetchVotingList('Pending');
    return createMockApiResponse(items as SeriesDto[]);
  },

  approveProposal: async (seriesId: string, payload: { approvedBudget: number; publishSchedule: string }) => {
    const body: VoteSeriesRequestDto = {
      approved: true,
      comment: `Lịch xuất bản: ${payload.publishSchedule}`,
      recommendedBudget: payload.approvedBudget,
    };
    const result = await votingApi.submitVote(seriesId, body);
    return createMockApiResponse(result.success, result.message);
  },

  rejectProposal: async (seriesId: string) => {
    const body: VoteSeriesRequestDto = { approved: false, comment: '' };
    const result = await votingApi.submitVote(seriesId, body);
    return createMockApiResponse(result.success, result.message);
  },
};
