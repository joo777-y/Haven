"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/images/getOptimizedImageUrl";

interface GalleryImage {
  id?: string;
  image_url: string;
  sort_order?: number;
  is_cover?: boolean;
}

interface PropertyLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryImage[];
  selectedIndex: number;
  onSelectIndex: (idx: number) => void;
  title: string;
  activeSrc: string;
}

export default function PropertyLightbox({
  isOpen,
  onClose,
  images,
  selectedIndex,
  onSelectIndex,
  title,
  activeSrc,
}: PropertyLightboxProps) {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handlePrev = useCallback(() => {
    onSelectIndex(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
  }, [selectedIndex, images.length, onSelectIndex]);

  const handleNext = useCallback(() => {
    onSelectIndex(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
  }, [selectedIndex, images.length, onSelectIndex]);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Touch swipe handling
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0]?.clientX ?? null;
    touchEndX.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (diff > minSwipeDistance) {
      handleNext();
    } else if (diff < -minSwipeDistance) {
      handlePrev();
    }
  };

  if (!isOpen) return null;

  const rawActiveImage = images[selectedIndex]?.image_url;
  const currentHeroUrl = rawActiveImage
    ? getOptimizedImageUrl(rawActiveImage, "hero") || activeSrc
    : activeSrc;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo gallery: ${title}`}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-black/95 p-4 sm:p-6 backdrop-blur-md select-none"
      onClick={onClose}
    >
      {/* Lightbox Header */}
      <div
        className="flex w-full items-center justify-between z-20 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-white">
          <span className="font-display text-sm tracking-wider uppercase opacity-80 block truncate max-w-xs sm:max-w-md">
            {title}
          </span>
          <span className="text-xs text-white/60 font-sans">
            Photo {selectedIndex + 1} of {images.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 focus:outline-none cursor-pointer"
          aria-label="Close lightbox"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Lightbox Image Viewport */}
      <div
        className="relative flex-1 w-full max-w-6xl my-auto flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative w-full h-[65vh] sm:h-[75vh]">
          <Image
            src={currentHeroUrl}
            alt={`${title} - Fullscreen View ${selectedIndex + 1}`}
            fill
            priority
            unoptimized
            className="object-contain"
          />
        </div>

        {/* Navigation Chevrons */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white transition-all hover:bg-white/20 focus:outline-none cursor-pointer"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white transition-all hover:bg-white/20 focus:outline-none cursor-pointer"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Lightbox Footer Thumbnails */}
      {images.length > 1 && (
        <div
          className="w-full max-w-2xl overflow-x-auto py-2 flex justify-center gap-2 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`relative h-12 w-16 sm:h-14 sm:w-20 rounded-lg overflow-hidden shrink-0 border transition-all cursor-pointer ${
                idx === selectedIndex
                  ? "border-secondary ring-2 ring-secondary/50 opacity-100"
                  : "border-white/20 opacity-40 hover:opacity-80"
              }`}
              aria-label={`Jump to photo ${idx + 1}`}
            >
              <Image
                src={getOptimizedImageUrl(img.image_url, "thumbnail")}
                alt=""
                fill
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
