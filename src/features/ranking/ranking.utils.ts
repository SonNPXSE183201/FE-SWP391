import type { RankingRecord } from '../../api/generated/types';

export type RankingUiStatus = 'Active' | 'UnderReview' | 'ProposedCancel';

export const parseSeriesGenres = (genre?: string | null): string[] =>
  genre ? genre.split(/[,;]/).map((g) => g.trim()).filter(Boolean) : [];

export const mapSeriesToRankingUiStatus = (status?: string | null): RankingUiStatus => {
  if (status === 'ProposedCancel' || status === 'Cancelled') return 'ProposedCancel';
  if (status === 'UnderReview' || status === 'Pending_Approval') return 'UnderReview';
  return 'Active';
};

export const getRankingRecordId = (record: RankingRecord, index = 0): string =>
  String(record.seriesId ?? record.id ?? index);

export const getRankingRecordTitle = (record: RankingRecord): string =>
  record.series?.title ?? `Series #${record.seriesId ?? '—'}`;

export const getRankingCoverUrl = (record: RankingRecord): string =>
  record.series?.coverArtworkUrl ?? '';

export const getRankingGenres = (record: RankingRecord): string[] =>
  parseSeriesGenres(record.series?.genre);

export const getRankingUiStatus = (record: RankingRecord): RankingUiStatus =>
  mapSeriesToRankingUiStatus(record.series?.status);

export const filterRankingByGenre = (records: RankingRecord[], genre?: string): RankingRecord[] => {
  if (!genre || genre === 'All') return records;
  return records.filter((record) => getRankingGenres(record).includes(genre));
};

export const sortRankingByPosition = (records: RankingRecord[]): RankingRecord[] =>
  [...records].sort((a, b) => (a.rankPosition ?? 0) - (b.rankPosition ?? 0));
