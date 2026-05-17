"use client";

import { FormEvent, useState } from "react";
import { Banknote, Loader2, PiggyBank, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import { generateBudgetRecommendation } from "@/app/budget/actions";
import { Field } from "@/components/field";
import { MetricCard } from "@/components/metric-card";
import { PageShell } from "@/components/page-shell";
import { ResultPanel } from "@/components/result-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  calculateBudget,
  initialBudgetForm,
  type BudgetForm,
  type BudgetResult,
} from "@/lib/budget-model";
import { cities } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

type BudgetAiRecommendation = {
  headline: string;
  summary: string;
  marketContext: string[];
  recommendedActions: string[];
  riskFlags: string[];
  sources: string[];
};

function statusVariant(status: BudgetResult["status"]) {
  if (status === "Comfortable") return "success";
  if (status === "Tight but manageable") return "warning";
  return "danger";
}

function renderInlineBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

export function BudgetClient() {
  const [form, setForm] = useState<BudgetForm>(initialBudgetForm);
  const [result, setResult] = useState<BudgetResult>(() => calculateBudget(initialBudgetForm));
  const [recommendation, setRecommendation] = useState<BudgetAiRecommendation | null>(null);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [pendingRecommendation, setPendingRecommendation] = useState(false);

  function updateField<K extends keyof BudgetForm>(field: K, value: BudgetForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const localResult = calculateBudget(form);
    setResult(localResult);
    setRecommendation(null);
    setRecommendationError(null);
    setPendingRecommendation(true);

    const response = await generateBudgetRecommendation(form);
    setResult(response.budget);

    if (response.ok) {
      setRecommendation(response.recommendation);
    } else {
      setRecommendationError(response.message);
    }

    setPendingRecommendation(false);
  }

  return (
    <PageShell
      eyebrow="Cost of Living Calculator"
      title="Estimate your monthly student budget"
      description="Add your expected weekly and monthly numbers to see expenses, income, surplus or shortfall, and a plain-English budget health status."
    >
      <div className="mx-auto grid max-w-6xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student budget model</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field id="city" label="City">
                  <Select id="city" value={form.city} onChange={(event) => updateField("city", event.target.value)}>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field id="weeklyRent" label="Weekly rent">
                  <Input
                    id="weeklyRent"
                    type="number"
                    min="0"
                    value={form.weeklyRent}
                    onChange={(event) => updateField("weeklyRent", event.target.value)}
                  />
                </Field>
                <Field id="groceries" label="Groceries per week">
                  <Input
                    id="groceries"
                    type="number"
                    min="0"
                    value={form.groceries}
                    onChange={(event) => updateField("groceries", event.target.value)}
                  />
                </Field>
                <Field id="transport" label="Transport per week">
                  <Input
                    id="transport"
                    type="number"
                    min="0"
                    value={form.transport}
                    onChange={(event) => updateField("transport", event.target.value)}
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field id="phoneInternet" label="Phone/internet per month">
                  <Input
                    id="phoneInternet"
                    type="number"
                    min="0"
                    value={form.phoneInternet}
                    onChange={(event) => updateField("phoneInternet", event.target.value)}
                  />
                </Field>
                <Field id="eatingOut" label="Eating out per week">
                  <Input
                    id="eatingOut"
                    type="number"
                    min="0"
                    value={form.eatingOut}
                    onChange={(event) => updateField("eatingOut", event.target.value)}
                  />
                </Field>
                <Field id="other" label="Other expenses per month">
                  <Input
                    id="other"
                    type="number"
                    min="0"
                    value={form.other}
                    onChange={(event) => updateField("other", event.target.value)}
                  />
                </Field>

                <Field id="income" label="Expected part-time income per week">
                  <Input
                    id="income"
                    type="number"
                    min="0"
                    value={form.income}
                    onChange={(event) => updateField("income", event.target.value)}
                  />
                </Field>
              </div>

              <div className="grid md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <Button type="submit" disabled={pendingRecommendation} className="md:h-10">
                  {pendingRecommendation ? "Generating AI..." : "Calculate with AI"}
                  {pendingRecommendation ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Banknote className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <ResultPanel title="Premium budget snapshot">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget health status</p>
                <h2 className="mt-1 text-2xl font-bold">{result.status}</h2>
              </div>
              <Badge variant={statusVariant(result.status)}>{result.status}</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Monthly expenses"
                value={formatCurrency(result.monthlyExpenses)}
                icon={<TrendingDown className="h-5 w-5" />}
              />
              <MetricCard
                label="Monthly income"
                value={formatCurrency(result.monthlyIncome)}
                icon={<TrendingUp className="h-5 w-5" />}
              />
              <MetricCard
                label={result.surplus >= 0 ? "Surplus" : "Shortfall"}
                value={formatCurrency(Math.abs(result.surplus))}
                helper={result.surplus >= 0 ? "Estimated buffer after expenses." : "Estimated gap to solve."}
                icon={<PiggyBank className="h-5 w-5" />}
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border bg-white p-5">
                <h3 className="font-semibold">Monthly flow</h3>
                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Income</span>
                      <span>{formatCurrency(result.monthlyIncome)}</span>
                    </div>
                    <div className="mt-2 h-3 rounded-md bg-muted">
                      <div className="h-3 rounded-md bg-emerald-600" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Expenses</span>
                      <span>{formatCurrency(result.monthlyExpenses)}</span>
                    </div>
                    <div className="mt-2 h-3 rounded-md bg-muted">
                      <div
                        className="h-3 rounded-md bg-primary"
                        style={{
                          width: `${Math.min(100, Math.round((result.monthlyExpenses / Math.max(result.monthlyIncome, 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Rent share</span>
                      <span>{result.rentShare}% of expenses</span>
                    </div>
                    <div className="mt-2 h-3 rounded-md bg-muted">
                      <div className="h-3 rounded-md bg-amber-500" style={{ width: `${Math.min(100, result.rentShare)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-sky-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-primary">AI recommendation card</p>
                    <h3 className="mt-1 font-semibold">
                      {recommendation?.headline ?? "City-aware budget guidance"}
                    </h3>
                  </div>
                  {pendingRecommendation ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                  )}
                </div>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {pendingRecommendation
                    ? "Checking your budget model against current city context..."
                    : renderInlineBold(recommendation?.summary ?? result.recommendation)}
                </p>

                {recommendationError ? (
                  <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                    {recommendationError}
                  </div>
                ) : null}

                {recommendation ? (
                  <div className="mt-5 grid gap-4 text-sm leading-6">
                    {recommendation.marketContext.length > 0 ? (
                      <div>
                        <p className="font-semibold">Market context</p>
                        <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
                          {recommendation.marketContext.map((item) => (
                            <li key={item}>{renderInlineBold(item)}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div>
                      <p className="font-semibold">Recommended actions</p>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
                        {recommendation.recommendedActions.map((item) => (
                          <li key={item}>{renderInlineBold(item)}</li>
                        ))}
                      </ul>
                    </div>

                    {recommendation.riskFlags.length > 0 ? (
                      <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                        <p className="font-semibold text-amber-950">Watch points</p>
                        <ul className="mt-2 list-disc space-y-2 pl-5 text-amber-900">
                          {recommendation.riskFlags.map((item) => (
                            <li key={item}>{renderInlineBold(item)}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-5 grid gap-2 text-sm leading-6 text-muted-foreground">
                    <p>- Keep rent and bills separate from daily spending.</p>
                    <p>- Review the budget again after your first rent payment.</p>
                    <p>- Add one small emergency buffer before lifestyle spending.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-white p-5">
              <h3 className="font-semibold">Input summary</h3>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground md:grid-cols-2">
                <p>- Weekly costs are converted using 52 weeks divided by 12 months.</p>
                <p>- This calculator is a planning estimate, not financial advice.</p>
              </div>
            </div>
          </div>
        </ResultPanel>
      </div>
    </PageShell>
  );
}
