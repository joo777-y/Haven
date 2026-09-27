"use client";

import { createClient } from "@/lib/supabase/client";

export const VIEW_SESSION_STORAGE_KEY = "haven_view_session_id";

// In-memory guard to avoid duplicate calls during the same mounted page lifecycle / re-renders
const recordedInSession = new Set<string>();

/**
 * Retrieves the current anonymous visitor session UUID or creates and persists
 * a new one in localStorage. Fails gracefully if storage is restricted.
 */
export function getOrCreateViewerSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    let sessionId = window.localStorage.getItem(VIEW_SESSION_STORAGE_KEY);
    if (!sessionId || sessionId.trim().length === 0 || sessionId.length > 100) {
      sessionId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `haven_sess_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      window.localStorage.setItem(VIEW_SESSION_STORAGE_KEY, sessionId);
    }
    return sessionId;
  } catch {
    // Fallback in-memory session if localStorage is disabled or throws
    return `haven_mem_${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Asynchronously records a property view into the database via Supabase RPC.
 * - Non-blocking: Executes in the background, never throws, never degrades UI.
 * - In-memory guard prevents duplicate requests during React re-renders / StrictMode.
 * - Database handles 12-hour deduplication and owner self-view exclusion.
 */
export async function recordPropertyView(propertyId: string): Promise<boolean> {
  if (typeof window === "undefined" || !propertyId) {
    return false;
  }

  // Prevent multiple calls for the same property during this client session
  if (recordedInSession.has(propertyId)) {
    return false;
  }
  recordedInSession.add(propertyId);

  try {
    const sessionId = getOrCreateViewerSessionId();
    if (!sessionId) return false;

    const supabase = createClient();
    const { data, error } = await supabase.rpc("record_property_view", {
      p_property_id: propertyId,
      p_session_id: sessionId,
    });

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[Analytics] View recording notice:", error.message);
      }
      return false;
    }

    return Boolean(data);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.debug("[Analytics] Failed to record view:", err);
    }
    return false;
  }
}
