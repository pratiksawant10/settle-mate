import { BriefcaseBusiness } from "lucide-react";

import { ComingSoonTool } from "@/components/coming-soon-tool";

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
