import type { PageDto } from '../../../api/generated/types';
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl';
import { normalizePageStatus } from '../../../utils/status';
import { useCompositedPageUrl } from '../../tasks/hooks/useTasks';

/** Trang có thể đã có lớp Assistant được duyệt — cần ảnh gộp live giống Canvas. */
export const shouldUseLivePageComposite = (page: PageDto): boolean => {
  const status = normalizePageStatus(page.status);
  return !!page.compositeImageUrl || status === 'InProgress' || status === 'Completed';
};

/** URL tĩnh từ DB (composite ưu tiên hơn raw), kèm cache-bust theo updateAt. */
export const getStaticPageDisplayUrl = (page: PageDto): string => {
  const composite = page.compositeImageUrl ? resolveMediaUrl(page.compositeImageUrl) : '';
  const raw = resolveMediaUrl(page.rawImageUrl || '');
  const base = composite || raw;
  if (!base || !page.compositeImageUrl) return base;
  const v = page.updateAt ? new Date(page.updateAt).getTime() : undefined;
  if (!v) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}v=${v}`;
};

/**
 * URL hiển thị trang: ưu tiên ảnh gộp live từ API (đồng bộ với Canvas),
 * fallback về composite/raw đã lưu trên server.
 */
export const usePagePreviewUrl = (page: PageDto | undefined) => {
  const useLive = page ? shouldUseLivePageComposite(page) : false;
  const { data: liveUrl, isFetching } = useCompositedPageUrl(useLive ? String(page?.id) : undefined);
  const staticUrl = page ? getStaticPageDisplayUrl(page) : '';

  return {
    displayUrl: liveUrl || staticUrl,
    isLoading: useLive && isFetching && !liveUrl && !staticUrl,
    hasLiveComposite: !!liveUrl,
  };
};
