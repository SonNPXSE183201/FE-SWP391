import { useState } from 'react';
import {
  ClipboardList, Clock, Download, Loader2, Search, User,
  Image as ImageIcon,
  DollarSign,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { TASK_STATUS_CONFIG, formatDeadline, useAvailableTasks, useAssistantMyTasks, useAcceptTask, useRequestExtension } from '../index';
import { formatVND } from '../../wallet';
import { useDebounce } from '../../../hooks/useDebounce';
import { Pagination } from '../../../components/common/Pagination';
import type { AvailableTaskDto } from '../hooks/useTasks';
import type { TaskStatus } from '../../../types/entities';
import { useQueryClient } from '@tanstack/react-query';
import { validatePngTransparent } from '../../../utils/validatePngTransparent';

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

  const handleTabChange = (tab: 'Available' | 'MyTasks') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSkillSearchChange = (value: string) => {
    setSkillSearch(value);
    setCurrentPage(1);
  };

  // ─── React Query: available tasks (server-side pagination) ───
  const {
    data: availableData,
    isLoading: isAvailableLoading,
    isError: isAvailableError,
    error: availableError,
  } = useAvailableTasks({
    page: currentPage,
    pageSize: PAGE_SIZE,
    skill: debouncedSkill || undefined,
  });

  const {
    data: myData,
    isLoading: isMyLoading,
    isError: isMyError,
    error: myError,
  } = useAssistantMyTasks({
    page: currentPage,
    pageSize: PAGE_SIZE,
  });

  const isMyTasksTab = activeTab === 'MyTasks';
  const isLoading = isMyTasksTab ? isMyLoading : isAvailableLoading;
  const isError = isMyTasksTab ? isMyError : isAvailableError;
  const error = isMyTasksTab ? myError : availableError;
  const activeData = isMyTasksTab ? myData : availableData;

  const tasks = activeData?.items ?? [];
  const totalPages = activeData?.totalPages ?? 1;
  const totalItems = activeData?.totalItems ?? 0;

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

  // ─── Mutation: nộp bài & gia hạn ───
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File>>({});
  const [extendingTaskId, setExtendingTaskId] = useState<number | null>(null);
  const [extensionReason, setExtensionReason] = useState('');
  const queryClient = useQueryClient();
  const extensionMutation = useRequestExtension();

  const handleFileChange = (taskId: number, file: File | null) => {
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [taskId]: file }));
    } else {
      setSelectedFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[taskId];
        return newFiles;
      });
    }
  };

  const handleSubmitResult = async (taskId: number) => {
    const file = selectedFiles[taskId];
    if (!file) {
      toast.error('Vui lòng chọn file kết quả trước khi nộp!');
      return;
    }

    const validation = await validatePngTransparent(file);
    if (!validation.valid) {
      toast.error(validation.message || 'File PNG không hợp lệ');
      return;
    }

    try {
      const { taskApi } = await import('../api/task.api');
      await taskApi.submitResult(String(taskId), { taskId: String(taskId), image: file, comment: '' });
      toast.success('Nộp kết quả thành công!');
      queryClient.invalidateQueries({ queryKey: ['tasks', 'assistant-my'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'mangaka'] });
      // clear file
      handleFileChange(taskId, null);
    } catch {
      toast.error('Lỗi khi nộp bài');
    }
  };

  const handleRequestExtension = async (taskId: number, days: 1 | 2) => {
    if (!extensionReason.trim()) {
      toast.error('Vui lòng nhập lý do xin gia hạn');
      return;
    }
    try {
      await extensionMutation.mutateAsync({ taskId: String(taskId), days, reason: extensionReason.trim() });
      toast.success(`Đã xin gia hạn thêm ${days * 24}h thành công!`);
      setExtendingTaskId(null);
      setExtensionReason('');
    } catch {
      toast.error('Lỗi khi xin gia hạn');
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
      <div className="flex items-center gap-4 bg-gradient-to-r from-bg-secondary to-transparent p-6 rounded-2xl border border-border-custom">
        <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center shadow-[0_0_15px_rgba(var(--brand),0.15)] border border-brand/20">
          <ClipboardList size={26} className="text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Danh sách công việc</h1>
          <p className="text-sm text-text-muted mt-1">{totalItems} task hiện có</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border-custom mt-8 relative">
        {(['Available', 'MyTasks'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-6 py-3.5 text-sm font-bold transition-all duration-300 relative border-none bg-transparent cursor-pointer ${activeTab === tab
                ? 'text-brand'
                : 'text-text-secondary hover:text-text-primary'
              }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              {tab === 'Available' ? '🔓 Việc có sẵn' : '📋 Việc của tôi'}
            </span>
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-brand rounded-t-full shadow-[0_-2px_10px_rgba(var(--brand),0.5)] z-20"></div>
            )}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-brand/10 to-transparent z-0"></div>
            )}
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
            onChange={(e) => handleSkillSearchChange(e.target.value)}
            placeholder="Tìm theo kỹ năng (ví dụ: coloring, background, shading...)"
            className="w-full pl-10 pr-10 py-2.5 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
          />
          {skillSearch && (
            <button
              onClick={() => handleSkillSearchChange('')}
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
          const statusKey = task.status as TaskStatus;
          const statusCfg = TASK_STATUS_CONFIG[statusKey] || {
            label: task.status,
            color: 'text-text-muted',
            bg: 'bg-bg-surface',
            icon: Clock,
          };
          const StatusIcon = statusCfg.icon;
          const dl = task.deadline ? formatDeadline(task.deadline) : null;

          return (
            <div
              key={task.id}
              className="group relative bg-bg-secondary border border-border-custom rounded-2xl p-5 hover:border-brand/40 hover:shadow-lg-custom hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Optional background glow for Pending tasks */}
              {activeTab === 'Available' && task.status === 'Pending' && (
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/5 blur-3xl rounded-full z-0 transition-all group-hover:bg-brand/10"></div>
              )}

              <div className="flex items-start gap-5 relative z-10">
                {/* Left: Status icon */}
                <div className={`w-12 h-12 rounded-2xl ${statusCfg.bg} flex items-center justify-center flex-shrink-0 shadow-sm border border-black/5`}>
                  <StatusIcon size={22} className={statusCfg.color} />
                </div>

                {/* Middle: Task info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-base font-bold text-text-primary group-hover:text-brand transition-colors line-clamp-1">
                      {task.description || 'Untitled Task'}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusCfg.bg} ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Meta info row */}
                  <div className="flex items-center gap-5 mt-3 flex-wrap">
                    {/* Payment */}
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand bg-brand/10 px-3 py-1.5 rounded-lg border border-brand/20">
                      <DollarSign size={14} />
                      {formatVND(task.paymentAmount ?? 0)}
                    </span>

                    {/* Mangaka */}
                    {task.mangakaName && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-secondary bg-bg-surface px-2.5 py-1 rounded-lg">
                        <User size={13} />
                        {task.mangakaName}
                      </span>
                    )}

                    {/* Page number */}
                    {(task.pageNumber ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-secondary bg-bg-surface px-2.5 py-1 rounded-lg">
                        <ImageIcon size={13} />
                        Trang {task.pageNumber}
                      </span>
                    )}

                    {/* Deadline */}
                    {dl && (
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${dl.urgent ? 'text-danger bg-danger/10 border border-danger/20' : 'text-text-muted bg-bg-surface'}`}>
                        <Clock size={13} />
                        {dl.text}
                      </span>
                    )}
                  </div>

                  {/* Feedback Comment (For Revision) */}
                  {task.feedbackComment && task.status === 'Revision' && (
                    <div className="mt-3 p-3 bg-danger/5 border border-danger/20 rounded-lg flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] text-danger font-bold">!</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-semibold text-danger mb-0.5">Mangaka yêu cầu sửa đổi:</p>
                        <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap">
                          {task.feedbackComment}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Page image preview */}
                  {task.pageImageUrl && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-border-custom w-fit bg-black/20">
                      <img
                        src={task.pageImageUrl}
                        alt={`Trang ${task.pageNumber}`}
                        className="h-24 w-auto object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in opacity-80 hover:opacity-100"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>

                {/* Right: Accept button */}
                {activeTab === 'Available' && task.status === 'Pending' && (
                  <div className="flex-shrink-0 ml-auto flex items-center justify-center pt-2">
                    <button
                      onClick={() => handleAcceptTask(task.id!)}
                      disabled={acceptMutation.isPending}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-bold transition-all border-none cursor-pointer shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download size={16} />
                      Nhận việc ngay
                    </button>
                  </div>
                )}

                {/* Right: Submit button & Extension */}
                {activeTab === 'MyTasks' && ['In_Progress', 'Revision'].includes(task.status || '') && (
                  <div className="flex-shrink-0 ml-auto flex flex-col gap-3 items-end pt-1">
                    <label className="cursor-pointer px-4 py-2 bg-bg-surface hover:bg-bg-secondary border border-border-custom rounded-xl text-xs font-semibold hover:border-brand/30 transition-all text-text-primary shadow-sm flex items-center gap-2">
                      <ImageIcon size={14} className="text-text-muted" />
                      {selectedFiles[task.id!] ? selectedFiles[task.id!].name : 'Chọn File PNG'}
                      <input
                        type="file"
                        accept="image/png,.png"
                        className="hidden"
                        onChange={(e) => handleFileChange(task.id!, e.target.files?.[0] || null)}
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      {extendingTaskId === task.id ? (
                        <div className="flex flex-col items-end gap-2 animate-fade-in min-w-[220px] bg-bg-surface p-3 rounded-xl border border-border-custom">
                          <textarea
                            value={extensionReason}
                            onChange={(e) => setExtensionReason(e.target.value)}
                            placeholder="Lý do xin gia hạn..."
                            className="w-full px-3 py-2 bg-bg-secondary border border-border-custom rounded-lg text-[11px] text-text-primary resize-none h-16 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
                          />
                          <div className="flex items-center gap-1.5 w-full">
                            <button
                              onClick={() => handleRequestExtension(task.id!, 1)}
                              disabled={extensionMutation.isPending || !!task.extensionRequestDays}
                              className="flex-1 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand rounded-lg text-[11px] font-bold border-none cursor-pointer disabled:opacity-50 transition-colors"
                            >
                              +24h
                            </button>
                            <button
                              onClick={() => handleRequestExtension(task.id!, 2)}
                              disabled={extensionMutation.isPending || !!task.extensionRequestDays}
                              className="flex-1 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand rounded-lg text-[11px] font-bold border-none cursor-pointer disabled:opacity-50 transition-colors"
                            >
                              +48h
                            </button>
                            <button
                              onClick={() => { setExtendingTaskId(null); setExtensionReason(''); }}
                              className="px-3 py-1.5 bg-bg-secondary hover:bg-border-custom text-text-secondary rounded-lg text-[11px] font-medium border-none cursor-pointer transition-colors"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setExtendingTaskId(task.id!)}
                          disabled={!!task.extensionRequestDays}
                          className="px-4 py-2 bg-bg-surface hover:bg-bg-secondary border border-border-custom text-text-secondary rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                          title={task.extensionRequestDays ? 'Task đã xin gia hạn' : undefined}
                        >
                          {task.extensionRequestDays ? 'Đã gia hạn' : 'Xin gia hạn'}
                        </button>
                      )}
                      <button
                        onClick={() => handleSubmitResult(task.id!)}
                        disabled={!task.id || !selectedFiles[task.id]}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-success hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-all border-none cursor-pointer shadow-success hover:shadow-success-hover hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download size={16} />
                        Nộp bài
                      </button>
                    </div>
                  </div>
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