import type { Metadata } from "next";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://settlemate.ai").replace(/\/$/, "");

export const seoKeywords = [
  "international students Australia",
  "student planner Australia",
  "student budget calculator Australia",
  "Australia student accommodation",
  "student suburbs Australia",
  "study in Australia",
  "student arrival checklist",
  "student cost of living Australia",
  "part-time work international students",
  "student visa reminders Australia",
  "Melbourne international students",
  "Sydney international students",
  "Brisbane international students",
  "Adelaide international students",
  "Perth international students",
  "Canberra international students",
];

type PageSeoOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
}: PageSeoOptions): Metadata {
  return {
    title,
    description,
    keywords: [...seoKeywords, ...keywords],
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "SettleMate AI",
      locale: "en_AU",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
