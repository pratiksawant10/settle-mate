import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  LayoutDashboard,
  MessageCircle,
  Navigation,
  Palette,
  Sparkles,
  Type,
} from "lucide-react";

import { Checklist } from "@/components/checklist";
import { PageShell } from "@/components/page-shell";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const colours = [
  { name: "Primary deep teal", value: "#075f7a", className: "bg-primary" },
  { name: "Secondary mint", value: "#dff7ef", className: "bg-secondary" },
  { name: "CTA coral", value: "#f97316", className: "bg-accent" },
  { name: "Safe green", value: "#16a34a", className: "bg-emerald-600" },
  { name: "Warning amber", value: "#f59e0b", className: "bg-amber-500" },
  { name: "Risk red", value: "#dc2626", className: "bg-red-600" },
  { name: "Info blue", value: "#0284c7", className: "bg-sky-600" },
  { name: "App background", value: "#f8fbff", className: "bg-sky-50" },
];

const typography = [
  { token: "Hero", className: "text-5xl font-bold", usage: "Landing page headline" },
  { token: "Page title", className: "text-4xl font-bold", usage: "Screen headers" },
  { token: "Section title", className: "text-2xl font-bold", usage: "Major content blocks" },
  { token: "Card title", className: "text-lg font-semibold", usage: "Cards and panels" },
  { token: "Body", className: "text-base", usage: "Primary explanatory copy" },
  { token: "Microcopy", className: "text-sm", usage: "Hints, disclaimers, metadata" },
];

const checklistItems = ["Apply for TFN", "Buy SIM card", "Attend orientation", "Confirm accommodation"];

export default function DesignSystemPage() {
  return (
    <PageShell
      eyebrow="Design System"
      title="SettleMate AI high-fidelity design system"
      description="A compact Figma and frontend handoff page covering the product’s visual language, UI components, responsive patterns, and supportive UX rules."
    >
      <div className="space-y-12">
        <section className="rounded-lg border bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 text-xl font-bold">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="h-6 w-6" aria-hidden="true" />
                </span>
                SettleMate AI
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Logo treatment pairs a simple AI sparkle mark with a confident wordmark. Use on white, primary, or very
                light blue backgrounds.
              </p>
            </div>
            <Badge variant="secondary">Your AI co-pilot for student life in Australia</Badge>
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Tokens" title="Colour palette" description="Trustworthy teal and sky foundations with a warm coral CTA and clear status colours." />
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {colours.map((colour) => (
              <div key={colour.name} className="rounded-lg border bg-white p-4">
                <div className={`h-16 rounded-md ${colour.className}`} />
                <p className="mt-3 text-sm font-semibold">{colour.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{colour.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Typography" title="Modern sans-serif scale" description="Large confident headings, compact dashboard text, and readable microcopy." />
          <div className="mt-6 rounded-lg border bg-white p-6">
            <div className="grid gap-5">
              {typography.map((item) => (
                <div key={item.token} className="grid gap-3 border-b pb-5 last:border-b-0 last:pb-0 md:grid-cols-[220px_1fr_1fr] md:items-center">
                  <p className="text-sm font-semibold text-muted-foreground">{item.token}</p>
                  <p className={item.className}>Settle with confidence</p>
                  <p className="text-sm leading-6 text-muted-foreground">{item.usage}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Components" title="Core product UI" description="Reusable components are calm, direct, and action-led." />
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" aria-hidden="true" />
                  Buttons and inputs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-3">
                  <Button variant="accent">Build My Student Plan</Button>
                  <Button>Primary action</Button>
                  <Button variant="outline">Secondary action</Button>
                  <Button variant="ghost">Quiet action</Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="University or college name" />
                  <Select defaultValue="Melbourne">
                    <option>Melbourne</option>
                    <option>Sydney</option>
                    <option>Brisbane</option>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" aria-hidden="true" />
                  Status badges
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="success">Comfortable</Badge>
                <Badge variant="warning">Tight but manageable</Badge>
                <Badge variant="danger">High Risk</Badge>
                <Badge variant="secondary">General reminder</Badge>
                <Badge variant="outline">Official source</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" aria-hidden="true" />
                  Risk score component
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-gradient-to-br from-slate-950 to-primary p-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white/70">Rental risk score</p>
                      <p className="mt-2 text-4xl font-bold">78/100</p>
                    </div>
                    <Badge variant="danger">High Risk</Badge>
                  </div>
                  <div className="mt-5 h-3 rounded-md bg-white/20">
                    <div className="h-3 w-[78%] rounded-md bg-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Checklist title="Checklist component" items={checklistItems} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-primary" aria-hidden="true" />
                  Dashboard cards
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-white p-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
                  <p className="mt-3 text-sm text-muted-foreground">Readiness</p>
                  <p className="mt-1 text-2xl font-bold">72%</p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                  <Banknote className="h-5 w-5 text-primary" aria-hidden="true" />
                  <p className="mt-3 text-sm text-muted-foreground">Budget health</p>
                  <p className="mt-1 text-2xl font-bold">Tight</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                  AI recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-primary/20 bg-sky-50 p-5">
                  <div className="flex gap-3">
                    <Sparkles className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                    <div>
                      <h3 className="font-semibold">Next best action</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Save the rental listing details, then update your first-week checklist.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Patterns" title="Navigation and responsive behaviour" description="Desktop uses top navigation and dashboard sidebars. Mobile feels app-like with bottom navigation and stacked cards." />
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {[
              {
                title: "Desktop navigation",
                icon: Navigation,
                copy: "Sticky top bar, concise labels, primary CTA on the right, and active states with soft mint backgrounds.",
              },
              {
                title: "Mobile bottom nav",
                icon: LayoutDashboard,
                copy: "Five high-frequency destinations: Home, Plan, Budget, City, Ask. Coming-soon tools stay out of the main menu until ready.",
              },
              {
                title: "Progressive disclosure",
                icon: ClipboardCheck,
                copy: "Show the next action first, then let students drill into details, flags, questions, and reminders when they are ready.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-lg border bg-white p-6">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-6">
          <SectionHeader eyebrow="UX principles" title="Supportive copy and anxiety reduction" description="Use plain English, visible boundaries, helpful empty states, and softer wording for stressful topics." />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
              Say: “Important rule to be aware of” instead of “Visa compliance violation.”
            </div>
            <div className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              Say: “Your budget may feel tight” instead of “High financial risk.”
            </div>
            <div className="rounded-lg bg-sky-50 p-4 text-sm leading-6 text-sky-950">
              Say: “You still have a few important setup steps left” instead of “You failed checklist.”
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
