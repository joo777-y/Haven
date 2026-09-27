"use client";

import { useState, useEffect, useCallback } from "react";
import type { RecentlyViewedItem } from "@/types/property";

export const STORAGE_KEY = "haven_recently_viewed";
export const MAX_RECENTLY_VIEWED = 10;
const SYNC_EVENT = "haven:recently-viewed-updated";

/**
 * Safely reads recently viewed property history from browser localStorage.
 * Handles SSR safety and corrupt JSON gracefully.
 */
export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter valid items
    return parsed.filter(
      (item): item is RecentlyViewedItem =>
        Boolean(
          item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.slug === "string" &&
            typeof item.title === "string"
        )
    );
  } catch (err) {
    console.warn("Failed to read recently viewed history from localStorage:", err);
    return [];
  }
}

/**
 * Records a property inspection into the recently viewed history.
 * Ensures the newest item is at the top, moves duplicate IDs to the front,
 * and maintains a strict maximum of 10 items.
 */
export function recordRecentlyViewed(
  property: Omit<RecentlyViewedItem, "viewedAt">
): void {
  if (typeof window === "undefined" || !property?.id || !property?.slug) return;

  try {
    const current = getRecentlyViewed();

    // Remove any previous entry with the same ID to prevent duplicates
    const filtered = current.filter((item) => item.id !== property.id);

    // Prepend as the newest viewed item
    const newItem: RecentlyViewedItem = {
      ...property,
      viewedAt: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, MAX_RECENTLY_VIEWED);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event for real-time reactive sync across mounted components
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch (err) {
    console.warn("Failed to write recently viewed history to localStorage:", err);
  }
}

/**
 * Purges all recently viewed property history from localStorage.
 */
export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch (err) {
    console.warn("Failed to clear recently viewed history:", err);
  }
}

/**
 * React hook to access and subscribe to recently viewed property history.
 * Safe from hydration mismatch by deferring initial localStorage read to mount.
 */
export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const sync = useCallback(() => {
    setItems(getRecentlyViewed());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    sync();

    const handleUpdate = () => sync();

    window.addEventListener(SYNC_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(SYNC_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [sync]);

  const clearHistory = useCallback(() => {
    clearRecentlyViewed();
    setItems([]);
  }, []);

  return {
    items,
    isLoaded,
    clearHistory,
  };
}
