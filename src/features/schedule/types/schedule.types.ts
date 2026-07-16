export type PublishStatus = 'Scheduled' | 'Published' | 'Delayed';

export interface ScheduleItem {
  id: string;
  seriesId: string;
  seriesTitle: string;
  chapterLabel: string;
  mangakaName: string;
  coverUrl?: string;
  publishDate: string;
  status: PublishStatus;
  genres: string[];
}
