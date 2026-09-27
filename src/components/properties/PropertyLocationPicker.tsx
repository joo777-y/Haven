"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Compass,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { geocodePropertyLocationAction } from "@/lib/properties/actions";

// Dynamic client-only import of PropertyMap for safe SSR rendering
const PropertyMap = dynamic(() => import("@/components/maps/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center rounded-xl border border-divider bg-background p-8 text-center min-h-[220px] animate-pulse">
      <Compass className="h-6 w-6 text-muted/50 animate-spin mb-1.5" />
      <span className="text-[11px] text-muted">Rendering location map canvas...</span>
    </div>
  ),
});

export interface PropertyLocationPickerProps {
  country: string;
  setCountry: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  neighborhood: string;
  setNeighborhood: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  latitude: string;
  setLatitude: (val: string) => void;
  longitude: string;
  setLongitude: (val: string) => void;
  errors?: {
    country?: string;
    city?: string;
    neighborhood?: string;
    address?: string;
    latitude?: string;
    longitude?: string;
  };
  className?: string;
}

export default function PropertyLocationPicker({
  country,
  setCountry,
  city,
  setCity,
  neighborhood,
  setNeighborhood,
  address,
  setAddress,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  errors = {},
  className = "",
}: PropertyLocationPickerProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeSuccessMsg, setGeocodeSuccessMsg] = useState<string | null>(null);
  const [geocodeErrorMsg, setGeocodeErrorMsg] = useState<string | null>(null);

  // Validate numeric coordinates for preview map
  const numLat = parseFloat(latitude);
  const numLng = parseFloat(longitude);
  const hasValidCoordinates =
    !isNaN(numLat) &&
    !isNaN(numLng) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLng >= -180 &&
    numLng <= 180;

  const handleFindLocation = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isGeocoding) return;

    setGeocodeSuccessMsg(null);
    setGeocodeErrorMsg(null);

    if (!city.trim()) {
      setGeocodeErrorMsg("Please enter at least a City to locate this residence.");
      return;
    }

    setIsGeocoding(true);

    try {
      const res = await geocodePropertyLocationAction({
        country: country.trim() || undefined,
        city: city.trim(),
        neighborhood: neighborhood.trim() || undefined,
        address: address.trim() || undefined,
      });

      if (res.success && res.data) {
        setLatitude(String(res.data.latitude));
        setLongitude(String(res.data.longitude));
        setGeocodeSuccessMsg(res.data.displayName);
      } else {
        setGeocodeErrorMsg(
          res.error ||
            "Location could not be determined. Please check the address or enter coordinates manually."
        );
      }
    } catch (err) {
      setGeocodeErrorMsg(
        "Network error communicating with geocoding provider. Please try again or enter coordinates manually."
      );
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Address Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            label="Country *"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            error={errors.country}
            placeholder="e.g. Egypt, UAE, United States"
            className="text-xs"
            required
          />
        </div>

        <div>
          <Input
            label="City / Metropolitan Area *"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            error={errors.city}
            placeholder="e.g. Cairo, El Gouna, Dubai"
            className="text-xs"
            required
          />
        </div>

        <div>
          <Input
            label="Exclusive District / Neighborhood"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            error={errors.neighborhood}
            placeholder="e.g. Marina District, Zamalek, Palm Hills"
            className="text-xs"
          />
        </div>

        <div>
          <Input
            label="Street Address / Residence Reference"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            error={errors.address}
            placeholder="e.g. 14 Palm Avenue, Villa 7"
            className="text-xs"
          />
        </div>
      </div>

      {/* Geocoding Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 pb-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFindLocation}
          disabled={isGeocoding || !city.trim()}
          className="flex items-center gap-2 text-xs border-secondary/40 hover:border-secondary hover:bg-secondary/10 self-start cursor-pointer shadow-xs transition-all"
        >
          {isGeocoding ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-secondary" />
              <span>Locating Residence...</span>
            </>
          ) : (
            <>
              <Compass className="h-3.5 w-3.5 text-secondary" />
              <span>Find Location</span>
            </>
          )}
        </Button>

        <span className="text-[11px] text-muted italic">
          Converts country, city, and address into precise GPS coordinates
        </span>
      </div>

      {/* Feedback Messages */}
      {geocodeSuccessMsg && (
        <div className="flex items-start gap-2.5 rounded-xl border border-secondary/30 bg-secondary/10 p-3 text-xs text-foreground animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-secondary block">
              Location Coordinates Resolved
            </span>
            <span className="text-[11px] text-muted line-clamp-2">
              {geocodeSuccessMsg}
            </span>
          </div>
        </div>
      )}

      {geocodeErrorMsg && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{geocodeErrorMsg}</span>
        </div>
      )}

      {/* Manual Coordinates Override Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div>
          <Input
            label="Latitude Coordinate (Optional)"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            error={errors.latitude}
            placeholder="e.g. 27.3949"
            className="text-xs"
          />
        </div>

        <div>
          <Input
            label="Longitude Coordinate (Optional)"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            error={errors.longitude}
            placeholder="e.g. 33.6766"
            className="text-xs"
          />
        </div>
      </div>

      {/* Live Map Preview when valid coordinates exist */}
      {hasValidCoordinates && (
        <div className="space-y-2 pt-2 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-secondary" />
              <span>Map Preview</span>
            </span>
            <span className="text-[10px] text-muted">
              {numLat.toFixed(4)}, {numLng.toFixed(4)}
            </span>
          </div>
          <PropertyMap
            latitude={numLat}
            longitude={numLng}
            markerLabel="Residence"
            className="w-full h-[220px] sm:h-[260px] rounded-xl shadow-xs"
          />
        </div>
      )}

      {/* Attribution */}
      <div className="pt-1 text-right">
        <span className="text-[10px] text-muted/70">
          Geocoding data &copy;{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-muted transition-colors"
          >
            OpenStreetMap
          </a>{" "}
          contributors via Nominatim
        </span>
      </div>
    </div>
  );
}
