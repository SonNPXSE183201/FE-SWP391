/**
 * Chuẩn hóa URL media từ BE (MinIO / Local / Firebase) để FE dev load same-origin qua Vite proxy.
 */
export const resolveMediaUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('data:')) return url;

  if (import.meta.env.DEV) {
    if (url.startsWith('/uploads') || url.startsWith('/manga-publishing')) {
      return url;
    }
    try {
      const parsed = new URL(url);
      if (parsed.hostname === 'localhost' && parsed.port === '9000' && parsed.pathname.startsWith('/manga-publishing/')) {
        return `${parsed.pathname}${parsed.search}`;
      }
    } catch {
      // ignore invalid URL
    }
  }

  if (/^https?:\/\//i.test(url)) return url;

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  const mediaBase =
    import.meta.env.VITE_MEDIA_URL || apiBase.replace(/\/api\/v1\/?$/, '') || 'http://localhost:5010';
  return url.startsWith('/') ? `${mediaBase}${url}` : `${mediaBase}/${url}`;
};
