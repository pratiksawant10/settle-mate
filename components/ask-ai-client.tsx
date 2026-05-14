"use client";

import { FormEvent, useState } from "react";
import { Bot, CalendarDays, GraduationCap, MapPinned, MessageCircle, Send, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getMockStudentSupportResponse } from "@/lib/services/chat";
import { cn } from "@/lib/utils";

type Message = {
  id: number;
  role: "student" | "assistant";
  content: string;
};

const starterQuestions = [
  "Can I afford to live in Melbourne on $1,800/month?",
  "Is this rental listing safe?",
  "Help me find part-time jobs near my university",
  "What should I do in my first week in Australia?",
  "Explain work-hour rules in simple terms",
];

const profileItems = [
  { label: "Student", value: "Aarav from India", icon: UserRound },
  { label: "City", value: "Melbourne", icon: MapPinned },
  { label: "Institution", value: "RMIT University", icon: GraduationCap },
  { label: "Course starts", value: "20 Jul 2026", icon: CalendarDays },
];

export function AskAiClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi, I am SettleMate AI. I can help you break student-life questions into safe, practical next steps. Ask about rent, jobs, budget, first-week setup, or general compliance reminders.",
    },
  ]);
  const [question, setQuestion] = useState("");

  function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const studentMessage: Message = {
      id: Date.now(),
      role: "student",
      content: trimmed,
    };
    const assistantMessage: Message = {
      id: Date.now() + 1,
      role: "assistant",
      content: getMockStudentSupportResponse(trimmed),
    };

    setMessages((current) => [...current, studentMessage, assistantMessage]);
    setQuestion("");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(question);
  }

  return (
    <PageShell
      eyebrow="Ask AI"
      title="A safe, supportive student-life assistant"
      description="A modern chat interface with profile context, suggested prompts, and visible boundaries for legal and migration topics."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden shadow-soft">
          <CardHeader className="border-b bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                  SettleMate AI chat
                </CardTitle>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Answers are mocked for the MVP and designed for plain-English support.
                </p>
              </div>
              <Badge variant="secondary">Profile-aware mock</Badge>
            </div>
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {starterQuestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => ask(item)}
                  className="shrink-0 rounded-md border bg-slate-50 px-3 py-2 text-left text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                >
                  {item}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[560px] min-h-[500px] overflow-y-auto bg-gradient-to-br from-white to-sky-50 p-5">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isStudent = message.role === "student";
                  return (
                    <div key={message.id} className={cn("flex gap-3", isStudent && "justify-end")}>
                      {!isStudent ? (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                          <Bot className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                      <div
                        className={cn(
                          "max-w-[82%] rounded-lg border p-4 text-sm leading-6 shadow-sm",
                          isStudent ? "bg-primary text-primary-foreground" : "bg-white text-foreground",
                        )}
                      >
                        {message.content}
                      </div>
                      {isStudent ? (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                          <UserRound className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <form className="border-t bg-white p-4" onSubmit={onSubmit}>
              <label htmlFor="question" className="sr-only">
                Ask SettleMate AI
              </label>
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <Textarea
                  id="question"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask about rent, job, budget, visa, transport, or settling in..."
                  className="min-h-20"
                />
                <Button type="submit" className="md:h-20" variant="accent">
                  Send
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Saved profile context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profileItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-3 rounded-lg border bg-white p-3">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-semibold">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
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
