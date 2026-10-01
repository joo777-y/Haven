"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export interface HeroPropertyItem {
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
  listingType?: string;
  propertyType?: string;
  tagline?: string;
}

export interface HeroStatItem {
  label: string;
  value: string;
  description: string;
}

interface HeroSectionProps {
  showcaseProperties: HeroPropertyItem[];
  stats?: HeroStatItem[];
}

const propertyTypeOptions = [
  { value: "all", label: "All Types" },
  { value: "villa", label: "Villas & Estates" },
  { value: "penthouse", label: "Penthouses" },
  { value: "chalet", label: "Coastal Chalets" },
  { value: "townhouse", label: "Townhouses" },
  { value: "apartment", label: "Apartments" },
];

const priceRangeOptions = [
  { value: "any", label: "Any Price" },
  { value: "0-1000000", label: "Under $1M" },
  { value: "1000000-3000000", label: "$1M - $3M" },
  { value: "3000000-5000000", label: "$3M - $5M" },
  { value: "5000000-10000000", label: "$5M - $10M" },
  { value: "10000000+", label: "$10M+" },
];

export default function HeroSection({
  showcaseProperties,
}: HeroSectionProps) {
  const router = useRouter();

  // Active showcase property index
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Search state
  const [tab, setTab] = useState<"buy" | "rent">("buy");
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState("any");

  const properties = showcaseProperties.length > 0 ? showcaseProperties : [];
  const activeProperty = properties[activeIndex] || properties[0];

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

  const handleSelectProperty = useCallback(
    (index: number) => {
      if (index === activeIndex || isTransitioning) return;
      setIsTransitioning(true);
      setActiveIndex(index);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
      return () => clearTimeout(timer);
    },
    [activeIndex, isTransitioning]
  );

  const handleNextProperty = useCallback(() => {
    if (properties.length <= 1) return;
    handleSelectProperty((activeIndex + 1) % properties.length);
  }, [activeIndex, properties.length, handleSelectProperty]);

  const handlePrevProperty = useCallback(() => {
    if (properties.length <= 1) return;
    handleSelectProperty((activeIndex - 1 + properties.length) % properties.length);
  }, [activeIndex, properties.length, handleSelectProperty]);

  // Search Form Submission -> URL query parameter synchronization
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    // Listing type
    params.set("type", tab === "buy" ? "sale" : "rent");

    // Location query
    if (location.trim()) {
      params.set("q", location.trim());
    }

    // Property Type
    if (propertyType && propertyType !== "all") {
      params.set("category", propertyType);
    }

    // Price Range mapping
    if (priceRange && priceRange !== "any") {
      if (priceRange.includes("-")) {
        const [min, max] = priceRange.split("-");
        if (min) params.set("minPrice", min);
        if (max) params.set("maxPrice", max);
      } else if (priceRange.endsWith("+")) {
        const min = priceRange.replace("+", "");
        params.set("minPrice", min);
      }
    }

    router.push(`/properties?${params.toString()}`);
  };

  if (!activeProperty) return null;

  return (
    <section className="relative h-[calc(100dvh-5rem)] min-h-[580px] sm:min-h-[640px] flex flex-col justify-between py-2 sm:py-3.5 overflow-hidden bg-background">
      <Container className="h-full flex flex-col justify-between gap-2.5 sm:gap-3.5">
        {/* ================================================================= */}
        {/* 1. THE HERO PROPERTY STAGE (Dominant Visual Protagonist - Fills Height) */}
        {/* ================================================================= */}
        <div className="group relative w-full flex-1 min-h-[320px] sm:min-h-[380px] rounded-2xl sm:rounded-3xl overflow-hidden border border-divider/80 bg-primary shadow-xl">
          {/* Main Hero Architectural Photography */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              isTransitioning && !prefersReducedMotion ? "opacity-40 scale-102" : "opacity-100 scale-100"
            }`}
          >
            <Image
              src={activeProperty.image}
              alt={activeProperty.title}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className={`object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                prefersReducedMotion ? "" : "group-hover:scale-[1.015]"
              }`}
            />
          </div>

          {/* Cinematic Vignette Overlay (Crystal clear upper image, readable contrast bottom) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20 pointer-events-none" />

          {/* Top Stage Bar: Badges & Showcase Switcher */}
          <div className="relative z-10 flex items-center justify-between p-3.5 sm:p-5 lg:p-6">
            {/* Architectural Quality Badge & Masthead Tagline */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/90 backdrop-blur-md px-3.5 py-1 text-[11px] font-semibold text-primary border border-white/20 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                <span>{activeProperty.badge || "Featured Sanctuary"}</span>
              </span>

              <span className="hidden sm:inline-flex rounded-full bg-black/45 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-white/90 border border-white/10 uppercase tracking-wider">
                {activeProperty.listingType === "rent" ? "For Rent" : "For Sale"}
              </span>

              <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-black/35 backdrop-blur-md px-3 py-1 text-[11px] text-white/80 border border-white/10">
                <span>Curated Architectural Portfolio</span>
              </span>
            </div>

            {/* Interactive Showcase Switcher (Cycle premier properties) */}
            {properties.length > 1 && (
              <div
                role="tablist"
                aria-label="Hero featured residences"
                className="flex items-center gap-1 rounded-full bg-black/45 backdrop-blur-md p-1 border border-white/15"
              >
                {properties.map((prop, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={prop.id || idx}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`View ${prop.title}`}
                      onClick={() => handleSelectProperty(idx)}
                      className={`rounded-full px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-white text-primary shadow-xs"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <span className="hidden md:inline mr-1 text-[10px] opacity-60">
                        0{idx + 1}
                      </span>
                      <span>
                        {prop.propertyType
                          ? prop.propertyType.charAt(0).toUpperCase() + prop.propertyType.slice(1)
                          : `Home ${idx + 1}`}
                      </span>
                    </button>
                  );
                })}

                {/* Mobile Arrows */}
                <div className="flex items-center md:hidden pl-1 pr-0.5">
                  <button
                    onClick={handlePrevProperty}
                    aria-label="Previous featured residence"
                    className="p-1 text-white/70 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleNextProperty}
                    aria-label="Next featured residence"
                    className="p-1 text-white/70 hover:text-white cursor-pointer"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Property Dossier (Layered Over Imagery) */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6 lg:p-7 flex flex-col md:flex-row md:items-end justify-between gap-4 pointer-events-none">
            {/* Left: Property Narrative & Architectural Specs */}
            <div className="space-y-2 max-w-2xl pointer-events-auto">
              <div>
                <span className="font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-secondary block mb-0.5">
                  FEATURED RESIDENCE • {activeProperty.city || "SANCTUARY"}
                </span>
                <Link
                  href={`/properties/${activeProperty.slug}`}
                  className="group/title block"
                >
                  <h2 className="font-display text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-semibold text-white tracking-tight drop-shadow-xs group-hover/title:text-secondary transition-colors line-clamp-1 sm:line-clamp-none">
                    {activeProperty.title}
                  </h2>
                </Link>
                <div className="flex items-center gap-1.5 text-white/90 text-xs sm:text-sm mt-1 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-secondary shrink-0" />
                  <span className="truncate">{activeProperty.location}</span>
                </div>
              </div>

              {/* Architectural Specs Bar */}
              <div className="flex items-center gap-2 text-white/90 text-xs font-medium flex-wrap pt-0.5">
                {activeProperty.beds !== null && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-black/45 backdrop-blur-md border border-white/15">
                    <Bed className="h-3.5 w-3.5 text-secondary shrink-0" />
                    <span>{activeProperty.beds} Beds</span>
                  </div>
                )}
                {activeProperty.baths !== null && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-black/45 backdrop-blur-md border border-white/15">
                    <Bath className="h-3.5 w-3.5 text-secondary shrink-0" />
                    <span>{activeProperty.baths} Baths</span>
                  </div>
                )}
                {activeProperty.area && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-black/45 backdrop-blur-md border border-white/15">
                    <Maximize2 className="h-3.5 w-3.5 text-secondary shrink-0" />
                    <span>{activeProperty.area}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Offering Price & Direct Action CTA */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2.5 shrink-0 pointer-events-auto pt-2 border-t border-white/15 md:border-t-0">
              <div className="text-left md:text-right">
                <span className="text-[10px] font-sans uppercase tracking-wider text-white/70 block">
                  Offering Price
                </span>
                <span className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  {activeProperty.price}
                </span>
              </div>

              <Link href={`/properties/${activeProperty.slug}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 text-xs font-semibold shadow-md hover:shadow-xl transition-all cursor-pointer px-4 py-2"
                >
                  <span>Explore Residence</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. INTEGRATED DISCOVERY & SEARCH BAR (Docked neatly at bottom)    */}
        {/* ================================================================= */}
        <div className="shrink-0 w-full">
          <div className="rounded-2xl border border-divider/90 bg-surface/95 backdrop-blur-md p-3 sm:p-4 shadow-floating">
            <form
              onSubmit={handleSearchSubmit}
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 items-end"
            >
              {/* Mode Toggle inside the search bar */}
              <div className="lg:col-span-2">
                <label className="block font-sans text-xs font-semibold text-primary mb-1">
                  Type
                </label>
                <div className="flex h-[42px] rounded-lg bg-background p-1 border border-divider/70">
                  <button
                    type="button"
                    onClick={() => setTab("buy")}
                    className={`flex-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      tab === "buy"
                        ? "bg-primary text-white shadow-xs"
                        : "text-muted hover:text-primary"
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("rent")}
                    className={`flex-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      tab === "rent"
                        ? "bg-primary text-white shadow-xs"
                        : "text-muted hover:text-primary"
                    }`}
                  >
                    Rent
                  </button>
                </div>
              </div>

              {/* Location Input */}
              <div className="lg:col-span-4">
                <Input
                  label="Location"
                  placeholder="City, Neighborhood, or Region..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  leftIcon={<MapPin className="h-4 w-4 text-secondary" />}
                />
              </div>

              {/* Property Type Select */}
              <div className="lg:col-span-2">
                <Select
                  label="Category"
                  options={propertyTypeOptions}
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                />
              </div>

              {/* Price Range Select */}
              <div className="lg:col-span-2">
                <Select
                  label="Price Range"
                  options={priceRangeOptions}
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                />
              </div>

              {/* Action Button */}
              <div className="lg:col-span-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full h-[42px] flex items-center justify-center gap-2 rounded-lg font-semibold text-xs cursor-pointer shadow-xs hover:bg-secondary transition-all"
                >
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
