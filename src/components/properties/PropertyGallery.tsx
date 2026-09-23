"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";

interface GalleryImage {
  id?: string;
  image_url: string;
  sort_order?: number;
  is_cover?: boolean;
}

interface PropertyGalleryProps {
  images: GalleryImage[];
  title: string;
}

export default function PropertyGallery({
  images,
  title,
}: PropertyGalleryProps) {
  // Sort images: is_cover first, then by sort_order
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_cover && !b.is_cover) return -1;
    if (!a.is_cover && b.is_cover) return 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const activeImage = sortedImages[selectedIndex]?.image_url;
  const isSupabaseImage =
    activeImage?.startsWith("https://afxgijkdaaidklzhwell.supabase.co") ?? false;

  // Fallback when no images exist
  if (!images || images.length === 0 || (!activeImage && imageError)) {
    return (
      <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-2xl border border-divider bg-surface flex flex-col items-center justify-center p-8 text-center shadow-xs">
        <Building2 className="h-16 w-16 text-muted/30 mb-3" />
        <span className="font-display text-sm uppercase tracking-widest text-muted/70">
          Haven Architectural Collection
        </span>
        <span className="font-sans text-xs text-muted/50 mt-1">
          No preview imagery available for this residence
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Large Display Viewport */}
      <div className="relative aspect-[16/10] md:aspect-[21/10] w-full overflow-hidden rounded-2xl border border-divider bg-background shadow-xs">
        {imageError ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-surface p-8 text-center">
            <Building2 className="h-12 w-12 text-muted/30 mb-2" />
            <span className="font-display text-xs uppercase tracking-wider text-muted/60">
              Imagery Unavailable
            </span>
          </div>
        ) : (
          <Image
            src={activeImage}
            alt={`${title} - View ${selectedIndex + 1}`}
            fill
            priority
            unoptimized={!isSupabaseImage}
            onError={() => setImageError(true)}
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover transition-opacity duration-300"
          />
        )}
      </div>

      {/* Thumbnail Strip (if multiple images available) */}
      {sortedImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {sortedImages.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            const isSubSupabase = img.image_url.startsWith(
              "https://afxgijkdaaidklzhwell.supabase.co"
            );

            return (
              <button
                key={img.id || idx}
                onClick={() => {
                  setSelectedIndex(idx);
                  setImageError(false);
                }}
                className={`relative aspect-[4/3] w-24 sm:w-28 shrink-0 overflow-hidden rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 shadow-xs opacity-100"
                    : "border-divider opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.image_url}
                  alt={`${title} thumbnail ${idx + 1}`}
                  fill
                  unoptimized={!isSubSupabase}
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
