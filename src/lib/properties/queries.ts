import { createClient } from "@/lib/supabase/server";
import {
  PropertyWithDetails,
  PropertyFilters,
  PaginatedProperties,
  InquiryWithDetails,
  PropertyStatus,
  PropertyType,
  getCoverImageUrl,
} from "@/types/property";
import type { AgentDashboardStats } from "@/types/agent";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Standard PostgREST select query string including safe public agent data,
 * gallery images, and property features.
 */
export const PROPERTY_DETAILS_SELECT = `
  *,
  property_images (
    id,
    property_id,
    image_url,
    sort_order,
    is_cover,
    created_at
  ),
  property_features (
    id,
    property_id,
    feature,
    created_at
  ),
  agents_public (
    id,
    profile_id,
    full_name,
    avatar_url,
    company_name,
    professional_title,
    bio,
    created_at
  )
` as const;

/**
 * Fetches published properties with multi-parameter filtering and pagination.
 * Used by the public catalog page (/properties).
 */
export async function getPublishedProperties(
  filters: PropertyFilters = {}
): Promise<PaginatedProperties> {
  const supabase = await createClient();

  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 12));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("properties")
    .select(PROPERTY_DETAILS_SELECT, { count: "exact" })
    .eq("status", "published");

  // Keyword search across title, city, neighborhood
  if (filters.query?.trim()) {
    const term = filters.query.trim();
    // Escape single quotes for PostgREST
    const sanitized = term.replace(/'/g, "''");
    query = query.or(
      `title.ilike.%${sanitized}%,city.ilike.%${sanitized}%,neighborhood.ilike.%${sanitized}%`
    );
  }

  // Listing type filter (sale vs rent)
  if (filters.listing_type) {
    query = query.eq("listing_type", filters.listing_type);
  }

  // Property type filter (villa, apartment, etc.)
  if (filters.property_type) {
    query = query.eq("property_type", filters.property_type);
  }

  // City filter
  if (filters.city?.trim()) {
    query = query.ilike("city", `%${filters.city.trim()}%`);
  }

  // Numeric range filters
  if (filters.min_price !== undefined && filters.min_price !== null) {
    query = query.gte("price", filters.min_price);
  }

  if (filters.max_price !== undefined && filters.max_price !== null) {
    query = query.lte("price", filters.max_price);
  }

  if (filters.bedrooms !== undefined && filters.bedrooms !== null) {
    query = query.gte("bedrooms", filters.bedrooms);
  }

  if (filters.bathrooms !== undefined && filters.bathrooms !== null) {
    query = query.gte("bathrooms", filters.bathrooms);
  }

  if (filters.min_area !== undefined && filters.min_area !== null) {
    query = query.gte("area", filters.min_area);
  }

  // Feature filter (match any of the requested features)
  if (filters.features && filters.features.length > 0) {
    const { data: matchedFeatures, error: featError } = await supabase
      .from("property_features")
      .select("property_id")
      .in("feature", filters.features);

    if (featError) {
      console.error("Error querying property features:", featError);
    } else if (matchedFeatures && matchedFeatures.length > 0) {
      const matchingIds = Array.from(
        new Set(matchedFeatures.map((f) => f.property_id))
      );
      query = query.in("id", matchingIds);
    } else {
      // None of the properties match the selected features
      return {
        data: [],
        count: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  // Sorting
  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Pagination range
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching published properties:", error);
    return {
      data: [],
      count: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  const properties = (data || []) as unknown as PropertyWithDetails[];
  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    data: properties,
    count: totalCount,
    page,
    limit,
    totalPages,
  };
}

/**
 * Fetches an individual published property by slug (or UUID).
 * Embeds images, features, and public agent advisor info.
 */
export async function getPropertyBySlug(
  slugOrId: string
): Promise<PropertyWithDetails | null> {
  const supabase = await createClient();

  const isUuid = UUID_REGEX.test(slugOrId);

  let query = supabase
    .from("properties")
    .select(PROPERTY_DETAILS_SELECT)
    .eq("status", "published");

  if (isUuid) {
    query = query.or(`slug.eq.${slugOrId},id.eq.${slugOrId}`);
  } else {
    query = query.eq("slug", slugOrId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error(`Error fetching property by slug (${slugOrId}):`, error);
    return null;
  }

  return (data as unknown as PropertyWithDetails) || null;
}

/**
 * Fetches up to `limit` similar properties matching the same property_type or city,
 * excluding the specified property ID.
 */
export async function getSimilarProperties(
  propertyId: string,
  propertyType: string,
  city: string,
  limit = 3
): Promise<PropertyWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_DETAILS_SELECT)
    .eq("status", "published")
    .neq("id", propertyId)
    .or(`property_type.eq.${propertyType},city.ilike.%${city}%`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching similar properties:", error);
    return [];
  }

  return (data || []) as unknown as PropertyWithDetails[];
}

/**
 * Fetches all properties owned by the authenticated agent (published, draft, archived).
 * If agentId is not specified, it resolves the current authenticated user's agent record.
 */
export async function getAgentProperties(
  agentId?: string
): Promise<PropertyWithDetails[]> {
  const supabase = await createClient();

  let targetAgentId = agentId;

  if (!targetAgentId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!agent) return [];
    targetAgentId = agent.id;
  }

  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_DETAILS_SELECT)
    .eq("agent_id", targetAgentId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching agent properties:", error);
    return [];
  }

  return (data || []) as unknown as PropertyWithDetails[];
}

/**
 * Fetches a single property for editing by the agent.
 * Row Level Security and agent_id verification ensure the agent can only access their own property.
 */
export async function getPropertyForEdit(
  id: string
): Promise<PropertyWithDetails | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!agent) return null;

  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_DETAILS_SELECT)
    .eq("id", id)
    .eq("agent_id", agent.id)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error(`Error fetching property for edit (${id}):`, error);
    }
    return null;
  }

  return (data as unknown as PropertyWithDetails) || null;
}

/**
 * Checks whether a specific property is favorited by the current user.
 */
export async function checkIsFavorite(
  propertyId: string,
  userId?: string
): Promise<boolean> {
  const supabase = await createClient();

  let targetUserId = userId;

  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    targetUserId = user.id;
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("property_id", propertyId)
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (error || !data) return false;
  return true;
}

/**
 * Fetches all published properties saved/favorited by the user.
 */
export async function getUserFavorites(
  userId?: string
): Promise<PropertyWithDetails[]> {
  const supabase = await createClient();

  let targetUserId = userId;

  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    targetUserId = user.id;
  }

  const { data: favorites, error } = await supabase
    .from("favorites")
    .select(
      `
      id,
      created_at,
      properties (
        ${PROPERTY_DETAILS_SELECT}
      )
    `
    )
    .eq("user_id", targetUserId)
    .order("created_at", { ascending: false });

  if (error || !favorites) {
    console.error("Error fetching user favorites:", error);
    return [];
  }

  // Extract joined properties that are published
  const properties: PropertyWithDetails[] = [];
  for (const fav of favorites) {
    const prop = fav.properties as unknown as PropertyWithDetails | null;
    if (prop && prop.status === "published") {
      properties.push(prop);
    }
  }

  return properties;
}

/**
 * Fetches an array of property IDs favorited by the current authenticated user.
 * Returns an empty array if the user is not authenticated.
 * Avoids N+1 queries when rendering catalog or list pages.
 */
export async function getUserFavoritePropertyIds(
  userId?: string
): Promise<string[]> {
  const supabase = await createClient();

  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    targetUserId = user.id;
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("property_id")
    .eq("user_id", targetUserId);

  if (error || !data) {
    return [];
  }

  return data.map((f) => f.property_id);
}

/**
 * Fetches inquiries submitted by the current authenticated user.
 * Row Level Security strictly scopes results to auth.uid() = user_id.
 */
export async function getUserInquiries(): Promise<InquiryWithDetails[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("inquiries")
    .select(`
      id,
      user_id,
      agent_id,
      property_id,
      message,
      status,
      created_at,
      updated_at,
      properties (
        id,
        title,
        slug,
        price,
        city,
        country,
        status,
        property_images (
          id,
          image_url,
          is_cover,
          sort_order
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user inquiries:", error);
    return [];
  }

  return (data || []) as unknown as InquiryWithDetails[];
}

/**
 * Fetches inquiries received for properties owned by the current authenticated agent.
 * Row Level Security and agent ownership ensure an agent only sees their own listings' inquiries.
 */
export async function getAgentInquiries(): Promise<InquiryWithDetails[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!agent) return [];

  const { data, error } = await supabase
    .from("inquiries")
    .select(`
      id,
      user_id,
      agent_id,
      property_id,
      message,
      status,
      created_at,
      updated_at,
      properties (
        id,
        title,
        slug,
        price,
        city,
        country,
        status,
        property_images (
          id,
          image_url,
          is_cover,
          sort_order
        )
      ),
      profiles (
        full_name,
        avatar_url
      )
    `)
    .eq("agent_id", agent.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching agent inquiries:", error);
    return [];
  }

  return (data || []) as unknown as InquiryWithDetails[];
}

/**
 * Aggregates high-level advisor statistics and recent pipeline data for /agent.
 */
export async function getAgentDashboardStats(): Promise<AgentDashboardStats | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!agent) return null;

  // Execute properties and inquiries queries in parallel
  const [propertiesRes, inquiriesRes] = await Promise.all([
    supabase
      .from("properties")
      .select(`
        id,
        title,
        slug,
        price,
        city,
        status,
        bedrooms,
        bathrooms,
        area,
        created_at,
        property_images (
          image_url,
          is_cover,
          sort_order
        )
      `)
      .eq("agent_id", agent.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("inquiries")
      .select(`
        id,
        message,
        status,
        created_at,
        properties (
          title,
          slug
        ),
        profiles (
          full_name,
          phone
        )
      `)
      .eq("agent_id", agent.id)
      .order("created_at", { ascending: false }),
  ]);

  const properties = propertiesRes.data || [];
  const inquiries = inquiriesRes.data || [];

  let publishedCount = 0;
  let draftCount = 0;
  let archivedCount = 0;
  let totalPortfolioValue = 0;

  for (const p of properties) {
    if (p.status === "published") {
      publishedCount++;
      totalPortfolioValue += Number(p.price) || 0;
    } else if (p.status === "draft") {
      draftCount++;
    } else if (p.status === "archived") {
      archivedCount++;
    }
  }

  let newInquiriesCount = 0;
  let contactedInquiriesCount = 0;
  let closedInquiriesCount = 0;

  for (const inq of inquiries) {
    if (inq.status === "new") newInquiriesCount++;
    else if (inq.status === "contacted") contactedInquiriesCount++;
    else if (inq.status === "closed") closedInquiriesCount++;
  }

  const recentProperties = properties.slice(0, 4).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    city: p.city,
    status: p.status,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    created_at: p.created_at,
    coverImage: getCoverImageUrl(p.property_images),
  }));

  const recentInquiries = inquiries.slice(0, 5).map((inq) => ({
    id: inq.id,
    message: inq.message,
    status: inq.status,
    created_at: inq.created_at,
    propertyTitle: inq.properties?.title || "Property",
    propertySlug: inq.properties?.slug || "",
    buyerName: inq.profiles?.full_name || "Prospective Buyer",
    buyerPhone: inq.profiles?.phone || null,
  }));

  return {
    totalListings: properties.length,
    publishedCount,
    draftCount,
    archivedCount,
    totalInquiries: inquiries.length,
    newInquiriesCount,
    contactedInquiriesCount,
    closedInquiriesCount,
    totalPortfolioValue,
    recentInquiries,
    recentProperties,
  };
}

/**
 * Fetches all properties owned by the agent with optional status and search filtering.
 */
export async function getAgentPropertiesWithFilters(filters: {
  status?: PropertyStatus | "all";
  query?: string;
  property_type?: PropertyType | "all";
} = {}): Promise<PropertyWithDetails[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!agent) return [];

  let query = supabase
    .from("properties")
    .select(PROPERTY_DETAILS_SELECT)
    .eq("agent_id", agent.id)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status as PropertyStatus);
  }

  if (filters.property_type && filters.property_type !== "all") {
    query = query.eq("property_type", filters.property_type as PropertyType);
  }

  if (filters.query?.trim()) {
    const term = filters.query.trim().replace(/'/g, "''");
    query = query.or(
      `title.ilike.%${term}%,city.ilike.%${term}%,neighborhood.ilike.%${term}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching filtered agent properties:", error);
    return [];
  }

  return (data || []) as unknown as PropertyWithDetails[];
}

