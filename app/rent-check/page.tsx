import { ShieldCheck } from "lucide-react";

import { ComingSoonTool } from "@/components/coming-soon-tool";

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
