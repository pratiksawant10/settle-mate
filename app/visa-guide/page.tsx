import { CalendarCheck } from "lucide-react";

import { ComingSoonTool } from "@/components/coming-soon-tool";

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
