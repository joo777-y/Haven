import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://haven.luxury";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/properties",
          "/properties/*",
          "/agents",
          "/agents/*",
          "/about",
          "/contact",
        ],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/agent",
          "/agent/*",
          "/auth",
          "/auth/*",
          "/api",
          "/api/*",
          "/_next/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
