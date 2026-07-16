import { useMemo, useState } from 'react';
import { AnimatedModal } from '../../../components/common/animation';
import {
  Calendar, ChevronLeft, ChevronRight, Loader2, User,
  X, CheckCircle2, CalendarClock, GripVertical,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CustomDatePicker } from '../../../components/common/CustomDatePicker';
import { useSchedule, useReschedule, useMarkPublished } from '../hooks/useSchedule';
import {
  PUBLISH_STATUS_CONFIG, WEEKDAYS, addMonths, buildCalendarGrid,
  formatMonthTitle, isSameDay, isSameMonth, toDateKey, toMonthKey,
} from '../constants';
import type { ScheduleItem } from '../types';
import { MotionStagger, MotionItem } from '../../../components/common/animation';

const MAX_VISIBLE_PER_DAY = 3;

export const PublishScheduleFeature = () => {
  const [viewMonth, setViewMonth] = useState(() => new Date());
  const { data: items = [], isLoading } = useSchedule(toMonthKey(viewMonth));
  const reschedule = useReschedule();
  const markPublished = useMarkPublished();

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [selected, setSelected] = useState<ScheduleItem | null>(null);

  const today = new Date();
  const grid = useMemo(() => buildCalendarGrid(viewMonth), [viewMonth]);

  // Group items by local date key.
  const itemsByDay = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    for (const it of items) {
      const key = toDateKey(new Date(it.publishDate));
      const arr = map.get(key) ?? [];
      arr.push(it);
      map.set(key, arr);
    }
    return map;
  }, [items]);

  const monthCount = useMemo(
    () => items.filter((i) => isSameMonth(new Date(i.publishDate), viewMonth)).length,
    [items, viewMonth],
  );

  const handleDrop = (cellDate: Date) => {
    const id = draggingId;
    setDraggingId(null);
    setDragOverKey(null);
    if (!id) return;
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (isSameDay(new Date(item.publishDate), cellDate)) return;
    const target = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate(), 9, 0, 0);
    reschedule.mutate(
      { id, publishDate: target.toISOString() },
      {
        onSuccess: () =>
          toast.success(`Đã dời "${item.seriesTitle} ${item.chapterLabel}" → ${cellDate.toLocaleDateString('vi-VN')}`),
        onError: () => toast.error('Không thể dời lịch'),
      },
    );
  };

  const handleRescheduleByPicker = (value: string) => {
    if (!selected || !value) return;
    const [y, m, d] = value.split('-').map(Number);
    const target = new Date(y, m - 1, d, 9, 0, 0);
    reschedule.mutate(
      { id: selected.id, publishDate: target.toISOString() },
      {
        onSuccess: () => {
          toast.success('Đã cập nhật lịch xuất bản');
          setSelected(null);
        },
        onError: () => toast.error('Không thể dời lịch'),
      },
    );
  };

  const handlePublish = (id: string) => {
    markPublished.mutate(id, {
      onSuccess: () => {
        toast.success('Đã đánh dấu xuất bản');
        setSelected(null);
      },
      onError: () => toast.error('Có lỗi xảy ra'),
    });
  };

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <Calendar size={20} className="text-brand" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Lịch xuất bản</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Kéo-thả thẻ truyện để dời lịch phát hành · {monthCount} mục trong tháng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
            className="w-9 h-9 rounded-lg bg-bg-secondary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="min-w-[150px] text-center text-sm font-semibold text-text-primary">
            {formatMonthTitle(viewMonth)}
          </div>
          <button
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            className="w-9 h-9 rounded-lg bg-bg-secondary border border-border-custom flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand/30 transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setViewMonth(new Date())}
            className="ml-1 px-3 h-9 rounded-lg bg-bg-secondary border border-border-custom text-xs font-medium text-text-secondary hover:text-text-primary hover:border-brand/30 transition-colors cursor-pointer"
          >
            Hôm nay
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        {(Object.keys(PUBLISH_STATUS_CONFIG) as (keyof typeof PUBLISH_STATUS_CONFIG)[]).map((s) => {
          const cfg = PUBLISH_STATUS_CONFIG[s];
          return (
            <span key={s} className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} /> {cfg.label}
            </span>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-brand" size={32} />
        </div>
      ) : (
        <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b border-border-custom">
            {WEEKDAYS.map((w) => (
              <div key={w} className="px-2 py-2.5 text-center text-[11px] font-semibold text-text-muted">
                {w}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <MotionStagger className="grid grid-cols-7">
            {grid.map((date) => {
              const key = toDateKey(date);
              const inMonth = isSameMonth(date, viewMonth);
              const isToday = isSameDay(date, today);
              const dayItems = itemsByDay.get(key) ?? [];
              const visible = dayItems.slice(0, MAX_VISIBLE_PER_DAY);
              const hidden = dayItems.length - visible.length;
              return (
                <MotionItem key={key}>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOverKey(key); }}
                  onDragLeave={() => setDragOverKey((k) => (k === key ? null : k))}
                  onDrop={(e) => { e.preventDefault(); handleDrop(date); }}
                  className={`min-h-[104px] border-b border-r border-border-custom/60 p-1.5 transition-colors ${
                    inMonth ? '' : 'bg-bg-primary/40'
                  } ${dragOverKey === key ? 'bg-brand/10 ring-1 ring-inset ring-brand/40' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-brand text-white'
                          : inMonth
                            ? 'text-text-secondary'
                            : 'text-text-muted/50'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {visible.map((it) => {
                      const cfg = PUBLISH_STATUS_CONFIG[it.status];
                      return (
                        <button
                          key={it.id}
                          draggable
                          onDragStart={() => setDraggingId(it.id)}
                          onDragEnd={() => { setDraggingId(null); setDragOverKey(null); }}
                          onClick={() => setSelected(it)}
                          className={`group w-full text-left flex items-center gap-1 px-1.5 py-1 rounded-md border ${cfg.chip} cursor-grab active:cursor-grabbing hover:brightness-110 transition-all ${
                            draggingId === it.id ? 'opacity-40' : ''
                          }`}
                          title={`${it.seriesTitle} ${it.chapterLabel} — ${cfg.label}`}
                        >
                          <GripVertical size={10} className="text-text-muted opacity-0 group-hover:opacity-100 flex-shrink-0" />
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <span className={`text-[10px] font-medium truncate ${cfg.text}`}>
                            {it.seriesTitle} {it.chapterLabel}
                          </span>
                        </button>
                      );
                    })}
                    {hidden > 0 && (
                      <p className="text-[10px] text-text-muted pl-1.5">+{hidden} mục khác</p>
                    )}
                  </div>
                </div>
                </MotionItem>
              );
            })}
          </MotionStagger>
        </div>
      )}

      {/* ─── Detail / reschedule modal ─── */}
      {selected && (
        <AnimatedModal open onClose={() => setSelected(null)} panelClassName="relative bg-bg-secondary border border-border-custom rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-border-custom">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                  <CalendarClock size={16} className="text-brand" />
                </div>
                <h3 className="text-base font-semibold text-text-primary">Chi tiết lịch xuất bản</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface cursor-pointer bg-transparent border-none">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex gap-3">
                {selected.coverUrl && (
                  <div className="w-16 h-[88px] rounded-lg overflow-hidden bg-bg-surface flex-shrink-0 border border-border-custom">
                    <img src={selected.coverUrl} alt={selected.seriesTitle} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${PUBLISH_STATUS_CONFIG[selected.status].chip} ${PUBLISH_STATUS_CONFIG[selected.status].text}`}>
                    {PUBLISH_STATUS_CONFIG[selected.status].label}
                  </span>
                  <h4 className="text-sm font-semibold text-text-primary mt-1.5">
                    {selected.seriesTitle} · {selected.chapterLabel}
                  </h4>
                  <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                    <User size={11} /> {selected.mangakaName}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {selected.genres.map((g) => (
                      <span key={g} className="px-1.5 py-0.5 rounded bg-brand/10 text-brand text-[9px]">{g}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Dời lịch xuất bản
                </label>
                <CustomDatePicker
                  value={toDateKey(new Date(selected.publishDate))}
                  onChange={handleRescheduleByPicker}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 pb-5">
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary cursor-pointer">
                Đóng
              </button>
              {selected.status !== 'Published' && (
                <button
                  onClick={() => handlePublish(selected.id)}
                  disabled={markPublished.isPending}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium border-none transition-all ${
                    markPublished.isPending
                      ? 'bg-success/40 text-white/60 cursor-not-allowed'
                      : 'bg-success hover:brightness-110 text-white cursor-pointer'
                  }`}
                >
                  {markPublished.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Đánh dấu xuất bản
                </button>
              )}
            </div>
        </AnimatedModal>
      )}
    </div>
  );
};
