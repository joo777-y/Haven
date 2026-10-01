"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Bed, Bath, Maximize2, Building2, ArrowRight } from "lucide-react";
import HavenImage from "@/components/ui/HavenImage";
import Badge from "@/components/ui/Badge";
import FavoriteButton from "./FavoriteButton";
import SaveToCollectionButton from "@/components/collections/SaveToCollectionButton";
import { getOptimizedImageUrl } from "@/lib/images/getOptimizedImageUrl";

export interface Property {
  id: string;
  title: string;
  slug: string;
  price: string;
  location: string;
  image: string;
  beds: number | null;
  baths: number | null;
  area: string;
  badge?: string;
  listingType?: "sale" | "rent";
  propertyType?: string;
  agent?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    companyName?: string | null;
    professionalTitle?: string | null;
  } | null;
  latitude?: number | null;
  longitude?: number | null;
  rawPrice?: number;
  isSaved?: boolean;
}

export interface PropertyCardProps {
  property: Property;
  onSaveToggle?: (id: string) => void;
  className?: string;
  isSelected?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function PropertyCard({
  property,
  onSaveToggle,
  className = "",
  isSelected = false,
  onMouseEnter,
  onMouseLeave,
}: PropertyCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <article
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group relative flex flex-col h-full overflow-hidden rounded-2xl border bg-surface transition-all duration-300 ${
        isSelected
          ? "border-secondary ring-2 ring-secondary/50 shadow-lg scale-[1.01]"
          : "border-divider hover:border-secondary/30 hover:shadow-card"
      } ${className}`}
    >
      {/* 1. Image Viewport */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-background shrink-0">
        <Link
          href={`/properties/${property.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="block h-full w-full focus:outline-none"
        >
          <HavenImage
            src={property.image}
            alt={property.title}
            preset="card"
            containerClassName="h-full w-full"
            className="transition-transform duration-500 group-hover:scale-105 transform-gpu will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40 pointer-events-none" />
        </Link>

        {/* Top Badges & Actions */}
        <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
            {/* Clear For Sale vs For Rent Classification Badge */}
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                property.listingType === "rent"
                  ? "bg-secondary text-white"
                  : "bg-primary text-white"
              }`}
            >
              {property.listingType === "rent" ? "For Rent" : "For Sale"}
            </span>

            {property.propertyType && (
              <span className="rounded-full bg-surface/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground border border-divider shadow-xs">
                {property.propertyType}
              </span>
            )}
            {property.badge && (
              <Badge variant="outline" size="sm" className="shadow-xs font-semibold text-[10px] bg-surface/90 text-foreground border-divider">
                {property.badge}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <SaveToCollectionButton
              propertyId={property.id}
              propertyTitle={property.title}
              variant="icon"
            />
            <FavoriteButton
              propertyId={property.id}
              initialIsSaved={property.isSaved}
              onToggleSuccess={onSaveToggle ? () => onSaveToggle(property.id) : undefined}
            />
          </div>
        </div>
      </div>

      {/* 2. Structured Content Body */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 space-y-3.5">
        <div className="space-y-2">
          {/* Location & Type Indicator */}
          <div className="flex items-center justify-between text-xs text-muted">
            <div className="flex items-center gap-1 min-w-0 pr-2">
              <MapPin className="h-3 w-3 text-secondary shrink-0" />
              <span className="truncate text-[11px]">{property.location}</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted/80 shrink-0">
              {property.listingType === "rent" ? "For Rent" : "For Sale"}
            </span>
          </div>

          {/* Residence Title */}
          <Link
            href={`/properties/${property.slug}`}
            className="font-display text-base font-semibold text-foreground group-hover:text-secondary transition-colors line-clamp-1 block"
          >
            {property.title}
          </Link>

          {/* Price Header */}
          <div className="flex items-baseline gap-1">
            <span className="font-display text-xl font-bold text-foreground tracking-tight">
              {property.price}
            </span>
            {property.listingType === "rent" && (
              <span className="text-xs font-normal text-muted font-sans">/ mo</span>
            )}
          </div>
        </div>

        {/* 3. Key Architectural Specs Bar */}
        <div className="pt-3 border-t border-divider/60 grid grid-cols-3 gap-1.5 text-center text-xs text-muted font-medium">
          <div className="flex items-center justify-center gap-1.5 py-1 px-1 rounded-lg bg-surface/70 border border-divider/30">
            <Bed className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate text-[11px]">{property.beds ?? "—"} Beds</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 py-1 px-1 rounded-lg bg-surface/70 border border-divider/30">
            <Bath className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate text-[11px]">{property.baths ?? "—"} Baths</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 py-1 px-1 rounded-lg bg-surface/70 border border-divider/30">
            <Maximize2 className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate text-[11px]">{property.area}</span>
          </div>
        </div>

        {/* 4. Advisor & Explore Link Footer */}
        <div className="pt-3 border-t border-divider/40 flex items-center justify-between text-xs mt-auto">
          {property.agent ? (
            <div className="flex items-center gap-2 min-w-0 pr-2">
              {property.agent.avatarUrl ? (
                <img
                  src={getOptimizedImageUrl(property.agent.avatarUrl, "thumbnail")}
                  alt={property.agent.fullName}
                  className="h-5 w-5 rounded-full object-cover border border-divider shrink-0"
                />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/15 text-[10px] font-bold text-secondary shrink-0">
                  {property.agent.fullName.charAt(0)}
                </div>
              )}
              <span className="truncate text-muted text-[11px]">
                <span className="font-medium text-foreground">
                  {property.agent.fullName}
                </span>
              </span>
            </div>
          ) : (
            <span className="text-[10px] font-display uppercase tracking-widest text-muted/60">
              Haven Collection
            </span>
          )}

          <Link
            href={`/properties/${property.slug}`}
            tabIndex={-1}
            aria-hidden="true"
            className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary transition-colors shrink-0 group/link"
          >
            <span>View</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
