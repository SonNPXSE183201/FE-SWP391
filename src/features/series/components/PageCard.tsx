import { ZoomIn, Layers, Loader2 } from 'lucide-react';
import type { Page } from '../../../types/entities';
import { getPageStatusConfig } from '../data/mockPages';
import { PagePlaceholder } from './PagePlaceholder';
import { usePagePreviewUrl } from '../hooks/usePagePreviewUrl';

interface PageCardProps {
  page: Page;
  onClick: () => void;
}

export const PageCard = ({ page, onClick }: PageCardProps) => {
  const statusCfg = getPageStatusConfig(page.status);
  const { displayUrl, isLoading, hasLiveComposite } = usePagePreviewUrl(page);
  const hasComposite = !!page.compositeImageUrl || hasLiveComposite;

  return (
    <div
      onClick={onClick}
      className="group relative bg-bg-secondary border border-border-custom rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-brand/30 hover:shadow-md-custom hover:-translate-y-0.5"
    >
      {/* Image / Placeholder */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center bg-bg-surface">
            <Loader2 size={22} className="animate-spin text-brand" />
          </div>
        ) : displayUrl ? (
          <img
            src={displayUrl}
            alt={`Trang ${page.pageNumber}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <PagePlaceholder pageNumber={page.pageNumber} />
        )}

        {hasComposite && (
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center gap-1 bg-success/80 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
              <Layers size={10} />
              Đã gộp
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <ZoomIn size={14} className="text-white" />
            <span className="text-white text-xs font-medium">Xem lớn</span>
          </div>
        </div>

        {/* Page number badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            P.{String(page.pageNumber).padStart(2, '0')}
          </span>
        </div>

        {/* Region count */}
        {page.regionCount > 0 && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 bg-brand/80 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
              <Layers size={10} />
              {page.regionCount}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 flex items-center justify-between">
        <span className="text-xs font-medium text-text-primary">
          Trang {page.pageNumber}
        </span>
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
          {statusCfg.label}
        </span>
      </div>
    </div>
  );
};
