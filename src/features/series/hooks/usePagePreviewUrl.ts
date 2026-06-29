import type { Page } from '../../../types/entities';
import { useCompositedPageUrl } from '../../tasks/hooks/useTasks';

/** Trang có thể đã có lớp Assistant được duyệt — cần ảnh gộp live giống Canvas. */
export const shouldUseLivePageComposite = (page: Page): boolean =>
  !!page.compositeImageUrl || page.status === 'InProgress' || page.status === 'Completed';

/** URL tĩnh từ DB (composite ưu tiên hơn raw), kèm cache-bust theo updatedAt. */
export const getStaticPageDisplayUrl = (page: Page): string => {
  const base = page.compositeImageUrl || page.imageUrl || '';
  if (!base || !page.compositeImageUrl) return base;
  const v = page.updatedAt ? new Date(page.updatedAt).getTime() : undefined;
  if (!v) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}v=${v}`;
};

/**
 * URL hiển thị trang: ưu tiên ảnh gộp live từ API (đồng bộ với Canvas),
 * fallback về composite/raw đã lưu trên server.
 */
export const usePagePreviewUrl = (page: Page | undefined) => {
  const useLive = page ? shouldUseLivePageComposite(page) : false;
  const { data: liveUrl, isFetching } = useCompositedPageUrl(useLive ? page?.id : undefined);
  const staticUrl = page ? getStaticPageDisplayUrl(page) : '';

  return {
    displayUrl: liveUrl || staticUrl,
    isLoading: useLive && isFetching && !liveUrl && !staticUrl,
    hasLiveComposite: !!liveUrl,
  };
};
