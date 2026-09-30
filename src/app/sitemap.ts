import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { mockAgents } from "@/data/agents";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://haven.luxury";
  const currentDate = new Date().toISOString();

  // 1. Core luxury static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/properties`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // 2. Dynamic published properties from Supabase
  let propertyRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
    const { data: properties, error } = await supabase
      .from("properties")
      .select("slug, updated_at")
      .eq("status", "published");

    if (!error && properties) {
      propertyRoutes = properties.map((prop) => ({
        url: `${baseUrl}/properties/${prop.slug}`,
        lastModified: prop.updated_at || currentDate,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      }));
    }
  } catch (err) {
    console.error("Error generating sitemap properties:", err);
  }

  // 3. Dynamic Advisor profiles
  const agentRoutes: MetadataRoute.Sitemap = mockAgents.map((agent) => ({
    url: `${baseUrl}/agents/${agent.slug}`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...propertyRoutes, ...agentRoutes];
}
