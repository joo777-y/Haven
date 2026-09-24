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
