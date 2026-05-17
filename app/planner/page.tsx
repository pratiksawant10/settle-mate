import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PlannerClient } from "@/components/planner-client";
import { createPageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import type { Concern, PlannerForm } from "@/lib/student-plan";

export const metadata: Metadata = createPageMetadata({
  title: "Student Planner Dashboard",
  description:
    "Private student onboarding and personalised settlement dashboard for international students using SettleMate AI.",
  path: "/planner",
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

function profileToPlannerForm(profile: StudentOnboardingProfileRow): PlannerForm {
  return {
    name: profile.student_name,
    origin: profile.country_of_origin,
    city: profile.city,
    institution: profile.institution,
    startDate: profile.course_start_date,
    monthlyBudget: String(profile.monthly_budget),
    accommodation: profile.accommodation,
    partTime: profile.part_time ? "yes" : "no",
    concern: profile.main_concern as Concern,
  };
}

export default async function PlannerPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/planner");
  }

  const { data: profile } = await supabase
    .from("student_onboarding_profiles")
    .select(
      "student_name,country_of_origin,city,institution,course_start_date,monthly_budget,accommodation,part_time,main_concern",
    )
    .eq("user_id", user.id)
    .maybeSingle<StudentOnboardingProfileRow>();

  return <PlannerClient initialProfile={profile ? profileToPlannerForm(profile) : null} />;
}
