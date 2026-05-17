"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, CalendarClock, CreditCard, Gauge, Sparkles, Zap } from "lucide-react";

import { purchaseAiPack } from "@/app/ask-ai/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AiPricingPlanView = {
  code: string;
  name: string;
  priceAud: number;
  durationDays: number | null;
  tokenAllowance: number;
  dailyRequestLimit: number | null;
  isActive: boolean;
};

export type AiUsageSummaryView = {
  entitlement: {
    id: string;
    planCode: string;
    status: "active" | "expired" | "cancelled" | "exhausted";
    tokenAllowance: number;
    tokensUsed: number;
    tokensRemaining: number;
    expiresAt: string;
    plan: AiPricingPlanView | null;
  };
  dailyUsage: {
    usageDate: string;
    requestCount: number;
    totalTokens: number;
  };
  dailyRequestLimit: number | null;
  isFreePlan: boolean;
  usagePercent: number;
  upgradeRecommended: boolean;
  pricingPlans: AiPricingPlanView[];
};

type AiUsageCardProps = {
  usageSummary: AiUsageSummaryView | null;
  usageError: string | null;
};

function formatTokens(value: number) {
  return new Intl.NumberFormat("en-AU").format(Math.max(0, value));
}

function formatAud(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function AiUsageCard({ usageSummary, usageError }: AiUsageCardProps) {
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const paidPlans = useMemo(
    () => usageSummary?.pricingPlans.filter((plan) => plan.priceAud > 0) ?? [],
    [usageSummary],
  );

  function startPurchase(planCode: string) {
    setPurchaseMessage(null);
    startTransition(async () => {
      const result = await purchaseAiPack(planCode);
      setPurchaseMessage(result.message);
    });
  }

  if (!usageSummary) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gauge className="h-4 w-4 text-primary" aria-hidden="true" />
            AI usage
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-800" aria-hidden="true" />
              <Badge variant="warning">Setup needed</Badge>
            </div>
            <p className="text-sm leading-6 text-amber-900">
              {usageError ?? "AI usage tracking is not available right now."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { entitlement } = usageSummary;
  const currentPlanName = entitlement.plan?.name ?? entitlement.planCode;
  const usagePercent = Math.min(100, Math.max(0, usageSummary.usagePercent));
  const remainingPercent =
    entitlement.tokenAllowance > 0
      ? Math.max(0, entitlement.tokensRemaining) / entitlement.tokenAllowance
      : 0;
  const firstPaidPlan = paidPlans[0];

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gauge className="h-4 w-4 text-primary" aria-hidden="true" />
            AI usage
          </CardTitle>
          <Badge variant={entitlement.status === "active" ? "success" : "warning"}>{entitlement.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="rounded-lg border bg-white p-3">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Current plan</p>
              <p className="mt-1 text-sm font-semibold">{currentPlanName}</p>
            </div>
            {usageSummary.upgradeRecommended && firstPaidPlan ? (
              <Button
                type="button"
                size="sm"
                variant="accent"
                onClick={() => startPurchase(firstPaidPlan.code)}
                disabled={isPending}
              >
                Upgrade
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-slate-50 p-2">
              <p className="text-[11px] font-semibold uppercase text-muted-foreground">Used</p>
              <p className="mt-1 text-sm font-semibold">{formatTokens(entitlement.tokensUsed)}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-2">
              <p className="text-[11px] font-semibold uppercase text-muted-foreground">Remaining</p>
              <p className="mt-1 text-sm font-semibold">{formatTokens(entitlement.tokensRemaining)}</p>
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn(
                "h-full rounded-full",
                remainingPercent < 0.2 ? "bg-amber-500" : "bg-primary",
              )}
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              Expires {formatDate(entitlement.expiresAt)}
            </span>
            {usageSummary.isFreePlan && usageSummary.dailyRequestLimit ? (
              <span className="inline-flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                {usageSummary.dailyUsage.requestCount}/{usageSummary.dailyRequestLimit} free requests today
              </span>
            ) : null}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">AI packs</p>
            <CreditCard className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="grid gap-2">
            {usageSummary.pricingPlans.map((plan) => {
              const isCurrent = plan.code === entitlement.planCode;
              return (
                <div
                  key={plan.code}
                  className={cn(
                    "rounded-lg border bg-white p-3",
                    isCurrent && "border-primary/40 bg-secondary/60",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-5">{plan.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatTokens(plan.tokenAllowance)} tokens
                        {plan.durationDays ? ` / ${plan.durationDays} days` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold">
                      {plan.priceAud === 0 ? "Free" : formatAud(plan.priceAud)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    {isCurrent ? <Badge variant="success">Current</Badge> : <span />}
                    {plan.priceAud > 0 ? (
                      <Button
                        type="button"
                        size="sm"
                        variant={isCurrent ? "outline" : "default"}
                        onClick={() => startPurchase(plan.code)}
                        disabled={isPending}
                      >
                        Start checkout
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {purchaseMessage ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
            {purchaseMessage}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
