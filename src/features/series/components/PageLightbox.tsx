import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { Page } from '../../../types/entities';
import { getPageStatusConfig } from '../data/mockPages';
import { PagePlaceholder } from './PagePlaceholder';
import { usePagePreviewUrl } from '../hooks/usePagePreviewUrl';

interface PageLightboxProps {
  pages: Page[];
  currentIndex: number;
  onClose: () => void;
  onNav: (idx: number) => void;
}

export const PageLightbox = ({ pages, currentIndex, onClose, onNav }: PageLightboxProps) => {
  const page = pages[currentIndex];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && currentIndex > 0) onNav(currentIndex - 1);
    if (e.key === 'ArrowRight' && currentIndex < pages.length - 1) onNav(currentIndex + 1);
  }, [currentIndex, pages.length, onClose, onNav]);

  useEffect(() => {
    if (!page) {
      onClose();
      return;
    }
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown, page, onClose]);

  if (!page) return null;

  const statusCfg = getPageStatusConfig(page.status);

  return createPortal(
    <PageLightboxContent
      page={page}
      pages={pages}
      currentIndex={currentIndex}
      statusCfg={statusCfg}
      onClose={onClose}
      onNav={onNav}
    />,
    document.body,
  );
};

const PageLightboxContent = ({
  page,
  pages,
  currentIndex,
  statusCfg,
  onClose,
  onNav,
}: {
  page: Page;
  pages: Page[];
  currentIndex: number;
  statusCfg: ReturnType<typeof getPageStatusConfig>;
  onClose: () => void;
  onNav: (idx: number) => void;
}) => {
  const { displayUrl, isLoading } = usePagePreviewUrl(page);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all border-none cursor-pointer backdrop-blur-sm"
      >
        <X size={20} />
      </button>

      {/* Page info */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <span className="text-white/90 text-sm font-semibold bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          Trang {page.pageNumber} / {pages.length}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.color} backdrop-blur-sm`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
          {statusCfg.label}
        </span>
      </div>

      {/* Navigation */}
      {currentIndex > 0 && (
        <button
          onClick={() => onNav(currentIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all border-none cursor-pointer backdrop-blur-sm"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      {currentIndex < pages.length - 1 && (
        <button
          onClick={() => onNav(currentIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all border-none cursor-pointer backdrop-blur-sm"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[90vh] animate-fade-in">
        {isLoading ? (
          <div className="flex h-[min(85vh,560px)] w-[min(90vw,400px)] items-center justify-center rounded-lg bg-bg-surface/10">
            <Loader2 size={32} className="animate-spin text-white/70" />
          </div>
        ) : displayUrl ? (
          <img
            src={displayUrl}
            alt={`Trang ${page.pageNumber}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <div className="w-[400px] h-[560px] rounded-lg overflow-hidden shadow-2xl">
            <PagePlaceholder pageNumber={page.pageNumber} />
          </div>
        )}
      </div>
    </div>
  );
};
