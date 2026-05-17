import type { Metadata } from "next";
import { BriefcaseBusiness } from "lucide-react";

import { ComingSoonTool } from "@/components/coming-soon-tool";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Part-Time Job Coach for International Students",
  description:
    "Plan part-time job preparation in Australia with student-friendly prompts for resume setup, interview practice, work availability, and workplace-rights reminders.",
  path: "/job-coach",
  keywords: [
    "part-time jobs international students Australia",
    "student resume Australia",
    "student job coach Australia",
    "casual work international students",
  ],
});

export default function JobCoachPage() {
  return (
    <ComingSoonTool
      eyebrow="Part-Time Job Coach"
      title="Student job coaching is coming soon"
      description="A practical part-time work assistant for job ideas, resume preparation, interview prompts, and workplace rights reminders."
      icon={BriefcaseBusiness}
      highlights={[
        "Role suggestions matched to study load and city",
        "Resume and interview preparation prompts",
        "Workplace rights reminders with official-source boundaries",
      ]}
    />
  );
}
