"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { getOptimizedImageUrl } from "@/lib/images/getOptimizedImageUrl";

export interface GalleryPropertyItem {
  id: string;
  title: string;
  slug: string;
  price: string;
  location: string;
  city?: string;
  image: string;
  beds?: number | null;
  baths?: number | null;
  area?: string | null;
  badge?: string;
  listingType?: "sale" | "rent" | string;
  propertyType?: string;
}

interface InteractivePropertyGalleryProps {
  properties: GalleryPropertyItem[];
  className?: string;
}

export default function InteractivePropertyGallery({
  properties,
  className = "",
}: InteractivePropertyGalleryProps) {
  const router = useRouter();

  // Use first 5 properties for balanced visual harmony
  const items = properties.slice(0, 5);

  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const userInteractedRef = useRef<boolean>(false);
  const hasTeasedRef = useRef<boolean>(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const teaserTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const teaserReturnTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cancelTeaser = useCallback(() => {
    if (teaserTimeoutRef.current) {
      clearTimeout(teaserTimeoutRef.current);
      teaserTimeoutRef.current = null;
    }
    if (teaserReturnTimeoutRef.current) {
      clearTimeout(teaserReturnTimeoutRef.current);
      teaserReturnTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  // First view hint animation: when gallery enters view, briefly peek second card,
  // then glide back to initial card to demonstrate interactive accordion capability
  useEffect(() => {
    if (prefersReducedMotion || typeof window === "undefined" || items.length <= 1) {
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasTeasedRef.current && !userInteractedRef.current) {
          hasTeasedRef.current = true;

          // 1. Wait 500ms after entering view so user perceives initial layout
          teaserTimeoutRef.current = setTimeout(() => {
            if (userInteractedRef.current) return;

            // 2. Simulated hover: smoothly expand second residence
            setActiveIndex(1);

            // 3. Return to original residence after 950ms demonstration
            teaserReturnTimeoutRef.current = setTimeout(() => {
              if (userInteractedRef.current) return;
              setActiveIndex(0);
            }, 950);
          }, 500);

          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelTeaser();
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [items.length, prefersReducedMotion, cancelTeaser]);

  const handleNext = useCallback(() => {
    userInteractedRef.current = true;
    cancelTeaser();
    setActiveIndex((prev) => (prev + 1) % items.length);
  }, [items.length, cancelTeaser]);

  const handlePrev = useCallback(() => {
    userInteractedRef.current = true;
    cancelTeaser();
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length, cancelTeaser]);

  const handleCardClick = (index: number, slug: string) => {
    userInteractedRef.current = true;
    cancelTeaser();
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

    if (index === activeIndex) {
      // Clicking the active maxi card redirects directly to this villa's page
      router.push(`/properties/${slug}`);
    } else {
      // Clicking an inactive mini card maximizes it
      setActiveIndex(index);
    }
  };

  const handleCardHover = (index: number) => {
    userInteractedRef.current = true;
    cancelTeaser();

    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    // 90ms hover intent for swift yet smooth expansion without fluttering
    hoverTimerRef.current = setTimeout(() => {
      setActiveIndex(index);
    }, 90);
  };

  const handleCardLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const activeProperty = items[activeIndex] || items[0];

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Interactive Property Showcase Gallery"
      className={`relative w-full space-y-4 ${className}`}
    >
      {/* ============================================================ */}
      {/* DESKTOP & TABLET ACCORDION (>= 768px)                         */}
      {/* Horizontal Expandable Flex: Hovered/Clicked = Maxi, Others = Mini */}
      {/* ============================================================ */}
      <div className="hidden md:flex h-[520px] lg:h-[580px] w-full gap-3 overflow-hidden rounded-3xl p-1 bg-surface/30">
        {items.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              aria-roledescription="slide"
              aria-label={`${item.title} (${index + 1} of ${items.length}). ${
                isActive ? "Click to view property details" : "Hover or click to expand"
              }`}
              onClick={() => handleCardClick(index, item.slug)}
              onMouseEnter={() => handleCardHover(index)}
              onMouseLeave={handleCardLeave}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCardClick(index, item.slug);
                }
              }}
              className={`relative overflow-hidden rounded-2xl md:rounded-3xl border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] select-none cursor-pointer ${
                isActive
                  ? "flex-[5] lg:flex-[6] border-secondary/60 shadow-2xl z-20 group/active ring-1 ring-secondary/30"
                  : "flex-[1] min-w-[70px] lg:min-w-[86px] border-divider/80 hover:border-secondary/60 shadow-xs z-10 group"
              }`}
              style={{
                transitionProperty: prefersReducedMotion
                  ? "none"
                  : "flex-grow, flex-basis, border-color, box-shadow",
              }}
            >
              {/* Background Imagery */}
              <Image
                src={
                  isActive
                    ? getOptimizedImageUrl(item.image, "gallery")
                    : getOptimizedImageUrl(item.image, "card")
                }
                alt={item.title}
                fill
                unoptimized
                loading={index === 0 ? "eager" : "lazy"}
                sizes={
                  isActive
                    ? "(min-width: 1024px) 800px, 600px"
                    : "140px"
                }
                priority={index === 0}
                className={`object-cover transition-all duration-700 ${
                  isActive
                    ? "scale-100 opacity-100 group-hover/active:scale-[1.02]"
                    : "scale-105 opacity-75 group-hover:opacity-95 group-hover:scale-110"
                }`}
              />

              {/* ===================================================== */}
              {/* MAXI STATE: Rich Active Residence Dossier             */}
              {/* ===================================================== */}
              {isActive ? (
                <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 lg:p-10 animate-fadeIn pointer-events-none">
                  {/* Top Gradient & Badges */}
                  <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        size="md"
                        className="bg-black/60 backdrop-blur-md border border-secondary/40 text-secondary font-semibold uppercase tracking-wider text-[11px]"
                      >
                        <Sparkles className="h-3 w-3 mr-1 inline" />
                        {item.badge || "Featured Residence"}
                      </Badge>
                      <span className="rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-xs font-medium text-white/90 border border-white/10 uppercase tracking-wider">
                        {item.listingType === "sale" ? "For Sale" : "For Lease"}
                      </span>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1 text-xs font-mono text-white/90 border border-white/15">
                      <span className="text-secondary font-bold">0{index + 1}</span>
                      <span className="text-white/40">/</span>
                      <span>0{items.length}</span>
                    </div>
                  </div>

                  {/* Bottom Gradient & Editorial Specs */}
                  <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

                  <div className="relative z-10 space-y-4 pointer-events-auto">
                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-secondary/90">
                      <MapPin className="h-3.5 w-3.5 text-secondary shrink-0" />
                      <span>{item.location}</span>
                    </div>

                    {/* Residence Title */}
                    <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight leading-tight max-w-2xl drop-shadow-sm group-hover/active:text-secondary transition-colors">
                      {item.title}
                    </h3>

                    {/* Specs & Pricing Action Strip */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/15">
                      {/* Specs */}
                      <div className="flex items-center gap-4 text-xs sm:text-sm text-surface/90">
                        {item.beds !== null && (
                          <div className="flex items-center gap-1.5">
                            <Bed className="h-4 w-4 text-secondary/80" />
                            <span>{item.beds} Beds</span>
                          </div>
                        )}
                        {item.baths !== null && (
                          <div className="flex items-center gap-1.5">
                            <Bath className="h-4 w-4 text-secondary/80" />
                            <span>{item.baths} Baths</span>
                          </div>
                        )}
                        {item.area && (
                          <div className="flex items-center gap-1.5">
                            <Maximize2 className="h-4 w-4 text-secondary/80" />
                            <span>{item.area}</span>
                          </div>
                        )}
                      </div>

                      {/* Price & CTA Button */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-widest text-white/50 block font-sans">
                            Valuation
                          </span>
                          <span className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                            {item.price}
                          </span>
                        </div>

                        <Button
                          variant="primary"
                          size="md"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/properties/${item.slug}`);
                          }}
                          className="bg-secondary hover:bg-secondary/90 text-white font-medium flex items-center gap-2 shadow-lg hover:shadow-secondary/20 transition-all text-xs uppercase tracking-wider cursor-pointer group-hover/active:scale-105"
                        >
                          <span>Explore Villa</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ===================================================== */
                /* MINI STATE: Slender Architectural Vertical Preview    */
                /* ===================================================== */
                <div
                  className="absolute inset-0 w-full h-full text-left p-0 bg-transparent border-0 focus:outline-none"
                >
                  {/* Subtle Darkening Scrim */}
                  <div className="absolute inset-0 bg-black/45 group-hover:bg-black/20 transition-colors duration-300" />

                  {/* Top Index Pill */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center justify-center h-8 w-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-mono font-bold text-white shadow-xs group-hover:border-secondary group-hover:text-secondary group-hover:scale-110 transition-all duration-300">
                    0{index + 1}
                  </div>

                  {/* Vertical Spine Typography */}
                  <div
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium tracking-widest text-white/75 uppercase select-none pointer-events-none group-hover:text-white transition-colors duration-300 flex items-center gap-2"
                    style={{
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                    }}
                  >
                    <span className="font-display font-semibold tracking-wider">
                      {item.title}
                    </span>
                    {item.city && (
                      <span className="text-secondary/90 font-mono text-[10px]">
                        • {item.city}
                      </span>
                    )}
                  </div>

                  {/* Direct Link Arrow Shortcut */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/properties/${item.slug}`);
                    }}
                    title={`Open ${item.title}`}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 flex items-center justify-center h-7 w-7 rounded-full bg-secondary/90 text-white transition-all duration-300 hover:scale-110 shadow-md cursor-pointer"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>

                  {/* Glowing Edge Line */}
                  <div className="absolute inset-y-0 left-0 w-1 bg-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Gallery Footer Navigation */}
      <div className="hidden md:flex items-center justify-between px-2 pt-1 text-xs text-muted">
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
          <span className="font-sans tracking-wide">
            Select any preview panel to expand residence • Click active residence to explore details
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            {items.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setActiveIndex(dotIdx)}
                aria-label={`Jump to property ${dotIdx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  dotIdx === activeIndex
                    ? "w-6 bg-secondary"
                    : "w-2 bg-divider hover:bg-muted"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handlePrev}
            aria-label="Previous property"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-divider bg-surface text-foreground hover:bg-secondary/10 hover:border-secondary hover:text-secondary transition-all cursor-pointer shadow-xs"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next property"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-divider bg-surface text-foreground hover:bg-secondary/10 hover:border-secondary hover:text-secondary transition-all cursor-pointer shadow-xs"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE ACCORDION (< 768px): Vertical Accordion                */}
      {/* Tap any card to maximize it, minimizing the others           */}
      {/* ============================================================ */}
      <div className="md:hidden flex flex-col h-[580px] gap-2.5 overflow-hidden">
        {items.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label={`${item.title} (${index + 1} of ${items.length}). ${
                isActive ? "Click to view property details" : "Click to expand"
              }`}
              onClick={() => handleCardClick(index, item.slug)}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer select-none ${
                isActive
                  ? "flex-[5] border-secondary/50 shadow-xl"
                  : "flex-[1] min-h-[58px] border-divider bg-surface"
              }`}
            >
              <Image
                src={
                  isActive
                    ? getOptimizedImageUrl(item.image, "gallery")
                    : getOptimizedImageUrl(item.image, "thumbnail")
                }
                alt={item.title}
                fill
                unoptimized
                loading={index === 0 ? "eager" : "lazy"}
                sizes="100vw"
                className={`object-cover transition-transform duration-500 ${
                  isActive ? "scale-100" : "scale-105 opacity-60"
                }`}
              />

              {isActive ? (
                /* Mobile Active State */
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30 p-4 sm:p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      size="sm"
                      className="bg-black/60 backdrop-blur-md text-[10px]"
                    >
                      {item.badge || "Featured"}
                    </Badge>
                    <div className="rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-mono text-white/90 border border-white/10">
                      0{index + 1} / 0{items.length}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-secondary uppercase tracking-wider">
                      <MapPin className="h-3 w-3" />
                      <span>{item.location}</span>
                    </div>

                    <h3 className="font-display text-lg sm:text-xl font-bold text-white leading-snug">
                      {item.title}
                    </h3>

                    <div className="flex items-center justify-between pt-2 border-t border-white/15">
                      <div>
                        <span className="text-[10px] uppercase text-white/50 block font-sans">
                          Valuation
                        </span>
                        <span className="font-display text-base sm:text-lg font-bold text-white">
                          {item.price}
                        </span>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/properties/${item.slug}`);
                        }}
                        className="bg-secondary text-white text-xs px-3 py-1.5 cursor-pointer"
                      >
                        <span>Explore</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mobile Mini Collapsed Strip */
                <div className="absolute inset-0 bg-black/50 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/70 text-[10px] font-mono font-bold text-secondary border border-secondary/30">
                      0{index + 1}
                    </span>
                    <span className="font-display text-xs font-semibold text-white truncate">
                      {item.title}
                    </span>
                  </div>

                  <span className="font-mono text-xs font-semibold text-secondary shrink-0">
                    {item.price}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
