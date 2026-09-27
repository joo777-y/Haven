import type { PropertyStatus, ListingType, PropertyType, InquiryStatus } from "@/types/property";

export interface AgentDashboardStats {
  totalListings: number;
  publishedCount: number;
  draftCount: number;
  archivedCount: number;
  totalInquiries: number;
  newInquiriesCount: number;
  contactedInquiriesCount: number;
  closedInquiriesCount: number;
  totalPortfolioValue: number;
  recentInquiries: Array<{
    id: string;
    message: string;
    status: InquiryStatus;
    created_at: string;
    propertyTitle: string;
    propertySlug: string;
    buyerName: string;
    buyerEmail?: string | null;
    buyerPhone?: string | null;
  }>;
  recentProperties: Array<{
    id: string;
    title: string;
    slug: string;
    price: number;
    city: string;
    status: PropertyStatus;
    coverImage: string;
    created_at: string;
    bedrooms: number | null;
    bathrooms: number | null;
    area: number | null;
  }>;
}

export interface AgentPropertyFilters {
  query?: string;
  status?: "all" | PropertyStatus;
  property_type?: "all" | PropertyType;
}

export interface AgentInquiryFilters {
  status?: "all" | InquiryStatus;
  query?: string;
}

export interface AgentPropertyAnalytics {
  property_id: string;
  property_title: string;
  property_slug: string;
  property_price: number;
  property_status: PropertyStatus | string;
  property_city: string;
  property_cover_image: string;
  views_count: number;
  unique_viewers_count: number;
  favorites_count: number;
  inquiries_count: number;
  inquiry_conversion_rate: number;
  created_at: string;
  price_per_sqm: number | null;
}

export interface AgentAnalyticsSummary {
  totalViews: number;
  totalUniqueViewers: number;
  totalFavorites: number;
  totalInquiries: number;
  overallConversionRate: number;
}

export interface AgentResponseVelocity {
  total_inquiries: number;
  responded_inquiries: number;
  pending_inquiries: number;
  avg_response_hours: number | null;
  avg_response_seconds: number | null;
  fastest_response_hours: number | null;
}

