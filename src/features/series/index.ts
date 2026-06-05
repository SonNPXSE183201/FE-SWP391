// Series feature — barrel export

// API
export { seriesApi } from './api/series.api';
export type { CreateSeriesRequest, UpdateSeriesRequest, SubmitChapterRequest } from './api/series.api';

// Types
export type { SeriesFormData, SeriesFormErrors } from './types/series.types';
export { GENRE_OPTIONS } from './types/series.types';

// Constants
export {
  SERIES_STATUS_CONFIG,
  SERIES_STATUS_FILTER_OPTIONS,
  CHAPTER_STATUS_CONFIG,
  CHAPTER_STATUS_FILTER_OPTIONS,
  PAGE_STATUS_FILTER_OPTIONS,
  COVER_GRADIENTS,
  SERIES_STATUS_STEPS,
  getStepState,
} from './constants';
export type { StepState } from './constants';

// Hooks
export { useSeriesForm } from './hooks/useSeriesForm';
export { useNameUpload } from './hooks/useNameUpload';
export { useSeriesSubmit } from './hooks/useSeriesSubmit';

// Components
export { SeriesCard, SeriesRow } from './components/SeriesCard';
export { CoverPlaceholder } from './components/CoverPlaceholder';
export { StatusTimeline } from './components/StatusTimeline';
export { NameUploader } from './components/NameUploader';
export { SubmitChecklist } from './components/SubmitChecklist';
export { SeriesInfoCard } from './components/SeriesInfoCard';
export { UploadChapterModal } from './components/UploadChapterModal';
export { PagePlaceholder } from './components/PagePlaceholder';
export { PageCard } from './components/PageCard';
export { PageLightbox } from './components/PageLightbox';
export { SeriesPreviewModal } from './components/SeriesPreviewModal';
export { CreateSeriesForm } from './components/CreateSeriesForm';

// Mock data (temporary — remove when backend API is ready)
export { MOCK_SERIES, MOCK_CHAPTERS } from './data/mockData';
export { MOCK_PAGES, getPagesByChapterId, PAGE_STATUS_CONFIG } from './data/mockPages';
