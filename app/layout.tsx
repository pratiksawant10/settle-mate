import type { Metadata } from "next";

import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { seoKeywords, siteUrl } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "SettleMate AI",
  title: {
    default: "SettleMate AI | International Student Planner for Australia",
    template: "%s | SettleMate AI",
  },
  description:
    "AI-powered planning tools for international students moving to Australia, including student onboarding, city guides, budget checks, accommodation prompts, and settlement support.",
  keywords: seoKeywords,
  authors: [{ name: "SettleMate AI" }],
  creator: "SettleMate AI",
  publisher: "SettleMate AI",
  category: "Education",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SettleMate AI | International Student Planner for Australia",
    description:
      "Plan your move to Australia with AI-powered student tools for arrival, budgeting, accommodation, city guidance, and settlement support.",
    url: "/",
    siteName: "SettleMate AI",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SettleMate AI | International Student Planner for Australia",
    description:
      "AI-powered planning, budgeting, and city guidance for international students moving to Australia.",
  },
  robots: {
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(user);

  return (
    <html lang="en">
      <body className="min-h-screen pb-16 font-sans lg:pb-0">
        <SiteHeader isAuthenticated={isAuthenticated} />
        <main>{children}</main>
        <SiteFooter />
        <MobileBottomNav isAuthenticated={isAuthenticated} />
      </body>
    </html>
  );
}
