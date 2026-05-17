import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type AiTokenUsageLogRow = {
  user_id: string;
  model: string;
  total_tokens: number;
  estimated_cost_usd: number | string | null;
  created_at: string;
};

export type AiUsageReport = {
  generatedAt: string;
  totalTokensToday: number;
  totalTokensThisMonth: number;
  estimatedMonthlyOpenAiCostUsd: number;
  usageByModel: Array<{
    model: string;
    totalTokens: number;
    estimatedCostUsd: number;
  }>;
  usageByUser: Array<{
    userId: string;
    totalTokens: number;
    estimatedCostUsd: number;
  }>;
  topUsersByTokenUsage: Array<{
    userId: string;
    totalTokens: number;
    estimatedCostUsd: number;
  }>;
};

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  return Number(value ?? 0);
}

function addAggregate<T extends { totalTokens: number; estimatedCostUsd: number }>(
  map: Map<string, T>,
  key: string,
  initialValue: T,
  tokens: number,
  cost: number,
) {
  const current = map.get(key) ?? initialValue;
  current.totalTokens += tokens;
  current.estimatedCostUsd = Number((current.estimatedCostUsd + cost).toFixed(6));
  map.set(key, current);
}

export async function getAiUsageReport(): Promise<AiUsageReport> {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("ai_token_usage_logs")
    .select("user_id,model,total_tokens,estimated_cost_usd,created_at")
    .gte("created_at", startOfMonth.toISOString());

  if (error) {
    throw new Error(`Could not build AI usage report: ${error.message}`);
  }

  const logs = (data ?? []) as AiTokenUsageLogRow[];
  const usageByModel = new Map<string, { model: string; totalTokens: number; estimatedCostUsd: number }>();
  const usageByUser = new Map<string, { userId: string; totalTokens: number; estimatedCostUsd: number }>();

  let totalTokensToday = 0;
  let totalTokensThisMonth = 0;
  let estimatedMonthlyOpenAiCostUsd = 0;

  for (const log of logs) {
    const tokens = log.total_tokens;
    const cost = toNumber(log.estimated_cost_usd);
    totalTokensThisMonth += tokens;
    estimatedMonthlyOpenAiCostUsd += cost;

    if (new Date(log.created_at) >= startOfToday) {
      totalTokensToday += tokens;
    }

    addAggregate(
      usageByModel,
      log.model,
      { model: log.model, totalTokens: 0, estimatedCostUsd: 0 },
      tokens,
      cost,
    );
    addAggregate(
      usageByUser,
      log.user_id,
      { userId: log.user_id, totalTokens: 0, estimatedCostUsd: 0 },
      tokens,
      cost,
    );
  }

  const users = Array.from(usageByUser.values()).sort((a, b) => b.totalTokens - a.totalTokens);

  return {
    generatedAt: now.toISOString(),
    totalTokensToday,
    totalTokensThisMonth,
    estimatedMonthlyOpenAiCostUsd: Number(estimatedMonthlyOpenAiCostUsd.toFixed(6)),
    usageByModel: Array.from(usageByModel.values()).sort((a, b) => b.totalTokens - a.totalTokens),
    usageByUser: users,
    topUsersByTokenUsage: users.slice(0, 20),
  };
}
