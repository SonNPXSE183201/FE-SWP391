import { createPortal } from 'react-dom';
import { X, Download } from 'lucide-react';

import type { TasksDto } from '../../../api/generated/types';
import { TaskRegionPreview } from './TaskRegionPreview';
import { formatVND } from '../../wallet';

interface TaskRegionPreviewModalProps {
  task: TasksDto;
  acceptPending?: boolean;
  onAccept?: () => void;
  onClose: () => void;
}

export const TaskRegionPreviewModal = ({
  task,
  acceptPending,
  onAccept,
  onClose,
}: TaskRegionPreviewModalProps) => {
  const canAccept = task.status === 'Pending' && !!onAccept;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border-custom bg-bg-secondary shadow-lg-custom animate-scale-in">
        <div className="flex items-center justify-between gap-3 border-b border-border-custom px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-text-primary">
              {task.description || 'Vùng cần vẽ'}
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              {task.regionName || 'Vùng chưa đặt tên'}
              {(task.pageNumber ?? 0) > 0 && ` · Trang ${task.pageNumber}`}
              {task.mangakaName && ` · ${task.mangakaName}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 cursor-pointer rounded-lg border-none bg-transparent p-2 text-text-muted transition-colors hover:bg-bg-surface hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <TaskRegionPreview
            pageId={task.pageId}
            imageUrl={task.pageImageUrl}
            coordinatesJson={task.regionCoordinatesJson}
            regionName={task.regionName}
            heightClassName="h-[min(60vh,520px)]"
          />
          <p className="mt-3 text-xs leading-relaxed text-text-secondary">
            Vùng được khoanh viền tím là phần Mangaka giao cho bạn vẽ. Xem kỹ trước khi nhận việc.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border-custom bg-bg-surface/50 px-5 py-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">Thù lao</p>
            <p className="text-lg font-bold tabular-nums text-brand">{formatVND(task.paymentAmount ?? 0)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-border-custom bg-bg-secondary px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-surface"
            >
              Đóng
            </button>
            {canAccept && (
              <button
                type="button"
                onClick={onAccept}
                disabled={acceptPending}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-none bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
              >
                <Download size={15} />
                {acceptPending ? 'Đang nhận…' : 'Nhận việc'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
