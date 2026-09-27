"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  LngLatBounds,
  GeoJSONSource,
  MapMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_CONFIG } from "@/config/map";
import {
  MapPin,
  Compass,
  X,
  ExternalLink,
  Building2,
  Bed,
  Bath,
  Maximize2,
} from "lucide-react";
import type { Property } from "@/components/properties/PropertyCard";

export interface PropertyCatalogMapProps {
  properties: Property[];
  selectedPropertyId?: string | null;
  onSelectProperty?: (id: string | null) => void;
  onSearchArea?: (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => void;
  className?: string;
}

/**
 * GeoJSON Feature creation helper for map properties
 */
function createGeoJSONData(
  properties: (Property & { latitude: number; longitude: number })[]
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: properties.map((p) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [p.longitude, p.latitude],
      },
      properties: {
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.price,
        rawPrice: p.rawPrice,
        location: p.location,
        propertyType: p.propertyType,
        image: p.image,
      },
    })),
  };
}

/**
 * High-performance, synchronized WebGL property catalog map powered by MapLibre GL.
 * Features GeoJSON native clustering, custom luxury price markers,
 * viewport movement tracking ("Search this area"), and list-to-map synchronization.
 */
export default function PropertyCatalogMap({
  properties,
  selectedPropertyId,
  onSelectProperty,
  onSearchArea,
  className = "",
}: PropertyCatalogMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const [activePreview, setActivePreview] = useState<Property | null>(null);
  const [showSearchAreaBtn, setShowSearchAreaBtn] = useState(false);
  const initialFitDoneRef = useRef(false);

  // Filter properties with valid numeric coordinates
  const validProperties = properties.filter(
    (p): p is Property & { latitude: number; longitude: number } =>
      typeof p.latitude === "number" &&
      typeof p.longitude === "number" &&
      !isNaN(p.latitude) &&
      !isNaN(p.longitude) &&
      p.latitude >= -90 &&
      p.latitude <= 90 &&
      p.longitude >= -180 &&
      p.longitude <= 180
  );

  // Handle "Search this area" trigger
  const handleSearchAreaClick = useCallback(() => {
    if (!mapInstanceRef.current || !onSearchArea) return;
    const bounds = mapInstanceRef.current.getBounds();
    setShowSearchAreaBtn(false);
    onSearchArea({
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLng: bounds.getWest(),
      maxLng: bounds.getEast(),
    });
  }, [onSearchArea]);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    // Calculate initial map center
    let initialCenter = MAP_CONFIG.defaultCenter;
    if (validProperties.length > 0 && validProperties[0]) {
      initialCenter = [validProperties[0].longitude, validProperties[0].latitude];
    }

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: MAP_CONFIG.defaultStyle,
      center: initialCenter,
      zoom: MAP_CONFIG.defaultCatalogZoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      attributionControl: { compact: true },
    });

    mapInstanceRef.current = map;

    map.addControl(
      new NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: false,
      }),
      "top-right"
    );

    map.on("load", () => {
      if (!isMounted) return;

      const geojsonData = createGeoJSONData(validProperties);

      // Add clustered GeoJSON source
      map.addSource("haven-properties", {
        type: "geojson",
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 50,
      });

      // Clusters layer (circles)
      map.addLayer({
        id: "haven-clusters",
        type: "circle",
        source: "haven-properties",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#121721",
          "circle-radius": [
            "step",
            ["get", "point_count"],
            18,
            5,
            22,
            15,
            28,
          ],
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#C5A880",
          "circle-opacity": 0.95,
        },
      });

      // Cluster count text
      map.addLayer({
        id: "haven-cluster-count",
        type: "symbol",
        source: "haven-properties",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 12,
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        },
        paint: {
          "text-color": "#FFFFFF",
        },
      });

      // Cluster click -> expand zoom
      map.on("click", "haven-clusters", async (e: MapMouseEvent) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["haven-clusters"],
        });
        if (!features || !features[0]) return;
        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource("haven-properties") as GeoJSONSource;
        if (source && clusterId !== undefined) {
          try {
            const zoom = await source.getClusterExpansionZoom(clusterId);
            const geom = features[0].geometry;
            if (geom && geom.type === "Point") {
              map.easeTo({
                center: geom.coordinates as [number, number],
                zoom: zoom ?? map.getZoom() + 2,
                duration: 500,
              });
            }
          } catch (err) {
            console.error("Cluster expansion error:", err);
          }
        }
      });

      // Mouse cursor hover states for clusters
      map.on("mouseenter", "haven-clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "haven-clusters", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    // Map movement listener to trigger "Search this area"
    const handleMoveEnd = () => {
      if (!isMounted) return;
      setShowSearchAreaBtn(true);
    };

    map.on("dragend", handleMoveEnd);
    map.on("zoomend", handleMoveEnd);

    return () => {
      isMounted = false;
      map.off("dragend", handleMoveEnd);
      map.off("zoomend", handleMoveEnd);

      // Clean up markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      map.remove();
      mapInstanceRef.current = null;
      initialFitDoneRef.current = false;
    };
  }, []); // Run once on mount

  // Synchronize GeoJSON source data and HTML Price Markers when properties update
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Update GeoJSON source if already loaded
    const source = map.getSource("haven-properties") as GeoJSONSource;
    if (source) {
      source.setData(createGeoJSONData(validProperties));
    }

    // 2. Clear existing HTML markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    if (validProperties.length === 0) return;

    const bounds = new LngLatBounds();

    validProperties.forEach((property) => {
      const isSelected = selectedPropertyId === property.id;
      const lngLat: [number, number] = [property.longitude, property.latitude];
      bounds.extend(lngLat);

      // Custom Luxury Price Pill Marker Element
      const el = document.createElement("div");
      el.className = `haven-catalog-marker group cursor-pointer transition-all duration-300 ${
        isSelected ? "scale-110 z-30" : "hover:scale-105 z-10"
      }`;

      el.innerHTML = `
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-tight shadow-md border transition-all ${
          isSelected
            ? "bg-[#C5A880] text-[#121721] border-white ring-2 ring-[#C5A880]/50 shadow-lg"
            : "bg-[#121721] text-white border-white/20 hover:bg-[#C5A880] hover:text-[#121721]"
        }">
          <span class="h-1.5 w-1.5 rounded-full ${
            isSelected ? "bg-[#121721] animate-pulse" : "bg-[#C5A880]"
          }"></span>
          <span>${property.price}</span>
        </div>
        <div class="w-1.5 h-1.5 rotate-45 mx-auto -mt-0.5 border-r border-b ${
          isSelected ? "bg-[#C5A880] border-white" : "bg-[#121721] border-white/20"
        }"></div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setActivePreview(property);
        if (onSelectProperty) {
          onSelectProperty(property.id);
        }
        map.easeTo({
          center: lngLat,
          zoom: Math.max(map.getZoom(), 14),
          duration: 600,
        });
      });

      const marker = new Marker({ element: el }).setLngLat(lngLat).addTo(map);
      markersRef.current.set(property.id, marker);
    });

    // Auto-fit map to visible properties once if multiple exist
    if (!initialFitDoneRef.current && validProperties.length > 1) {
      initialFitDoneRef.current = true;
      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        maxZoom: 14,
        duration: 800,
      });
    }
  }, [validProperties, selectedPropertyId, onSelectProperty]);

  // Synchronize when selectedPropertyId changes from outside (e.g. Card Hover / Click)
  useEffect(() => {
    if (!selectedPropertyId || !mapInstanceRef.current) return;

    const targetProp = validProperties.find((p) => p.id === selectedPropertyId);
    if (targetProp) {
      setActivePreview(targetProp);
      mapInstanceRef.current.easeTo({
        center: [targetProp.longitude, targetProp.latitude],
        zoom: Math.max(mapInstanceRef.current.getZoom(), 14),
        duration: 700,
      });
    }
  }, [selectedPropertyId, validProperties]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-divider bg-surface ${className}`}
    >
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[400px] lg:min-h-[600px]"
      />

      {/* "Search this area" Floating Action */}
      {showSearchAreaBtn && onSearchArea && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            type="button"
            onClick={handleSearchAreaClick}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white shadow-floating border border-secondary/40 text-xs font-semibold hover:bg-primary/90 hover:scale-105 transition-all cursor-pointer"
          >
            <Compass className="h-3.5 w-3.5 text-secondary animate-spin-slow" />
            <span>Search this area</span>
          </button>
        </div>
      )}

      {/* No coordinates notice banner if some properties lack coordinates */}
      {validProperties.length === 0 && properties.length > 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/85 backdrop-blur-xs p-8 text-center z-10 space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background border border-divider text-muted mb-1 shadow-xs">
            <MapPin className="h-6 w-6 text-muted" />
          </div>
          <p className="font-display text-sm font-semibold text-foreground">
            No Geographic Coordinates Available
          </p>
          <p className="text-xs text-muted max-w-xs">
            The residences currently matching your filter criteria do not have
            published map coordinates.
          </p>
        </div>
      )}

      {/* Selected Property Preview Popup Card */}
      {activePreview && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-20 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-divider bg-surface shadow-2xl p-3 space-y-2.5">
            <button
              type="button"
              onClick={() => setActivePreview(null)}
              className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              title="Close preview"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl bg-background">
              {activePreview.image ? (
                <Image
                  src={activePreview.image}
                  alt={activePreview.title}
                  fill
                  sizes="320px"
                  unoptimized={
                    !activePreview.image.startsWith(
                      "https://afxgijkdaaidklzhwell.supabase.co"
                    )
                  }
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted">
                  <Building2 className="h-8 w-8" />
                </div>
              )}
              {activePreview.propertyType && (
                <span className="absolute bottom-2 left-2 rounded-full bg-surface/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground border border-divider">
                  {activePreview.propertyType}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[11px] text-muted truncate">
                <MapPin className="h-3 w-3 text-secondary shrink-0" />
                <span>{activePreview.location}</span>
              </div>

              <Link
                href={`/properties/${activePreview.slug}`}
                className="font-display text-sm font-semibold text-foreground hover:text-secondary truncate block transition-colors"
              >
                {activePreview.title}
              </Link>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-muted">
              {activePreview.beds !== null && (
                <div className="flex items-center gap-1">
                  <Bed className="h-3 w-3 text-primary" />
                  <span>{activePreview.beds} Beds</span>
                </div>
              )}
              {activePreview.baths !== null && (
                <div className="flex items-center gap-1">
                  <Bath className="h-3 w-3 text-primary" />
                  <span>{activePreview.baths} Baths</span>
                </div>
              )}
              {activePreview.area && (
                <div className="flex items-center gap-1">
                  <Maximize2 className="h-3 w-3 text-primary" />
                  <span>{activePreview.area}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-divider/60 text-xs">
              <span className="font-display text-base font-bold text-foreground">
                {activePreview.price}
              </span>

              <Link
                href={`/properties/${activePreview.slug}`}
                className="inline-flex items-center gap-1 font-semibold text-secondary hover:underline text-xs"
              >
                <span>View Details</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
