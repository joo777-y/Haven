import type { Database } from "@/types/database";

// Database row aliases
export type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
export type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"];
export type PropertyUpdate = Database["public"]["Tables"]["properties"]["Update"];

export type PropertyImageRow = Database["public"]["Tables"]["property_images"]["Row"];
export type PropertyImageInsert = Database["public"]["Tables"]["property_images"]["Insert"];
export type PropertyImageUpdate = Database["public"]["Tables"]["property_images"]["Update"];

export type PropertyFeatureRow = Database["public"]["Tables"]["property_features"]["Row"];
export type PropertyFeatureInsert = Database["public"]["Tables"]["property_features"]["Insert"];

export type AgentPublicRow = Database["public"]["Views"]["agents_public"]["Row"];
export type InquiryRow = Database["public"]["Tables"]["inquiries"]["Row"];

// Domain Enums / Type literals
export type PropertyStatus = PropertyRow["status"];
export type ListingType = PropertyRow["listing_type"];
export type PropertyType = PropertyRow["property_type"];
export type InquiryStatus = InquiryRow["status"];

// Joined detailed property representation
export interface PropertyWithDetails extends PropertyRow {
  property_images: PropertyImageRow[];
  property_features: PropertyFeatureRow[];
  agents_public: AgentPublicRow | null;
}

// Normalized presentation model for UI cards
export interface PropertyCardData {
  id: string;
  title: string;
  slug: string;
  price: number;
  formattedPrice: string;
  location: string;
  city: string;
  country: string;
  neighborhood: string | null;
  coverImage: string;
  images: string[];
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  formattedArea: string;
  listingType: ListingType;
  propertyType: PropertyType;
  status: PropertyStatus;
  isSaved?: boolean;
  agent?: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    companyName: string | null;
    professionalTitle: string | null;
  } | null;
  createdAt: string;
}

// Catalog filter criteria
export interface PropertyFilters {
  query?: string;
  listing_type?: ListingType;
  property_type?: PropertyType;
  city?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  min_area?: number;
  features?: string[];
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
}

// Generic paginated response wrapper
export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type PaginatedProperties = PaginatedResult<PropertyWithDetails>;

/**
 * Resolves the primary cover image from a list of property images.
 * Priority: is_cover = true -> lowest sort_order -> first image -> fallback placeholder.
 */
export function getCoverImageUrl(
  images?: PropertyImageRow[] | null,
  fallback = "/placeholder-property.jpg"
): string {
  if (!images || images.length === 0) return fallback;
  const cover = images.find((img) => img.is_cover);
  if (cover?.image_url) return cover.image_url;

  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  return sorted[0]?.image_url || fallback;
}

/**
 * Formats a numeric price into a currency string (e.g., $1,250,000 or $4,500/mo).
 */
export function formatPropertyPrice(price: number, listingType: ListingType = "sale"): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);

  return listingType === "rent" ? `${formatted}/mo` : formatted;
}

/**
 * Formats square meter area (e.g., "350 sqm" or "350 m²").
 */
export function formatPropertyArea(area: number | null): string {
  if (area === null || area === undefined || area <= 0) return "—";
  return `${new Intl.NumberFormat("en-US").format(area)} sqm`;
}

/**
 * Maps a full PropertyWithDetails database entity into a clean, UI-ready PropertyCardData.
 */
export function formatPropertyCardData(
  property: PropertyWithDetails,
  isSaved = false
): PropertyCardData {
  const coverImage = getCoverImageUrl(property.property_images);
  const sortedImages = [...(property.property_images || [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.image_url);

  const locationParts = [property.neighborhood, property.city, property.country].filter(Boolean);
  const location = locationParts.join(", ") || property.city || "HAVEN Collection";

  return {
    id: property.id,
    title: property.title,
    slug: property.slug,
    price: property.price,
    formattedPrice: formatPropertyPrice(property.price, property.listing_type),
    location,
    city: property.city,
    country: property.country,
    neighborhood: property.neighborhood,
    coverImage,
    images: sortedImages.length > 0 ? sortedImages : [coverImage],
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    formattedArea: formatPropertyArea(property.area),
    listingType: property.listing_type,
    propertyType: property.property_type,
    status: property.status,
    isSaved,
    agent: property.agents_public
      ? {
          id: property.agents_public.id,
          fullName: property.agents_public.full_name,
          avatarUrl: property.agents_public.avatar_url,
          companyName: property.agents_public.company_name,
          professionalTitle: property.agents_public.professional_title,
        }
      : null,
    createdAt: property.created_at,
  };
}
