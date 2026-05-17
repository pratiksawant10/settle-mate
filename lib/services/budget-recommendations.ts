import "server-only";

import type { BudgetForm, BudgetResult } from "@/lib/budget-model";
import { formatCurrency } from "@/lib/utils";

export type BudgetAiRecommendation = {
  headline: string;
  summary: string;
  marketContext: string[];
  recommendedActions: string[];
  riskFlags: string[];
  sources: string[];
};

type OpenAiBudgetResponse = BudgetAiRecommendation;

type OpenAiResponse = {
  output_text?: string;
  output?: Array<{
    action?: {
      sources?: Array<{
        url?: string;
      }>;
    };
    content?: Array<{
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

const budgetRecommendationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "summary", "marketContext", "recommendedActions", "riskFlags", "sources"],
  properties: {
    headline: { type: "string" },
    summary: { type: "string" },
    marketContext: {
      type: "array",
      items: { type: "string" },
    },
    recommendedActions: {
      type: "array",
      items: { type: "string" },
    },
    riskFlags: {
      type: "array",
      items: { type: "string" },
    },
    sources: {
      type: "array",
      items: { type: "string" },
    },
  },
};

export const BUDGET_RECOMMENDATION_SYSTEM_PROMPT = `You are SettleMate AI's Australian student budget analyst.
Return only JSON matching the schema.
Use the web search tool to include current, city-specific market context for Australian international students.
Base the recommendation primarily on the provided budget model values and calculated result.
Use AUD, monthly numbers, and plain English.
Mention current market trends only when supported by recent public sources such as official transport pages, university cost-of-living pages, government pages, or reputable rental/cost guides.
Do not invent rent figures, job income guarantees, visa/work-rights rules, or financial advice.
Do not tell the student they can safely rely on part-time work to cover essentials.
If the budget has a shortfall, prioritise rent, food, transport, and student support services before lifestyle spending.
For visa, tax, employment rights, tenancy, welfare, or hardship issues, tell the student to verify with official sources or qualified support.`;

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

function extractSearchSources(response: OpenAiResponse) {
  return (
    response.output
      ?.flatMap((item) => item.action?.sources ?? [])
      .map((source) => source.url)
      .filter((url): url is string => Boolean(url)) ?? []
  );
}

function normalizeRecommendation(response: OpenAiBudgetResponse, webSearchSources: string[]): BudgetAiRecommendation {
  return {
    headline: response.headline.trim(),
    summary: response.summary.trim(),
    marketContext: response.marketContext.filter(Boolean).slice(0, 4),
    recommendedActions: response.recommendedActions.filter(Boolean).slice(0, 5),
    riskFlags: response.riskFlags.filter(Boolean).slice(0, 4),
    sources: Array.from(new Set([...response.sources.filter(Boolean), ...webSearchSources])).slice(0, 6),
  };
}

function fallbackRecommendation(form: BudgetForm, result: BudgetResult): BudgetAiRecommendation {
  return {
    headline: `${form.city} budget snapshot`,
    summary: result.recommendation,
    marketContext: [
      "Current market data could not be fetched, so this recommendation uses only your entered budget values.",
    ],
    recommendedActions: [
      "Keep rent and bills separate from daily spending.",
      "Review the budget again after your first rent payment.",
      "Add one small emergency buffer before lifestyle spending.",
    ],
    riskFlags:
      result.surplus < 0
        ? ["Your estimated monthly expenses are higher than your expected income."]
        : result.rentShare >= 45
          ? ["Rent is taking a high share of monthly expenses."]
          : [],
    sources: [],
  };
}

function buildBudgetPrompt(form: BudgetForm, result: BudgetResult) {
  return `City: ${form.city}

Student-entered weekly values:
- Weekly rent: AUD ${form.weeklyRent}
- Groceries per week: AUD ${form.groceries}
- Transport per week: AUD ${form.transport}
- Eating out per week: AUD ${form.eatingOut}
- Expected part-time income per week: AUD ${form.income}

Student-entered monthly values:
- Phone/internet per month: AUD ${form.phoneInternet}
- Other expenses per month: AUD ${form.other}

Calculated budget result:
- Monthly expenses: ${formatCurrency(result.monthlyExpenses)}
- Monthly income: ${formatCurrency(result.monthlyIncome)}
- Monthly surplus or shortfall: ${formatCurrency(result.surplus)}
- Rent share of expenses: ${result.rentShare}%
- Status: ${result.status}

Tasks:
1. Generate a concise student-friendly budget recommendation for this city.
2. Use current market context for rent pressure, transport costs, groceries, and casual job conditions where useful.
3. Explain whether the model looks comfortable, tight, or risky based on the calculated values.
4. Give practical actions the student can take this month.
5. Include warnings when rent share, shortfall, or reliance on casual work creates risk.
6. Include source URLs used for current market context.`;
}

export async function requestBudgetRecommendation(
  form: BudgetForm,
  result: BudgetResult,
): Promise<BudgetAiRecommendation> {
  const apiKey = getOpenAiApiKey();
  const model = process.env.OPENAI_BUDGET_MODEL ?? "gpt-4.1-mini";

  if (!apiKey) {
    return fallbackRecommendation(form, result);
  }

  const requestBody: Record<string, unknown> = {
    model,
    tools: [
      {
        type: "web_search",
        user_location: {
          type: "approximate",
          country: "AU",
          city: form.city,
          timezone: "Australia/Melbourne",
        },
      },
    ],
    tool_choice: "auto",
    include: ["web_search_call.action.sources"],
    max_output_tokens: 1300,
    text: {
      format: {
        type: "json_schema",
        name: "student_budget_recommendation",
        strict: true,
        schema: budgetRecommendationSchema,
      },
    },
    input: [
      {
        role: "system",
        content: BUDGET_RECOMMENDATION_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildBudgetPrompt(form, result),
      },
    ],
  };

  if (model.startsWith("gpt-5") || /^o\d/.test(model)) {
    requestBody.reasoning = { effort: "low" };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(18000),
      body: JSON.stringify(requestBody),
    });

    const data = (await response.json()) as OpenAiResponse;

    if (!response.ok) {
      return fallbackRecommendation(form, result);
    }

    const outputText = extractOutputText(data);
    const webSearchSources = extractSearchSources(data);

    if (!outputText) {
      return fallbackRecommendation(form, result);
    }

    return normalizeRecommendation(JSON.parse(outputText) as OpenAiBudgetResponse, webSearchSources);
  } catch {
    return fallbackRecommendation(form, result);
  }
}
