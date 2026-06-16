import type { PublishStatus } from './types';

// ─── Publish status config ───────────────────────────────────
export const PUBLISH_STATUS_CONFIG: Record<
  PublishStatus,
  { label: string; dot: string; chip: string; text: string }
> = {
  Scheduled: {
    label: 'Đã lên lịch',
    dot: 'bg-brand',
    chip: 'bg-brand/10 border-brand/30',
    text: 'text-brand',
  },
  Published: {
    label: 'Đã xuất bản',
    dot: 'bg-success',
    chip: 'bg-success/10 border-success/30',
    text: 'text-success',
  },
  Delayed: {
    label: 'Trễ lịch',
    dot: 'bg-danger',
    chip: 'bg-danger/10 border-danger/30',
    text: 'text-danger',
  },
};

// Monday-first weekday labels (vi-VN).
export const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

// ─── Calendar date helpers ───────────────────────────────────
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isSameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** Build a fixed 42-cell (6 weeks) grid, Monday-first, covering the given month. */
export const buildCalendarGrid = (month: Date): Date[] => {
  const first = startOfMonth(month);
  const firstWeekday = (first.getDay() + 6) % 7; // Monday = 0
  const start = new Date(first);
  start.setDate(first.getDate() - firstWeekday);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

export const formatMonthTitle = (d: Date) =>
  `Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;

/** Local YYYY-MM-DD key (avoids timezone shift from toISOString). */
export const toDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
