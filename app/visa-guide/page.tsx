import type { Metadata } from "next";
import { CalendarCheck } from "lucide-react";

import { ComingSoonTool } from "@/components/coming-soon-tool";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Student Visa and Compliance Reminders Australia",
  description:
    "Organise general student visa, COE, OSHC, course milestone, and official-source reminders for international students in Australia.",
  path: "/visa-guide",
  keywords: [
    "student visa reminders Australia",
    "international student compliance Australia",
    "COE OSHC reminders",
    "Australia student visa checklist",
  ],
});

export default function VisaGuidePage() {
  return (
    <ComingSoonTool
      eyebrow="Visa & Compliance Guide"
      title="Visa and compliance reminders are coming soon"
      description="A general-information reminder centre for important student responsibilities, with clear boundaries around legal and migration advice."
      icon={CalendarCheck}
      highlights={[
        "Visa, COE, OSHC, and course milestone reminders",
        "Official-source prompts before important decisions",
        "Clear guidance on when to seek professional advice",
      ]}
    />
  );
}
