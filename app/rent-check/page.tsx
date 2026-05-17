import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { ComingSoonTool } from "@/components/coming-soon-tool";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Rental Safety Checks for International Students",
  description:
    "Prepare safer rental decisions in Australia with student accommodation prompts for listings, inspections, bond payments, and document sharing.",
  path: "/rent-check",
  keywords: [
    "student rental safety Australia",
    "international student accommodation Australia",
    "rental scam checks students",
    "student housing Australia",
  ],
});

export default function RentCheckPage() {
  return (
    <ComingSoonTool
      eyebrow="RentGuard AI"
      title="Rental listing checks are coming soon"
      description="A focused rental safety workflow for spotting listing warning signs before students pay bond, transfer money, or share documents."
      icon={ShieldCheck}
      highlights={[
        "Listing and message checks before payment",
        "Inspection, bond, and identity-document reminders",
        "Plain-English next steps for safer rental decisions",
      ]}
    />
  );
}
