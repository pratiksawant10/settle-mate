import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/ask-ai", "/planner", "/login", "/design-system", "/auth"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
