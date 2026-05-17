import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

const publicRoutes = [
  {
    path: "/",
    priority: 1,
    changeFrequency: "weekly",
  },
  {
    path: "/budget",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    path: "/city-guides",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  {
    path: "/rent-check",
    priority: 0.6,
    changeFrequency: "monthly",
  },
  {
    path: "/job-coach",
    priority: 0.6,
    changeFrequency: "monthly",
  },
  {
    path: "/visa-guide",
    priority: 0.6,
    changeFrequency: "monthly",
  },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
