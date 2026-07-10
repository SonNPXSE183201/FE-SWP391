/**
 * Parse datetime từ BE:
 * - REST (DateTimeJsonConverter): "yyyy-MM-dd HH:mm:ss" — giờ VN (+07)
 * - SignalR / ISO UTC thiếu hậu tố Z: coi là UTC
 */
export const parseApiDate = (iso: string): Date => {
  if (!iso?.trim()) return new Date(NaN);
  const value = iso.trim();

  if (/[zZ]$/.test(value) || /[+-]\d{2}:\d{2}$/.test(value)) {
    return new Date(value);
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return new Date(`${value.replace(' ', 'T')}+07:00`);
  }

  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  return new Date(`${normalized}Z`);
};

/** Chuẩn hóa chuỗi datetime từ BE sang ISO UTC để lưu/so sánh. */
export const toApiDateIso = (raw: string | undefined): string => {
  if (!raw?.trim()) return new Date().toISOString();
  const parsed = parseApiDate(raw);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};
