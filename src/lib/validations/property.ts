import { z } from "zod";

export const LISTING_TYPES = ["sale", "rent"] as const;
export const PROPERTY_TYPES = [
  "apartment",
  "villa",
  "studio",
  "chalet",
  "townhouse",
  "penthouse",
] as const;
export const PROPERTY_STATUSES = ["draft", "published", "archived"] as const;

const currentYear = new Date().getFullYear();

/**
 * Validation schema for creating or updating a property listing.
 */
export const propertySchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(150, "Title cannot exceed 150 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),
  price: z.coerce
    .number()
    .min(0, "Price must be non-negative"),
  listing_type: z.enum(LISTING_TYPES, {
    message: "Invalid listing type. Choose sale or rent.",
  }),
  property_type: z.enum(PROPERTY_TYPES, {
    message: "Invalid property type.",
  }),
  bedrooms: z.coerce
    .number()
    .int("Bedrooms must be a whole number")
    .min(0, "Bedrooms cannot be negative")
    .nullable()
    .optional(),
  bathrooms: z.coerce
    .number()
    .int("Bathrooms must be a whole number")
    .min(0, "Bathrooms cannot be negative")
    .nullable()
    .optional(),
  area: z.coerce
    .number()
    .min(0, "Area cannot be negative")
    .nullable()
    .optional(),
  parking_spaces: z.coerce
    .number()
    .int("Parking spaces must be a whole number")
    .min(0, "Parking spaces cannot be negative")
    .nullable()
    .optional(),
  year_built: z.coerce
    .number()
    .int("Year built must be a valid year")
    .min(1800, "Year built must be after 1800")
    .max(currentYear + 5, `Year built cannot exceed ${currentYear + 5}`)
    .nullable()
    .optional(),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(100, "Country name cannot exceed 100 characters"),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(100, "City name cannot exceed 100 characters"),
  neighborhood: z
    .string()
    .trim()
    .max(100, "Neighborhood cannot exceed 100 characters")
    .nullable()
    .optional(),
  address: z
    .string()
    .trim()
    .max(255, "Address cannot exceed 255 characters")
    .nullable()
    .optional(),
  latitude: z.coerce
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .nullable()
    .optional(),
  longitude: z.coerce
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .nullable()
    .optional(),
  status: z.enum(PROPERTY_STATUSES).default("draft"),
  features: z
    .array(z.string().trim().min(1, "Feature item cannot be empty"))
    .optional()
    .default([]),
});

export type PropertyInput = z.infer<typeof propertySchema>;

/**
 * Validation schema for property catalog search and filter URL parameters.
 */
export const propertyFilterSchema = z.object({
  q: z.string().trim().optional(),
  type: z.enum(LISTING_TYPES).optional(),
  category: z.enum(PROPERTY_TYPES).optional(),
  city: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  minArea: z.coerce.number().min(0).optional(),
  features: z
    .union([z.string().transform((v) => [v]), z.array(z.string())])
    .optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type PropertyFilterInput = z.infer<typeof propertyFilterSchema>;

/**
 * Validation schema for buyer inquiry submission.
 */
export const inquiryCreateSchema = z.object({
  property_id: z.string().uuid("Invalid property reference ID"),
  message: z
    .string()
    .trim()
    .min(5, "Inquiry message must be at least 5 characters")
    .max(2000, "Inquiry message cannot exceed 2000 characters"),
});

export type InquiryCreateInput = z.infer<typeof inquiryCreateSchema>;

/**
 * Parses raw URL searchParams into a typed, validated PropertyFilters query object.
 */
export function parseFilterParams(
  rawParams: Record<string, string | string[] | undefined>
) {
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rawParams)) {
    if (Array.isArray(value)) {
      normalized[key] = value[0];
    } else {
      normalized[key] = value;
    }
  }

  const parsed = propertyFilterSchema.safeParse(normalized);
  if (!parsed.success) {
    return {
      page: 1,
      limit: 12,
      sort: "newest" as const,
    };
  }

  const data = parsed.data;
  return {
    query: data.q,
    listing_type: data.type,
    property_type: data.category,
    city: data.city,
    min_price: data.minPrice,
    max_price: data.maxPrice,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    min_area: data.minArea,
    features: data.features,
    sort: data.sort,
    page: data.page,
    limit: data.limit,
  };
}
