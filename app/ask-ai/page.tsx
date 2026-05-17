import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AskAiClient } from "@/components/ask-ai-client";
import { createPageMetadata } from "@/lib/seo";
import { getAiUsageSummary, type AiUsageSummary } from "@/lib/services/ai-usage-service";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = createPageMetadata({
  title: "Ask SettleMate AI",
  description:
    "Private AI chat for authenticated international students with saved onboarding context and settlement planning support.",
  path: "/ask-ai",
  noIndex: true,
});

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${value}T00:00:00`),
  );
}

function mapProfile(profile: StudentOnboardingProfileRow) {
  return {
    student: `${profile.student_name} from ${profile.country_of_origin}`,
    city: profile.city,
    institution: profile.institution,
    courseStart: formatDate(profile.course_start_date),
    monthlyBudget: `AUD ${profile.monthly_budget}`,
    accommodation: profile.accommodation,
    partTime: profile.part_time ? "Plans to work" : "Study-first plan",
    mainConcern: profile.main_concern,
  };
}

export default async function AskAiPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/ask-ai");
  }

  const { data: profile } = await supabase
    .from("student_onboarding_profiles")
    .select(
      "student_name,country_of_origin,city,institution,course_start_date,monthly_budget,accommodation,part_time,main_concern",
    )
    .eq("user_id", user.id)
    .maybeSingle<StudentOnboardingProfileRow>();

  if (!profile) {
    redirect("/planner");
  }

  let usageSummary: AiUsageSummary | null = null;
  let usageError: string | null = null;

  try {
    usageSummary = await getAiUsageSummary(user.id);
  } catch (error) {
    usageError =
      error instanceof Error && error.message.includes("SUPABASE_SERVICE_ROLE_KEY")
        ? "AI usage tracking needs SUPABASE_SERVICE_ROLE_KEY."
        : "AI usage tracking is not available right now.";
  }

  return <AskAiClient profile={mapProfile(profile)} usageSummary={usageSummary} usageError={usageError} />;
}
