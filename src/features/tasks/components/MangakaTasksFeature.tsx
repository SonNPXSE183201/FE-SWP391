import { useState, useMemo, useEffect } from 'react';
import {
  ClipboardList, Plus, Search, Eye,
  UserCheck, Calendar, DollarSign, Filter, ArrowUpDown,
  Clock, Loader2,
} from 'lucide-react';

import { TASK_STATUS_CONFIG, TASK_STATUS_FILTER_OPTIONS, formatDeadline, CreateTaskModal, useMangakaTasks } from '../index';
import { formatVND } from '../../wallet';
import { usePagination } from '../../../hooks/usePagination';
import { Pagination } from '../../../components/common/Pagination';
import { CustomSelect } from '../../../components/common/CustomSelect';

export const MangakaTasksFeature = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'deadline' | 'amount'>('newest');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: tasks = [], isLoading, error } = useMangakaTasks();

  const filtered = useMemo(() => {
    let result = tasks.filter((t) => {
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-medium transition-all border-none cursor-pointer shadow-brand hover:shadow-brand-hover hover:-translate-y-0.5"
        >
          <Plus size={16} />
          Tạo Task mới
        </button>
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
                </div>

                {/* Action hints */}
                {task.status === 'Pending_Review' && (
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-[11px] font-medium hover:bg-success/20 transition-colors border-none cursor-pointer">
                      Duyệt
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-[11px] font-medium hover:bg-danger/20 transition-colors border-none cursor-pointer">
                      Revision
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

      {showCreateModal && <CreateTaskModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};
