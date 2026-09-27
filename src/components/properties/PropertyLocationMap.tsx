"use client";

import dynamic from "next/dynamic";
import { MapPin, Navigation, ExternalLink, Compass } from "lucide-react";
import Button from "@/components/ui/Button";

// Dynamically import PropertyMap with SSR disabled to guarantee zero window/WebGL issues during SSR
const PropertyMap = dynamic(() => import("@/components/maps/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-divider bg-surface/50 p-12 text-center min-h-[320px] sm:min-h-[380px] animate-pulse">
      <Compass className="h-8 w-8 text-muted/50 animate-spin mb-2" />
      <span className="text-xs text-muted">Loading architectural map canvas...</span>
    </div>
  ),
});

interface PropertyLocationMapProps {
  latitude: number | null;
  longitude: number | null;
  title: string;
  address?: string | null;
  neighborhood?: string | null;
  city: string;
  country: string;
  formattedPrice?: string;
  className?: string;
}

export default function PropertyLocationMap({
  latitude,
  longitude,
  title,
  address,
  neighborhood,
  city,
  country,
  formattedPrice,
  className = "",
}: PropertyLocationMapProps) {
  const hasCoordinates =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    !isNaN(latitude) &&
    !isNaN(longitude);

  const locationSummary = [neighborhood, city, country].filter(Boolean).join(", ") || city;

  // External directions URL
  const directionsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        [address, neighborhood, city, country].filter(Boolean).join(", ")
      )}`;

  return (
    <section className={`space-y-4 pt-6 border-t border-divider ${className}`}>
      {/* Header with location text and external directions link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/10 text-secondary">
              <MapPin className="h-3.5 w-3.5" />
            </span>
            <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
              Neighborhood & Location
            </h2>
          </div>
          <p className="text-xs text-muted">
            {locationSummary}
            {address ? ` • ${address}` : ""}
          </p>
        </div>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-divider bg-surface text-xs font-semibold text-foreground hover:border-secondary/40 hover:text-secondary transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Navigation className="h-3.5 w-3.5 text-secondary" />
          <span>Get Directions</span>
          <ExternalLink className="h-3 w-3 text-muted ml-0.5" />
        </a>
      </div>

      {/* Map or Graceful Fallback Card */}
      {hasCoordinates ? (
        <PropertyMap
          latitude={latitude}
          longitude={longitude}
          markerLabel={formattedPrice}
          className="w-full h-[320px] sm:h-[400px] shadow-xs"
        />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-divider bg-surface/40 p-10 text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background border border-divider text-muted mb-1 shadow-xs">
            <MapPin className="h-6 w-6 text-muted" />
          </div>
          <p className="font-display text-sm font-semibold text-foreground">
            Precise Map Pin Unavailable
          </p>
          <p className="text-xs text-muted max-w-sm">
            Exact geographic coordinates for this residence are withheld for client privacy. Please consult the advisor for private tour navigation.
          </p>
        </div>
      )}
    </section>
  );
}
