"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MapPin, Bed, Bath, Maximize2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import IconButton from "@/components/ui/IconButton";

export interface Property {
  id: string;
  title: string;
  slug: string;
  price: string;
  location: string;
  image: string;
  beds: number;
  baths: number;
  area: string;
  badge?: string;
  listingType?: "sale" | "rent";
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
        <img
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

        {/* Top Badges & Actions */}
        <div className="absolute inset-x-4 top-4 flex items-center justify-between z-10">
          {property.badge ? (
            <Badge variant="secondary" size="md" className="shadow-xs font-semibold">
              {property.badge}
            </Badge>
          ) : (
            <Badge variant="surface" size="md" className="capitalize">
              {property.listingType === "rent" ? "For Rent" : "For Sale"}
            </Badge>
          )}

          {/* UI-only Favorite Button */}
          <IconButton
            onClick={handleFavoriteClick}
            aria-label={isSaved ? "Remove from saved" : "Save property"}
            variant="ghost"
            size="md"
            className="bg-surface/80 text-primary backdrop-blur-md hover:bg-surface hover:scale-105 shadow-xs"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isSaved ? "fill-secondary text-secondary" : "text-primary"
              }`}
            />
          </IconButton>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Price & Title */}
        <div className="space-y-1.5">
          <span className="font-display text-2xl font-bold text-primary tracking-tight">
            {property.price}
            {property.listingType === "rent" && (
              <span className="text-xs font-normal text-muted font-sans ml-1">/ mo</span>
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
      </div>
    </article>
  );
}
