/**
 * عکس‌های انتخابی کاربر پیش از ذخیره، فشرده می‌شوند تا حافظه دستگاه
 * پر نشود و برنامه کاملاً آفلاین کار کند.
 */
export async function fileToCompressedDataUrl(
  file: File,
  maxSize = 1100,
  quality = 0.72
): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read-failed'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('decode-failed'));
    el.src = dataUrl;
  });

  const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * ratio));
  const h = Math.max(1, Math.round(img.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);

  try {
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return dataUrl;
  }
}

export function approxDataUrlKb(dataUrl: string): number {
  return Math.round((dataUrl.length * 0.75) / 1024);
}
