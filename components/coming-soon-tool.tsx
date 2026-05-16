import Link from "next/link";
import { BellRing, type LucideIcon } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { PlanCtaLink } from "@/components/plan-cta-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ComingSoonToolProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  highlights: string[];
};

export function ComingSoonTool({ eyebrow, title, description, icon: Icon, highlights }: ComingSoonToolProps) {
  return (
    <PageShell eyebrow={eyebrow} title={title} description={description}>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <Card className="bg-white/95">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <Badge variant="warning">Coming soon</Badge>
            </div>
            <CardTitle className="pt-3">This tool is being prepared for launch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              We are keeping this feature out of the main menu until the workflow is ready. The planner,
              budget calculator, city guides, and Ask AI are available now.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="accent">
                <PlanCtaLink icon="sparkles" />
              </Button>
              <Button asChild variant="outline">
                <Link href="/ask-ai">Ask AI</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-primary" aria-hidden="true" />
              Launch scope
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-lg border bg-slate-50 px-4 py-3 text-sm leading-6 text-muted-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
