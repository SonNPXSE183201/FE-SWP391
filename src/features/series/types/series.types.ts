// Series feature-specific types (form data, filters, UI state)

export interface SeriesFilterState {
  searchQuery: string;
  statusFilter: string;
  genreFilter: string;
  sortBy: 'newest' | 'oldest' | 'title' | 'chapters';
}

export interface SeriesFormData {
  title: string;
  synopsis: string;
  genre: string[];
  coverImage: File | null;
  coverPreviewUrl: string;
  requestedBudget: string;
}

export interface SeriesFormErrors {
  title?: string;
  synopsis?: string;
  genre?: string;
  coverImage?: string;
  requestedBudget?: string;
}

export interface ChapterFormData {
  chapterNumber: number;
  title: string;
  pages: File[];
  pagePreviewUrls: string[];
}

export interface ChapterFormErrors {
  chapterNumber?: string;
  title?: string;
  pages?: string;
}

// Genre options — re-export from constants (grouped + flat list)
export { GENRE_OPTIONS, GENRE_GROUPS, getGenreLabel } from '../../../constants/genres';
