import { useState, useMemo, useEffect } from 'react';
import {
  ClipboardList, Plus, Search, ChevronDown, Eye,
  UserCheck, X, Send, Calendar, DollarSign, Filter, ArrowUpDown, AlertCircle,
  Clock,
} from 'lucide-react';

// ─── Import from features (Feature-Driven Architecture) ─────
import { TASK_STATUS_CONFIG, TASK_STATUS_FILTER_OPTIONS, formatDeadline, MOCK_TASKS } from '../../features/tasks';
import { formatVND } from '../../features/wallet';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/common/Pagination';


// ─── Create Task Modal ──────────────────────────────────────
const CreateTaskModal = ({ onClose }: { onClose: () => void }) => {
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setCreating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-lg shadow-lg-custom animate-scale-in">
        <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
              <Plus size={18} className="text-brand" />
            </div>
            <h2 className="text-base font-semibold text-text-primary">Tạo Task mới</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors bg-transparent border-none cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Region / Vùng cần vẽ</label>
            <select className="w-full px-3 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand/50 cursor-pointer appearance-none">
              <option>Chọn region từ trang...</option>
              <option>Panel A1 — Trang 5, Ch.4</option>
              <option>Background B1 — Trang 8, Ch.4</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Trợ lý vẽ (Assistant)</label>
            <select className="w-full px-3 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand/50 cursor-pointer appearance-none">
              <option>Chọn assistant...</option>
              <option>Minh Anh — ⭐ 4.8 (24 tasks)</option>
              <option>Thiên Kim — ⭐ 4.5 (18 tasks)</option>
              <option>Đức Minh — ⭐ 4.6 (12 tasks)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                <DollarSign size={11} className="inline mr-0.5" />
                Số tiền (VND)
              </label>
              <input type="number" placeholder="350,000" className="w-full px-3 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                <Calendar size={11} className="inline mr-0.5" />
                Deadline
              </label>
              <input type="date" className="w-full px-3 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all" />
            </div>
          </div>
          <div className="bg-warning/5 border border-warning/20 rounded-xl p-3">
            <p className="text-[11px] text-warning font-medium flex items-center gap-1.5">
              <AlertCircle size={13} />
              Tạo task sẽ Lock số tiền trên từ ví của bạn (T01)
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border-custom flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
            Hủy
          </button>
          <button onClick={handleCreate} disabled={creating} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${creating ? 'bg-brand/50 text-white/70 cursor-not-allowed' : 'bg-brand hover:bg-brand-hover text-white shadow-brand'}`}>
            {creating ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang tạo...</>
            ) : (
              <><Send size={14} />Tạo & Lock tiền</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────
export const MangakaTasksPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'deadline' | 'amount'>('newest');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filtered = useMemo(() => {
    let result = MOCK_TASKS.filter((t) => {
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
  }, [searchQuery, statusFilter, sortBy]);

  // Pagination
  const pagination = usePagination(filtered, { pageSize: 10 });

  // Reset to page 1 when filters change
  useEffect(() => {
    pagination.goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, sortBy]);

  // Stats
  const stats = {
    total: MOCK_TASKS.length,
    inProgress: MOCK_TASKS.filter((t) => t.status === 'In_Progress').length,
    pendingReview: MOCK_TASKS.filter((t) => t.status === 'Pending_Review').length,
    totalLocked: MOCK_TASKS.filter((t) => ['Pending', 'In_Progress', 'Pending_Review', 'Revision'].includes(t.status))
      .reduce((sum, t) => sum + t.amount, 0),
  };

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
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-8 pr-8 py-2.5 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand/50 cursor-pointer min-w-[150px]">
            {TASK_STATUS_FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
        <div className="relative">
          <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="appearance-none pl-8 pr-8 py-2.5 bg-bg-secondary border border-border-custom rounded-xl text-sm text-text-primary focus:outline-none focus:border-brand/50 cursor-pointer">
            <option value="newest">Mới nhất</option>
            <option value="deadline">Deadline</option>
            <option value="amount">Số tiền</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-text-muted mt-4">
        Tìm thấy <span className="text-text-primary font-medium">{filtered.length}</span> / {MOCK_TASKS.length} tasks
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
                      {task.regionLabel}
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
                    {task.pageName} · {task.chapterTitle} · {task.seriesTitle}
                  </p>

                  {/* Bottom row */}
                  <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                    {/* Assistant */}
                    <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary">
                      <UserCheck size={12} />
                      {task.assignedAssistantName || <span className="text-text-muted italic">Chưa phân công</span>}
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
