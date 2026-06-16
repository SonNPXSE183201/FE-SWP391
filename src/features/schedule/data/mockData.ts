import type { ScheduleItem } from '../types';

// Build a date in the current month at a given day-of-month (keeps mock relevant over time).
const dayThisMonth = (day: number, hour = 9): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), day, hour, 0, 0).toISOString();
};

// Mutable in-memory store so reschedule/publish persist during a session (mock only).
export const MOCK_SCHEDULE: ScheduleItem[] = [
  {
    id: 'sch-1',
    seriesId: 'series-1',
    seriesTitle: 'Huyền Thoại Samurai',
    chapterLabel: 'Ch.5',
    mangakaName: 'Nguyễn Minh Đức',
    coverUrl: 'https://picsum.photos/seed/samurai-cover/120/160',
    publishDate: dayThisMonth(3),
    status: 'Published',
    genres: ['Shōnen', 'Action'],
  },
  {
    id: 'sch-2',
    seriesId: 'series-2',
    seriesTitle: 'Tokyo Dreamers',
    chapterLabel: 'Ch.9',
    mangakaName: 'Lê Thị Hương',
    coverUrl: 'https://picsum.photos/seed/tokyo-cover/120/160',
    publishDate: dayThisMonth(8),
    status: 'Published',
    genres: ['Shōjo', 'Romance'],
  },
  {
    id: 'sch-3',
    seriesId: 'series-3',
    seriesTitle: 'Mecha Genesis',
    chapterLabel: 'Ch.3',
    mangakaName: 'Hoàng Anh Tuấn',
    coverUrl: 'https://picsum.photos/seed/mecha-cover/120/160',
    publishDate: dayThisMonth(12),
    status: 'Delayed',
    genres: ['Seinen', 'Sci-Fi'],
  },
  {
    id: 'sch-4',
    seriesId: 'series-2',
    seriesTitle: 'Học Viện Pháp Sư',
    chapterLabel: 'Ch.12',
    mangakaName: 'Trần Lê Hương',
    coverUrl: 'https://picsum.photos/seed/mage-cover/120/160',
    publishDate: dayThisMonth(18),
    status: 'Scheduled',
    genres: ['Fantasy', 'Action'],
  },
  {
    id: 'sch-5',
    seriesId: 'series-1',
    seriesTitle: 'Huyền Thoại Samurai',
    chapterLabel: 'Ch.6',
    mangakaName: 'Nguyễn Minh Đức',
    coverUrl: 'https://picsum.photos/seed/samurai-cover/120/160',
    publishDate: dayThisMonth(20),
    status: 'Scheduled',
    genres: ['Shōnen', 'Action'],
  },
  {
    id: 'sch-6',
    seriesId: 'series-4',
    seriesTitle: 'Đầu Bếp Thượng Hạng',
    chapterLabel: 'Ch.8',
    mangakaName: 'Phạm Quốc Anh',
    coverUrl: 'https://picsum.photos/seed/chef-cover/120/160',
    publishDate: dayThisMonth(20),
    status: 'Scheduled',
    genres: ['Gourmet', 'Slice of Life'],
  },
  {
    id: 'sch-7',
    seriesId: 'series-5',
    seriesTitle: 'Vương Quốc Bóng Đêm',
    chapterLabel: 'Ch.1',
    mangakaName: 'Đỗ Khánh Linh',
    coverUrl: 'https://picsum.photos/seed/dark-cover/120/160',
    publishDate: dayThisMonth(25),
    status: 'Scheduled',
    genres: ['Dark Fantasy', 'Horror'],
  },
  {
    id: 'sch-8',
    seriesId: 'series-3',
    seriesTitle: 'Mecha Genesis',
    chapterLabel: 'Ch.4',
    mangakaName: 'Hoàng Anh Tuấn',
    coverUrl: 'https://picsum.photos/seed/mecha-cover/120/160',
    publishDate: dayThisMonth(28),
    status: 'Scheduled',
    genres: ['Seinen', 'Sci-Fi'],
  },
];
