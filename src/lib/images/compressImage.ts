/**
 * Client-Side Image Compression & Downscaling Utility
 *
 * Compresses images in the browser before network transmission to Supabase Storage.
 * Reduces 10MB-20MB camera originals down to ~200KB-500KB modern WebP/JPEG files,
 * drastically speeding up uploads, preventing network socket drops, and keeping
 * storage and bandwidth lightweight.
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: "image/webp" | "image/jpeg";
}

/**
 * Compresses an image File using the browser Canvas API.
 * Automatically handles EXIF orientation and downscales dimensions.
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  // If running in SSR or file is vector SVG / animated GIF, bypass compression
  if (typeof window === "undefined" || !window.HTMLCanvasElement) {
    return file;
  }
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  const maxWidth = options.maxWidth ?? 2048;
  const maxHeight = options.maxHeight ?? 2048;
  const quality = options.quality ?? 0.82;
  const targetMime = options.mimeType ?? "image/webp";

  try {
    let imgBitmap: ImageBitmap | HTMLImageElement | null = null;
    let originalWidth = 0;
    let originalHeight = 0;

    // 1. Try modern createImageBitmap (fastest, automatic EXIF orientation)
    if (typeof createImageBitmap === "function") {
      try {
        const bitmap = await createImageBitmap(file);
        imgBitmap = bitmap;
        originalWidth = bitmap.width;
        originalHeight = bitmap.height;
      } catch {
        // Fall back to standard HTMLImageElement if createImageBitmap fails
        imgBitmap = null;
      }
    }

    // 2. Fallback to HTMLImageElement
    if (!imgBitmap) {
      imgBitmap = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(img);
        };
        img.onerror = (e) => {
          URL.revokeObjectURL(objectUrl);
          reject(e);
        };
        img.src = objectUrl;
      });
      originalWidth = imgBitmap.naturalWidth || imgBitmap.width;
      originalHeight = imgBitmap.naturalHeight || imgBitmap.height;
    }

    // Calculate constrained dimensions preserving aspect ratio
    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Create canvas and render resized image
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      if ("close" in imgBitmap && typeof imgBitmap.close === "function") {
        imgBitmap.close();
      }
      return file;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(imgBitmap, 0, 0, width, height);

    if ("close" in imgBitmap && typeof imgBitmap.close === "function") {
      imgBitmap.close();
    }

    // Convert canvas to Blob
    return await new Promise<File>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // If compression doesn't decrease file size (rare, e.g. already compressed tiny icon)
          if (blob.size >= file.size && file.size < 500 * 1024) {
            resolve(file);
            return;
          }

          const extension = targetMime === "image/webp" ? "webp" : "jpg";
          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const cleanName = `${baseName}.${extension}`;

          const compressedFile = new File([blob], cleanName, {
            type: targetMime,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        targetMime,
        quality
      );
    });
  } catch (err) {
    console.warn("Client-side image compression fallback to original file:", err);
    return file;
  }
}
