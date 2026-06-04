// Series feature — barrel export

// API
export { seriesApi } from './api/series.api';
export type { CreateSeriesRequest, UpdateSeriesRequest, SubmitChapterRequest } from './api/series.api';

// Types
export type { SeriesFormData, SeriesFormErrors } from './types/series.types';
export { GENRE_OPTIONS } from './types/series.types';

// Constants
export { SERIES_STATUS_CONFIG, SERIES_STATUS_FILTER_OPTIONS, CHAPTER_STATUS_CONFIG, COVER_GRADIENTS } from './constants';

// Hooks
export { useSeriesForm } from './hooks/useSeriesForm';

// Components
export { SeriesCard, SeriesRow } from './components/SeriesCard';
export { CoverPlaceholder } from './components/CoverPlaceholder';

// Mock data (temporary — remove when backend API is ready)
export { MOCK_SERIES, MOCK_CHAPTERS } from './data/mockData';
