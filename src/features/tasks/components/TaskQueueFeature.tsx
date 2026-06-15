import { useState, useEffect } from 'react';
import {
  ClipboardList, Clock, Download, Loader2, Search, User,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { TASK_STATUS_CONFIG, formatDeadline, useAvailableTasks, useAcceptTask } from '../index';
import { formatVND } from '../../wallet';
import { useDebounce } from '../../../hooks/useDebounce';
import { Pagination } from '../../../components/common/Pagination';
import type { AvailableTaskDto } from '../hooks/useTasks';
import type { TaskStatus } from '../../../types/entities';

// ─── Server-side pagination state ────────────────────────────
interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageRange: (number | 'ellipsis')[];
}

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

// ─── Component ───────────────────────────────────────────────

const PAGE_SIZE = 10;

export const TaskQueueFeature = () => {
  const [activeTab, setActiveTab] = useState<'Available' | 'MyTasks'>('Available');
  const [skillSearch, setSkillSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSkill = useDebounce(skillSearch, 400);

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSkill]);

  // ─── React Query: available tasks (server-side pagination) ───
  const {
    data: availableData,
    isLoading,
    isError,
    error,
  } = useAvailableTasks({
    page: currentPage,
    pageSize: PAGE_SIZE,
    skill: debouncedSkill || undefined,
  });

  const tasks = availableData?.items ?? [];
  const totalPages = availableData?.totalPages ?? 1;
  const totalItems = availableData?.totalItems ?? 0;

  // ─── Mutation: nhận việc ───
  const acceptMutation = useAcceptTask();

  const handleAcceptTask = async (taskId: number) => {
    try {
      await acceptMutation.mutateAsync(taskId);
      toast.success('Nhận việc thành công!');
    } catch {
      toast.error('Lỗi khi nhận việc');
    }
  };

  // ─── Server-side pagination state for <Pagination> ───
  const paginationState: PaginationState = {
    currentPage,
    totalPages,
    totalItems,
    pageRange: buildPageRange(currentPage, totalPages),
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalItems);

  // ─── Render ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-muted">{error?.message || 'Không thể tải danh sách tasks. Vui lòng thử lại.'}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
          <ClipboardList size={20} className="text-brand" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Danh sách công việc</h1>
          <p className="text-xs text-text-muted mt-0.5">{totalItems} task hiện có</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-custom mt-6">
        {(['Available', 'MyTasks'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 ${
              activeTab === tab
                ? 'border-brand text-brand'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab === 'Available' ? '🔓 Việc có sẵn' : '📋 Việc của tôi'}
          </button>
        ))}
      </div>

      {/* Search bar — tab Available only */}
      {activeTab === 'Available' && (
        <div className="relative mt-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            placeholder="Tìm theo kỹ năng (ví dụ: coloring, background, shading...)"
            className="w-full pl-10 pr-10 py-2.5 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
          />
          {skillSearch && (
            <button
              onClick={() => setSkillSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs border-none bg-transparent cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-text-muted mt-4">
        Tìm thấy <span className="text-text-primary font-medium">{totalItems}</span> tasks
        {debouncedSkill && (
          <> khớp "<span className="text-brand font-medium">{debouncedSkill}</span>"</>
        )}
      </p>

      {/* Task List */}
      <div className="space-y-3 mt-3">
        {tasks.map((task: AvailableTaskDto) => {
          const statusKey = task.Status as TaskStatus;
          const statusCfg = TASK_STATUS_CONFIG[statusKey] ?? {
            label: task.Status,
            color: 'text-text-muted',
            bg: 'bg-bg-surface',
            icon: Clock,
          };
          const StatusIcon = statusCfg.icon;
          const dl = task.Deadline ? formatDeadline(task.Deadline) : null;

          return (
            <div
              key={task.Id}
              className="group bg-bg-secondary border border-border-custom rounded-xl p-4 hover:border-brand/20 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Left: Status icon */}
                <div className={`w-10 h-10 rounded-xl ${statusCfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <StatusIcon size={18} className={statusCfg.color} />
                </div>

                {/* Middle: Task info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors truncate">
                      {task.Description || 'Untitled Task'}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Meta info row */}
                  <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                    {/* Mangaka */}
                    {task.MangakaName && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary">
                        <User size={12} />
                        {task.MangakaName}
                      </span>
                    )}

                    {/* Page number */}
                    {task.PageNumber > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary">
                        <ImageIcon size={12} />
                        Trang {task.PageNumber}
                      </span>
                    )}

                    {/* Payment */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-primary">
                      {formatVND(task.PaymentAmount)}
                    </span>

                    {/* Deadline */}
                    {dl && (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${dl.urgent ? 'text-danger' : 'text-text-muted'}`}>
                        <Clock size={12} />
                        {dl.text}
                      </span>
                    )}
                  </div>

                  {/* Page image preview */}
                  {task.PageImageUrl && (
                    <div className="mt-3">
                      <img
                        src={task.PageImageUrl}
                        alt={`Trang ${task.PageNumber}`}
                        className="h-16 rounded-md border border-border-custom object-cover opacity-60 hover:opacity-100 transition-opacity"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>

                {/* Right: Accept button */}
                {activeTab === 'Available' && task.Status === 'Pending' && (
                  <button
                    onClick={() => handleAcceptTask(task.Id)}
                    disabled={acceptMutation.isPending}
                    className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-xl text-[11px] font-medium transition-all border-none cursor-pointer shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={14} />
                    Nhận việc
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="mt-6 bg-bg-secondary border border-border-custom rounded-xl p-12 flex flex-col items-center gap-4">
          <ClipboardList size={40} className="text-text-muted" />
          <p className="text-sm text-text-secondary">
            {debouncedSkill
              ? `Không tìm thấy công việc nào khớp "${debouncedSkill}"`
              : 'Hiện tại không có công việc nào đang chờ nhận'}
          </p>
        </div>
      )}

      {/* Pagination — reuse shared component */}
      <Pagination
        currentPage={paginationState.currentPage}
        totalPages={paginationState.totalPages}
        pageRange={paginationState.pageRange}
        totalItems={paginationState.totalItems}
        startItem={startItem}
        endItem={endItem}
        canGoNext={currentPage < totalPages}
        canGoPrev={currentPage > 1}
        onPageChange={setCurrentPage}
        onNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        onPrevPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
        itemLabel="tasks"
      />
    </div>
  );
};