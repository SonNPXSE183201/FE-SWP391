import type { CreateSeriesDto } from '../../../api/generated/types';

export type CreateSeriesRequest = CreateSeriesDto & {
  coverImage?: File;
};

export interface UpdateSeriesRequest {
  title?: string;
  synopsis?: string;
  genre?: string[];
  coverImage?: File;
}

export interface SubmitChapterRequest {
  chapterNumber: number;
  title: string;
  pages: File[];
}
