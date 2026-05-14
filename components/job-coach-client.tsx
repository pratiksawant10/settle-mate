"use client";

import { FormEvent, useState } from "react";
import { BriefcaseBusiness, FileText, MessageSquareText, ShieldCheck } from "lucide-react";

import { Field } from "@/components/field";
import { PageShell } from "@/components/page-shell";
import { ResultPanel } from "@/components/result-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cities } from "@/lib/constants";

type JobType =
  | "Retail"
  | "Hospitality"
  | "Warehouse"
  | "Call centre"
  | "Delivery"
  | "Admin"
  | "IT internship";

type ResumeStatus = "No resume yet" | "Draft resume" | "Australian-style resume ready" | "Needs review";

type JobForm = {
  experience: string;
  preferredJobType: JobType;
  availability: string;
  city: string;
  resumeStatus: ResumeStatus;
};

type JobResult = {
  resumeScore: number;
  missingSections: string[];
  suggestedJobTypes: string[];
  resumeTips: string[];
  coverLetter: string;
  interviewQuestions: string[];
  rightsReminders: string[];
};

const initialForm: JobForm = {
  experience: "Customer service in a family business and volunteer event support.",
  preferredJobType: "Retail",
  availability: "Weekends and two evenings after 5pm",
  city: "Melbourne",
  resumeStatus: "Draft resume",
};

const jobPairings: Record<JobType, string[]> = {
  Retail: ["Retail assistant", "Sales floor team member", "Customer service assistant"],
  Hospitality: ["Cafe all-rounder", "Food runner", "Barista trainee"],
  Warehouse: ["Pick packer", "Stockroom assistant", "Fulfilment team member"],
  "Call centre": ["Customer support agent", "Inbound call assistant", "Student services casual"],
  Delivery: ["Bike courier", "Food delivery partner", "Parcel sorting support"],
  Admin: ["Reception assistant", "Data entry assistant", "Campus admin casual"],
  "IT internship": ["IT support intern", "Junior QA assistant", "Help desk trainee"],
};

function generateJobCoach(form: JobForm): JobResult {
  // Future AI/API integration: this can become a resume-aware coaching prompt.
  const hasExperience = form.experience.trim().length > 20;
  const city = form.city;
  const jobType = form.preferredJobType;
  const resumeScore =
    form.resumeStatus === "Australian-style resume ready" ? 82 : form.resumeStatus === "Draft resume" ? 61 : 42;

  return {
    resumeScore,
    missingSections:
      form.resumeStatus === "Australian-style resume ready"
        ? ["Tailored achievements for each job type", "Referee line if available"]
        : ["Australian phone number", "Availability near the top", "Short skills summary", "Local or campus experience"],
    suggestedJobTypes: [
      ...jobPairings[jobType],
      hasExperience ? "Customer-facing casual roles" : "Entry-level campus and event roles",
    ],
    resumeTips: [
      form.resumeStatus === "No resume yet"
        ? "Start with a one-page resume: contact details, availability, education, skills, and any project or volunteer work."
        : "Keep your resume to one page if possible and put availability near the top.",
      "Use Australian phone formatting, suburb/city, and a professional email address.",
      `For ${jobType}, show evidence of reliability, communication, teamwork, and handling busy periods.`,
      "Use short achievement bullets with action words instead of long paragraphs.",
    ],
    coverLetter: `Hi, I am an international student based in ${city} and I am interested in a ${jobType.toLowerCase()} role. I can offer ${form.availability || "flexible availability around my classes"} and I am confident with communication, reliability, and learning new systems quickly. I would welcome the chance to discuss how I can support your team.`,
    interviewQuestions: [
      "Tell me about yourself and your availability.",
      "Describe a time you handled a busy or stressful situation.",
      "How would you respond to an unhappy customer?",
      "What would you do if you made a mistake during a shift?",
      "How will you balance study commitments with work?",
    ],
    rightsReminders: [
      "Know your minimum pay rate and check official Fair Work information.",
      "Keep payslips, rosters, messages, and written records of hours worked.",
      "Do not ignore unsafe work, unpaid trials that seem unreasonable, or cash-only pressure.",
      "Be aware of visa condition and work-hour responsibilities, and check official sources.",
    ],
  };
}

export function JobCoachClient() {
  const [form, setForm] = useState<JobForm>(initialForm);
  const [result, setResult] = useState<JobResult>(() => generateJobCoach(initialForm));

  function updateField<K extends keyof JobForm>(field: K, value: JobForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(generateJobCoach(form));
  }

  return (
    <PageShell
      eyebrow="Part-Time Job Coach"
      title="Prepare for student-friendly work in Australia"
      description="Get mock AI coaching for suitable job types, resume improvements, cover letters, interview preparation, and workplace rights awareness."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Student work profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-5" onSubmit={onSubmit}>
              <Field id="experience" label="Previous experience">
                <Textarea
                  id="experience"
                  value={form.experience}
                  onChange={(event) => updateField("experience", event.target.value)}
                  placeholder="Retail, hospitality, volunteering, projects, family business..."
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field id="preferredJobType" label="Preferred job type">
                  <Select
                    id="preferredJobType"
                    value={form.preferredJobType}
                    onChange={(event) => updateField("preferredJobType", event.target.value as JobType)}
                  >
                    {Object.keys(jobPairings).map((jobType) => (
                      <option key={jobType} value={jobType}>
                        {jobType}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field id="city" label="City">
                  <Select id="city" value={form.city} onChange={(event) => updateField("city", event.target.value)}>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field id="availability" label="Availability">
                <Input
                  id="availability"
                  value={form.availability}
                  onChange={(event) => updateField("availability", event.target.value)}
                  placeholder="Weekends, evenings, weekdays after class..."
                />
              </Field>

              <Field id="resumeStatus" label="Current resume status">
                <Select
                  id="resumeStatus"
                  value={form.resumeStatus}
                  onChange={(event) => updateField("resumeStatus", event.target.value as ResumeStatus)}
                >
                  <option>No resume yet</option>
                  <option>Draft resume</option>
                  <option>Australian-style resume ready</option>
                  <option>Needs review</option>
                </Select>
              </Field>

              <Button type="submit" variant="accent" size="lg">
                Generate Job Coaching
                <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <ResultPanel title="Job coach output">
          <div className="space-y-6">
            <div>
              <Badge variant="secondary">Mock AI guidance</Badge>
              <h2 className="mt-3 text-xl font-semibold">{form.preferredJobType} pathway in {form.city}</h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <section className="rounded-lg border bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">AI Resume Coach</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Resume strength score based on completeness, relevance, and student-friendly clarity.
                    </p>
                  </div>
                  <span className="text-3xl font-bold text-primary">{result.resumeScore}%</span>
                </div>
                <div className="mt-5 h-3 rounded-md bg-muted">
                  <div className="h-3 rounded-md bg-primary" style={{ width: `${result.resumeScore}%` }} />
                </div>
                <h4 className="mt-5 text-sm font-semibold">Missing sections</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.missingSections.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="flex items-center gap-2 font-semibold">
                  <BriefcaseBusiness className="h-5 w-5 text-primary" aria-hidden="true" />
                  Suggested job types
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {result.suggestedJobTypes.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <section>
                <h3 className="flex items-center gap-2 font-semibold">
                  <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                  Resume tips
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {result.resumeTips.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="rounded-lg bg-sky-50 p-5">
              <h3 className="font-semibold">Mock cover letter snippet</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{result.coverLetter}</p>
            </section>

            <div className="grid gap-5 md:grid-cols-2">
              <section>
                <h3 className="flex items-center gap-2 font-semibold">
                  <MessageSquareText className="h-5 w-5 text-primary" aria-hidden="true" />
                  Interview preparation
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {result.interviewQuestions.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h3 className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                  Workplace rights reminders
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {result.rightsReminders.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </ResultPanel>
      </div>
    </PageShell>
  );
}
