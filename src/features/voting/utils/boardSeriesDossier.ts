import type { VotingSeriesDto } from '../../../api/generated/types';

export const hasBoardSeriesDossier = (
  series: Pick<VotingSeriesDto, 'resourceFolderUrl' | 'editorNote' | 'mangakaSubmissionNote'>,
): boolean =>
  Boolean(
    series.resourceFolderUrl?.trim() ||
      series.editorNote?.trim() ||
      series.mangakaSubmissionNote?.trim(),
  );
