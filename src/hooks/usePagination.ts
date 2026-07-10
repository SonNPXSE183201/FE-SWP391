import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  /** Number of items per page */
  pageSize?: number;
  /** Number of sibling pages to show around current page */
  siblingCount?: number;
}

interface UsePaginationReturn<T> {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Items for the current page */
  paginatedData: T[];
  /** Total items count */
  totalItems: number;
  /** Start index (1-indexed) for display */
  startItem: number;
  /** End index (1-indexed) for display */
  endItem: number;
  /** Page size */
  pageSize: number;
  /** Go to specific page */
  goToPage: (page: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  prevPage: () => void;
  /** Check if can go next */
  canGoNext: boolean;
  /** Check if can go previous */
  canGoPrev: boolean;
  /** Page range with ellipsis for rendering pagination buttons */
  pageRange: (number | 'ellipsis')[];
}

/**
 * Generate an array of page numbers with ellipsis markers.
 * Example: [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10]
 */
export function generatePageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): (number | 'ellipsis')[] {
  // Always show first and last page
  // Show siblingCount pages around current page
  const totalNumbers = siblingCount * 2 + 5; // siblings + first + last + current + 2 ellipsis slots

  // If total pages fit without ellipsis, return all pages
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    // Show more pages on left
    const leftCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftCount }, (_, i) => i + 1);
    return [...leftRange, 'ellipsis', totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    // Show more pages on right
    const rightCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightCount },
      (_, i) => totalPages - rightCount + 1 + i,
    );
    return [1, 'ellipsis', ...rightRange];
  }

  // Both ellipsis
  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i,
  );
  return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
}

export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {},
): UsePaginationReturn<T> {
  const { pageSize = 10, siblingCount = 1 } = options;
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Clamp current page if data changes
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(clamped);
    },
    [totalPages],
  );

  const nextPage = useCallback(() => goToPage(safePage + 1), [safePage, goToPage]);
  const prevPage = useCallback(() => goToPage(safePage - 1), [safePage, goToPage]);

  const pageRange = useMemo(
    () => generatePageRange(safePage, totalPages, siblingCount),
    [safePage, totalPages, siblingCount],
  );

  return {
    currentPage: safePage,
    totalPages,
    paginatedData,
    totalItems,
    startItem,
    endItem,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    canGoNext: safePage < totalPages,
    canGoPrev: safePage > 1,
    pageRange,
  };
}
