"use client";

import Image from "next/image";
import Link from "next/link";
import { History, Trash2, MapPin, Building2, ExternalLink } from "lucide-react";
import { useRecentlyViewed } from "@/lib/properties/recentlyViewed";
import { formatPropertyPrice } from "@/types/property";
import Button from "@/components/ui/Button";

interface RecentlyViewedTrayProps {
  title?: string;
  subtitle?: string;
  className?: string;
  currentPropertyId?: string; // Optional: filter out the current property if rendered on details page
}

export default function RecentlyViewedTray({
  title = "Recently Explored Residences",
  subtitle = "Quickly resume reviewing your previously viewed luxury properties.",
  className = "",
  currentPropertyId,
}: RecentlyViewedTrayProps) {
  const { items, clearHistory, isLoaded } = useRecentlyViewed();

  if (!isLoaded || items.length === 0) {
    return null;
  }

  // Optionally filter out current property if requested
  const displayItems = currentPropertyId
    ? items.filter((item) => item.id !== currentPropertyId)
    : items;

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <section className={`space-y-6 pt-6 ${className}`}>
      {/* Tray Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-divider pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/10 text-secondary">
              <History className="h-3.5 w-3.5" />
            </span>
            <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
              {title}
            </h2>
          </div>
          <p className="text-xs text-muted">
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={clearHistory}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-red-500 transition-colors self-start sm:self-auto cursor-pointer font-medium"
          title="Clear browsing history"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {displayItems.map((property) => (
          <div
            key={property.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-divider bg-surface transition-all duration-300 hover:border-secondary/30 hover:shadow-card"
          >
            {/* Image Frame */}
            <Link
              href={`/properties/${property.slug}`}
              className="relative aspect-4/3 w-full overflow-hidden bg-background block"
            >
              {property.coverImage ? (
                <Image
                  src={property.coverImage}
                  alt={property.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted">
                    <Building2 className="h-8 w-8" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Property Type Badge */}
                <span className="absolute top-3 left-3 rounded-full bg-surface/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground border border-divider">
                  {property.propertyType}
                </span>
              </Link>

              {/* Content Body */}
              <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[11px] text-muted">
                    <MapPin className="h-3 w-3 text-secondary shrink-0" />
                    <span className="truncate">
                      {property.city}, {property.country}
                    </span>
                  </div>

                  <Link
                    href={`/properties/${property.slug}`}
                    className="font-display text-sm font-semibold text-foreground group-hover:text-secondary transition-colors line-clamp-1 block"
                  >
                    {property.title}
                  </Link>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-divider/60">
                  <span className="font-display text-base font-bold text-foreground">
                    {property.formattedPrice || formatPropertyPrice(property.price)}
                  </span>

                  <Link
                    href={`/properties/${property.slug}`}
                    className="text-xs font-medium text-secondary hover:underline inline-flex items-center gap-1"
                  >
                    <span>View</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
