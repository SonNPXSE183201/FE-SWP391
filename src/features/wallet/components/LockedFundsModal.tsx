import { createPortal } from 'react-dom';
import { X, Lock, Loader2, Calendar } from 'lucide-react';
import { formatVND } from '../constants';
import { useMangakaTasks, OPEN_TASK_STATUSES, getTaskStatusConfig, formatDeadline } from '../../tasks';
import { normalizeTaskStatus } from '../../../utils/status';
import { useMemo } from 'react';

interface LockedFundsModalProps {
  onClose: () => void;
}

export const LockedFundsModal = ({ onClose }: LockedFundsModalProps) => {
  const { data: tasks = [], isLoading, error } = useMangakaTasks();

  const lockedTasks = useMemo(() => {
    return tasks.filter((t) => t.status && OPEN_TASK_STATUSES.includes(normalizeTaskStatus(t.status)));
  }, [tasks]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-secondary border border-border-custom rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-lg-custom animate-modal-enter">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-custom flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
              <Lock size={18} className="text-warning" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Chi tiết tiền đang khóa</h2>
              <p className="text-xs text-text-muted mt-0.5">Danh sách các công việc chưa hoàn tất</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-bg-surface hover:bg-bg-primary flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Loader2 size={24} className="text-brand animate-spin" />
              <p className="text-sm text-text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-sm text-danger text-center">Có lỗi xảy ra khi tải danh sách công việc.</p>
            </div>
          ) : lockedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <Lock size={32} className="text-text-muted mb-3 opacity-50" />
              <p className="text-sm text-text-secondary">Không có công việc nào đang khóa tiền.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lockedTasks.map((task) => {
                const statusCfg = getTaskStatusConfig(task.status);
                const dl = formatDeadline(task.deadline || '');

                return (
                  <div key={task.id} className="bg-bg-surface border border-border-custom rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                        <span className="text-[11px] text-text-muted font-mono">#{task.id}</span>
                      </div>
                      <h3 className="text-sm font-medium text-text-primary">
                        {task.description || 'Nhiệm vụ vẽ'}
                      </h3>
                      {task.assistantName && (
                        <p className="text-[11px] text-text-secondary mt-1">Trợ lý: {task.assistantName}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
                      <div className="text-sm font-bold text-text-primary">
                        {formatVND(task.paymentAmount || 0)}
                      </div>
                      <div className={`flex items-center gap-1 mt-1 text-[11px] ${dl.urgent ? 'text-danger' : 'text-text-muted'}`}>
                        <Calendar size={12} />
                        <span>{dl.text}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-custom flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 bg-bg-surface border border-border-custom rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
