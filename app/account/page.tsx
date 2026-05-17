import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, Settings, UserRound } from "lucide-react";

import { AiUsageCard } from "@/components/ai-usage-card";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAiUsageSummary, type AiUsageSummary } from "@/lib/services/ai-usage-service";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  let usageSummary: AiUsageSummary | null = null;
  let usageError: string | null = null;

  try {
    usageSummary = await getAiUsageSummary(user.id);
  } catch (error) {
    usageError =
      error instanceof Error && error.message.includes("SUPABASE_SERVICE_ROLE_KEY")
        ? "AI usage tracking needs SUPABASE_SERVICE_ROLE_KEY."
        : "AI usage tracking is not available right now.";
  }

  return (
    <PageShell
      eyebrow="Account Settings"
      title="Manage your SettleMate account"
      description="Review your account details, AI plan, token usage, and upgrade options."
    >
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" aria-hidden="true" />
              Account details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="rounded-lg border bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Signed in as</p>
              <p className="mt-2 break-words text-sm font-semibold">{user.email ?? "Google account"}</p>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-start gap-3">
                <Settings className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Student profile</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Update your onboarding details from the planner when your city, budget, institution, or arrival
                    priorities change.
                  </p>
                </div>
              </div>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/planner">Open planner</Link>
              </Button>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-start gap-3">
                <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Billing</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Pack checkout is prepared as a backend abstraction. Payment provider integration can connect here
                    when ready.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <AiUsageCard usageSummary={usageSummary} usageError={usageError} />
      </div>
    </PageShell>
  );
}
