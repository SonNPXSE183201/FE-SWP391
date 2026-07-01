/**
 * Sửa chuỗi bị lỗi encoding (UTF-8 bị đọc nhầm thành Latin-1).
 * Ví dụ: "Tráº§n Mai Linh" → "Trần Mai Linh"
 */
export const fixMojibake = (value?: string | null): string => {
  if (!value) return '';
  if (!/[ÃÂÄÆÐÑÒÓÔÕÖØÙÚÛÜÝàáâãäåæçèéêëìíîïðñòóôõöøùúûüýÿ]/.test(value)) {
    return value;
  }

  try {
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0) & 0xff);
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    if (decoded && decoded !== value && /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/.test(decoded)) {
      return decoded;
    }
  } catch {
    // Giữ nguyên nếu không decode được
  }

  return value;
};
