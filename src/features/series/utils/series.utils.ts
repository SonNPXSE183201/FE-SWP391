import type { SeriesDto } from '../../../api/generated/types';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';

export const parseGenreList = (genre?: string | null): string[] => {
  if (!genre?.trim()) return [];
  return genre.split(',').map((g) => g.trim()).filter(Boolean);
};

export const resolveSeriesCover = (dto: Pick<SeriesDto, 'coverArtworkUrl'>): string =>
  resolveMediaUrl(dto.coverArtworkUrl || '');

export const removeVietnameseAccents = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};
