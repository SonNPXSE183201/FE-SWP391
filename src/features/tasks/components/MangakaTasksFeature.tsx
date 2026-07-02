import { useState, useMemo, useEffect } from 'react';
import {
  ClipboardList, Search, Eye,
  UserCheck, Calendar, DollarSign, Filter, ArrowUpDown,
  Clock, Loader2, X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { 
  TASK_STATUS_FILTER_OPTIONS,
  OPEN_TASK_STATUSES,
  REVIEWABLE_TASK_STATUSES,
  getTaskStatusConfig,
  formatDeadline,
  useMangakaTasks,
  useApproveExtension,
  TaskReviewModal,
} from '../index';
import type { TasksDto } from '../../../api/generated/types';
import { formatVND } from '../../wallet';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination } from '../../../components/common/Pagination';
import { CustomSelect } from '../../../components/common/CustomSelect';
import { HelpTip } from '../../../components/common/HelpTip';
import { normalizeTaskStatus, taskStatusMatchesFilter, toSelectFilterOptions } from '../../../utils/status';

export const MangakaTasksFeature = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'deadline' | 'amount'>('newest');

  const { data: tasks = [], isLoading, error } = useMangakaTasks();
  const extensionMutation = useApproveExtension();

  // ─── Review (xem bài nộp) Modal State ───
  const [reviewTask, setReviewTask] = useState<TasksDto | null>(null);

  const handleApproveExtension = async (taskId: string, approve: boolean) => {
    try {
      await extensionMutation.mutateAsync({ taskId, approve });
      toast.success(approve ? 'Đã duyệt gia hạn!' : 'Đã từ chối gia hạn');
    } catch {
      toast.error('Lỗi khi xử lý yêu cầu gia hạn');
    }
  };

  const filtered = useMemo(() => {
    const result = tasks.filter((t) => {
      const matchesSearch = !searchQuery ||
        (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.regionId?.toString().includes(searchQuery.toLowerCase()) ||
        t.mangakaId?.toString().includes(searchQuery.toLowerCase()) ||
        (t.assistantName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = taskStatusMatchesFilter(t.status, statusFilter);
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === 'deadline') return new Date(a.deadline || '').getTime() - new Date(b.deadline || '').getTime();
      if (sortBy === 'amount') return (b.paymentAmount || 0) - (a.paymentAmount || 0);
      return new Date(b.createAt || '').getTime() - new Date(a.createAt || '').getTime();
    });

    return result;
  }, [tasks, searchQuery, statusFilter, sortBy]);

  // Pagination
  const pagination = usePagination(filtered, { pageSize: 10 });

  // Reset to page 1 when filters change
  useEffect(() => {
    pagination.goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: tasks.length,
    inProgress: tasks.filter((t) => normalizeTaskStatus(t.status) === 'In_Progress').length,
    pendingReview: tasks.filter((t) => normalizeTaskStatus(t.status) === 'Pending_Review').length,
    totalLocked: tasks
      .filter((t) => t.status && OPEN_TASK_STATUSES.includes(normalizeTaskStatus(t.status)))
      .reduce((sum, t) => sum + (t.paymentAmount || 0), 0),
  }), [tasks]);

  const hasActiveFilters = !!searchQuery.trim() || !!statusFilter || sortBy !== 'newest';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-muted">Không thể tải danh sách công việc. Vui lòng thử lại.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <ClipboardList size={20} className="text-brand" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary">Quản lý công việc</h1>
              <HelpTip
                title="Giải thích"
                ariaLabel="Giải thích quản lý công việc"
                placement="bottom-start"
                width="22rem"
                content={(
                  <div className="space-y-2">
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Đây là nơi bạn theo dõi các vùng đã giao trợ lý và duyệt bài nộp.
                    </p>
                    <ul className="text-xs text-text-secondary leading-relaxed space-y-1 pl-4">
                      <li><span className="text-text-primary font-medium">Chờ duyệt</span>: Trợ lý đã nộp, bạn mở xem và duyệt/sửa.</li>
                      <li><span className="text-text-primary font-medium">Tiền tạm giữ</span>: tổng tiền đang giữ cho các công việc chưa kết thúc.</li>
                    </ul>
                  </div>
                )}
              />
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Tìm nhanh, lọc trạng thái, xem bài nộp và xử lý gia hạn
            </p>
          </div>
        </div>
      </div>

      {/* Stats (Dashboard cards) */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatPill label="Tổng công việc" value={String(stats.total)} icon={ClipboardList} tone="text-brand" />
        <StatPill label="Đang làm" value={String(stats.inProgress)} icon={Clock} tone="text-info" />
        <StatPill label="Chờ duyệt" value={String(stats.pendingReview)} icon={Eye} tone="text-warning" />
        <StatPill
          label="Tiền tạm giữ"
          value={formatVND(stats.totalLocked)}
          icon={DollarSign}
          tone="text-danger"
          help={(
            <div className="space-y-2">
              <p className="text-xs text-text-secondary leading-relaxed">
                Là tổng tiền đang giữ cho các công việc chưa kết thúc (Chờ nhận việc/Đang làm/Chờ duyệt/Yêu cầu sửa).
              </p>
            </div>
          )}
        />
      </div>

      {/* Filters */}
      <div className="mt-4 bg-bg-secondary border border-border-custom rounded-xl p-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo mô tả, ID vùng, tên trợ lý..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-primary/40 border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-[170px]">
              <CustomSelect
                options={toSelectFilterOptions(TASK_STATUS_FILTER_OPTIONS)}
                value={statusFilter}
                onChange={(v) => setStatusFilter(v)}
                placeholder="Trạng thái"
                icon={<Filter size={14} />}
                size="sm"
              />
            </div>
            <div className="w-[150px]">
              <CustomSelect
                options={[
                  { value: 'newest', label: 'Mới nhất' },
                  { value: 'deadline', label: 'Deadline' },
                  { value: 'amount', label: 'Số tiền' },
                ]}
                value={sortBy}
                onChange={(v) => setSortBy(v as typeof sortBy)}
                icon={<ArrowUpDown size={14} />}
                size="sm"
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setSortBy('newest');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-bg-primary/40 border border-border-custom text-text-secondary hover:text-text-primary hover:border-brand/30 transition-colors cursor-pointer text-xs font-medium"
                title="Xóa bộ lọc"
              >
                <X size={14} />
                Xóa lọc
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 text-[11px] text-text-muted">
          <span>
            Hiển thị <span className="text-text-primary font-medium">{filtered.length}</span> / {tasks.length} công việc
          </span>
          {statusFilter && (
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand" />
              Lọc theo trạng thái
            </span>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3 mt-3">
        {pagination.paginatedData.map((task) => {
          const statusCfg = getTaskStatusConfig(task.status);
          const StatusIcon = statusCfg.icon;
          const dl = formatDeadline(task.deadline || '');

          const reviewable = REVIEWABLE_TASK_STATUSES.includes(normalizeTaskStatus(task.status));

          return (
            <div
              key={task.id}
              onClick={() => reviewable && setReviewTask(task)}
              className={`group bg-bg-secondary border border-border-custom rounded-xl p-4 hover:border-brand/20 transition-all ${reviewable ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* Left: Icon + Info */}
                <div className={`w-10 h-10 rounded-xl ${statusCfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <StatusIcon size={18} className={statusCfg.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors">
                      {task.description || `Công việc ${task.id} - Vùng ${task.regionId}`}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                    {!!task.extensionRequestDays && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-warning/10 text-warning text-[9px] font-medium">
                        Đã gia hạn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {[`Vùng ${task.regionId}`, `Trang ${task.pageNumber || '—'}`, task.assistantId ? `Trợ lý #${task.assistantId}` : ''].filter(Boolean).join(' · ')}
                  </p>

                  {/* Bottom row */}
                  <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                    {/* Assistant */}
                    <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary">
                      <UserCheck size={12} />
                      {task.assistantName || <span className="text-text-muted italic">Chờ Trợ lý nhận việc</span>}
                    </span>

                    {/* Amount */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-primary">
                      <DollarSign size={12} className="text-text-muted" />
                      {formatVND(task.paymentAmount || 0)}
                    </span>

                    {/* Deadline */}
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${dl.urgent ? 'text-danger' : 'text-text-muted'}`}>
                      <Calendar size={12} />
                      {dl.text}
                    </span>
                  </div>

                  {task.extensionStatus === 'Pending' && (
                    <div className="mt-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
                      <div className="flex items-start gap-2">
                        <Clock size={14} className="text-warning mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-warning">Yêu cầu gia hạn deadline</p>
                          <p className="text-[11px] text-text-secondary mt-0.5">
                            +{task.extensionRequestDays ?? '?'} ngày
                            {task.extensionReason ? ` — ${task.extensionReason}` : ''}
                          </p>
                        </div>
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApproveExtension(String(task.id), true); }}
                            disabled={extensionMutation.isPending}
                            className="px-2.5 py-1 rounded-lg bg-success/10 text-success text-[10px] font-medium hover:bg-success/20 transition-colors border-none cursor-pointer disabled:opacity-50"
                          >
                            Duyệt GH
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApproveExtension(String(task.id), false); }}
                            disabled={extensionMutation.isPending}
                            className="px-2.5 py-1 rounded-lg bg-danger/10 text-danger text-[10px] font-medium hover:bg-danger/20 transition-colors border-none cursor-pointer disabled:opacity-50"
                          >
                            Từ chối
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Removed Result Image Preview as not present in TasksDto */}
                </div>

                {/* Action: xem bài nộp rồi mới duyệt/sửa đổi */}
                {task.status === 'Pending_Review' && (
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setReviewTask(task); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-[11px] font-medium hover:bg-brand/20 transition-colors border-none cursor-pointer"
                    >
                      <Eye size={13} />
                      Xem bài nộp
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 bg-bg-secondary border border-border-custom rounded-xl p-12 flex flex-col items-center gap-4">
          <ClipboardList size={40} className="text-text-muted" />
          <p className="text-sm text-text-secondary">Không tìm thấy task nào</p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageRange={pagination.pageRange}
        totalItems={pagination.totalItems}
        startItem={pagination.startItem}
        endItem={pagination.endItem}
        canGoNext={pagination.canGoNext}
        canGoPrev={pagination.canGoPrev}
        onPageChange={pagination.goToPage}
        onNextPage={pagination.nextPage}
        onPrevPage={pagination.prevPage}
        itemLabel="công việc"
      />

      {/* ─── Review (xem bài nộp + ghim lỗi Canvas) Modal ─── */}
      {reviewTask && (
        <TaskReviewModal
          task={reviewTask}
          onClose={() => setReviewTask(null)}
        />
      )}

    </div>
  );
};

const StatPill = ({
  label,
  value,
  icon: Icon,
  tone,
  help,
}: {
  label: string;
  value: string;
  icon: typeof ClipboardList;
  tone: string;
  help?: React.ReactNode;
}) => (
  <div className="relative overflow-hidden group flex items-center gap-4 px-5 py-4 rounded-2xl bg-bg-secondary border border-border-custom shadow-sm hover:border-brand/30 hover:shadow-md transition-all duration-300">
    {/* Decorative background circle */}
    <div className={`absolute right-0 top-0 w-24 h-24 rounded-full ${tone.replace('text-', 'bg-')}/5 -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110`} />
    
    <div className={`w-12 h-12 rounded-xl bg-bg-surface flex items-center justify-center flex-shrink-0 ${tone} shadow-sm group-hover:scale-105 transition-transform duration-300`}>
      <Icon size={24} />
    </div>
    <div className="flex-col relative z-10">
      <div className="text-2xl font-bold text-text-primary tracking-tight">{value}</div>
      <div className="text-[11px] font-medium text-text-muted mt-0.5 inline-flex items-center gap-1.5 uppercase tracking-wide">
        {label}
        {help && (
          <div className="text-text-muted hover:text-text-primary transition-colors">
            <HelpTip
              title={label}
              ariaLabel={`Giải thích ${label}`}
              placement="bottom-start"
              width="20rem"
              content={help}
            />
          </div>
        )}
      </div>
    </div>
  </div>
);
