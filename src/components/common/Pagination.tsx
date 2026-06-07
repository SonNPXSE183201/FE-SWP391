import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';

interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Page range with ellipsis markers from usePagination */
  pageRange: (number | 'ellipsis')[];
  /** Total number of items */
  totalItems: number;
  /** First item index on current page (1-indexed) */
  startItem: number;
  /** Last item index on current page (1-indexed) */
  endItem: number;
  /** Whether can navigate forward */
  canGoNext: boolean;
  /** Whether can navigate backward */
  canGoPrev: boolean;
  /** Handler for page change */
  onPageChange: (page: number) => void;
  /** Handler for next page */
  onNextPage: () => void;
  /** Handler for previous page */
  onPrevPage: () => void;
  /** Label for items (e.g., "tasks", "series") */
  itemLabel?: string;
  /** Show "first" and "last" page buttons */
  showEdgeButtons?: boolean;
}

export const Pagination = ({
  currentPage,
  totalPages,
  pageRange,
  totalItems,
  startItem,
  endItem,
  canGoNext,
  canGoPrev,
  onPageChange,
  onNextPage,
  onPrevPage,
  itemLabel = 'mục',
  showEdgeButtons = true,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div
      id="pagination-bar"
      className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-5 border-t border-border-custom"
    >
      {/* Item counter */}
      <div className="text-xs text-text-muted order-2 sm:order-1">
        Hiển thị{' '}
        <span className="text-text-primary font-medium">{startItem}</span>
        {' – '}
        <span className="text-text-primary font-medium">{endItem}</span>
        {' / '}
        <span className="text-text-primary font-medium">{totalItems}</span>{' '}
        {itemLabel}
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* First page */}
        {showEdgeButtons && (
          <button
            onClick={() => onPageChange(1)}
            disabled={!canGoPrev}
            aria-label="Trang đầu"
            className={`
              flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium
              border-none cursor-pointer transition-all duration-200
              ${canGoPrev
                ? 'bg-transparent text-text-secondary hover:bg-bg-surface hover:text-text-primary'
                : 'bg-transparent text-text-muted/40 cursor-not-allowed'
              }
            `}
          >
            <ChevronsLeft size={16} />
          </button>
        )}

        {/* Previous */}
        <button
          onClick={onPrevPage}
          disabled={!canGoPrev}
          aria-label="Trang trước"
          className={`
            flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium
            border-none cursor-pointer transition-all duration-200
            ${canGoPrev
              ? 'bg-transparent text-text-secondary hover:bg-bg-surface hover:text-text-primary'
              : 'bg-transparent text-text-muted/40 cursor-not-allowed'
            }
          `}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {pageRange.map((item, index) => {
          if (item === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center w-8 h-8 text-text-muted"
                aria-hidden="true"
              >
                <MoreHorizontal size={14} />
              </span>
            );
          }

          const isActive = item === currentPage;
          return (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              aria-label={`Trang ${item}`}
              aria-current={isActive ? 'page' : undefined}
              className={`
                flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium
                border transition-all duration-200 cursor-pointer
                ${isActive
                  ? 'bg-brand text-white border-brand shadow-brand'
                  : 'bg-transparent text-text-secondary border-transparent hover:bg-bg-surface hover:text-text-primary hover:border-border-custom'
                }
              `}
            >
              {item}
            </button>
          );
        })}

        {/* Next */}
        <button
          onClick={onNextPage}
          disabled={!canGoNext}
          aria-label="Trang sau"
          className={`
            flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium
            border-none cursor-pointer transition-all duration-200
            ${canGoNext
              ? 'bg-transparent text-text-secondary hover:bg-bg-surface hover:text-text-primary'
              : 'bg-transparent text-text-muted/40 cursor-not-allowed'
            }
          `}
        >
          <ChevronRight size={16} />
        </button>

        {/* Last page */}
        {showEdgeButtons && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext}
            aria-label="Trang cuối"
            className={`
              flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium
              border-none cursor-pointer transition-all duration-200
              ${canGoNext
                ? 'bg-transparent text-text-secondary hover:bg-bg-surface hover:text-text-primary'
                : 'bg-transparent text-text-muted/40 cursor-not-allowed'
              }
            `}
          >
            <ChevronsRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
