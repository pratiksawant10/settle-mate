"use server";

import { createClient } from "@/lib/supabase/server";

type ChatHistoryMessage = {
  role: "student" | "assistant";
  content: string;
};

type AskAiResult =
  | { ok: true; answer: string; usage: TokenUsage }
  | { ok: false; message: string };

type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
};

type StudentOnboardingProfileRow = {
  student_name: string;
  country_of_origin: string;
  city: string;
  institution: string;
  course_start_date: string;
  monthly_budget: number | string;
  accommodation: string;
  part_time: boolean;
  main_concern: string;
};

type OpenAiResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
};

function getOpenAiApiKey() {
  return process.env.OPEN_AI_API_KEY ?? process.env.OPENAI_API_KEY;
}

function extractOutputText(response: OpenAiResponse) {
  if (response.output_text) {
    return response.output_text;
  }

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter(Boolean)
      .join("\n") ?? ""
  );
}

function profileToPromptContext(profile: StudentOnboardingProfileRow | null) {
  if (!profile) {
    return "No saved student onboarding profile is available. Ask concise follow-up questions before making assumptions.";
  }

  return `Saved student onboarding profile:
- Student: ${profile.student_name}
- Country of origin: ${profile.country_of_origin}
- Australian city: ${profile.city}
- University or college: ${profile.institution}
- Course start date: ${profile.course_start_date}
- Monthly budget: AUD ${profile.monthly_budget}
- Accommodation preference: ${profile.accommodation}
- Plans to work part-time: ${profile.part_time ? "yes" : "no"}
- Main concern: ${profile.main_concern}`;
}

export async function askSettleMateAi(
  question: string,
  history: ChatHistoryMessage[],
): Promise<AskAiResult> {
  const trimmed = question.trim();

  if (!trimmed) {
    return { ok: false, message: "Ask a question before sending." };
  }

  const apiKey = getOpenAiApiKey();

  if (!apiKey) {
    return { ok: false, message: "OpenAI API key is not configured." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Please sign in before using Ask AI." };
  }

  const { data: profile } = await supabase
    .from("student_onboarding_profiles")
    .select(
      "student_name,country_of_origin,city,institution,course_start_date,monthly_budget,accommodation,part_time,main_concern",
    )
    .eq("user_id", user.id)
    .maybeSingle<StudentOnboardingProfileRow>();

  if (!profile) {
    return { ok: false, message: "Build your student plan before using Ask AI." };
  }

  const recentHistory = history
    .slice(-8)
    .map((message) => `${message.role === "student" ? "Student" : "Assistant"}: ${message.content}`)
    .join("\n\n");

  try {
    const model = process.env.OPENAI_CHAT_MODEL ?? "gpt-4.1-mini";
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        model,
        max_output_tokens: 900,
        input: [
          {
            role: "system",
            content:
              "You are SettleMate AI, a calm student-life assistant for international students in Australia. Use the saved profile context when relevant. Give practical, plain-English next steps. Do not provide legal, financial, migration, rental, employment, medical, or safety advice as a professional. For visa, tenancy, employment rights, emergencies, and official rules, tell the student to verify with official sources or qualified professionals. Keep answers concise and action-oriented.",
          },
          {
            role: "user",
            content: `${profileToPromptContext(profile)}

Recent conversation:
${recentHistory || "No previous messages."}

Student question:
${trimmed}`,
          },
        ],
      }),
    });

    const data = (await response.json()) as OpenAiResponse;

    if (!response.ok) {
      return {
        ok: false,
        message: data.error?.message ?? "OpenAI could not answer right now. Please try again.",
      };
    }

    const answer = extractOutputText(data).trim();

    if (!answer) {
      return { ok: false, message: "OpenAI returned an empty answer. Please try again." };
    }

    return {
      ok: true,
      answer,
      usage: {
        inputTokens: data.usage?.input_tokens ?? 0,
        outputTokens: data.usage?.output_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
        model,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof DOMException && error.name === "TimeoutError"
          ? "OpenAI took too long to respond. Please try a shorter question."
          : "We could not reach OpenAI. Please try again.",
    };
  }
}
