import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Pagination } from '../../../components/common/Pagination';
import { generatePageRange } from '../../../hooks/usePagination';

interface ListTableShellProps {
  isLoading?: boolean;
  emptyMessage?: string;
  isEmpty?: boolean;
  colSpan: number;
  children: ReactNode;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  startItem?: number;
  endItem?: number;
  onPageChange?: (page: number) => void;
  itemLabel?: string;
}

export const ListTableShell = ({
  isLoading,
  emptyMessage = 'Không có dữ liệu',
  isEmpty,
  colSpan,
  children,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  startItem = 0,
  endItem = 0,
  onPageChange,
  itemLabel = 'mục',
}: ListTableShellProps) => {
  const pageRange = generatePageRange(currentPage, totalPages, 1);

  return (
    <div className="bg-bg-secondary border border-border-custom rounded-xl overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 size={28} className="animate-spin text-brand" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {children}
              {isEmpty && (
                <tbody>
                  <tr>
                    <td colSpan={colSpan} className="p-10 text-center text-sm text-text-muted">
                      {emptyMessage}
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>

          {totalPages > 1 && onPageChange && (
            <div className="p-4 border-t border-border-custom bg-bg-secondary">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageRange={pageRange}
                totalItems={totalItems}
                startItem={startItem}
                endItem={endItem}
                canGoNext={currentPage < totalPages}
                canGoPrev={currentPage > 1}
                onPageChange={onPageChange}
                onNextPage={() => onPageChange(currentPage + 1)}
                onPrevPage={() => onPageChange(currentPage - 1)}
                itemLabel={itemLabel}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export const tableHeadClass = 'p-4 font-medium text-text-secondary text-sm bg-bg-primary/50 border-b border-border-custom';
export const tableRowClass = 'border-b border-border-custom/50 hover:bg-bg-primary/30 transition-colors';
export const tableCellClass = 'p-4 text-sm';
