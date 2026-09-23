"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MapPin, Bed, Bath, Maximize2, Building2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import FavoriteButton from "./FavoriteButton";

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
  isSaved?: boolean;
}

export interface PropertyCardProps {
  property: Property;
  onSaveToggle?: (id: string) => void;
  className?: string;
}

export default function PropertyCard({
  property,
  onSaveToggle,
  className = "",
}: PropertyCardProps) {
  const [isSaved, setIsSaved] = useState(property.isSaved || false);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    if (onSaveToggle) {
      onSaveToggle(property.id);
    }
  };

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-divider bg-surface transition-all duration-300 hover:border-secondary/30 hover:shadow-card ${className}`}
    >
      {/* Image & Overlay Header */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-background">
        {imageError || !property.image ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-surface/80 p-6 text-center border-b border-divider">
            <Building2 className="h-10 w-10 text-muted/40 mb-2" />
            <span className="font-display text-[11px] tracking-wider uppercase text-muted/70">
              Haven Collection
            </span>
          </div>
        ) : (
          <img
            src={property.image}
            alt={property.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40 pointer-events-none" />

        {/* Top Badges & Actions */}
        <div className="absolute inset-x-4 top-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {property.badge ? (
              <Badge variant="secondary" size="md" className="shadow-xs font-semibold">
                {property.badge}
              </Badge>
            ) : (
              <Badge variant="surface" size="md" className="capitalize shadow-xs">
                {property.listingType === "rent" ? "For Rent" : "For Sale"}
              </Badge>
            )}

            {property.propertyType && (
              <Badge
                variant="surface"
                size="sm"
                className="capitalize bg-black/40 text-white backdrop-blur-md border border-white/20"
              >
                {property.propertyType}
              </Badge>
            )}
          </div>

          {/* Reusable Favorite Button */}
          <FavoriteButton
            propertyId={property.id}
            initialIsSaved={property.isSaved}
            onToggleSuccess={onSaveToggle ? () => onSaveToggle(property.id) : undefined}
          />
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Price & Title */}
        <div className="space-y-1.5">
          <span className="font-display text-2xl font-bold text-primary tracking-tight">
            {property.price}
            {property.listingType === "rent" && (
              <span className="text-xs font-normal text-muted font-sans ml-1">
                / mo
              </span>
            )}
          </span>
          <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1 group-hover:text-secondary transition-colors">
            <Link href={`/properties/${property.slug}`}>
              <span className="absolute inset-0 z-0" aria-hidden="true" />
              {property.title}
            </Link>
          </h3>
        </div>

        {/* Location */}
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5 text-secondary shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Key Specs Bar */}
        <div className="mt-5 pt-4 border-t border-divider/60 flex items-center justify-between text-xs text-muted font-medium">
          <div className="flex items-center gap-1.5">
            <Bed className="h-4 w-4 text-primary shrink-0" />
            <span>{property.beds} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="h-4 w-4 text-primary shrink-0" />
            <span>{property.baths} Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="h-4 w-4 text-primary shrink-0" />
            <span>{property.area}</span>
          </div>
        </div>

        {/* Safe Public Advisor Info */}
        {property.agent && (
          <div className="mt-3.5 pt-3 border-t border-divider/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              {property.agent.avatarUrl ? (
                <img
                  src={property.agent.avatarUrl}
                  alt={property.agent.fullName}
                  className="h-5 w-5 rounded-full object-cover border border-divider shrink-0"
                />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/10 text-[10px] font-semibold text-secondary shrink-0">
                  {property.agent.fullName.charAt(0)}
                </div>
              )}
              <span className="truncate text-muted text-[11px]">
                Advised by{" "}
                <span className="font-medium text-foreground">
                  {property.agent.fullName}
                </span>
              </span>
            </div>
            {property.agent.professionalTitle && (
              <span className="text-[10px] text-muted hidden sm:inline truncate max-w-[110px]">
                {property.agent.professionalTitle}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
