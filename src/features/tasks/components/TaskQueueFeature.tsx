import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Filter,
  ListChecks,
  Loader2,
  RotateCcw,
  Search,
  Unlock,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import {
  useAvailableTasks,
  useAssistantMyTasks,
  useAcceptTask,
  AssistantTaskDetailModal,
  ASSISTANT_MY_TASK_FILTER_OPTIONS,
  ACTIVE_TASK_STATUSES,
} from '../index';
import { AssistantTaskCard } from './AssistantTaskCard';
import { TaskRegionPreviewModal } from './TaskRegionPreviewModal';
import { useDebounce } from '../../../hooks/useDebounce';
import { Pagination } from '../../../components/common/Pagination';
import { CustomSelect } from '../../../components/common/CustomSelect';
import { HelpTip } from '../../../components/common/HelpTip';
import {
  MotionStagger,
  MotionItem,
  MotionTabPanel,
  MotionListItem,
  containerVariants,
} from '../../../components/common/animation';
import { motion } from 'framer-motion';
import type { AvailableTaskDto } from '../hooks/useTasks';
import type { TaskStatus } from '../../../types/status.types';
import { normalizeTaskStatus, taskStatusMatchesFilter } from '../../../utils/status';

// ─── Types & constants ───────────────────────────────────────
type TabKey = 'Available' | 'MyTasks';
type MyStatusFilter = '' | TaskStatus | 'active';

const PAGE_SIZE = 10;

const ASSISTANT_MY_TASK_SELECT_OPTIONS = ASSISTANT_MY_TASK_FILTER_OPTIONS.map(({ value, label }) => ({
  value: value || 'all',
  label,
}));

// ─── Pagination helpers ──────────────────────────────────────
const buildPageRange = (current: number, total: number): (number | 'ellipsis')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const left = Math.max(current - 1, 2);
  const right = Math.min(current + 1, total - 1);
  const range: (number | 'ellipsis')[] = [1];
  if (left > 2) range.push('ellipsis');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push('ellipsis');
  range.push(total);
  return range;
};

// ─── Filtering (My Tasks is filtered client-side) ────────────
const matchesSearch = (task: AvailableTaskDto, query: string) => {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  return (
    (task.description || '').toLowerCase().includes(q) ||
    (task.mangakaName || '').toLowerCase().includes(q) ||
    String(task.pageNumber ?? '').includes(q) ||
    String(task.paymentAmount ?? '').includes(q.replace(/\D/g, ''))
  );
};

const filterMyTasks = (items: AvailableTaskDto[], statusFilter: MyStatusFilter, search: string) => {
  let list = items;
  if (search.trim()) list = list.filter((t) => matchesSearch(t, search));
  if (!statusFilter) return list;
  if (statusFilter === 'active') {
    return list.filter((t) => ACTIVE_TASK_STATUSES.includes(normalizeTaskStatus(t.status)));
  }
  return list.filter((t) => taskStatusMatchesFilter(t.status, statusFilter));
};

// ─── Component ───────────────────────────────────────────────
export const TaskQueueFeature = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('Available');
  const [searchQuery, setSearchQuery] = useState('');
  const [myStatusFilter, setMyStatusFilter] = useState<MyStatusFilter>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailTask, setDetailTask] = useState<AvailableTaskDto | null>(null);
  const [previewTask, setPreviewTask] = useState<AvailableTaskDto | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 400);

  const isMyTasksTab = activeTab === 'MyTasks';
  const hasActiveFilters = !!searchQuery || !!myStatusFilter;

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setMyStatusFilter('');
    setSearchQuery('');
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setMyStatusFilter('');
    setCurrentPage(1);
  };

  // ─── Data ──────────────────────────────────────────────────
  const {
    data: availableData,
    isLoading: isAvailableLoading,
    isError: isAvailableError,
    error: availableError,
  } = useAvailableTasks({
    page: currentPage,
    pageSize: PAGE_SIZE,
    skill: !isMyTasksTab && debouncedSearch ? debouncedSearch : undefined,
  });

  const {
    data: myData,
    isLoading: isMyLoading,
    isError: isMyError,
    error: myError,
  } = useAssistantMyTasks({ page: currentPage, pageSize: 50 });

  const isLoading = isMyTasksTab ? isMyLoading : isAvailableLoading;
  const isError = isMyTasksTab ? isMyError : isAvailableError;
  const error = isMyTasksTab ? myError : availableError;
  const activeData = isMyTasksTab ? myData : availableData;

  const rawTasks = activeData?.items ?? [];
  const totalPages = activeData?.totalPages ?? 1;
  const totalItems = activeData?.totalItems ?? 0;

  const tasks = useMemo(
    () => (isMyTasksTab ? filterMyTasks(rawTasks, myStatusFilter, debouncedSearch) : rawTasks),
    [rawTasks, isMyTasksTab, myStatusFilter, debouncedSearch],
  );

  // Quick at-a-glance counts for the "Việc của tôi" tab (from loaded items)
  const myStats = useMemo(() => {
    const all = myData?.items ?? [];
    return {
      active: all.filter((t) => ACTIVE_TASK_STATUSES.includes(normalizeTaskStatus(t.status))).length,
      review: all.filter((t) => normalizeTaskStatus(t.status) === 'Submitted').length,
      done: all.filter((t) => normalizeTaskStatus(t.status) === 'Approved').length,
    };
  }, [myData]);

  const isFilteredView = isMyTasksTab && hasActiveFilters;

  // ─── Mutations ─────────────────────────────────────────────
  const acceptMutation = useAcceptTask();
  const handleAcceptTask = async (taskId: number) => {
    try {
      await acceptMutation.mutateAsync(taskId);
      setPreviewTask(null);
      toast.success('Nhận việc thành công!');
    } catch {
      toast.error('Lỗi khi nhận việc');
    }
  };

  // ─── Derived pagination ────────────────────────────────────
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalItems);
  const showPagination = !(isMyTasksTab && isFilteredView) && totalPages > 1;

  // ─── Render ────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10">
            <ClipboardList size={22} className="text-brand" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary">Danh sách công việc</h1>
              <HelpTip
                title="Cách nhận & nộp việc"
                ariaLabel="Hướng dẫn nhận và nộp việc"
                placement="bottom-start"
                width="22rem"
                autoCloseMs={0}
                content={
                  <div className="space-y-2">
                    <div>
                      <p className="mb-0.5 font-medium text-text-primary">Quy trình</p>
                      <ol className="m-0 list-decimal space-y-0.5 pl-4">
                        <li>
                          Tab <strong className="text-brand">Việc có sẵn</strong> → xem{' '}
                          <strong>vùng cần vẽ</strong> trên ảnh trang, rồi bấm{' '}
                          <strong>Nhận việc</strong> nếu phù hợp kỹ năng.
                        </li>
                        <li>
                          Tab <strong className="text-brand">Việc của tôi</strong> → làm và{' '}
                          <strong>nộp bài</strong>.
                        </li>
                        <li>Mangaka duyệt → tiền tự động vào ví của bạn.</li>
                      </ol>
                    </div>
                    <div>
                      <p className="mb-0.5 font-medium text-text-primary">Trạng thái</p>
                      <ul className="m-0 list-none space-y-0.5 p-0">
                        <li><span className="font-medium text-info">Đang làm</span> — cần nộp bài.</li>
                        <li><span className="font-medium text-danger">Cần sửa</span> — xem góp ý & nộp lại.</li>
                        <li><span className="font-medium text-warning">Chờ duyệt</span> — đợi Mangaka kiểm tra.</li>
                        <li><span className="font-medium text-success">Hoàn thành</span> — đã nhận tiền.</li>
                      </ul>
                    </div>
                    <p className="text-text-muted">
                      Chip <strong className="text-danger">deadline đỏ</strong> = task sắp hoặc đã quá hạn.
                    </p>
                  </div>
                }
              />
            </div>
            <p className="mt-0.5 text-xs text-text-muted">
              {isMyTasksTab ? 'Theo dõi và nộp bài các task đã nhận' : 'Tìm và nhận task phù hợp kỹ năng'}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <MotionStagger className="flex flex-wrap gap-2">
          {(isMyTasksTab
            ? [
                { label: 'Việc cần xử lý', value: myStats.active, icon: ListChecks, color: 'text-info', bg: 'bg-info/10' },
                { label: 'Chờ duyệt', value: myStats.review, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
                { label: 'Hoàn thành', value: myStats.done, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
              ]
            : [
                { label: 'Đang chờ nhận', value: totalItems, icon: Unlock, color: 'text-brand', bg: 'bg-brand/10' },
              ]
          ).map((s) => (
            <MotionItem key={s.label}>
            <div
              className="flex items-center gap-2.5 rounded-xl border border-border-custom bg-bg-secondary px-3 py-2"
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon size={15} className={s.color} />
              </span>
              <div>
                <p className={`text-lg font-bold leading-none tabular-nums ${s.color}`}>{s.value}</p>
                <p className="mt-1 text-[10px] text-text-muted">{s.label}</p>
              </div>
            </div>
            </MotionItem>
          ))}
        </MotionStagger>
      </header>

      {/* Toolbar: tabs + search + filter */}
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Tabs */}
        <div className="flex w-fit shrink-0 gap-1 rounded-xl border border-border-custom bg-bg-secondary p-1">
          {(
            [
              { key: 'Available' as const, label: 'Việc có sẵn', icon: Unlock },
              { key: 'MyTasks' as const, label: 'Việc của tôi', icon: ListChecks },
            ]
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTabChange(key)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border-none px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={
              isMyTasksTab
                ? 'Tìm theo tên task, mangaka, trang, số tiền…'
                : 'Tìm theo kỹ năng (coloring, background, shading…)'
            }
            className="w-full rounded-xl border border-border-custom bg-bg-secondary py-2.5 pl-10 pr-10 text-sm text-text-primary transition-all placeholder:text-text-muted focus:border-brand/50 focus:outline-none focus:ring-1 focus:ring-brand/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent p-0.5 text-text-muted hover:text-text-primary"
              aria-label="Xóa tìm kiếm"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {isMyTasksTab && (
          <div className="w-full shrink-0 lg:w-[190px]">
            <CustomSelect
              options={ASSISTANT_MY_TASK_SELECT_OPTIONS}
              value={myStatusFilter || 'all'}
              onChange={(v) => {
                setMyStatusFilter(v === 'all' ? '' : (v as MyStatusFilter));
                setCurrentPage(1);
              }}
              placeholder="Trạng thái"
              icon={<Filter size={14} />}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Result summary */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-text-muted">
          <span className="font-semibold text-text-primary">
            {isMyTasksTab ? tasks.length : totalItems}
          </span>{' '}
          task
          {isFilteredView && tasks.length !== rawTasks.length && (
            <span className="text-text-muted"> / {rawTasks.length}</span>
          )}
          {debouncedSearch && (
            <>
              {' '}
              khớp “<span className="font-medium text-brand">{debouncedSearch}</span>”
            </>
          )}
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 border-none bg-transparent text-xs font-medium text-brand hover:text-brand-hover"
          >
            <RotateCcw size={12} />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <Loader2 size={30} className="animate-spin text-brand" />
        </div>
      ) : isError ? (
        <div className="mt-4 flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-danger/20 bg-danger/5 p-10 text-center">
          <X size={32} className="text-danger" />
          <p className="text-sm text-text-secondary">
            {error?.message || 'Không thể tải danh sách tasks. Vui lòng thử lại.'}
          </p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-custom bg-bg-secondary/50 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-surface">
            <ClipboardList size={28} className="text-text-muted" />
          </div>
          <p className="max-w-xs text-sm text-text-secondary">
            {hasActiveFilters
              ? 'Không có task nào khớp bộ lọc hiện tại.'
              : isMyTasksTab
                ? 'Bạn chưa nhận task nào. Hãy xem tab “Việc có sẵn”.'
                : 'Hiện không có công việc nào đang chờ nhận.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="cursor-pointer rounded-lg border-none bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <MotionTabPanel tabKey={activeTab} className="mt-4">
          <motion.div
            className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
          {tasks.map((task: AvailableTaskDto) => (
            <MotionListItem key={task.id}>
            <AssistantTaskCard
              task={task}
              variant={isMyTasksTab ? 'my' : 'available'}
              acceptPending={acceptMutation.isPending}
              onAccept={() => task.id && handleAcceptTask(task.id)}
              onOpenDetail={isMyTasksTab ? () => setDetailTask(task) : undefined}
              onOpenRegionPreview={!isMyTasksTab ? () => setPreviewTask(task) : undefined}
            />
            </MotionListItem>
          ))}
          </motion.div>
        </MotionTabPanel>
      )}

      {showPagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageRange={buildPageRange(currentPage, totalPages)}
          totalItems={totalItems}
          startItem={startItem}
          endItem={endItem}
          canGoNext={currentPage < totalPages}
          canGoPrev={currentPage > 1}
          onPageChange={setCurrentPage}
          onNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          onPrevPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
          itemLabel="tasks"
        />
      )}

      {detailTask && (
        <AssistantTaskDetailModal task={detailTask} onClose={() => setDetailTask(null)} />
      )}

      {previewTask && (
        <TaskRegionPreviewModal
          task={previewTask}
          acceptPending={acceptMutation.isPending}
          onAccept={() => previewTask.id && handleAcceptTask(previewTask.id)}
          onClose={() => setPreviewTask(null)}
        />
      )}
    </div>
  );
};
