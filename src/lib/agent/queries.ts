import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import { PROPERTY_CARD_SELECT } from "@/lib/properties/queries";
import { formatPropertyCardData } from "@/types/property";
import type { Agent } from "@/components/agents/AgentCard";
import type { Property } from "@/components/properties/PropertyCard";

/**
 * Focused PostgREST select query string specifically for public advisor cards.
 * Reads from the public view `agents_public` and embeds live active listing count
 * from `properties` without exposing any private agent or profile columns.
 */
export const AGENTS_PUBLIC_SELECT = `
  id,
  full_name,
  avatar_url,
  company_name,
  professional_title,
  bio,
  created_at,
  properties (count)
` as const;

export interface GetPublicAgentsOptions {
  limit?: number;
}

export interface PublicAgentDetail extends Agent {
  bio: string;
  createdAt: string;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Fetches verified public real estate advisors from the agents_public view.
 * Uses createPublicClient() with zero cookies/session reads so it remains
 * 100% compatible with static generation and ISR (Incremental Static Regeneration).
 */
export async function getPublicAgents(
  options: GetPublicAgentsOptions = {}
): Promise<Agent[]> {
  const supabase = createPublicClient();

  let query = supabase
    .from("agents_public")
    .select(AGENTS_PUBLIC_SELECT)
    .order("created_at", { ascending: true });

  if (options.limit && options.limit > 0) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching public agents from Supabase:", error);
    return [];
  }

  return (data || []).map((row: any) => {
    const listingCount =
      Array.isArray(row.properties) && row.properties[0]?.count
        ? Number(row.properties[0].count)
        : 0;

    return {
      id: row.id,
      name: row.full_name || "HAVEN Advisor",
      slug: row.id,
      title: row.professional_title || "Licensed Real Estate Advisor",
      agency: row.company_name || "HAVEN Private Estates",
      avatar: row.avatar_url || "/placeholder-avatar.jpg",
      listingCount,
    };
  });
}

/**
 * Fetches an individual public agent by ID (UUID).
 * Wrapped in React cache() so both generateMetadata() and AgentDetailsPage()
 * can call it without incurring duplicate database round-trips.
 */
export const getPublicAgentById = cache(
  async (idOrSlug: string): Promise<PublicAgentDetail | null> => {
    if (!idOrSlug) return null;

    const isUuid = UUID_REGEX.test(idOrSlug);

    // If not a valid UUID format, avoid malformed database query
    if (!isUuid) {
      return null;
    }

    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("agents_public")
      .select(AGENTS_PUBLIC_SELECT)
      .eq("id", idOrSlug)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error("Error fetching agent by ID:", error);
      return null;
    }

    const listingCount =
      Array.isArray((data as any).properties) && (data as any).properties[0]?.count
        ? Number((data as any).properties[0].count)
        : 0;

    return {
      id: data.id,
      name: data.full_name || "HAVEN Advisor",
      slug: data.id,
      title: data.professional_title || "Licensed Real Estate Advisor",
      agency: data.company_name || "HAVEN Private Estates",
      avatar: data.avatar_url || "/placeholder-avatar.jpg",
      bio: data.bio || "",
      listingCount,
      createdAt: data.created_at,
    };
  }
);

/**
 * Fetches all published properties belonging to a specific agent.
 * Formats them into UI presentation items (Property[]) for PropertyGrid.
 */
export async function getAgentPublishedProperties(
  agentId: string
): Promise<Property[]> {
  if (!agentId || !UUID_REGEX.test(agentId)) return [];

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_CARD_SELECT)
    .eq("agent_id", agentId)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("Error fetching agent properties:", error);
    return [];
  }

  return (data || []).map((item) => {
    const formatted = formatPropertyCardData(item as any, false);
    return {
      id: formatted.id,
      title: formatted.title,
      slug: formatted.slug,
      price: formatted.formattedPrice,
      rawPrice: item.price,
      location: formatted.location,
      image: formatted.coverImage,
      beds: formatted.bedrooms ?? 0,
      baths: formatted.bathrooms ?? 0,
      area: formatted.formattedArea,
      listingType: formatted.listingType,
      propertyType: formatted.propertyType,
      agent: formatted.agent,
      latitude: formatted.latitude,
      longitude: formatted.longitude,
      isSaved: false,
    };
  });
}
