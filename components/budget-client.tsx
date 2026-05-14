"use client";

import { FormEvent, useState } from "react";
import { Banknote, PiggyBank, TrendingDown, TrendingUp } from "lucide-react";

import { Field } from "@/components/field";
import { MetricCard } from "@/components/metric-card";
import { PageShell } from "@/components/page-shell";
import { ResultPanel } from "@/components/result-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cities } from "@/lib/constants";
import { formatCurrency, weeklyToMonthly } from "@/lib/utils";

type BudgetForm = {
  city: string;
  weeklyRent: string;
  groceries: string;
  transport: string;
  phoneInternet: string;
  eatingOut: string;
  other: string;
  income: string;
};

type BudgetResult = {
  monthlyExpenses: number;
  monthlyIncome: number;
  surplus: number;
  rentShare: number;
  status: "Comfortable" | "Tight but manageable" | "Your budget may feel tight";
  recommendation: string;
};

const initialForm: BudgetForm = {
  city: "Melbourne",
  weeklyRent: "320",
  groceries: "110",
  transport: "45",
  phoneInternet: "65",
  eatingOut: "60",
  other: "180",
  income: "550",
};

function toNumber(value: string) {
  return Number(value) || 0;
}

function calculateBudget(form: BudgetForm): BudgetResult {
  const monthlyExpenses =
    weeklyToMonthly(toNumber(form.weeklyRent)) +
    weeklyToMonthly(toNumber(form.groceries)) +
    weeklyToMonthly(toNumber(form.transport)) +
    weeklyToMonthly(toNumber(form.eatingOut)) +
    toNumber(form.phoneInternet) +
    toNumber(form.other);
  const monthlyIncome = weeklyToMonthly(toNumber(form.income));
  const surplus = monthlyIncome - monthlyExpenses;
  const rentShare = monthlyExpenses > 0 ? Math.round((weeklyToMonthly(toNumber(form.weeklyRent)) / monthlyExpenses) * 100) : 0;
  const status =
    surplus >= 400 ? "Comfortable" : surplus >= 0 ? "Tight but manageable" : "Your budget may feel tight";

  const recommendation =
    status === "Comfortable"
      ? `Your ${form.city} budget has breathing room. Rent is taking up ${rentShare}% of monthly expenses, so keep housing predictable and save part of the surplus.`
      : status === "Tight but manageable"
        ? `Your rent is taking up ${rentShare}% of your monthly budget. Consider shared accommodation in nearby suburbs or increasing your weekly work target during semester breaks.`
        : `Your budget may feel tight in ${form.city}. Rent is taking up ${rentShare}% of monthly expenses, so recheck housing, reduce flexible spending, and speak with student support if the gap continues.`;

  return {
    monthlyExpenses,
    monthlyIncome,
    surplus,
    rentShare,
    status,
    recommendation,
  };
}

function statusVariant(status: BudgetResult["status"]) {
  if (status === "Comfortable") return "success";
  if (status === "Tight but manageable") return "warning";
  return "danger";
}

export function BudgetClient() {
  const [form, setForm] = useState<BudgetForm>(initialForm);
  const [result, setResult] = useState<BudgetResult>(() => calculateBudget(initialForm));

  function updateField<K extends keyof BudgetForm>(field: K, value: BudgetForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(calculateBudget(form));
  }

  return (
    <PageShell
      eyebrow="Cost of Living Calculator"
      title="Estimate your monthly student budget"
      description="Add your expected weekly and monthly numbers to see expenses, income, surplus or shortfall, and a plain-English budget health status."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Student budget model</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-5" onSubmit={onSubmit}>
              <Field id="city" label="City">
                <Select id="city" value={form.city} onChange={(event) => updateField("city", event.target.value)}>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
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
              </div>

              <Field id="income" label="Expected part-time income per week">
                <Input
                  id="income"
                  type="number"
                  min="0"
                  value={form.income}
                  onChange={(event) => updateField("income", event.target.value)}
                />
              </Field>

              <Button type="submit">
                Calculate Budget
                <Banknote className="h-4 w-4" aria-hidden="true" />
              </Button>
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
                <h3 className="font-semibold">AI recommendation card</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{result.recommendation}</p>
                <div className="mt-5 grid gap-2 text-sm leading-6 text-muted-foreground">
                  <p>- Keep rent and bills separate from daily spending.</p>
                  <p>- Review the budget again after your first rent payment.</p>
                  <p>- Add one small emergency buffer before lifestyle spending.</p>
                </div>
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
