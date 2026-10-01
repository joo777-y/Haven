"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Building2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/images/getOptimizedImageUrl";

const PropertyLightbox = dynamic(() => import("./PropertyLightbox"), {
  ssr: false,
});

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
          ? "border-secondary ring-2 ring-secondary/40 shadow-xs opacity-100"
          : "border-divider opacity-60 hover:opacity-100"
      }`}
      aria-label={`View photo ${idx + 1} of ${title}`}
    >
      <Image
        src={src}
        alt={`${title} thumbnail ${idx + 1}`}
        fill
        unoptimized
        sizes="120px"
        className="object-cover"
        onError={() => {
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : sortedImages.length - 1));
  }, [sortedImages.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev < sortedImages.length - 1 ? prev + 1 : 0));
  }, [sortedImages.length]);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diffX = touchStartX.current - touchEndX.current;
    if (diffX > 45) {
      // Swiped left -> next
      handleNext();
    } else if (diffX < -45) {
      // Swiped right -> prev
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };



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
    <>
      <div className="space-y-4">
        {/* Main Display Viewport */}
        <div
          className="group relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] max-h-[620px] w-full overflow-hidden rounded-2xl border border-divider bg-surface/30 shadow-xs cursor-pointer select-none"
          onClick={() => setIsLightboxOpen(true)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
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
                if (activeSrc !== rawActiveImage && rawActiveImage) {
                  setActiveSrc(rawActiveImage);
                } else {
                  setImageError(true);
                }
              }}
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02] transform-gpu will-change-transform"
            />
          )}

          {/* Top Controls: Photo Count & Lightbox Trigger */}
          <div className="absolute inset-x-4 top-4 flex items-center justify-between pointer-events-none z-10">
            <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-white shadow-xs pointer-events-auto">
              {selectedIndex + 1} / {sortedImages.length}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:scale-105 pointer-events-auto focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Open fullscreen gallery"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Next / Prev Chevrons on Hover */}
          {sortedImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-all hover:bg-black/80 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-all hover:bg-black/80 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
        </div>

        {/* Thumbnail Strip with Gradient Overflow Hints */}
        {sortedImages.length > 1 && (
          <div className="relative">
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
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal (Dynamically loaded on demand) */}
      {isLightboxOpen && (
        <PropertyLightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={sortedImages}
          selectedIndex={selectedIndex}
          onSelectIndex={(idx) => {
            setSelectedIndex(idx);
            setImageError(false);
          }}
          title={title}
          activeSrc={activeSrc}
        />
      )}
    </>
  );
}
