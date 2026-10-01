"use client";

import React, { useState, useCallback, useTransition, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LayoutGrid, Columns2, Map as MapIcon, X, MapPin } from "lucide-react";
import PropertyGrid from "./PropertyGrid";
import PropertyPagination from "./PropertyPagination";
import type { Property } from "./PropertyCard";

// Dynamic client-only import of WebGL map component (prevents SSR / window reference issues)
const PropertyCatalogMap = dynamic(
  () => import("@/components/maps/PropertyCatalogMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[500px] rounded-2xl border border-divider bg-surface flex flex-col items-center justify-center animate-pulse text-muted space-y-3">
        <MapPin className="h-8 w-8 animate-bounce text-secondary" />
        <span className="text-xs font-medium tracking-wide">
          Loading HAVEN Location Intelligence Map...
        </span>
      </div>
    ),
  }
);

export type ViewMode = "list" | "split" | "map";

export interface PropertyCatalogViewProps {
  properties: Property[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  initialViewMode?: ViewMode;
}

export default function PropertyCatalogView({
  properties,
  totalCount,
  currentPage,
  totalPages,
  initialViewMode = "split",
}: PropertyCatalogViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read view mode from URL or fallback to initial
  const currentViewParam = searchParams.get("view") as ViewMode | null;
  const [viewMode, setViewMode] = useState<ViewMode>(
    currentViewParam && ["list", "split", "map"].includes(currentViewParam)
      ? currentViewParam
      : initialViewMode
  );

  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth hover with intentional delay and leave grace period
  const handlePropertyHover = useCallback((id: string | null) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (id) {
      // 280ms hover intent ensures deliberate hover before moving map
      hoverTimeoutRef.current = setTimeout(() => {
        setSelectedPropertyId(id);
      }, 280);
    } else {
      // 600ms grace period keeps pin in view without instantaneous flicker
      hoverTimeoutRef.current = setTimeout(() => {
        setSelectedPropertyId(null);
      }, 600);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Check if geographic bounds filter is active in URL
  const hasBoundsFilter = Boolean(
    searchParams.get("minLat") &&
      searchParams.get("maxLat") &&
      searchParams.get("minLng") &&
      searchParams.get("maxLng")
  );

  // Switch view mode and update URL param smoothly
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", mode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handle "Search this area" bounding box filter
  const handleSearchArea = useCallback(
    (bounds: {
      minLat: number;
      maxLat: number;
      minLng: number;
      maxLng: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("minLat", bounds.minLat.toFixed(6));
      params.set("maxLat", bounds.maxLat.toFixed(6));
      params.set("minLng", bounds.minLng.toFixed(6));
      params.set("maxLng", bounds.maxLng.toFixed(6));
      // Reset to page 1 when bounds change
      params.set("page", "1");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  // Clear map bounding box filter
  const handleClearBounds = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minLat");
    params.delete("maxLat");
    params.delete("minLng");
    params.delete("maxLng");
    params.set("page", "1");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="space-y-6">
      {/* Top View Mode Switcher & Active Bounds Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted font-medium">
            Showing <strong className="text-foreground">{properties.length}</strong> of{" "}
            <strong className="text-foreground">{totalCount}</strong> residences
          </span>

          {hasBoundsFilter && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-semibold border border-secondary/30">
              <MapPin className="h-3 w-3" />
              <span>Area Filter Active</span>
              <button
                type="button"
                onClick={handleClearBounds}
                className="hover:text-primary transition-colors ml-0.5 cursor-pointer"
                title="Clear map area filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* View Mode Segmented Controls */}
        <div className="flex items-center bg-surface border border-divider rounded-xl p-1 shadow-xs">
          {/* List/Grid View Toggle */}
          <button
            type="button"
            onClick={() => handleViewModeChange("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-foreground hover:bg-background"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Grid</span>
          </button>

          {/* Split View Toggle (Desktop only) */}
          <button
            type="button"
            onClick={() => handleViewModeChange("split")}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "split"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-foreground hover:bg-background"
            }`}
          >
            <Columns2 className="h-3.5 w-3.5" />
            <span>Split</span>
          </button>

          {/* Map View Toggle */}
          <button
            type="button"
            onClick={() => handleViewModeChange("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "map"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-foreground hover:bg-background"
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* Main Content Layouts */}
      {viewMode === "list" && (
        <div className="space-y-8">
          <PropertyGrid
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onPropertyHover={handlePropertyHover}
          />
          <PropertyPagination
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      )}

      {viewMode === "split" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Property List */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">
            <PropertyGrid
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              onPropertyHover={handlePropertyHover}
              className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6"
            />
            <PropertyPagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>

          {/* Right Column: Sticky Interactive Catalog Map */}
          <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24 h-[520px] lg:h-[calc(100vh-140px)] rounded-2xl overflow-hidden border border-divider shadow-card">
            <PropertyCatalogMap
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              onSelectProperty={setSelectedPropertyId}
              onSearchArea={handleSearchArea}
              className="h-full w-full"
            />
          </div>
        </div>
      )}

      {viewMode === "map" && (
        <div className="relative w-full h-[650px] lg:h-[calc(100vh-200px)] rounded-2xl overflow-hidden border border-divider shadow-lg">
          <PropertyCatalogMap
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onSelectProperty={setSelectedPropertyId}
            onSearchArea={handleSearchArea}
            className="h-full w-full"
          />
        </div>
      )}
    </div>
  );
}
