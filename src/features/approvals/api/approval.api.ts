import { createMockApiResponse } from '../../../api/apiResponse';
import { votingApi } from '../../voting/api/voting.api';
import type { VotingSeriesItem } from '../../voting/api/voting.api';

/** @deprecated BE không có /api/approvals — delegate sang voting.api (GET /votes/pending, POST /series/{id}/vote) */

export interface PendingProposal {
  id: string;
  title: string;
  mangakaName: string;
  submittedAt: string;
  requestedBudget: number;
  genres: string[];
  editorName: string;
  editorNote: string;
  synopsis: string;
  coverUrl: string;
  nameFileName: string;
}

const mapToProposal = (item: VotingSeriesItem): PendingProposal => ({
  id: item.seriesId,
  title: item.title,
  mangakaName: item.mangakaName,
  submittedAt: item.submittedAt,
  requestedBudget: item.requestedBudget,
  genres: item.genres,
  editorName: item.editorName,
  editorNote: item.editorRecommendation,
  synopsis: item.synopsis,
  coverUrl: item.coverImageUrl,
  nameFileName: '',
});

export const approvalApi = {
  getPendingProposals: async () => {
    const items = await votingApi.fetchVotingList('Pending');
    return createMockApiResponse(items.map(mapToProposal));
  },

  approveProposal: async (seriesId: string, payload: { approvedBudget: number; publishSchedule: string }) => {
    const comment = `Lịch xuất bản: ${payload.publishSchedule}`;
    const result = await votingApi.submitVote({
      votingId: seriesId,
      decision: 'Approve',
      comment,
      recommendedBudget: payload.approvedBudget,
    });
    return createMockApiResponse(result.success, result.message);
  },

  rejectProposal: async (seriesId: string) => {
    const result = await votingApi.submitVote({
      votingId: seriesId,
      decision: 'Reject',
      comment: '',
    });
    return createMockApiResponse(result.success, result.message);
  },
};
