import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export const FREE_PLAN_CODE = "free_monthly";
export const AI_FEATURE_STUDENT_CHAT = "student_ai_chat";
export const FREE_MAX_PROMPT_CHARS = 1200;
export const FREE_MAX_OUTPUT_TOKENS = 500;
export const PAID_MAX_OUTPUT_TOKENS = 900;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

type AiPricingPlanRow = {
  code: string;
  name: string;
  price_aud: number | string;
  duration_days: number | null;
  token_allowance: number;
  daily_request_limit: number | null;
  is_active: boolean;
  created_at: string;
};

type UserAiEntitlementRow = {
  id: string;
  user_id: string;
  plan_code: string;
  status: AiEntitlementStatus;
  token_allowance: number;
  tokens_used: number;
  tokens_remaining?: number | null;
  starts_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  ai_pricing_plans?: AiPricingPlanRow | AiPricingPlanRow[] | null;
};

type DailyUsageRow = {
  usage_date: string;
  request_count: number;
  total_tokens: number;
};

export type AiEntitlementStatus = "active" | "expired" | "cancelled" | "exhausted";

export type AiPricingPlan = {
  code: string;
  name: string;
  priceAud: number;
  durationDays: number | null;
  tokenAllowance: number;
  dailyRequestLimit: number | null;
  isActive: boolean;
};

export type AiEntitlement = {
  id: string;
  userId: string;
  planCode: string;
  status: AiEntitlementStatus;
  tokenAllowance: number;
  tokensUsed: number;
  tokensRemaining: number;
  startsAt: string;
  expiresAt: string;
  plan: AiPricingPlan | null;
};

export type AiDailyUsage = {
  usageDate: string;
  requestCount: number;
  totalTokens: number;
};

export type AiUsageSummary = {
  entitlement: AiEntitlement;
  dailyUsage: AiDailyUsage;
  dailyRequestLimit: number | null;
  isFreePlan: boolean;
  usagePercent: number;
  upgradeRecommended: boolean;
  pricingPlans: AiPricingPlan[];
};

export type EnsureUserCanSendMessageResult =
  | {
      allowed: true;
      entitlement: AiEntitlement;
      dailyUsage: AiDailyUsage;
      recommendedPlans: AiPricingPlan[];
    }
  | {
      allowed: false;
      reason: "daily_limit_reached" | "token_limit_reached" | "prompt_too_long" | "rate_limited";
      message: string;
      tokensRemaining: number;
      upgradeRequired: boolean;
      entitlement: AiEntitlement;
      dailyUsage: AiDailyUsage;
      recommendedPlans: AiPricingPlan[];
      retryAfterSeconds?: number;
    };

export type RecordTokenUsageParams = {
  userId: string;
  entitlementId: string;
  model: string;
  feature?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  promptPreview: string;
  responsePreview: string;
  requestId?: string | null;
};

export type PurchasePackResult = {
  ok: boolean;
  message: string;
  plan?: AiPricingPlan;
};

const ENTITLEMENT_SELECT = `
  id,
  user_id,
  plan_code,
  status,
  token_allowance,
  tokens_used,
  tokens_remaining,
  starts_at,
  expires_at,
  created_at,
  updated_at,
  ai_pricing_plans (
    code,
    name,
    price_aud,
    duration_days,
    token_allowance,
    daily_request_limit,
    is_active,
    created_at
  )
`;

const rateLimitAttempts = new Map<string, number[]>();

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  return Number(value ?? 0);
}

function mapPlan(row: AiPricingPlanRow): AiPricingPlan {
  return {
    code: row.code,
    name: row.name,
    priceAud: toNumber(row.price_aud),
    durationDays: row.duration_days,
    tokenAllowance: row.token_allowance,
    dailyRequestLimit: row.daily_request_limit,
    isActive: row.is_active,
  };
}

function getJoinedPlan(row: UserAiEntitlementRow) {
  if (Array.isArray(row.ai_pricing_plans)) {
    return row.ai_pricing_plans[0] ?? null;
  }

  return row.ai_pricing_plans ?? null;
}

function mapEntitlement(row: UserAiEntitlementRow, planOverride?: AiPricingPlan | null): AiEntitlement {
  const plan = planOverride ?? (getJoinedPlan(row) ? mapPlan(getJoinedPlan(row) as AiPricingPlanRow) : null);
  const tokensRemaining = row.tokens_remaining ?? row.token_allowance - row.tokens_used;

  return {
    id: row.id,
    userId: row.user_id,
    planCode: row.plan_code,
    status: row.status,
    tokenAllowance: row.token_allowance,
    tokensUsed: row.tokens_used,
    tokensRemaining,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    plan,
  };
}

function getCurrentMonthWindow(now = new Date()) {
  const startsAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const expiresAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  return {
    startsAt: startsAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function consumeRateLimit(userId: string) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const attempts = (rateLimitAttempts.get(userId) ?? []).filter((timestamp) => timestamp > windowStart);

  if (attempts.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitAttempts.set(userId, attempts);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((attempts[0] + RATE_LIMIT_WINDOW_MS - now) / 1000)),
    };
  }

  attempts.push(now);
  rateLimitAttempts.set(userId, attempts);
  return { allowed: true };
}

export async function getPricingPlans() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("ai_pricing_plans")
    .select("code,name,price_aud,duration_days,token_allowance,daily_request_limit,is_active,created_at")
    .eq("is_active", true)
    .order("price_aud", { ascending: true });

  if (error) {
    throw new Error(`Could not fetch AI pricing plans: ${error.message}`);
  }

  return ((data ?? []) as AiPricingPlanRow[]).map(mapPlan);
}

async function getPricingPlanByCode(code: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("ai_pricing_plans")
    .select("code,name,price_aud,duration_days,token_allowance,daily_request_limit,is_active,created_at")
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle<AiPricingPlanRow>();

  if (error) {
    throw new Error(`Could not fetch AI pricing plan ${code}: ${error.message}`);
  }

  return data ? mapPlan(data) : null;
}

async function getCurrentMonthFreeEntitlement(userId: string) {
  const supabase = createAdminClient();
  const freePlan = await getPricingPlanByCode(FREE_PLAN_CODE);

  if (!freePlan) {
    throw new Error("Free monthly AI plan is not configured.");
  }

  const monthWindow = getCurrentMonthWindow();
  const { data: existingRows, error: existingError } = await supabase
    .from("user_ai_entitlements")
    .select(ENTITLEMENT_SELECT)
    .eq("user_id", userId)
    .eq("plan_code", FREE_PLAN_CODE)
    .gte("starts_at", monthWindow.startsAt)
    .lt("starts_at", monthWindow.expiresAt)
    .order("created_at", { ascending: false })
    .limit(1);

  if (existingError) {
    throw new Error(`Could not fetch free AI entitlement: ${existingError.message}`);
  }

  const existing = ((existingRows ?? []) as UserAiEntitlementRow[])[0];

  if (existing) {
    if (existing.tokens_used >= existing.token_allowance && existing.status !== "exhausted") {
      const { data, error } = await supabase
        .from("user_ai_entitlements")
        .update({ status: "exhausted" })
        .eq("id", existing.id)
        .select(ENTITLEMENT_SELECT)
        .single<UserAiEntitlementRow>();

      if (error) {
        throw new Error(`Could not mark free AI entitlement exhausted: ${error.message}`);
      }

      return mapEntitlement(data, freePlan);
    }

    if (existing.status !== "active" && existing.status !== "exhausted") {
      const { data, error } = await supabase
        .from("user_ai_entitlements")
        .update({
          status: "active",
          token_allowance: freePlan.tokenAllowance,
          expires_at: monthWindow.expiresAt,
        })
        .eq("id", existing.id)
        .select(ENTITLEMENT_SELECT)
        .single<UserAiEntitlementRow>();

      if (error) {
        throw new Error(`Could not reset free AI entitlement: ${error.message}`);
      }

      return mapEntitlement(data, freePlan);
    }

    return mapEntitlement(existing, freePlan);
  }

  const { data, error } = await supabase
    .from("user_ai_entitlements")
    .insert({
      user_id: userId,
      plan_code: FREE_PLAN_CODE,
      status: "active",
      token_allowance: freePlan.tokenAllowance,
      tokens_used: 0,
      starts_at: monthWindow.startsAt,
      expires_at: monthWindow.expiresAt,
    })
    .select(ENTITLEMENT_SELECT)
    .single<UserAiEntitlementRow>();

  if (error) {
    throw new Error(`Could not create free AI entitlement: ${error.message}`);
  }

  return mapEntitlement(data, freePlan);
}

export async function getActiveEntitlement(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("user_ai_entitlements")
    .select(ENTITLEMENT_SELECT)
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: true });

  if (error) {
    throw new Error(`Could not fetch active AI entitlement: ${error.message}`);
  }

  const activeEntitlement = ((data ?? []) as UserAiEntitlementRow[]).find(
    (entitlement) => entitlement.tokens_used < entitlement.token_allowance,
  );

  if (activeEntitlement) {
    return mapEntitlement(activeEntitlement);
  }

  return getCurrentMonthFreeEntitlement(userId);
}

export async function getDailyUsage(userId: string) {
  const supabase = createAdminClient();
  const usageDate = getTodayDate();
  const { data, error } = await supabase
    .from("ai_daily_usage")
    .select("usage_date,request_count,total_tokens")
    .eq("user_id", userId)
    .eq("usage_date", usageDate)
    .maybeSingle<DailyUsageRow>();

  if (error) {
    throw new Error(`Could not fetch daily AI usage: ${error.message}`);
  }

  return {
    usageDate,
    requestCount: data?.request_count ?? 0,
    totalTokens: data?.total_tokens ?? 0,
  };
}

export async function getAiUsageSummary(userId: string): Promise<AiUsageSummary> {
  const entitlement = await getActiveEntitlement(userId);
  const [dailyUsage, pricingPlans] = await Promise.all([getDailyUsage(userId), getPricingPlans()]);
  const isFreePlan = entitlement.planCode === FREE_PLAN_CODE;
  const dailyRequestLimit = entitlement.plan?.dailyRequestLimit ?? null;
  const usagePercent =
    entitlement.tokenAllowance > 0
      ? Math.min(100, Math.round((entitlement.tokensUsed / entitlement.tokenAllowance) * 100))
      : 0;
  const remainingPercent =
    entitlement.tokenAllowance > 0
      ? Math.max(0, entitlement.tokensRemaining) / entitlement.tokenAllowance
      : 0;

  return {
    entitlement,
    dailyUsage,
    dailyRequestLimit,
    isFreePlan,
    usagePercent,
    upgradeRecommended: isFreePlan || entitlement.status === "exhausted" || remainingPercent < 0.2,
    pricingPlans,
  };
}

export async function ensureUserCanSendMessage(
  userId: string,
  options: { estimatedTokensRequired?: number; promptLength?: number } = {},
): Promise<EnsureUserCanSendMessageResult> {
  const entitlement = await getActiveEntitlement(userId);
  const dailyUsage = await getDailyUsage(userId);
  const recommendedPlans = (await getPricingPlans()).filter((plan) => plan.priceAud > 0);
  const tokensRemaining = Math.max(0, entitlement.tokensRemaining);
  const isFreePlan = entitlement.planCode === FREE_PLAN_CODE;

  const rateLimit = consumeRateLimit(userId);
  if (!rateLimit.allowed) {
    return {
      allowed: false,
      reason: "rate_limited",
      message: "You are sending messages too quickly. Please wait a moment before trying again.",
      tokensRemaining,
      upgradeRequired: false,
      entitlement,
      dailyUsage,
      recommendedPlans,
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    };
  }

  if (isFreePlan && options.promptLength && options.promptLength > FREE_MAX_PROMPT_CHARS) {
    return {
      allowed: false,
      reason: "prompt_too_long",
      message: `Free AI questions are limited to ${FREE_MAX_PROMPT_CHARS.toLocaleString()} characters. Shorten the question or upgrade to a paid pack.`,
      tokensRemaining,
      upgradeRequired: true,
      entitlement,
      dailyUsage,
      recommendedPlans,
    };
  }

  if (entitlement.status === "exhausted" || tokensRemaining <= 0) {
    return {
      allowed: false,
      reason: "token_limit_reached",
      message: "You have used your AI token allowance. Upgrade to a paid pack to keep using Ask AI.",
      tokensRemaining,
      upgradeRequired: true,
      entitlement,
      dailyUsage,
      recommendedPlans,
    };
  }

  if (options.estimatedTokensRequired && tokensRemaining < options.estimatedTokensRequired) {
    return {
      allowed: false,
      reason: "token_limit_reached",
      message: "Your remaining token balance is too low for this request. Upgrade to a paid pack to continue.",
      tokensRemaining,
      upgradeRequired: true,
      entitlement,
      dailyUsage,
      recommendedPlans,
    };
  }

  if (
    isFreePlan &&
    entitlement.plan?.dailyRequestLimit &&
    dailyUsage.requestCount >= entitlement.plan.dailyRequestLimit
  ) {
    return {
      allowed: false,
      reason: "daily_limit_reached",
      message: "You have used today's 3 free Ask AI requests. Upgrade to a paid pack or try again tomorrow.",
      tokensRemaining,
      upgradeRequired: true,
      entitlement,
      dailyUsage,
      recommendedPlans,
    };
  }

  return {
    allowed: true,
    entitlement,
    dailyUsage,
    recommendedPlans,
  };
}

export async function recordTokenUsage(params: RecordTokenUsageParams) {
  const supabase = createAdminClient();
  const { error } = await supabase.rpc("consume_ai_tokens", {
    p_user_id: params.userId,
    p_entitlement_id: params.entitlementId,
    p_request_id: params.requestId ?? null,
    p_model: params.model,
    p_feature: params.feature ?? AI_FEATURE_STUDENT_CHAT,
    p_input_tokens: params.inputTokens,
    p_output_tokens: params.outputTokens,
    p_total_tokens: params.totalTokens,
    p_estimated_cost_usd: params.estimatedCostUsd,
    p_prompt_preview: params.promptPreview,
    p_response_preview: params.responsePreview,
  });

  if (error) {
    throw new Error(`Could not record AI token usage: ${error.message}`);
  }

  return getAiUsageSummary(params.userId);
}

export async function purchasePack(planCode: string): Promise<PurchasePackResult> {
  const plan = await getPricingPlanByCode(planCode);

  if (!plan || plan.priceAud <= 0) {
    return {
      ok: false,
      message: "Select a paid AI pack.",
    };
  }

  return {
    ok: false,
    message: "Payment checkout is not connected yet. Stripe integration can create this entitlement after payment.",
    plan,
  };
}
