import { createClient } from "@/lib/supabase/server";
import { PROPERTY_DETAILS_SELECT } from "@/lib/properties/queries";
import { getCoverImageUrl, type PropertyWithDetails } from "@/types/property";
import type {
  CollectionPreviewItem,
  CollectionWithProperties,
  DashboardOverviewStats,
} from "@/types/collection";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Fetches all collections belonging to the authenticated user.
 * Includes property counts, cumulative portfolio valuation, and up to 4 preview thumbnails for mosaic cards.
 */
export async function getUserCollections(
  userId?: string
): Promise<CollectionPreviewItem[]> {
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
    .from("collections")
    .select(`
      id,
      name,
      created_at,
      updated_at,
      collection_properties (
        property_id,
        properties (
          id,
          title,
          price,
          status,
          property_images (
            id,
            property_id,
            image_url,
            is_cover,
            sort_order,
            created_at
          )
        )
      )
    `)
    .eq("user_id", targetUserId)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching user collections:", error);
    return [];
  }

  return data.map((col) => {
    const validProps = (col.collection_properties || [])
      .map((cp) => cp.properties)
      .filter(
        (p): p is NonNullable<typeof p> =>
          Boolean(p) && p.status === "published"
      );

    const totalValue = validProps.reduce(
      (sum, p) => sum + (Number(p.price) || 0),
      0
    );

    const previewImages = validProps
      .slice(0, 4)
      .map((p) => getCoverImageUrl(p.property_images, "/placeholder-property.jpg"));

    return {
      id: col.id,
      name: col.name,
      created_at: col.created_at,
      updated_at: col.updated_at,
      propertyCount: validProps.length,
      previewImages,
      totalValue,
    };
  });
}

/**
 * Fetches an individual collection by ID with full nested property specifications.
 * Enforces ownership check against authenticated user.
 */
export async function getCollectionById(
  collectionId: string,
  userId?: string
): Promise<CollectionWithProperties | null> {
  if (!collectionId || !UUID_REGEX.test(collectionId)) {
    return null;
  }

  const supabase = await createClient();

  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    targetUserId = user.id;
  }

  const { data, error } = await supabase
    .from("collections")
    .select(`
      id,
      user_id,
      name,
      created_at,
      updated_at,
      collection_properties (
        property_id,
        created_at,
        properties (
          ${PROPERTY_DETAILS_SELECT}
        )
      )
    `)
    .eq("id", collectionId)
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error(`Error fetching collection (${collectionId}):`, error);
    }
    return null;
  }

  const properties: PropertyWithDetails[] = [];
  let totalValue = 0;

  for (const cp of data.collection_properties || []) {
    const prop = cp.properties as unknown as PropertyWithDetails | null;
    if (prop && prop.status === "published") {
      properties.push(prop);
      totalValue += Number(prop.price) || 0;
    }
  }

  return {
    id: data.id,
    user_id: data.user_id,
    name: data.name,
    created_at: data.created_at,
    updated_at: data.updated_at,
    properties,
    totalValue,
    propertyCount: properties.length,
  };
}

/**
 * Returns an array of collection IDs that currently contain the specified property.
 * Used for pre-filling checkbox states in the "Save to Collection" modal dialog.
 */
export async function getUserCollectionIdsForProperty(
  propertyId: string,
  userId?: string
): Promise<string[]> {
  if (!propertyId || !UUID_REGEX.test(propertyId)) {
    return [];
  }

  const supabase = await createClient();

  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    targetUserId = user.id;
  }

  // Subquery through user's collections
  const { data, error } = await supabase
    .from("collection_properties")
    .select(`
      collection_id,
      collections!inner (
        user_id
      )
    `)
    .eq("property_id", propertyId)
    .eq("collections.user_id", targetUserId);

  if (error || !data) {
    console.error("Error fetching collection memberships for property:", error);
    return [];
  }

  return data.map((cp) => cp.collection_id);
}

/**
 * Aggregates high-level metrics and recent activity for the user's dashboard overview.
 * Parallelizes metric lookups to minimize server response latency.
 */
export async function getDashboardOverviewData(
  userId?: string
): Promise<DashboardOverviewStats | null> {
  const supabase = await createClient();

  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    targetUserId = user.id;
  }

  // Execute queries in parallel
  const [
    savedCountRes,
    collectionsCountRes,
    inquiriesCountRes,
    recentInquiriesRes,
    recentSavedRes,
  ] = await Promise.all([
    // 1. Saved favorites count
    supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", targetUserId),

    // 2. Collections count
    supabase
      .from("collections")
      .select("*", { count: "exact", head: true })
      .eq("user_id", targetUserId),

    // 3. Inquiries count
    supabase
      .from("inquiries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", targetUserId),

    // 4. Recent inquiries (up to 3)
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
        )
      `)
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false })
      .limit(3),

    // 5. Recent saved properties (up to 4)
    supabase
      .from("favorites")
      .select(`
        id,
        created_at,
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
            property_id,
            image_url,
            is_cover,
            sort_order,
            created_at
          )
        )
      `)
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const recentInquiries = (recentInquiriesRes.data || []).map((inq) => ({
    id: inq.id,
    propertyTitle: inq.properties?.title || "Property Listing",
    propertySlug: inq.properties?.slug || "",
    status: inq.status,
    createdAt: inq.created_at,
    message: inq.message,
  }));

  const recentSavedProperties = (recentSavedRes.data || [])
    .map((fav) => {
      const p = fav.properties;
      if (!p || p.status !== "published") return null;
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.price,
        city: p.city,
        country: p.country,
        coverImage: getCoverImageUrl(p.property_images),
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  return {
    savedCount: savedCountRes.count ?? 0,
    collectionsCount: collectionsCountRes.count ?? 0,
    inquiriesCount: inquiriesCountRes.count ?? 0,
    recentInquiries,
    recentSavedProperties,
  };
}
