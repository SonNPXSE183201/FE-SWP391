/**
 * Bộ tiện ích định dạng tiền VND dùng chung cho toàn hệ thống.
 * Chuẩn hiển thị: nhóm hàng nghìn bằng dấu chấm theo locale `vi-VN`
 * (vd: 200000 → "200.000", có ký hiệu → "200.000 VND").
 */

const NUMBER_FORMATTER = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
});

type Numeric = number | string | null | undefined;

const toNumber = (value: Numeric): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (value == null || value === '') return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** Định dạng có ký hiệu tiền tệ: 200000 → "200.000 VND". */
export const formatVND = (value: Numeric): string =>
  `${NUMBER_FORMATTER.format(toNumber(value))} VND`;

/** Định dạng số có dấu chấm, KHÔNG kèm ký hiệu: 200000 → "200.000". */
export const formatVNDNumber = (value: Numeric): string => NUMBER_FORMATTER.format(toNumber(value));

/**
 * Bóc tách chuỗi người dùng nhập (vd "200.000", "200000 ₫", "200 000")
 * về số nguyên. Trả về 0 nếu không có chữ số.
 */
export const parseVND = (value: Numeric): number => {
  if (typeof value === 'number') return Math.trunc(value);
  if (!value) return 0;
  const digits = String(value).replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
};

/**
 * Chuẩn hoá giá trị đang gõ trong ô input thành dạng có dấu chấm.
 * Giữ chuỗi rỗng khi chưa nhập gì (để placeholder hiển thị).
 */
export const formatVNDInput = (value: Numeric): string => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return NUMBER_FORMATTER.format(parseInt(digits, 10));
};
