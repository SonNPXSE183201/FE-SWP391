/**
 * F2.8 — Validate PNG has transparent background before task result upload.
 */
export async function validatePngTransparent(file: File): Promise<{ valid: boolean; message?: string }> {
  if (!file.type.includes('png') && !file.name.toLowerCase().endsWith('.png')) {
    return { valid: false, message: 'File phải là định dạng PNG.' };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { valid: false, message: 'Không thể đọc file ảnh.' };
    }

    ctx.drawImage(img, 0, 0);
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Sample pixels for performance on large images
    const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 10000)));
    let transparentPixels = 0;
    let sampled = 0;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha < 250) transparentPixels += 1;
        sampled += 1;
      }
    }

    if (transparentPixels === 0) {
      return {
        valid: false,
        message: 'Ảnh phải có nền trong suốt. Vui lòng xuất ảnh và loại bỏ phần nền.',
      };
    }

    const ratio = transparentPixels / sampled;
    if (ratio < 0.02) {
      return {
        valid: false,
        message: 'Ảnh gần như không có vùng trong suốt. Assistant cần nộp PNG nền trong suốt theo quy định F2.8.',
      };
    }

    return { valid: true };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
