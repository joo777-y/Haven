import type { Database } from "@/types/database";
import type { PropertyWithDetails } from "@/types/property";

// Database row aliases
export type CollectionRow = Database["public"]["Tables"]["collections"]["Row"];
export type CollectionInsert = Database["public"]["Tables"]["collections"]["Insert"];
export type CollectionUpdate = Database["public"]["Tables"]["collections"]["Update"];

export type CollectionPropertyRow = Database["public"]["Tables"]["collection_properties"]["Row"];
export type CollectionPropertyInsert = Database["public"]["Tables"]["collection_properties"]["Insert"];
export type CollectionPropertyUpdate = Database["public"]["Tables"]["collection_properties"]["Update"];

/**
 * Lightweight collection summary for catalog & dashboard cards.
 * Includes mosaic preview image thumbnails and property count.
 */
export interface CollectionPreviewItem {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  propertyCount: number;
  previewImages: string[];
  totalValue: number;
}

/**
 * Full collection with nested properties and media.
 */
export interface CollectionWithProperties extends CollectionRow {
  properties: PropertyWithDetails[];
  totalValue: number;
  propertyCount: number;
}

/**
 * Aggregated statistics for the user dashboard overview.
 */
export interface DashboardOverviewStats {
  savedCount: number;
  collectionsCount: number;
  inquiriesCount: number;
  recentInquiries: {
    id: string;
    propertyTitle: string;
    propertySlug: string;
    status: string;
    createdAt: string;
    message: string;
  }[];
  recentSavedProperties: {
    id: string;
    title: string;
    slug: string;
    price: number;
    city: string;
    country: string;
    coverImage: string;
  }[];
}
