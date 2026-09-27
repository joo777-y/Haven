"use client";

import React, { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, Marker, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_CONFIG } from "@/config/map";
import { MapPin, AlertCircle, Compass } from "lucide-react";

export interface PropertyMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  className?: string;
  markerLabel?: string;
  interactive?: boolean;
}

/**
 * Reusable client-side WebGL map component powered by MapLibre GL JS.
 * Renders a single property location with a luxury editorial marker.
 * Strictly adheres to [longitude, latitude] coordinate ordering.
 */
export default function PropertyMap({
  latitude,
  longitude,
  zoom = MAP_CONFIG.defaultPropertyZoom,
  className = "",
  markerLabel,
  interactive = true,
}: PropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  // Validate coordinates
  const isValidCoord =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  useEffect(() => {
    if (!isValidCoord || !mapContainerRef.current) return;

    let isMounted = true;

    try {
      // Coordinates in MapLibre: [longitude, latitude]
      const center: [number, number] = [longitude, latitude];

      const map = new MapLibreMap({
        container: mapContainerRef.current,
        style: MAP_CONFIG.defaultStyle,
        center,
        zoom,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
        interactive,
        attributionControl: {
          compact: true,
        },
      });

      mapInstanceRef.current = map;

      // Add navigation controls (zoom in/out, compass) if interactive
      if (interactive) {
        map.addControl(
          new NavigationControl({
            showCompass: true,
            showZoom: true,
            visualizePitch: false,
          }),
          "top-right"
        );
      }

      // Create luxury custom DOM marker
      const el = document.createElement("div");
      el.className = "haven-map-marker group relative cursor-pointer";

      // Inner marker design
      if (markerLabel) {
        el.innerHTML = `
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white shadow-floating border border-secondary/40 font-display text-xs font-bold tracking-tight hover:scale-105 transition-transform">
            <span class="h-2 w-2 rounded-full bg-secondary"></span>
            <span>${markerLabel}</span>
          </div>
          <div class="w-2 h-2 bg-primary rotate-45 mx-auto -mt-1 border-r border-b border-secondary/40"></div>
        `;
      } else {
        el.innerHTML = `
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-floating border-2 border-secondary hover:scale-110 transition-transform">
            <div class="h-3 w-3 rounded-full bg-secondary animate-pulse"></div>
          </div>
        `;
      }

      const marker = new Marker({ element: el })
        .setLngLat(center)
        .addTo(map);

      markerRef.current = marker;

      map.on("error", (e: any) => {
        if (isMounted) {
          console.warn("MapLibre tile loading notice:", e?.error);
        }
      });
    } catch (err) {
      if (isMounted) {
        console.error("Failed to initialize MapLibre instance:", err);
        setInitError("Unable to load map at this time.");
      }
    }

    return () => {
      isMounted = false;
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, interactive, markerLabel, isValidCoord]);

  // Graceful fallback for missing or invalid coordinates
  if (!isValidCoord) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-2xl border border-divider bg-surface/40 p-8 text-center ${className}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background border border-divider text-muted mb-3">
          <MapPin className="h-6 w-6 text-muted" />
        </div>
        <p className="font-display text-sm font-semibold text-foreground">
          Exact Coordinates Unavailable
        </p>
        <p className="text-xs text-muted max-w-xs mt-1">
          Detailed geographic coordinates have not been provided for this residence.
        </p>
      </div>
    );
  }

  // Graceful fallback for WebGL / initialization error
  if (initError) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-2xl border border-divider bg-surface/40 p-8 text-center ${className}`}
      >
        <AlertCircle className="h-6 w-6 text-amber-500 mb-2" />
        <p className="font-display text-sm font-semibold text-foreground">
          Map Preview Unavailable
        </p>
        <p className="text-xs text-muted max-w-xs mt-1">
          {initError}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-divider ${className}`}>
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[300px] sm:min-h-[380px]"
      />
    </div>
  );
}
