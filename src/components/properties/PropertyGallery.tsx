"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/images/getOptimizedImageUrl";

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

interface GalleryThumbnailProps {
  image: GalleryImage;
  idx: number;
  title: string;
  isSelected: boolean;
  onSelect: () => void;
}

function GalleryThumbnail({
  image,
  idx,
  title,
  isSelected,
  onSelect,
}: GalleryThumbnailProps) {
  const optimizedUrl = getOptimizedImageUrl(image.image_url, "thumbnail");
  const [src, setSrc] = useState(optimizedUrl);

  useEffect(() => {
    setSrc(getOptimizedImageUrl(image.image_url, "thumbnail"));
  }, [image.image_url]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative aspect-[4/3] w-24 sm:w-28 shrink-0 overflow-hidden rounded-xl border transition-all cursor-pointer bg-surface/50 ${
        isSelected
          ? "border-primary ring-2 ring-primary/20 shadow-xs opacity-100"
          : "border-divider opacity-60 hover:opacity-100"
      }`}
    >
      <Image
        src={src}
        alt={`${title} thumbnail ${idx + 1}`}
        fill
        unoptimized
        sizes="120px"
        className="object-cover"
        onError={() => {
          // If CDN transformation fails (e.g. source image exceeds processing resolution limit),
          // seamlessly fall back to original storage URL so thumbnail is never broken
          if (src !== image.image_url) {
            setSrc(image.image_url);
          }
        }}
      />
    </button>
  );
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

  const rawActiveImage = sortedImages[selectedIndex]?.image_url;
  const [activeSrc, setActiveSrc] = useState(() =>
    rawActiveImage ? getOptimizedImageUrl(rawActiveImage, "gallery") : ""
  );

  useEffect(() => {
    if (rawActiveImage) {
      setActiveSrc(getOptimizedImageUrl(rawActiveImage, "gallery"));
      setImageError(false);
    }
  }, [rawActiveImage]);

  // Fallback when no images exist
  if (!images || images.length === 0 || (!rawActiveImage && imageError)) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-divider bg-surface flex flex-col items-center justify-center p-8 text-center shadow-xs">
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
      {/* Main Display Viewport - 16:9 / 16:10 for natural architectural framing */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] max-h-[620px] w-full overflow-hidden rounded-2xl border border-divider bg-surface/30 shadow-xs">
        {imageError ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-surface p-8 text-center">
            <Building2 className="h-12 w-12 text-muted/30 mb-2" />
            <span className="font-display text-xs uppercase tracking-wider text-muted/60">
              Imagery Unavailable
            </span>
          </div>
        ) : (
          <Image
            src={activeSrc}
            alt={`${title} - View ${selectedIndex + 1}`}
            fill
            priority
            unoptimized
            onError={() => {
              // If optimized transform fails (e.g. resolution > 50MP), fall back to original
              if (activeSrc !== rawActiveImage && rawActiveImage) {
                setActiveSrc(rawActiveImage);
              } else {
                setImageError(true);
              }
            }}
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover transition-opacity duration-300"
          />
        )}
      </div>

      {/* Thumbnail Strip (if multiple images available) */}
      {sortedImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {sortedImages.map((img, idx) => (
            <GalleryThumbnail
              key={img.id || idx}
              image={img}
              idx={idx}
              title={title}
              isSelected={idx === selectedIndex}
              onSelect={() => {
                setSelectedIndex(idx);
                setImageError(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
