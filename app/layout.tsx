import type { Metadata } from "next";

import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "SettleMate AI | Student life support in Australia",
  description:
    "An AI-powered support platform for international students planning arrival, money, rentals, part-time work, and settlement in Australia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen pb-16 font-sans lg:pb-0">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <MobileBottomNav />
      </body>
    </html>
  );
}
