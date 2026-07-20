/**
 * Chuẩn hóa URL media từ BE (MinIO / Local / Firebase) để FE dev load same-origin qua Vite proxy.
 */
export const resolveMediaUrl = (url: unknown): string => {
  if (!url) return '';
  if (typeof url !== 'string') {
    if (typeof url === 'object' && url !== null) {
      const obj = url as Record<string, unknown>;
      const candidate = obj.colorizedImageUrl || obj.imageUrl || obj.url || obj.src || obj.resultUrl || obj.drawnImageUrl;
      if (typeof candidate === 'string') return resolveMediaUrl(candidate);
    }
    return '';
  }
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

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

  if (/^https?:\/\//i.test(url)) {
    // Tự động chuyển đổi link MinIO localhost sang Firebase trên môi trường Deploy
    if (!import.meta.env.DEV && url.includes('localhost:9000/manga-publishing/')) {
      const path = url.split('localhost:9000/manga-publishing/')[1];
      const encodedPath = encodeURIComponent(path);
      return `https://firebasestorage.googleapis.com/v0/b/manga-32554.firebasestorage.app/o/${encodedPath}?alt=media`;
    }
    return url;
  }

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  const mediaBase =
    import.meta.env.VITE_MEDIA_URL || apiBase.replace(/\/api\/v1\/?$/, '') || 'http://localhost:5010';
  return url.startsWith('/') ? `${mediaBase}${url}` : `${mediaBase}/${url}`;
};
