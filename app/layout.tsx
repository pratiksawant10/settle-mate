import type { Metadata } from "next";

import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "SettleMate AI | Student life support in Australia",
  description:
    "An AI-powered support platform for international students planning arrival, money, rentals, part-time work, and settlement in Australia.",
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
