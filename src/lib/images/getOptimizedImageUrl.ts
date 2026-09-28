/**
 * Centralized Image Optimization Utility for HAVEN
 *
 * Automatically converts Supabase Storage public asset URLs into CDN-transformed
 * responsive variants to prevent heavy uncompressed image payloads.
 */

export type ImagePreset = "thumbnail" | "card" | "hero" | "gallery";

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain";
}

export const IMAGE_PRESETS: Record<ImagePreset, ImageTransformOptions> = {
  thumbnail: { width: 240, quality: 70, resize: "contain" },
  card: { width: 640, quality: 75, resize: "contain" },
  hero: { width: 1600, quality: 80, resize: "contain" },
  gallery: { width: 1600, quality: 80, resize: "contain" },
};

/**
 * Returns an optimized image URL based on requested preset or custom dimensions.
 * Gracefully preserves non-Supabase URLs, data URLs, and vector SVGs.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  presetOrOptions: ImagePreset | ImageTransformOptions = "card"
): string {
  if (!url) return "";

  // Do not transform SVG files, local relative paths without extensions, or data URIs
  if (url.startsWith("data:") || url.endsWith(".svg")) {
    return url;
  }

  const options: ImageTransformOptions =
    typeof presetOrOptions === "string"
      ? IMAGE_PRESETS[presetOrOptions] ?? IMAGE_PRESETS.card
      : presetOrOptions;

  try {
    const resizeMode = options.resize ?? "contain";

    // 1. Supabase standard storage object URL
    // Format: .../storage/v1/object/public/<bucket>/<path>
    if (url.includes("/storage/v1/object/public/")) {
      const transformUrl = new URL(
        url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/")
      );
      if (options.width) transformUrl.searchParams.set("width", options.width.toString());
      if (options.height) transformUrl.searchParams.set("height", options.height.toString());
      if (options.quality) transformUrl.searchParams.set("quality", options.quality.toString());
      transformUrl.searchParams.set("resize", resizeMode);
      return transformUrl.toString();
    }

    // 2. Supabase already-transformed storage URL
    // Format: .../storage/v1/render/image/public/<bucket>/<path>
    if (url.includes("/storage/v1/render/image/public/")) {
      const transformUrl = new URL(url);
      if (options.width) transformUrl.searchParams.set("width", options.width.toString());
      if (options.height) transformUrl.searchParams.set("height", options.height.toString());
      if (options.quality) transformUrl.searchParams.set("quality", options.quality.toString());
      transformUrl.searchParams.set("resize", resizeMode);
      return transformUrl.toString();
    }

    // 3. Unsplash URLs
    if (url.includes("images.unsplash.com")) {
      const u = new URL(url);
      if (options.width) u.searchParams.set("w", options.width.toString());
      if (options.quality) u.searchParams.set("q", options.quality.toString());
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      return u.toString();
    }

    return url;
  } catch {
    return url;
  }
}
