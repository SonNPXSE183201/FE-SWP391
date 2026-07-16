interface PngValidationOptions {
  minTransparentRatio?: number;
}

/**
 * F2.8 — If the uploaded file is PNG, validate it has transparent background.
 * Other image formats are allowed for testing/flexible upload flows.
 */
export async function validatePngTransparent(
  file: File,
  options: PngValidationOptions = {},
): Promise<{ valid: boolean; message?: string }> {
  const isPng = file.type.includes('png') || file.name.toLowerCase().endsWith('.png');
  if (!isPng) {
    return { valid: true };
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
    const minTransparentRatio = options.minTransparentRatio ?? 0.02;
    if (ratio < minTransparentRatio) {
      return {
        valid: false,
        message: 'Ảnh chưa có nền trong suốt đủ rõ. Vui lòng nộp PNG đã xóa nền, không dùng ảnh nền trắng hoặc ảnh minh họa nguyên khung.',
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
