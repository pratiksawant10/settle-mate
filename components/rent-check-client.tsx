"use client";

import { FormEvent, useState } from "react";
import { AlertTriangle, HelpCircle, Home, ShieldAlert } from "lucide-react";

import { Field } from "@/components/field";
import { MetricCard } from "@/components/metric-card";
import { PageShell } from "@/components/page-shell";
import { ResultPanel } from "@/components/result-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

type RoomType = "Private room" | "Shared room" | "Studio" | "Apartment";

type RentForm = {
  suburb: string;
  weeklyRent: string;
  roomType: RoomType;
  inspectionAvailable: "yes" | "no";
  bondBeforeInspection: "yes" | "no";
  cashOnly: "yes" | "no";
  description: string;
};

type RentResult = {
  score: number;
  level: "Low" | "Medium" | "High";
  flags: string[];
  questions: string[];
  tips: string[];
};

const initialForm: RentForm = {
  suburb: "Brunswick",
  weeklyRent: "210",
  roomType: "Private room",
  inspectionAvailable: "yes",
  bondBeforeInspection: "yes",
  cashOnly: "yes",
  description: "Urgent room available near tram. Pay cash deposit today to secure. Photos available.",
};

const suspiciousKeywords = [
  "urgent",
  "cash only",
  "no inspection",
  "overseas",
  "deposit today",
  "western union",
  "wire transfer",
  "send money",
  "too good to be true",
  "key will be posted",
];

function analyseRent(form: RentForm): RentResult {
  let score = 5;
  const flags: string[] = [];
  const weeklyRent = Number(form.weeklyRent) || 0;
  const description = form.description.toLowerCase();

  if (!form.suburb.trim()) {
    score += 5;
    flags.push("Suburb is missing, which makes price and commute checks harder.");
  }

  if (weeklyRent > 0 && weeklyRent < 180) {
    score += 15;
    flags.push("Weekly rent is unusually low for many student suburbs. Compare similar listings.");
  }

  if (form.inspectionAvailable === "no") {
    score += 25;
    flags.push("No inspection is available before payment.");
  }

  if (form.bondBeforeInspection === "yes") {
    score += 30;
    flags.push("Bond or deposit is requested before inspection.");
  }

  if (form.cashOnly === "yes") {
    score += 25;
    flags.push("Landlord is asking for cash only, which reduces payment records.");
  }

  suspiciousKeywords.forEach((keyword) => {
    if (description.includes(keyword)) {
      score += 10;
      flags.push(`Listing description includes a warning phrase: "${keyword}".`);
    }
  });

  if (form.description.trim().length < 40) {
    score += 10;
    flags.push("Listing description is very short. Ask for more details and photos.");
  }

  const cappedScore = Math.min(score, 100);
  const level = cappedScore >= 70 ? "High" : cappedScore >= 35 ? "Medium" : "Low";

  const questions = [
    "Can I inspect the room in person or by live video before paying anything?",
    "Will the bond be lodged with the relevant state or territory authority?",
    "Can you provide a written lease or rooming agreement before I transfer money?",
    "What bills are included, and who else lives at the property?",
    "Can I receive receipts for every payment?",
  ];

  if (form.inspectionAvailable === "no") {
    questions.unshift("Why is inspection unavailable, and can a trusted local person inspect on my behalf?");
  }
  if (form.cashOnly === "yes") {
    questions.unshift("Can I pay through a traceable method instead of cash?");
  }

  return {
    score: cappedScore,
    level,
    flags: Array.from(new Set(flags.length ? flags : ["No major warning flags were detected in the mock scan."])),
    questions,
    tips: [
      "Inspect in person or by live video before sending money.",
      "Use traceable payment methods and keep receipts.",
      "Ask for a written agreement before moving in.",
      "Check how bond will be lodged with the correct authority.",
      "Do not rush if the listing pressures you to pay immediately.",
    ],
  };
}

function riskVariant(level: RentResult["level"]) {
  if (level === "Low") return "success";
  if (level === "Medium") return "warning";
  return "danger";
}

export function RentCheckClient() {
  const [form, setForm] = useState<RentForm>(initialForm);
  const [result, setResult] = useState<RentResult>(() => analyseRent(initialForm));

  function updateField<K extends keyof RentForm>(field: K, value: RentForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(analyseRent(form));
  }

  return (
    <PageShell
      eyebrow="Rental Safety Checker"
      title="RentGuard AI: scan rental listings before you pay"
      description="A standout mock AI feature that turns rental red flags into a clear risk score, warning flags, landlord questions, and safe renting tips."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Rental listing scan</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-5" onSubmit={onSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <Field id="suburb" label="Suburb">
                  <Input
                    id="suburb"
                    value={form.suburb}
                    onChange={(event) => updateField("suburb", event.target.value)}
                    placeholder="Carlton, Parramatta, St Lucia..."
                  />
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
              </div>

              <Field id="roomType" label="Room type">
                <Select
                  id="roomType"
                  value={form.roomType}
                  onChange={(event) => updateField("roomType", event.target.value as RoomType)}
                >
                  <option>Private room</option>
                  <option>Shared room</option>
                  <option>Studio</option>
                  <option>Apartment</option>
                </Select>
              </Field>

              <div className="grid gap-5 md:grid-cols-3">
                <Field id="inspectionAvailable" label="Inspection available?">
                  <Select
                    id="inspectionAvailable"
                    value={form.inspectionAvailable}
                    onChange={(event) => updateField("inspectionAvailable", event.target.value as RentForm["inspectionAvailable"])}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </Select>
                </Field>
                <Field id="bondBeforeInspection" label="Bond before inspection?">
                  <Select
                    id="bondBeforeInspection"
                    value={form.bondBeforeInspection}
                    onChange={(event) => updateField("bondBeforeInspection", event.target.value as RentForm["bondBeforeInspection"])}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </Select>
                </Field>
                <Field id="cashOnly" label="Cash only?">
                  <Select
                    id="cashOnly"
                    value={form.cashOnly}
                    onChange={(event) => updateField("cashOnly", event.target.value as RentForm["cashOnly"])}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </Select>
                </Field>
              </div>

              <Field id="description" label="Listing description">
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Paste the listing text here..."
                />
              </Field>

              <Button type="submit" variant="accent" size="lg">
                Run RentGuard AI
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <ResultPanel title="RentGuard AI risk report">
          <div className="space-y-6">
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border bg-gradient-to-br from-slate-950 to-primary p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white/70">Risk score</p>
                    <p className="mt-2 text-5xl font-bold">{result.score}/100</p>
                  </div>
                  <Badge variant={riskVariant(result.level)}>{result.level} Risk</Badge>
                </div>
                <div className="mt-6 h-3 rounded-md bg-white/20">
                  <div
                    className="h-3 rounded-md bg-accent"
                    style={{ width: `${result.score}%` }}
                    aria-label={`Risk score ${result.score} out of 100`}
                  />
                </div>
                <p className="mt-5 text-sm leading-6 text-white/80">
                  Higher scores mean more warning signals. Slow down, verify the property, and avoid pressure to pay immediately.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <MetricCard
                  label="Risk level"
                  value={`${result.level} Risk`}
                  helper="Based on mock rental safety rules."
                  icon={<ShieldAlert className="h-5 w-5" />}
                />
                <MetricCard
                  label="Weekly rent"
                  value={formatCurrency(Number(form.weeklyRent) || 0)}
                  helper={`${form.roomType} in ${form.suburb || "selected suburb"}`}
                  icon={<Home className="h-5 w-5" />}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-5 w-5 text-amber-700" aria-hidden="true" />
                  Warning flags
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {result.flags.map((flag) => (
                    <li key={flag}>- {flag}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-semibold">
                  <HelpCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                  Suggested questions
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {result.questions.map((question) => (
                    <li key={question}>- {question}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-lg border bg-emerald-50 p-5">
              <h3 className="font-semibold text-emerald-950">Safe renting tips</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-emerald-950 md:grid-cols-2">
                {result.tips.map((tip) => (
                  <li key={tip}>- {tip}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Disclaimer: SettleMate AI provides general rental safety information only and does not provide legal
              advice. Check your state or territory tenancy authority or speak with a qualified professional.
            </div>
          </div>
        </ResultPanel>
      </div>
    </PageShell>
  );
}
