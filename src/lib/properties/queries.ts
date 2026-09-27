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
import type {
  AgentDashboardStats,
  AgentPropertyAnalytics,
  AgentResponseVelocity,
} from "@/types/agent";

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

  // Geographic bounds filter (from interactive map Search This Area)
  if (filters.min_lat !== undefined && filters.max_lat !== undefined) {
    query = query.gte("latitude", filters.min_lat).lte("latitude", filters.max_lat);
  }
  if (filters.min_lng !== undefined && filters.max_lng !== undefined) {
    query = query.gte("longitude", filters.min_lng).lte("longitude", filters.max_lng);
  }

  // Sorting
  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "price_sqm":
      query = query.order("price_per_sqm", { ascending: true, nullsFirst: false });
      break;
    case "bedrooms":
      query = query.order("bedrooms", { ascending: false, nullsFirst: false });
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
 * Rule-based recommendation engine for similar architectural properties.
 * Scores candidates using the Phase 11 multi-factor model:
 * - Same property type: +40
 * - Same city: +30 (or same country: +15)
 * - Same neighborhood: +20
 * - Price proximity (±25%): +20
 * - Shared architectural amenities: +5 each
 *
 * Excludes current property and restricts strictly to published status.
 */
export async function getSimilarProperties(
  property: PropertyWithDetails,
  limit?: number
): Promise<PropertyWithDetails[]>;
export async function getSimilarProperties(
  propertyId: string,
  propertyType: string,
  city: string,
  limit?: number
): Promise<PropertyWithDetails[]>;
export async function getSimilarProperties(
  propertyOrId: PropertyWithDetails | string,
  arg2?: string | number,
  arg3?: string,
  arg4 = 3
): Promise<PropertyWithDetails[]> {
  const supabase = await createClient();

  let targetId: string;
  let targetType: string | undefined;
  let targetCity: string | undefined;
  let targetCountry: string | undefined;
  let targetNeighborhood: string | null = null;
  let targetPrice: number | undefined;
  let targetFeatures: string[] = [];
  let limit = 3;

  if (typeof propertyOrId === "object" && propertyOrId !== null) {
    targetId = propertyOrId.id;
    targetType = propertyOrId.property_type;
    targetCity = propertyOrId.city;
    targetCountry = propertyOrId.country;
    targetNeighborhood = propertyOrId.neighborhood ?? null;
    targetPrice = Number(propertyOrId.price);
    targetFeatures = (propertyOrId.property_features || []).map((f) => f.feature);
    limit = typeof arg2 === "number" ? arg2 : 3;
  } else {
    targetId = propertyOrId;
    targetType = typeof arg2 === "string" ? arg2 : undefined;
    targetCity = typeof arg3 === "string" ? arg3 : undefined;
    limit = typeof arg4 === "number" ? arg4 : 3;
  }

  // 1. Fetch a bounded candidate pool of published properties (max 25)
  let candidateQuery = supabase
    .from("properties")
    .select(PROPERTY_DETAILS_SELECT)
    .eq("status", "published")
    .neq("id", targetId);

  if (targetType && targetCity) {
    const escapedCity = targetCity.trim().replace(/'/g, "''");
    candidateQuery = candidateQuery.or(
      `property_type.eq.${targetType},city.ilike.%${escapedCity}%`
    );
  } else if (targetType) {
    candidateQuery = candidateQuery.eq("property_type", targetType as any);
  }

  const { data: candidates, error } = await candidateQuery
    .order("created_at", { ascending: false })
    .limit(25);

  if (error || !candidates || candidates.length === 0) {
    if (error) {
      console.error("Error fetching candidate properties for recommendations:", error);
    }
    // Fallback: fetch most recent published properties excluding targetId
    const { data: fallbackData } = await supabase
      .from("properties")
      .select(PROPERTY_DETAILS_SELECT)
      .eq("status", "published")
      .neq("id", targetId)
      .order("created_at", { ascending: false })
      .limit(limit);

    return (fallbackData || []) as unknown as PropertyWithDetails[];
  }

  const targetFeatureSet = new Set(
    targetFeatures.map((f) => f.toLowerCase().trim())
  );

  // 2. Score candidates in server-side TypeScript
  const scored = (candidates as unknown as PropertyWithDetails[]).map((candidate) => {
    let score = 0;

    // A. Same property type (+40)
    if (targetType && candidate.property_type === targetType) {
      score += 40;
    }

    // B. Same city (+30) or country (+15)
    if (targetCity && candidate.city?.toLowerCase() === targetCity.toLowerCase()) {
      score += 30;
    } else if (
      targetCountry &&
      candidate.country?.toLowerCase() === targetCountry.toLowerCase()
    ) {
      score += 15;
    }

    // C. Same exclusive neighborhood (+20)
    if (
      targetNeighborhood &&
      candidate.neighborhood &&
      candidate.neighborhood.toLowerCase().trim() ===
        targetNeighborhood.toLowerCase().trim()
    ) {
      score += 20;
    }

    // D. Price proximity within ±25% (+20)
    if (targetPrice && candidate.price) {
      const candPrice = Number(candidate.price);
      const minPrice = targetPrice * 0.75;
      const maxPrice = targetPrice * 1.25;
      if (candPrice >= minPrice && candPrice <= maxPrice) {
        score += 20;
      }
    }

    // E. Shared architectural amenities (+5 each)
    if (targetFeatureSet.size > 0 && candidate.property_features) {
      let sharedCount = 0;
      for (const feat of candidate.property_features) {
        if (targetFeatureSet.has(feat.feature.toLowerCase().trim())) {
          sharedCount++;
        }
      }
      score += sharedCount * 5;
    }

    return { candidate, score };
  });

  // 3. Sort by score descending, with newer listings as tiebreaker
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (
      new Date(b.candidate.created_at).getTime() -
      new Date(a.candidate.created_at).getTime()
    );
  });

  return scored.slice(0, limit).map((s) => s.candidate);
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

  // Try invoking secure RPC first (provides buyer email and phone)
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "get_agent_inquiries" as any
    );

    if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
      let inquiriesList = (rpcData as any[]).map((r) => ({
        id: r.id,
        user_id: r.user_id,
        agent_id: r.agent_id,
        property_id: r.property_id,
        message: r.message,
        status: r.status,
        created_at: r.created_at,
        updated_at: r.updated_at,
        properties: {
          id: r.property_id_val,
          title: r.property_title,
          slug: r.property_slug,
          price: Number(r.property_price),
          city: r.property_city,
          country: r.property_country,
          status: r.property_status,
          property_images: r.property_cover_image
            ? [
                {
                  id: "cover",
                  property_id: r.property_id_val,
                  image_url: r.property_cover_image,
                  sort_order: 0,
                  is_cover: true,
                  created_at: r.created_at,
                },
              ]
            : [],
        },
        profiles: {
          full_name: r.buyer_name,
          avatar_url: r.buyer_avatar_url,
          phone: r.buyer_phone,
          email: r.buyer_email,
        },
        buyer_phone: r.buyer_phone,
        buyer_email: r.buyer_email,
      })) as InquiryWithDetails[];

      // Securely attach private advisor notes (isolated table, agent-only)
      try {
        const { data: notesData } = await supabase
          .from("inquiry_notes" as any)
          .select("inquiry_id, note")
          .eq("agent_id", agent.id);

        if (notesData && Array.isArray(notesData)) {
          const notesMap = new Map<string, string>();
          for (const n of notesData as any[]) {
            notesMap.set(n.inquiry_id, n.note);
          }
          inquiriesList = inquiriesList.map((inq) => ({
            ...inq,
            advisor_note: notesMap.get(inq.id) || null,
          }));
        }
      } catch {
        // Table not yet created or migration pending
      }

      return inquiriesList;
    }
  } catch (err) {
    // Proceed to standard PostgREST fallback
  }

  // Fallback to direct PostgREST join with profiles.phone
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
        avatar_url,
        phone
      )
    `)
    .eq("agent_id", agent.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching agent inquiries:", error);
    return [];
  }

  let inquiriesList = (data || []) as unknown as InquiryWithDetails[];

  // Securely attach private advisor notes (isolated table, agent-only)
  try {
    const { data: notesData } = await supabase
      .from("inquiry_notes" as any)
      .select("inquiry_id, note")
      .eq("agent_id", agent.id);

    if (notesData && Array.isArray(notesData)) {
      const notesMap = new Map<string, string>();
      for (const n of notesData as any[]) {
        notesMap.set(n.inquiry_id, n.note);
      }
      inquiriesList = inquiriesList.map((inq) => ({
        ...inq,
        advisor_note: notesMap.get(inq.id) || null,
      }));
    }
  } catch {
    // Table not yet created or migration pending
  }

  return inquiriesList;
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

/**
 * Fetches aggregated property performance analytics for the authenticated advisor
 * via the secure get_agent_property_analytics() database RPC.
 * Identity is resolved strictly on the server from auth.uid().
 */
export async function getAgentPropertyAnalytics(): Promise<AgentPropertyAnalytics[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_agent_property_analytics");

  if (error) {
    console.error("Error fetching agent property analytics:", error.message);
    return [];
  }

  // Fetch stored database-generated price_per_sqm for the returned properties
  const propertyIds = (data || []).map((row) => row.property_id);
  const pricePerSqmMap: Record<string, number | null> = {};

  if (propertyIds.length > 0) {
    const { data: propRows, error: propError } = await supabase
      .from("properties")
      .select("id, price_per_sqm")
      .in("id", propertyIds);

    if (!propError && propRows) {
      for (const p of propRows) {
        pricePerSqmMap[p.id] =
          p.price_per_sqm !== null && p.price_per_sqm !== undefined
            ? Number(p.price_per_sqm)
            : null;
      }
    }
  }

  return (data || []).map((row) => ({
    property_id: row.property_id,
    property_title: row.property_title,
    property_slug: row.property_slug,
    property_price: Number(row.property_price) || 0,
    property_status: row.property_status,
    property_city: row.property_city,
    property_cover_image: row.property_cover_image || "",
    views_count: Number(row.views_count) || 0,
    unique_viewers_count: Number(row.unique_viewers_count) || 0,
    favorites_count: Number(row.favorites_count) || 0,
    inquiries_count: Number(row.inquiries_count) || 0,
    inquiry_conversion_rate: Number(row.inquiry_conversion_rate) || 0,
    created_at: row.created_at,
    price_per_sqm: pricePerSqmMap[row.property_id] ?? null,
  }));
}

/**
 * Fetches advisor response velocity metrics via get_agent_response_velocity() RPC.
 * Identity is resolved strictly on the server from auth.uid().
 */
export async function getAgentResponseVelocity(): Promise<AgentResponseVelocity | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_agent_response_velocity");

  if (error) {
    console.error("Error fetching agent response velocity:", error.message);
    return null;
  }

  const row = data?.[0];
  if (!row) {
    return {
      total_inquiries: 0,
      responded_inquiries: 0,
      pending_inquiries: 0,
      avg_response_hours: null,
      avg_response_seconds: null,
      fastest_response_hours: null,
    };
  }

  return {
    total_inquiries: Number(row.total_inquiries) || 0,
    responded_inquiries: Number(row.responded_inquiries) || 0,
    pending_inquiries: Number(row.pending_inquiries) || 0,
    avg_response_hours:
      row.avg_response_hours !== null && row.avg_response_hours !== undefined
        ? Number(row.avg_response_hours)
        : null,
    avg_response_seconds:
      row.avg_response_seconds !== null && row.avg_response_seconds !== undefined
        ? Number(row.avg_response_seconds)
        : null,
    fastest_response_hours:
      row.fastest_response_hours !== null && row.fastest_response_hours !== undefined
        ? Number(row.fastest_response_hours)
        : null,
  };
}


