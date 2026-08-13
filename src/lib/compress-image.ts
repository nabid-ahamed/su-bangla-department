/**
 * Browser-side image downscaling for the admin ImageUploader.
 *
 * Cloudinary's free tier rejects uploads over 10 MB, and a modern
 * phone photo routinely exceeds that. Rather than failing after a slow
 * upload, oversized images are re-encoded in the browser first.
 *
 * Only raster images are touched. PDFs, SVGs, and already-small files
 * are returned unchanged.
 */

/** Cloudinary free-tier limit is 10 MB; stay under it with headroom. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const TARGET_BYTES = 8 * 1024 * 1024;

/** No site image needs more than this on the long edge. */
const MAX_DIMENSION = 2400;

/** Quality ladder tried in order until the result fits. */
const QUALITY_STEPS = [0.85, 0.75, 0.65, 0.55];

function isCompressibleImage(file: File): boolean {
  if (!file.type.startsWith('image/')) return false;
  // SVG is XML — rasterizing would destroy it. GIF may be animated;
  // canvas would flatten it to a single frame.
  return !['image/svg+xml', 'image/gif'].includes(file.type);
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file);
  }
  // Fallback for browsers without createImageBitmap.
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not decode image'));
      img.src = url;
    });
  } finally {
    // Revoked after decode; the bitmap data is already in memory.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Returns a file small enough to upload. If the input is already under
 * the limit — or isn't a compressible raster image — it is returned
 * untouched.
 *
 * Throws only if the image cannot be decoded, or if it still exceeds
 * the limit at the lowest quality step (a caller-visible error is
 * better than a silent 10 MB upload failure).
 */
export async function compressImageIfNeeded(file: File): Promise<File> {
  if (file.size <= MAX_UPLOAD_BYTES) return file;
  if (!isCompressibleImage(file)) {
    throw new Error(
      `File is too large (${(file.size / 1048576).toFixed(1)} MB). The maximum is 10 MB.`,
    );
  }

  const bitmap = await loadBitmap(file);
  const srcW = bitmap.width;
  const srcH = bitmap.height;

  const scale = Math.min(1, MAX_DIMENSION / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process image in this browser');
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, w, h);
  if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close();

  // PNGs with transparency stay PNG only when small enough; otherwise
  // JPEG wins on size and the background is already composited.
  const outType = 'image/jpeg';

  for (const q of QUALITY_STEPS) {
    const blob = await canvasToBlob(canvas, outType, q);
    if (blob && blob.size <= TARGET_BYTES) {
      const base = file.name.replace(/\.[^.]+$/, '');
      return new File([blob], `${base}.jpg`, {
        type: outType,
        lastModified: Date.now(),
      });
    }
  }

  throw new Error(
    'Image is too large to upload even after compression. Please resize it below 10 MB and try again.',
  );
}
