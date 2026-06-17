import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ClipboardList, Search, Eye,
  UserCheck, Calendar, DollarSign, Filter, ArrowUpDown,
  Clock, Loader2, AlertCircle, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { 
  TASK_STATUS_CONFIG, 
  TASK_STATUS_FILTER_OPTIONS,
  formatDeadline,
  useMangakaTasks,
  useApproveTask,
  useRequestRevisionTask,
} from '../index';
import { formatVND } from '../../wallet';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination } from '../../../components/common/Pagination';
import { CustomSelect } from '../../../components/common/CustomSelect';

export const MangakaTasksFeature = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'deadline' | 'amount'>('newest');

  const { data: tasks = [], isLoading, error } = useMangakaTasks();
  const approveMutation = useApproveTask();
  const revisionMutation = useRequestRevisionTask();

  // ─── Revision Modal State ───
  const [revisionTaskId, setRevisionTaskId] = useState<string | null>(null);
  const [revisionComment, setRevisionComment] = useState('');
  const [extensionHours, setExtensionHours] = useState<24 | 48>(24);

  const handleApprove = async (taskId: string) => {
    try {
      await approveMutation.mutateAsync(taskId);
      toast.success('Duyệt bài thành công!');
    } catch {
      toast.error('Lỗi khi duyệt bài');
    }
  };

  const submitRevision = async () => {
    if (!revisionTaskId) return;
    if (!revisionComment.trim()) {
      toast.error('Vui lòng nhập yêu cầu sửa đổi!');
      return;
    }

    try {
      await revisionMutation.mutateAsync({ taskId: revisionTaskId, comment: revisionComment, extensionHours });
      toast.success('Yêu cầu sửa đổi thành công!');
      setRevisionTaskId(null);
      setRevisionComment('');
      setExtensionHours(24);
    } catch {
      toast.error('Lỗi khi yêu cầu sửa đổi');
    }
  };

  const filtered = useMemo(() => {
    const result = tasks.filter((t) => {
      const matchesSearch = !searchQuery ||
        t.regionLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.seriesTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.assignedAssistantName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === 'deadline') return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (sortBy === 'amount') return b.amount - a.amount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
    inProgress: tasks.filter((t) => t.status === 'In_Progress').length,
    pendingReview: tasks.filter((t) => t.status === 'Pending_Review').length,
    totalLocked: tasks.filter((t) => ['Pending', 'In_Progress', 'Pending_Review', 'Revision'].includes(t.status))
      .reduce((sum, t) => sum + t.amount, 0),
  }), [tasks]);

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
        <p className="text-text-muted">Không thể tải danh sách tasks. Vui lòng thử lại.</p>
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
            <h1 className="text-xl font-bold text-text-primary">Quản lý Task</h1>
            <p className="text-xs text-text-muted mt-0.5">Phân công và theo dõi công việc trợ lý vẽ</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {[
          { label: 'Tổng Tasks', value: stats.total, icon: ClipboardList, color: 'text-brand' },
          { label: 'Đang thực hiện', value: stats.inProgress, icon: Clock, color: 'text-info' },
          { label: 'Chờ duyệt bài', value: stats.pendingReview, icon: Eye, color: 'text-warning' },
          { label: 'Tiền đang Lock', value: formatVND(stats.totalLocked), icon: DollarSign, color: 'text-danger' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-bg-secondary border border-border-custom rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg bg-bg-surface flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <div className="text-base font-bold text-text-primary">{value}</div>
              <div className="text-[11px] text-text-muted">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text" placeholder="Tìm task, series, assistant..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all"
          />
        </div>
        <div className="w-[170px]">
          <CustomSelect
            options={TASK_STATUS_FILTER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            placeholder="Tất cả trạng thái"
            icon={<Filter size={14} />}
            size="sm"
          />
        </div>
        <div className="w-[140px]">
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
      </div>

      {/* Results count */}
      <p className="text-xs text-text-muted mt-4">
        Tìm thấy <span className="text-text-primary font-medium">{filtered.length}</span> / {tasks.length} tasks
      </p>

      {/* Task List */}
      <div className="space-y-3 mt-3">
        {pagination.paginatedData.map((task) => {
          const statusCfg = TASK_STATUS_CONFIG[task.status];
          const StatusIcon = statusCfg.icon;
          const dl = formatDeadline(task.deadline);

          return (
            <div key={task.id} className="group bg-bg-secondary border border-border-custom rounded-xl p-4 hover:border-brand/20 transition-all cursor-pointer">
              <div className="flex items-start gap-4">
                {/* Left: Icon + Info */}
                <div className={`w-10 h-10 rounded-xl ${statusCfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <StatusIcon size={18} className={statusCfg.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors">
                      {task.taskName}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                    {task.extensionUsed && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-warning/10 text-warning text-[9px] font-medium">
                        Đã gia hạn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {[task.regionLabel, task.pageName, task.chapterTitle, task.seriesTitle].filter(Boolean).join(' · ')}
                  </p>

                  {/* Bottom row */}
                  <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                    {/* Assistant */}
                    <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary">
                      <UserCheck size={12} />
                      {task.assignedAssistantName || <span className="text-text-muted italic">Chờ Trợ lý nhận việc</span>}
                    </span>

                    {/* Amount */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-primary">
                      <DollarSign size={12} className="text-text-muted" />
                      {formatVND(task.amount)}
                    </span>

                    {/* Deadline */}
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${dl.urgent ? 'text-danger' : 'text-text-muted'}`}>
                      <Calendar size={12} />
                      {dl.text}
                    </span>
                  </div>

                  {/* Result Image Preview */}
                  {task.resultImageUrl && (
                    <div className="mt-3">
                      <p className="text-[11px] font-medium text-text-secondary mb-1.5">Kết quả Trợ lý nộp:</p>
                      <a href={task.resultImageUrl} target="_blank" rel="noreferrer">
                        <img 
                          src={task.resultImageUrl} 
                          alt="Kết quả" 
                          className="h-24 md:h-32 rounded-lg border border-border-custom object-cover cursor-zoom-in hover:opacity-90 transition-opacity" 
                        />
                      </a>
                    </div>
                  )}
                </div>

                {/* Action hints */}
                {task.status === 'Pending_Review' && (
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button 
                      onClick={() => handleApprove(task.id)}
                      disabled={approveMutation.isPending}
                      className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-[11px] font-medium hover:bg-success/20 transition-colors border-none cursor-pointer disabled:opacity-50"
                    >
                      Duyệt
                    </button>
                    <button 
                      onClick={() => {
                        setRevisionTaskId(task.id);
                        setRevisionComment('');
                        setExtensionHours(24);
                      }}
                      disabled={revisionMutation.isPending}
                      className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-[11px] font-medium hover:bg-danger/20 transition-colors border-none cursor-pointer disabled:opacity-50"
                    >
                      Sửa đổi
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
        itemLabel="tasks"
      />

      {/* ─── Revision Modal ─── */}
      {revisionTaskId && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setRevisionTaskId(null)}></div>
          <div className="relative bg-bg-secondary w-full max-w-md rounded-2xl border border-border-custom shadow-2xl overflow-hidden flex flex-col animate-scale-in z-10">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-custom">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center text-danger">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Yêu cầu sửa đổi</h2>
                  <p className="text-xs text-text-muted mt-0.5">Task: {tasks.find(t => t.id === revisionTaskId)?.taskName}</p>
                </div>
              </div>
              <button
                onClick={() => setRevisionTaskId(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-surface text-text-muted transition-colors border-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Nhận xét / Yêu cầu sửa đổi <span className="text-danger">*</span>
                </label>
                <textarea
                  value={revisionComment}
                  onChange={(e) => setRevisionComment(e.target.value)}
                  placeholder="Vd: Đổ bóng bị lố quá, bôi bớt đi em..."
                  className="w-full px-4 py-3 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all resize-none h-28"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Gia hạn Deadline (Quy định bắt buộc)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExtensionHours(24)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                      extensionHours === 24
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-border-custom bg-bg-surface text-text-secondary hover:border-text-muted'
                    } cursor-pointer`}
                  >
                    <Clock size={16} />
                    +24 giờ
                  </button>
                  <button
                    onClick={() => setExtensionHours(48)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                      extensionHours === 48
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-border-custom bg-bg-surface text-text-secondary hover:border-text-muted'
                    } cursor-pointer`}
                  >
                    <Clock size={16} />
                    +48 giờ
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-border-custom bg-bg-surface/50">
              <button
                onClick={() => setRevisionTaskId(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors border-none cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={submitRevision}
                disabled={revisionMutation.isPending || !revisionComment.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-danger hover:bg-red-600 transition-colors border-none shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {revisionMutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
