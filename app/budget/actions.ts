"use server";

import { calculateBudget, type BudgetForm, type BudgetResult } from "@/lib/budget-model";
import {
  requestBudgetRecommendation,
  type BudgetAiRecommendation,
} from "@/lib/services/budget-recommendations";

export type GenerateBudgetRecommendationResult =
  | {
      ok: true;
      budget: BudgetResult;
      recommendation: BudgetAiRecommendation;
    }
  | {
      ok: false;
      budget: BudgetResult;
      message: string;
    };

export async function generateBudgetRecommendation(
  form: BudgetForm,
): Promise<GenerateBudgetRecommendationResult> {
  const budget = calculateBudget(form);

  try {
    const recommendation = await requestBudgetRecommendation(form, budget);

    return {
      ok: true,
      budget,
      recommendation,
    };
  } catch {
    return {
      ok: false,
      budget,
      message: "We could not generate an AI budget recommendation. The budget totals were still calculated.",
    };
  }
}
