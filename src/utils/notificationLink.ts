import type { UserRole } from '../stores/authStore';

const SERIES_ID_PREFIX = /^#(\d+)#\s*/;

export const parseSeriesIdFromNotification = (content: string): string | null => {
  const match = content.match(SERIES_ID_PREFIX);
  return match?.[1] ?? null;
};

export const stripSeriesIdPrefix = (content: string): string =>
  content.replace(SERIES_ID_PREFIX, '').trim();

const normalizePath = (link: string): string => {
  const trimmed = link.trim();
  if (!trimmed) return '';
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return trimmed;
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const roleHome = (role: UserRole): string => {
  switch (role) {
    case 'Mangaka':
      return '/mangaka';
    case 'Editor':
      return '/editor';
    case 'Assistant':
      return '/assistant';
    case 'Board':
      return '/board';
    case 'Admin':
      return '/admin';
    default:
      return '/';
  }
};

const fixLegacyPath = (path: string, role: UserRole, seriesId: string | null): string | null => {
  if (!path) return null;

  const seriesDetail = seriesId ? `/mangaka/series/${seriesId}` : '/mangaka/series';

  if (path === '/tasks' || path.startsWith('/tasks/')) {
    if (role === 'Assistant') return '/assistant/tasks';
    if (role === 'Mangaka') return '/mangaka/tasks';
    return null;
  }

  if (path === '/wallet' || path.startsWith('/wallet')) {
    if (role === 'Mangaka') return '/mangaka/wallet';
    if (role === 'Assistant') return '/assistant/wallet';
    return null;
  }

  if (path.startsWith('/series/')) {
    const id = path.split('/')[2] ?? seriesId;
    if (role === 'Editor' && id) return `/editor/review/${id}`;
    if (id) return `/mangaka/series/${id}`;
    return role === 'Mangaka' ? '/mangaka/series' : null;
  }

  if (path.startsWith('/chapters/')) {
    const chapterId = path.split('/')[2];
    if (role === 'Mangaka' && chapterId) return `/mangaka/manuscripts/${chapterId}`;
    if (role === 'Editor') return '/editor/series-review';
    return null;
  }

  if (path === '/editor/review' || path.startsWith('/editor/review/') || path === '/editor/series-review' || path.startsWith('/editor/series-review/')) {
    return role === 'Editor' ? path : null;
  }

  if (path.startsWith('/mangaka/')) {
    return role === 'Mangaka' ? path : null;
  }

  if (path.startsWith('/assistant/')) {
    return role === 'Assistant' ? path : null;
  }

  if (path.startsWith('/board/')) {
    return role === 'Board' ? path : null;
  }

  if (path.startsWith('/admin/')) {
    return role === 'Admin' ? path : null;
  }

  if (path === '/mangaka/series' && seriesId && role === 'Mangaka') {
    return seriesDetail;
  }

  return path;
};

export const getNotificationTitle = (type: string): string => {
  const titles: Record<string, string> = {
    Series_Submitted: 'Đã gửi xét duyệt Series',
    Series_Submitted_To_Board: 'Series chờ Hội đồng',
    Series_Pending_Review: 'Series mới chờ duyệt',
    Series_Revision_Required: 'Editor yêu cầu chỉnh sửa',
    Chapter_Rejected: 'Yêu cầu sửa chương',
    Chapter_Revision_Required: 'Yêu cầu sửa chương',
    Series_Approved: 'Series được phê duyệt',
    Series_Fund_Approved: 'Vốn thực tế đã được duyệt',
    Series_Rejected: 'Series bị từ chối',
    Contract_Ready_To_Create: 'Cần lập hợp đồng',
    Wallet_Deposit_Success: 'Nạp tiền thành công',
    Wallet_Withdrawal_Pending: 'Yêu cầu rút tiền đã gửi',
    Wallet_Withdrawal_Approve: 'Rút tiền được duyệt',
    Wallet_Withdrawal_Reject: 'Rút tiền bị từ chối',
    Wallet_Withdrawal_Admin_Pending: 'Yêu cầu rút tiền mới',
    Series_Axing_Warning: '⚠️ Cảnh báo nguy cơ Hủy xuất bản',
    Series_Warning_Axing: '⚠️ Cảnh báo nguy cơ Hủy xuất bản',
    Series_Cancelled: '🛑 Bộ truyện đã bị Hủy xuất bản',
    Series_Axed: '🛑 Bộ truyện đã bị Hủy xuất bản',
    Series_Board_Approved: '🎉 Hội đồng biên tập đã duyệt',
    Series_Board_Rejected: '❌ Hội đồng biên tập từ chối',
    Series_Board_Escalated: '⚖️ Hồ sơ được chuyển Admin xử lý',
    Chapter_Submitted: 'Chương mới chờ duyệt',
  };

  if (titles[type]) return titles[type];
  if (type.startsWith('Task_')) return 'Cập nhật nhiệm vụ';
  if (type.startsWith('Wallet')) return 'Cập nhật ví';
  if (type.startsWith('Series')) return 'Cập nhật Series';
  return 'Thông báo';
};

export const resolveNotificationLink = (
  type: string,
  content: string,
  apiLink?: string | null,
  role?: UserRole | null,
): string | null => {
  const seriesId = parseSeriesIdFromNotification(content);
  const userRole = role ?? 'Mangaka';

  if (type === 'Chapter_Submitted' && userRole === 'Editor') {
    return '/editor/chapter-review';
  }

  if (seriesId) {
    if (userRole === 'Editor' && (type === 'Series_Pending_Review' || type.startsWith('Series'))) {
      return `/editor/review/${seriesId}`;
    }
    if (userRole === 'Mangaka') {
      if (type === 'Series_Axing_Warning' || type === 'Series_Warning_Axing') {
        return `/mangaka/ranking`;
      }
      return `/mangaka/series/${seriesId}`;
    }
  }

  if (type === 'Series_Pending_Review' && userRole === 'Editor') {
    return seriesId ? `/editor/review/${seriesId}` : '/editor/series-review';
  }

  if (type === 'Series_Submitted_To_Board' && userRole === 'Mangaka') {
    return seriesId ? `/mangaka/series/${seriesId}` : '/mangaka/series';
  }

  if (type === 'Series_Revision_Required' && userRole === 'Mangaka') {
    return seriesId ? `/mangaka/series/${seriesId}` : '/mangaka/series';
  }

  if (type === 'Wallet_Withdrawal_Admin_Pending' && userRole === 'Admin') {
    return '/admin/withdraw-approval';
  }

  if (type.startsWith('Wallet') && userRole === 'Mangaka') {
    return '/mangaka/wallet';
  }

  if (type.startsWith('Wallet') && userRole === 'Assistant') {
    return '/assistant/wallet';
  }

  if (type.startsWith('Task') && userRole === 'Assistant') {
    return '/assistant/tasks';
  }

  if (type.startsWith('Task') && userRole === 'Mangaka') {
    return '/mangaka/tasks';
  }

  if (apiLink) {
    const fixed = fixLegacyPath(normalizePath(apiLink), userRole, seriesId);
    if (fixed) return fixed;
  }

  return roleHome(userRole);
};
