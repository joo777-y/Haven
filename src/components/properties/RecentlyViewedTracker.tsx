"use client";

import { useEffect, useRef } from "react";
import { recordRecentlyViewed } from "@/lib/properties/recentlyViewed";
import { recordPropertyView } from "@/lib/properties/propertyView";
import type { RecentlyViewedItem } from "@/types/property";

interface RecentlyViewedTrackerProps {
  property: Omit<RecentlyViewedItem, "viewedAt">;
}

/**
 * Invisible client-side component that records a property page view:
 * 1. User browsing history into browser localStorage for UX trays (preserved)
 * 2. Anonymized property analytics view into Supabase via record_property_view RPC
 */
export default function RecentlyViewedTracker({
  property,
}: RecentlyViewedTrackerProps) {
  const trackedPropertyIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!property?.id) return;

    // Prevent duplicate triggers during the same component lifecycle (e.g. React StrictMode)
    if (trackedPropertyIdRef.current === property.id) return;
    trackedPropertyIdRef.current = property.id;

    // 1. Record UX browsing history (localStorage)
    try {
      recordRecentlyViewed(property);
    } catch {
      // Fail silently
    }

    // 2. Record analytics view via Supabase RPC (non-blocking)
    recordPropertyView(property.id);
  }, [property]);

  return null;
}
