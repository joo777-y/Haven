"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { Building2 } from "lucide-react";
import { getOptimizedImageUrl, ImagePreset } from "@/lib/images/getOptimizedImageUrl";

export interface HavenImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  alt: string;
  preset?: ImagePreset;
  aspectRatioClass?: string;
  fallbackText?: string;
  containerClassName?: string;
}

export default function HavenImage({
  src,
  alt,
  preset = "card",
  aspectRatioClass = "aspect-[16/10]",
  fallbackText = "Haven Collection",
  containerClassName = "",
  className = "",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  fill = true,
  ...props
}: HavenImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const optimizedSrc = getOptimizedImageUrl(src, preset);

  if (!optimizedSrc || hasError) {
    return (
      <div
        className={`relative flex h-full w-full flex-col items-center justify-center bg-surface/80 p-4 text-center border border-divider/40 ${containerClassName}`}
        role="img"
        aria-label={alt}
      >
        <Building2 className="h-8 w-8 text-muted/30 mb-1.5" />
        <span className="font-display text-[11px] tracking-wider uppercase text-muted/60 select-none">
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-background/50 ${containerClassName}`}
    >
      {/* Subtle skeleton shimmer while loading */}
      {isLoading && (
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-divider/30 via-divider/60 to-divider/30 animate-pulse pointer-events-none" />
      )}

      <Image
        src={optimizedSrc}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        unoptimized
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${className}`}
        {...props}
      />
    </div>
  );
}
