"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Home,
  MapPinned,
  Plane,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { Checklist } from "@/components/checklist";
import { Field } from "@/components/field";
import { MetricCard } from "@/components/metric-card";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { recommendSuburbsForPlan, saveStudentOnboarding } from "@/app/planner/actions";
import { cities } from "@/lib/constants";
import {
  emptyPlannerForm,
  loadingSuburbRecommendations,
  type Concern,
  type PlannerForm,
  type SuburbRecommendationResult,
} from "@/lib/student-plan";
import { cn, formatCurrency } from "@/lib/utils";

type StudentPlan = {
  readiness: number;
  summary: string;
  first7: string[];
  first30: string[];
  first90: string[];
  budgetSuggestions: string[];
  suburbRecommendations: SuburbRecommendationResult;
  reminders: string[];
  nextAction: string;
};

const concernFocus: Record<Concern, string[]> = {
  housing: ["Confirm accommodation", "Ask bond questions", "Keep payment evidence"],
  job: ["Prepare resume", "Apply for TFN", "Map work availability"],
  budget: ["Protect rent money", "Track weekly food spend", "Build emergency buffer"],
  visa: ["Check official conditions", "Track work hours", "Save COE and OSHC"],
  loneliness: ["Join clubs", "Find community groups", "Book wellbeing support"],
  transport: ["Set up transport card", "Save campus route", "Compare commute times"],
  "study pressure": ["Attend academic skills", "Plan study blocks", "Ask for help early"],
};

const cityTransport: Record<string, string> = {
  Melbourne: "Get Myki and save your campus route.",
  Sydney: "Use Opal or contactless and check peak fares.",
  Brisbane: "Set up a go card and check concession eligibility.",
  Adelaide: "Set up metroCARD and check late transport.",
  Perth: "Set up SmartRider and compare zones.",
  Canberra: "Check MyWay+ and bus/light rail links.",
};

const plannerSidebarItems = [
  { label: "Overview", icon: Plane, section: "overview" },
  { label: "Checklist", icon: ClipboardCheck, section: "checklist" },
  { label: "Budget", icon: Banknote, section: "budget" },
  { label: "Housing", icon: Home, section: "housing" },
  { label: "Support", icon: ShieldCheck, section: "support" },
] as const;

type PlannerSection = (typeof plannerSidebarItems)[number]["section"];

type PlannerClientProps = {
  initialProfile?: PlannerForm | null;
};

function displayDate(value: string) {
  if (!value) return "Course date TBC";
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${value}T00:00:00`),
  );
}

function getCourseStartCountdown(value: string) {
  if (!value) {
    return {
      value: "Date TBC",
      helper: "Add your course start date to show a countdown.",
    };
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return {
      value: "Date TBC",
      helper: "Check the course start date format.",
    };
  }

  const startDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Math.ceil((startDate.getTime() - today.getTime()) / 86_400_000);

  if (days > 1) {
    return {
      value: `${days} days`,
      helper: `Until ${displayDate(value)}`,
    };
  }

  if (days === 1) {
    return {
      value: "1 day",
      helper: `Until ${displayDate(value)}`,
    };
  }

  if (days === 0) {
    return {
      value: "Starts today",
      helper: displayDate(value),
    };
  }

  if (days === -1) {
    return {
      value: "Started yesterday",
      helper: displayDate(value),
    };
  }

  return {
    value: `Started ${Math.abs(days)} days ago`,
    helper: displayDate(value),
  };
}

function generatePlan(
  form: PlannerForm,
  suburbRecommendations: SuburbRecommendationResult = loadingSuburbRecommendations,
): StudentPlan {
  // Future AI/API integration: replace this deterministic plan builder with a model-backed service.
  const budget = Number(form.monthlyBudget) || 0;
  const readiness = Math.max(
    48,
    Math.min(
      92,
      62 +
        (form.origin ? 4 : 0) +
        (form.institution ? 5 : 0) +
        (form.startDate ? 5 : 0) +
        (budget >= 2200 ? 5 : -4) +
        (form.partTime === "yes" ? 3 : 0),
    ),
  );

  return {
    readiness,
    summary: `${form.name || "Your student"} is preparing for ${form.city} with ${formatCurrency(budget)} per month, ${form.accommodation.toLowerCase()}, and ${form.concern} as the priority area.`,
    first7: [
      "Apply for TFN",
      "Set up Australian bank account",
      "Buy SIM card",
      cityTransport[form.city] ?? "Set up your local transport card.",
      "Attend university orientation",
      "Confirm accommodation",
      "Register with student support services",
    ],
    first30: [
      "Run a full budget check after your first rent cycle",
      "Prepare a one-page Australian-style resume",
      "Join one campus club and one community group",
      "Save health, housing, academic, and urgent support contacts",
      "Understand work-hour rules through official sources",
    ],
    first90: [
      "Review rent, commute, study load, and work hours together",
      "Book academic skills support before major assessments",
      "Set reminders for OSHC, visa dates, COE, and rent payments",
      "Build a two-week emergency plan for money, housing, and documents",
      "Update your plan after exams or timetable changes",
    ],
    budgetSuggestions: [
      budget >= 2500
        ? "Budget looks comfortable if rent stays predictable."
        : budget >= 1900
          ? "Budget may feel tight. Shared housing and planned groceries matter."
          : "Budget needs careful protection. Prioritise lower rent and student support.",
      "Put rent, transport, and groceries into separate weekly buckets.",
      "Keep emergency money away from daily spending.",
    ],
    suburbRecommendations,
    reminders: [
      "Set OSHC, COE, visa date, and rent reminders.",
      "Check official government and university sources before important decisions.",
      "Keep passport, visa grant, COE, OSHC, lease, and receipts in cloud storage.",
    ],
    nextAction:
      form.concern === "housing"
        ? "Shortlist listings, inspect before paying, and save details for RentGuard AI when it launches."
        : `Complete your ${concernFocus[form.concern][0].toLowerCase()} step today, then update your checklist.`,
  };
}

export function PlannerClient({ initialProfile = null }: PlannerClientProps) {
  const [form, setForm] = useState<PlannerForm>(initialProfile ?? emptyPlannerForm);
  const [plan, setPlan] = useState<StudentPlan | null>(() =>
    initialProfile ? generatePlan(initialProfile) : null,
  );
  const [activeSection, setActiveSection] = useState<PlannerSection>("overview");
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const monthlyBudgetLabel = useMemo(() => formatCurrency(Number(form.monthlyBudget) || 0), [form.monthlyBudget]);
  const courseCountdown = useMemo(() => getCourseStartCountdown(form.startDate), [form.startDate]);
  const activeSidebarItem = plannerSidebarItems.find((item) => item.section === activeSection) ?? plannerSidebarItems[0];

  function updateField<K extends keyof PlannerForm>(field: K, value: PlannerForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function refreshSuburbRecommendations(targetForm: PlannerForm) {
    setPlan((current) => (current ? { ...current, suburbRecommendations: loadingSuburbRecommendations } : current));

    const result = await recommendSuburbsForPlan(targetForm);

    setPlan((current) => (current ? { ...current, suburbRecommendations: result } : generatePlan(targetForm, result)));
  }

  useEffect(() => {
    if (!initialProfile) {
      return;
    }

    refreshSuburbRecommendations(initialProfile).catch(() => {
      setPlan((current) =>
        current
          ? {
              ...current,
              suburbRecommendations: {
                status: "error",
                institutionName: initialProfile.institution,
                message: "We could not generate suburb recommendations. Please try again.",
                recommendations: [],
                sources: [],
              },
            }
          : current,
      );
    });
  }, [initialProfile]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      const result = await saveStudentOnboarding(form);

      if (!result.ok) {
        setSaveError(result.message);
        return;
      }

      setPlan(generatePlan(form));
      setGeneratedAt(
        new Intl.DateTimeFormat("en-AU", { hour: "numeric", minute: "2-digit" }).format(new Date(result.savedAt)),
      );
      setActiveSection("overview");
      window.dispatchEvent(new Event("student-plan-updated"));
      refreshSuburbRecommendations(form).catch(() => {
        setPlan((current) =>
          current
            ? {
                ...current,
                suburbRecommendations: {
                  status: "error",
                  institutionName: form.institution,
                  message: "We could not generate suburb recommendations. Please try again from the housing section.",
                  recommendations: [],
                  sources: [],
                },
              }
            : current,
        );
      });
    } catch {
      setSaveError("We could not save your onboarding profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function editOnboarding() {
    setPlan(null);
    setGeneratedAt(null);
    setSaveError(null);
    setActiveSection("overview");
  }

  return (
    <PageShell
      eyebrow={plan ? "Student Planner Dashboard" : "Student Planner Onboarding"}
      title={plan ? "Your personalised first 90 days dashboard" : "Build your personalised first 90 days dashboard"}
      description={
        plan
          ? "Review your saved student profile, first-week checklist, budget snapshot, housing prompts, and support reminders."
          : "Start with your arrival, study, money, housing, and support details. Your dashboard appears after onboarding."
      }
    >
      <div className={cn("grid gap-6", !plan && "xl:grid-cols-[390px_1fr]")}>
        {!plan ? (
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Student onboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-5" onSubmit={onSubmit}>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                <Field id="name" label="Student name">
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                  />
                </Field>
                <Field id="origin" label="Country of origin">
                  <Input
                    id="origin"
                    required
                    value={form.origin}
                    onChange={(event) => updateField("origin", event.target.value)}
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                <Field id="city" label="Australian city">
                  <Select id="city" value={form.city} onChange={(event) => updateField("city", event.target.value)}>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field id="institution" label="University or college">
                  <Input
                    id="institution"
                    required
                    value={form.institution}
                    onChange={(event) => updateField("institution", event.target.value)}
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                <Field id="startDate" label="Course start date">
                  <Input
                    id="startDate"
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(event) => updateField("startDate", event.target.value)}
                  />
                </Field>
                <Field id="monthlyBudget" label="Monthly budget">
                  <Input
                    id="monthlyBudget"
                    type="number"
                    min="0"
                    required
                    value={form.monthlyBudget}
                    onChange={(event) => updateField("monthlyBudget", event.target.value)}
                  />
                </Field>
              </div>

              <Field id="accommodation" label="Accommodation preference">
                <Select
                  id="accommodation"
                  value={form.accommodation}
                  onChange={(event) => updateField("accommodation", event.target.value)}
                >
                  <option>Private room in shared house</option>
                  <option>Shared room</option>
                  <option>Student accommodation</option>
                  <option>Studio apartment</option>
                  <option>Living with relatives</option>
                </Select>
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="partTime" label="Work part-time?">
                  <Select
                    id="partTime"
                    value={form.partTime}
                    onChange={(event) => updateField("partTime", event.target.value as PlannerForm["partTime"])}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </Select>
                </Field>
                <Field id="concern" label="Main concern">
                  <Select
                    id="concern"
                    value={form.concern}
                    onChange={(event) => updateField("concern", event.target.value as Concern)}
                  >
                    {Object.keys(concernFocus).map((concern) => (
                      <option key={concern} value={concern}>
                        {concern}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Button type="submit" variant="accent" size="lg" disabled={saving}>
                {saving ? "Saving..." : "Start Student Dashboard"}
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </Button>
              {saveError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
                  {saveError}
                </div>
              ) : null}
              {generatedAt ? (
                <p className="text-sm leading-6 text-muted-foreground">Dashboard saved at {generatedAt}.</p>
              ) : null}
            </form>
          </CardContent>
        </Card>
        ) : null}

        {plan ? (
          <div className="grid gap-5">
            {/* <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white px-5 py-4 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-primary">Saved student dashboard</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  This dashboard is generated from the onboarding profile saved.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={editOnboarding}>
                Edit onboarding
              </Button>
            </div> */}
            <div className="overflow-hidden rounded-lg border bg-white shadow-soft">
          <div className="grid min-h-[780px] lg:grid-cols-[220px_1fr]">
            <aside className="hidden border-r bg-slate-950 p-5 text-white lg:block">
              <div className="flex items-center gap-2 font-bold">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </span>
                SettleMate
              </div>
              <nav className="mt-8 grid gap-2 text-sm">
                {plannerSidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setActiveSection(item.section)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-white/10 hover:text-white",
                        activeSection === item.section ? "bg-white/10 text-white" : "text-white/70",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            <section className="bg-slate-50">
              <header className="border-b bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {form.city} student plan · {activeSidebarItem.label}
                    </p>
                    <h2 className="mt-1 text-2xl font-bold">Welcome to {form.city}, {form.name || "student"}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {form.institution || "Institution TBC"} · Starts {displayDate(form.startDate)} · {form.origin || "Origin TBC"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3 rounded-lg border bg-white p-3">
                      <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Course countdown</p>
                        <p className="text-sm font-semibold">{courseCountdown.value}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border bg-white p-3">
                      <UserRound className="h-5 w-5 text-primary" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Profile</p>
                        <p className="text-sm font-semibold">{form.partTime === "yes" ? "Plans to work" : "Study-first plan"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              <div className="border-b bg-white p-3 lg:hidden">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {plannerSidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setActiveSection(item.section)}
                        className={cn(
                          "flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold",
                          activeSection === item.section
                            ? "border-primary bg-secondary text-secondary-foreground"
                            : "bg-white text-muted-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-5 p-5">
                {generatedAt ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
                    Dashboard generated at {generatedAt}. Use the section controls to review the plan.
                  </div>
                ) : null}

                {activeSection === "overview" ? (
                  <>
                    <div className="grid">
                      <div className="rounded-lg border bg-gradient-to-r from-primary to-sky-700 p-6 text-primary-foreground">
                        <Badge className="bg-white text-primary">AI-generated plan</Badge>
                        <h3 className="mt-5 text-2xl font-bold">Welcome to {form.city}, {form.name || "student"}</h3>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">{plan.summary}</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                          {concernFocus[form.concern].map((item) => (
                            <span key={item} className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-semibold">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* <div className="rounded-lg border bg-white p-6">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground">Readiness score</p>
                            <p className="mt-2 text-4xl font-bold">{plan.readiness}% ready</p>
                          </div>
                          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="mt-5 h-3 rounded-md bg-muted">
                          <div className="h-3 rounded-md bg-primary" style={{ width: `${plan.readiness}%` }} />
                        </div>
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">
                          You still have a few important setup steps left. Focus on documents, accommodation, and support
                          contacts first.
                        </p>
                      </div> */}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <MetricCard
                        label="Monthly budget"
                        value={monthlyBudgetLabel}
                        icon={<Banknote className="h-5 w-5" />}
                      />
                      <MetricCard
                        label="Course start"
                        value={displayDate(form.startDate)}
                        icon={<CalendarDays className="h-5 w-5" />}
                      />
                      <MetricCard
                        label="Course countdown"
                        value={courseCountdown.value}
                        helper={courseCountdown.helper}
                        icon={<CalendarDays className="h-5 w-5" />}
                      />
                      <MetricCard label="Main focus" value={form.concern} icon={<MapPinned className="h-5 w-5" />} />
                    </div>

                    <div className="rounded-lg border border-primary/20 bg-white p-5">
                      <div className="flex items-start gap-3">
                        <Sparkles className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                        <div>
                          <h3 className="font-semibold">AI next-best-action</h3>
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.nextAction}</p>
                          <Button className="mt-4" asChild>
                            <Link href="/ask-ai">Continue</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}

                {activeSection === "checklist" ? (
                  <div className="grid gap-5 xl:grid-cols-[1fr_1fr_0.85fr]">
                    <Checklist title="First 7 Days Checklist" items={plan.first7} />
                    <Checklist title="First 30 Days Checklist" items={plan.first30} />
                    <Checklist title="First 90 Days Roadmap" items={plan.first90} />
                  </div>
                ) : null}

                {activeSection === "budget" ? (
                  <div className="grid gap-5 lg:grid-cols-[0.75fr_1fr]">
                    <MetricCard
                      label="Monthly budget"
                      value={monthlyBudgetLabel}
                      helper="Generated from the current student setup form."
                      icon={<Banknote className="h-5 w-5" />}
                    />
                    <div className="rounded-lg border bg-white p-5">
                      <h3 className="font-semibold">Budget snapshot</h3>
                      <div className="mt-4 grid gap-3">
                        {plan.budgetSuggestions.map((item) => (
                          <div key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                            <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeSection === "housing" ? (
                  <div className="grid gap-5">
                    <div className="rounded-lg border bg-white p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">Recommended suburbs</h3>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {plan.suburbRecommendations.message}
                          </p>
                        </div>
                        <Badge variant={plan.suburbRecommendations.status === "ai" ? "success" : "outline"}>
                          {plan.suburbRecommendations.status === "ai"
                            ? "AI matched"
                            : plan.suburbRecommendations.status === "static"
                              ? "Static fallback"
                              : plan.suburbRecommendations.status === "loading"
                                ? "Finding suburbs"
                                : "Unavailable"}
                        </Badge>
                      </div>

                      {plan.suburbRecommendations.status === "loading" ? (
                        <div className="mt-5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-950">
                          Checking the university or college, campus proximity, current rent context, transport, and casual
                          work access.
                        </div>
                      ) : null}

                      {plan.suburbRecommendations.status === "error" ? (
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
                          <span>{plan.suburbRecommendations.message}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-red-200 bg-white text-red-900 hover:bg-red-100"
                            onClick={() => refreshSuburbRecommendations(form)}
                          >
                            Try again
                          </Button>
                        </div>
                      ) : null}

                      {plan.suburbRecommendations.recommendations.length > 0 ? (
                        <div className="mt-5 grid gap-4 xl:grid-cols-2">
                          {plan.suburbRecommendations.recommendations.map((item) => (
                            <article key={item.suburb} className="rounded-lg border bg-slate-50 p-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <h4 className="text-lg font-semibold">{item.suburb}</h4>
                                <Badge variant="outline">{item.medianWeeklyRent}</Badge>
                              </div>
                              <div className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground">
                                <p>
                                  <span className="font-semibold text-foreground">Proximity:</span> {item.proximity}
                                </p>
                                <p>
                                  <span className="font-semibold text-foreground">Transport:</span>{" "}
                                  {item.transportNotes}
                                </p>
                                <p>
                                  <span className="font-semibold text-foreground">Free tram zone:</span>{" "}
                                  {item.freeTramZone}
                                </p>
                                <p>
                                  <span className="font-semibold text-foreground">Casual jobs:</span>{" "}
                                  {item.jobProspects}
                                </p>
                              </div>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {item.benefits.map((benefit) => (
                                  <Badge key={benefit} variant="secondary">
                                    {benefit}
                                  </Badge>
                                ))}
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="rounded-lg border bg-white p-5">
                      <h3 className="font-semibold">Housing actions</h3>
                      <ul className="mt-4 space-y-3">
                        {concernFocus.housing.map((item) => (
                          <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                            <Home className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-sm leading-6 text-muted-foreground">{plan.nextAction}</p>
                    </div>
                  </div>
                ) : null}

                {activeSection === "support" ? (
                  <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
                    <div className="rounded-lg border bg-amber-50 p-5">
                      <h3 className="font-semibold text-amber-950">Important reminders</h3>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-950">
                        {plan.reminders.map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg border border-primary/20 bg-white p-5">
                      <div className="flex items-start gap-3">
                        <Sparkles className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                        <div>
                          <h3 className="font-semibold">AI next-best-action</h3>
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.nextAction}</p>
                          <Button className="mt-4" asChild>
                            <Link href="/ask-ai">Continue</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
          </div>
          </div>
        ) : (
          <div className="grid min-h-[560px] items-center rounded-lg border bg-white p-6 shadow-soft">
            <div className="mx-auto max-w-xl text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Sparkles className="h-7 w-7" aria-hidden="true" />
              </span>
              <p className="mt-5 text-sm font-semibold uppercase text-primary">Onboarding first</p>
              <h2 className="mt-2 text-3xl font-bold leading-tight">Your dashboard is ready to build</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Complete the student onboarding fields to generate your first-week checklist, budget snapshot,
                housing prompts, support reminders, and next-best action.
              </p>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
