import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Banknote,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  MapPinned,
  MessageCircle,
  Plane,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { FeatureCard } from "@/components/feature-card";
import { PlanCtaLink } from "@/components/plan-cta-link";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { audienceCountries, cities, features } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

const trustIndicators = [
  { label: "Personalised settlement plans", icon: Plane },
  { label: "Rental safety checks coming soon", icon: ShieldCheck },
  { label: "Budget guidance", icon: Banknote },
  { label: "Student job support coming soon", icon: BriefcaseBusiness },
  { label: "Compliance guide coming soon", icon: ClipboardCheck },
];

const steps = [
  {
    title: "Tell us your city, university, budget, and goals",
    description: "Students share the context that actually changes their first few months: campus, rent, course date, work plans, and main concerns.",
    icon: ClipboardCheck,
  },
  {
    title: "Get your personalised AI settlement plan",
    description: "SettleMate turns those details into a clear first week, first month, and 90-day roadmap with calm next steps.",
    icon: Sparkles,
  },
  {
    title: "Use tools to manage rent, budget, work, and student life",
    description: "Students can model their budget, scan city guidance, and ask support questions while specialist tools prepare for launch.",
    icon: ShieldCheck,
  },
];

const dashboardMetrics = [
  { label: "90-day plan", value: "18 steps", tone: "bg-sky-50 text-sky-800", icon: Plane },
  { label: "Budget health", value: "Tight", tone: "bg-amber-50 text-amber-800", icon: Banknote },
  { label: "Rental safety", value: "Soon", tone: "bg-amber-50 text-amber-800", icon: ShieldCheck },
  { label: "Job coaching", value: "Soon", tone: "bg-indigo-50 text-indigo-800", icon: BriefcaseBusiness },
];

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/planner");
  }

  return (
    <>
      <section className="settlemate-shell dashboard-grid overflow-hidden">
        <div className="container grid min-h-[calc(100vh-4rem)] items-center gap-12 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-6">
              Your AI co-pilot for student life in Australia
            </Badge>
            <h1 className="text-4xl font-bold leading-tight text-foreground md:text-6xl">
              Land in Australia with confidence.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              SettleMate AI helps international students plan their move, manage money, explore city guidance,
              ask support questions, and prepare for upcoming rental, job, and compliance tools.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="accent">
                <PlanCtaLink defaultLabel="Build My Student Plan" profileLabel="Open Student Planner" />
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/ask-ai">
                  Try AI Assistant
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {audienceCountries.map((country) => (
                <span key={country} className="rounded-md border bg-white/80 px-3 py-1.5 text-sm font-medium text-muted-foreground">
                  {country}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-lg border border-white/70 bg-white/90 p-4 shadow-soft backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                <div>
                  <p className="text-sm font-semibold text-primary">Live student dashboard preview</p>
                  <h2 className="mt-1 text-xl font-bold">Aarav’s Melbourne arrival plan</h2>
                </div>
                <Badge variant="success">72% ready</Badge>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {dashboardMetrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.label} className="rounded-lg border bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground">{metric.label}</p>
                          <p className="mt-2 text-2xl font-bold">{metric.value}</p>
                        </div>
                        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.tone}`}>
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-lg border bg-gradient-to-r from-primary to-sky-700 p-5 text-primary-foreground">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold">AI next best action</p>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                      Confirm accommodation first, then apply for TFN and prepare a one-page retail resume before orientation week.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {["Apply for TFN", "Buy SIM card", "Attend orientation"].map((item, index) => (
                  <div key={item} className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">Day {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-white py-6">
        <div className="container grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {trustIndicators.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex min-h-14 items-center gap-3 rounded-lg bg-slate-50 px-4">
                <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section id="features" className="bg-white py-16 md:py-20">
        <div className="container">
          <SectionHeader
            align="center"
            eyebrow="Core MVP tools"
            title="Premium support tools for the first 90 days"
            description="Each feature is designed to reduce anxiety, keep guidance plain-English, and lead students toward one clear next action."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-16 md:py-20">
        <div className="container">
          <SectionHeader
            align="center"
            eyebrow="How it works"
            title="A calm path from arrival stress to confident action"
            description="The experience uses progressive disclosure: profile first, plan second, specialist tools when the student is ready."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-lg border bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground">Step {index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <SectionHeader
            eyebrow="Initial launch focus"
            title="Built around the cities and communities students ask about most"
            description="The MVP focuses on Melbourne, Sydney, Brisbane, Adelaide, Perth, and Canberra, with microcopy shaped for students arriving from South and Southeast Asia."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => (
              <div key={city} className="rounded-lg border bg-gradient-to-br from-white to-sky-50 p-5">
                <MapPinned className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">{city}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Local rent cues, transport prompts, student suburbs, community tips, and safety reminders.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary to-sky-700 py-16 text-primary-foreground md:py-20">
        <div className="container grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-white/80">Free MVP demo</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
              Create your free student plan in 5 minutes.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
              Start with a personalised first-week checklist, then use the budget calculator, city guides,
              and Ask AI while RentGuard AI, Part-Time Job Coach, and Visa & Compliance Guide prepare for launch.
            </p>
          </div>
          <Button asChild size="lg" variant="accent">
            <PlanCtaLink defaultLabel="Build My Student Plan" profileLabel="Open Student Planner" />
          </Button>
        </div>
      </section>
    </>
  );
}
