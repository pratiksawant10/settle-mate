"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Banknote,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  Home,
  Info,
  Loader2,
  MapPinned,
  MessageCircle,
  Send,
  ShieldCheck,
  Target,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { askSettleMateAi } from "@/app/ask-ai/actions";
import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Message = {
  id: number;
  role: "student" | "assistant";
  content: string;
  status?: "error";
};

export type SavedProfileContext = {
  student: string;
  city: string;
  institution: string;
  courseStart: string;
  monthlyBudget: string;
  accommodation: string;
  partTime: string;
  mainConcern: string;
};

type AskAiClientProps = {
  profile: SavedProfileContext | null;
};

const starterQuestions = [
  { label: "This week", prompt: "What should I prioritise this week?", icon: CalendarDays },
  { label: "Rent budget", prompt: "How should I think about my rent budget?", icon: Banknote },
  { label: "Part-time work", prompt: "Help me prepare for part-time work near campus", icon: BriefcaseBusiness },
  { label: "Arrival setup", prompt: "What should I do in my first week in Australia?", icon: MapPinned },
  { label: "Rental questions", prompt: "What should I ask before paying for a room?", icon: Home },
];

export function AskAiClient({ profile }: AskAiClientProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        profile
          ? `Hi, I am SettleMate AI. I can use your saved ${profile.city} student profile to give more relevant next steps. Ask about rent, jobs, budget, first-week setup, or general compliance reminders.`
          : "Hi, I am SettleMate AI. I can help with student-life questions. Set up your student plan first if you want me to use your saved city, university, budget, and housing context.",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const profileItems = useMemo(
    () =>
      profile
        ? [
            { label: "Student", value: profile.student, icon: UserRound },
            { label: "City", value: profile.city, icon: MapPinned },
            { label: "Institution", value: profile.institution, icon: GraduationCap },
            { label: "Course starts", value: profile.courseStart, icon: CalendarDays },
            { label: "Monthly budget", value: profile.monthlyBudget, icon: Banknote },
            { label: "Accommodation", value: profile.accommodation, icon: Home },
            { label: "Work plan", value: profile.partTime, icon: BriefcaseBusiness },
            { label: "Main concern", value: profile.mainConcern, icon: Target },
          ]
        : [],
    [profile],
  );

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const studentMessage: Message = {
      id: Date.now(),
      role: "student",
      content: trimmed,
    };

    const history = messages.map(({ role, content }) => ({ role, content }));

    setMessages((current) => [...current, studentMessage]);
    setQuestion("");
    setPending(true);

    const result = await askSettleMateAi(trimmed, history);

    setMessages((current) => [
      ...current,
      {
        id: Date.now() + 1,
        role: "assistant",
        content: result.ok ? result.answer : result.message,
        status: result.ok ? undefined : "error",
      },
    ]);
    setPending(false);
  }

  function renderMessageContent(content: string) {
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const normalized = line.replace(/^[-*]\s+/, "").replace(/^\d+[.)]\s+/, "");

        return (
          <p key={`${line}-${index}`} className={cn(index > 0 && "mt-2")}>
            {line === normalized ? null : <span className="mr-2 text-primary">•</span>}
            {normalized}
          </p>
        );
      });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(question);
  }

  return (
    <PageShell
      eyebrow="Ask AI"
      title="Ask SettleMate AI about your student plan"
      description="A profile-aware student-life assistant connected to your saved onboarding details."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden border-slate-200 shadow-soft">
          <CardHeader className="border-b bg-white px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                  SettleMate AI chat
                </CardTitle>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">OpenAI connected</Badge>
                <Badge variant={profile ? "secondary" : "warning"}>
                  {profile ? "Saved profile loaded" : "No saved profile"}
                </Badge>
              </div>
            </div>

            <div className="mt-4 rounded-lg border bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Recommended questions</p>
                <span className="text-xs font-medium text-muted-foreground">Uses saved context</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {starterQuestions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.prompt}
                      type="button"
                      onClick={() => ask(item.prompt)}
                      disabled={pending}
                      className="group grid min-h-20 content-between rounded-md border bg-white p-3 text-left transition-colors hover:border-primary/40 hover:bg-secondary disabled:opacity-60"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                        <Send className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </div>
                      <span className="mt-3 text-sm font-semibold leading-5 text-foreground">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[620px] min-h-[560px] overflow-y-auto bg-slate-50 p-4 sm:p-5">
              <div className="space-y-5">
                {messages.map((message) => {
                  const isStudent = message.role === "student";
                  return (
                    <div key={message.id} className={cn("grid gap-2", isStudent ? "justify-items-end" : "justify-items-start")}>
                      <div className={cn("flex items-center gap-2 text-xs font-semibold text-muted-foreground", isStudent && "flex-row-reverse")}>
                        <span
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-md",
                            isStudent ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground",
                          )}
                        >
                          {isStudent ? <UserRound className="h-4 w-4" aria-hidden="true" /> : <Bot className="h-4 w-4" aria-hidden="true" />}
                        </span>
                        <span>{isStudent ? "You" : "SettleMate AI"}</span>
                      </div>
                      <div className={cn("flex w-full", isStudent && "justify-end")}>
                      {!isStudent ? (
                        <div className="hidden w-7 shrink-0 sm:block" />
                      ) : null}
                      <div
                        className={cn(
                          "max-w-[92%] rounded-lg border px-4 py-3 text-sm leading-6 shadow-sm md:max-w-[78%]",
                          isStudent
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-slate-200 bg-white text-foreground",
                          message.status === "error" && "border-red-200 bg-red-50 text-red-900",
                        )}
                      >
                        {isStudent ? message.content : renderMessageContent(message.content)}
                      </div>
                      {isStudent ? (
                        <div className="hidden w-7 shrink-0 sm:block" />
                      ) : null}
                      </div>
                    </div>
                  );
                })}
                {pending ? (
                  <div className="grid justify-items-start gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>SettleMate AI</span>
                    </div>
                    <div className="ml-0 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 shadow-sm sm:ml-9">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                      Thinking with your student context...
                    </div>
                  </div>
                ) : null}
                <div ref={scrollRef} />
              </div>
            </div>

            <form className="border-t bg-white p-4" onSubmit={onSubmit}>
              <label htmlFor="question" className="sr-only">
                Ask SettleMate AI
              </label>
              <div className="rounded-lg border bg-slate-50 p-2">
                <Textarea
                  id="question"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask about rent, job, budget, visa, transport, or settling in..."
                  className="min-h-20 border-0 bg-transparent focus-visible:ring-0"
                  disabled={pending}
                />
                <div className="flex flex-wrap items-center justify-between gap-3 border-t px-2 pt-2">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Info className="h-3.5 w-3.5" aria-hidden="true" />
                    General guidance only. Check official sources for rules and advice.
                  </p>
                  <Button type="submit" variant="accent" disabled={pending}>
                    {pending ? "Sending..." : "Send"}
                    {pending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Send className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <aside className="space-y-5">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-slate-950 text-white">
              <CardTitle className="text-base">Saved profile context</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {profile ? (
                <div className="grid gap-3">
                  {profileItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="grid gap-2 rounded-lg border bg-white p-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                          <p className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</p>
                        </div>
                        <p className="break-words text-sm font-semibold leading-5">{item.value}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm leading-6 text-amber-950">
                    No saved student profile was found. Build your student plan to give Ask AI your city,
                    institution, budget, accommodation, and main concern.
                  </p>
                  <Button asChild variant="accent" className="mt-4">
                    <Link href="/login?next=/planner">Build My Plan</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assistant boundaries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 rounded-lg bg-amber-50 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
                <p className="text-sm leading-6 text-amber-900">
                  SettleMate AI provides general information only and does not provide legal, financial, rental,
                  employment, or migration advice. For visa topics, check official sources or a registered migration agent.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next useful tools</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/budget">Check budget health</Link>
              </Button>
              <Button variant="outline" className="justify-start" disabled>
                RentGuard AI coming soon
              </Button>
              <Button variant="outline" className="justify-start" disabled>
                Part-Time Job Coach coming soon
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
