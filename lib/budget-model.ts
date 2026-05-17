import { weeklyToMonthly } from "@/lib/utils";

export type BudgetForm = {
  city: string;
  weeklyRent: string;
  groceries: string;
  transport: string;
  phoneInternet: string;
  eatingOut: string;
  other: string;
  income: string;
};

export type BudgetStatus = "Comfortable" | "Tight but manageable" | "Your budget may feel tight";

export type BudgetResult = {
  monthlyExpenses: number;
  monthlyIncome: number;
  surplus: number;
  rentShare: number;
  status: BudgetStatus;
  recommendation: string;
};

export const initialBudgetForm: BudgetForm = {
  city: "Melbourne",
  weeklyRent: "320",
  groceries: "110",
  transport: "45",
  phoneInternet: "65",
  eatingOut: "60",
  other: "180",
  income: "550",
};

export function toBudgetNumber(value: string) {
  return Number(value) || 0;
}

export function calculateBudget(form: BudgetForm): BudgetResult {
  const monthlyExpenses =
    weeklyToMonthly(toBudgetNumber(form.weeklyRent)) +
    weeklyToMonthly(toBudgetNumber(form.groceries)) +
    weeklyToMonthly(toBudgetNumber(form.transport)) +
    weeklyToMonthly(toBudgetNumber(form.eatingOut)) +
    toBudgetNumber(form.phoneInternet) +
    toBudgetNumber(form.other);
  const monthlyIncome = weeklyToMonthly(toBudgetNumber(form.income));
  const surplus = monthlyIncome - monthlyExpenses;
  const rentShare =
    monthlyExpenses > 0
      ? Math.round((weeklyToMonthly(toBudgetNumber(form.weeklyRent)) / monthlyExpenses) * 100)
      : 0;
  const status: BudgetStatus =
    surplus >= 400 ? "Comfortable" : surplus >= 0 ? "Tight but manageable" : "Your budget may feel tight";

  const recommendation =
    status === "Comfortable"
      ? `Your ${form.city} budget has breathing room. Rent is taking up ${rentShare}% of monthly expenses, so keep housing predictable and save part of the surplus.`
      : status === "Tight but manageable"
        ? `Your rent is taking up ${rentShare}% of your monthly budget. Consider shared accommodation in nearby suburbs or increasing your weekly work target during semester breaks.`
        : `Your budget may feel tight in ${form.city}. Rent is taking up ${rentShare}% of monthly expenses, so recheck housing, reduce flexible spending, and speak with student support if the gap continues.`;

  return {
    monthlyExpenses,
    monthlyIncome,
    surplus,
    rentShare,
    status,
    recommendation,
  };
}
