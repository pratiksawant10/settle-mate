"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requestSuburbRecommendations } from "@/lib/services/suburb-recommendations";
import type { PlannerForm, SuburbRecommendationResult } from "@/lib/student-plan";

type SaveStudentOnboardingResult =
  | { ok: true; savedAt: string }
  | { ok: false; message: string };

export async function saveStudentOnboarding(form: PlannerForm): Promise<SaveStudentOnboardingResult> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, message: "Please sign in again before saving your student plan." };
  }

  const monthlyBudget = Number(form.monthlyBudget);

  if (
    !form.name.trim() ||
    !form.origin.trim() ||
    !form.city ||
    !form.institution.trim() ||
    !form.startDate ||
    !Number.isFinite(monthlyBudget) ||
    monthlyBudget < 0
  ) {
    return { ok: false, message: "Please complete all onboarding fields before starting the dashboard." };
  }

  const savedAt = new Date().toISOString();
  const { error } = await supabase.from("student_onboarding_profiles").upsert(
    {
      user_id: user.id,
      student_name: form.name.trim(),
      country_of_origin: form.origin.trim(),
      city: form.city,
      institution: form.institution.trim(),
      course_start_date: form.startDate,
      monthly_budget: monthlyBudget,
      accommodation: form.accommodation,
      part_time: form.partTime === "yes",
      main_concern: form.concern,
      updated_at: savedAt,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/planner");

  return { ok: true, savedAt };
}

export async function recommendSuburbsForPlan(form: PlannerForm): Promise<SuburbRecommendationResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      institutionName: form.institution,
      message: "Please sign in again before generating suburb recommendations.",
      recommendations: [],
      sources: [],
    };
  }

  try {
    return await requestSuburbRecommendations(form.city, form.institution);
  } catch (error) {
    return {
      status: "error",
      institutionName: form.institution,
      message:
        error instanceof DOMException && error.name === "TimeoutError"
          ? "Suburb recommendations took too long. You can keep using the dashboard and try again from Housing."
          : "We could not generate suburb recommendations. Please try again from Housing.",
      recommendations: [],
      sources: [],
    };
  }
}
