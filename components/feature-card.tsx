import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FeatureCardProps = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
};

export function FeatureCard({ title, description, href, icon: Icon, comingSoon }: FeatureCardProps) {
  const card = (
    <Card
      className={
        comingSoon
          ? "h-full border-dashed bg-white/90"
          : "h-full bg-white/90 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
      }
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          {comingSoon ? <Badge variant="warning">Coming soon</Badge> : null}
        </div>
        <CardTitle className="pt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        <span
          className={
            comingSoon
              ? "mt-4 inline-flex text-sm font-semibold text-amber-800"
              : "mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          }
        >
          {comingSoon ? (
            "Coming soon"
          ) : (
            <>
              Open tool
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </>
          )}
        </span>
      </CardContent>
    </Card>
  );

  if (comingSoon) {
    return (
      <div className="h-full" aria-disabled="true">
        {card}
      </div>
    );
  }

  return (
    <Link href={href} className="group block h-full">
      {card}
    </Link>
  );
}
