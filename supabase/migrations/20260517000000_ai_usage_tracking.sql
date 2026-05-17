create extension if not exists pgcrypto;

create table if not exists public.ai_pricing_plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  price_aud numeric(10,2) not null default 0,
  duration_days integer,
  token_allowance integer not null,
  daily_request_limit integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_ai_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_code text not null references public.ai_pricing_plans(code),
  status text not null default 'active',
  token_allowance integer not null,
  tokens_used integer not null default 0,
  tokens_remaining integer generated always as (token_allowance - tokens_used) stored,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_ai_entitlements_status_check
    check (status in ('active', 'expired', 'cancelled', 'exhausted'))
);

create table if not exists public.ai_token_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_id uuid references public.user_ai_entitlements(id) on delete set null,
  request_id text,
  model text not null,
  feature text not null default 'student_ai_chat',
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  total_tokens integer not null default 0,
  estimated_cost_usd numeric(12,6) default 0,
  prompt_preview text,
  response_preview text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_daily_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  request_count integer not null default 0,
  total_tokens integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, usage_date)
);

create index if not exists user_ai_entitlements_user_id_idx
  on public.user_ai_entitlements(user_id);

create index if not exists user_ai_entitlements_status_idx
  on public.user_ai_entitlements(status);

create index if not exists user_ai_entitlements_expires_at_idx
  on public.user_ai_entitlements(expires_at);

create index if not exists user_ai_entitlements_user_status_expires_idx
  on public.user_ai_entitlements(user_id, status, expires_at);

create index if not exists ai_token_usage_logs_user_id_idx
  on public.ai_token_usage_logs(user_id);

create index if not exists ai_token_usage_logs_entitlement_id_idx
  on public.ai_token_usage_logs(entitlement_id);

create index if not exists ai_token_usage_logs_created_at_idx
  on public.ai_token_usage_logs(created_at);

create index if not exists ai_token_usage_logs_user_created_at_idx
  on public.ai_token_usage_logs(user_id, created_at);

create index if not exists ai_daily_usage_user_id_idx
  on public.ai_daily_usage(user_id);

insert into public.ai_pricing_plans (
  code,
  name,
  price_aud,
  duration_days,
  token_allowance,
  daily_request_limit
)
values
  ('free_monthly', 'Free Monthly', 0, 30, 20000, 3),
  ('pack_30_day', '30 Day Student Help Pack', 4.99, 30, 200000, null),
  ('pack_60_day', '60 Day Study Support Pack', 8.99, 60, 450000, null),
  ('pack_90_day', '90 Day Arrival Pack', 12.99, 90, 750000, null)
on conflict (code) do update
set
  name = excluded.name,
  price_aud = excluded.price_aud,
  duration_days = excluded.duration_days,
  token_allowance = excluded.token_allowance,
  daily_request_limit = excluded.daily_request_limit,
  is_active = true;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_ai_entitlements_updated_at on public.user_ai_entitlements;
create trigger set_user_ai_entitlements_updated_at
before update on public.user_ai_entitlements
for each row execute function public.set_updated_at();

drop trigger if exists set_ai_daily_usage_updated_at on public.ai_daily_usage;
create trigger set_ai_daily_usage_updated_at
before update on public.ai_daily_usage
for each row execute function public.set_updated_at();

alter table public.ai_pricing_plans enable row level security;
alter table public.user_ai_entitlements enable row level security;
alter table public.ai_token_usage_logs enable row level security;
alter table public.ai_daily_usage enable row level security;

drop policy if exists "Authenticated users can read active AI pricing plans" on public.ai_pricing_plans;
create policy "Authenticated users can read active AI pricing plans"
on public.ai_pricing_plans
for select
to authenticated
using (is_active = true);

drop policy if exists "Users can read their own AI entitlements" on public.user_ai_entitlements;
create policy "Users can read their own AI entitlements"
on public.user_ai_entitlements
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read their own AI usage logs" on public.ai_token_usage_logs;
create policy "Users can read their own AI usage logs"
on public.ai_token_usage_logs
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read their own daily AI usage" on public.ai_daily_usage;
create policy "Users can read their own daily AI usage"
on public.ai_daily_usage
for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.consume_ai_tokens(
  p_user_id uuid,
  p_entitlement_id uuid,
  p_request_id text,
  p_model text,
  p_feature text,
  p_input_tokens integer,
  p_output_tokens integer,
  p_total_tokens integer,
  p_estimated_cost_usd numeric,
  p_prompt_preview text,
  p_response_preview text
)
returns table (
  updated_tokens_used integer,
  updated_tokens_remaining integer,
  updated_entitlement_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entitlement public.user_ai_entitlements%rowtype;
  v_total_tokens integer;
  v_tokens_used integer;
  v_tokens_remaining integer;
  v_status text;
begin
  v_total_tokens := coalesce(nullif(p_total_tokens, 0), coalesce(p_input_tokens, 0) + coalesce(p_output_tokens, 0));

  if coalesce(p_input_tokens, 0) < 0
    or coalesce(p_output_tokens, 0) < 0
    or v_total_tokens < 0 then
    raise exception 'Token counts cannot be negative';
  end if;

  select *
  into v_entitlement
  from public.user_ai_entitlements
  where id = p_entitlement_id
    and user_id = p_user_id
  for update;

  if not found then
    raise exception 'AI entitlement not found for user';
  end if;

  insert into public.ai_token_usage_logs (
    user_id,
    entitlement_id,
    request_id,
    model,
    feature,
    input_tokens,
    output_tokens,
    total_tokens,
    estimated_cost_usd,
    prompt_preview,
    response_preview
  )
  values (
    p_user_id,
    p_entitlement_id,
    p_request_id,
    p_model,
    coalesce(nullif(p_feature, ''), 'student_ai_chat'),
    coalesce(p_input_tokens, 0),
    coalesce(p_output_tokens, 0),
    v_total_tokens,
    coalesce(p_estimated_cost_usd, 0),
    left(coalesce(p_prompt_preview, ''), 500),
    left(coalesce(p_response_preview, ''), 500)
  );

  update public.user_ai_entitlements
  set
    tokens_used = tokens_used + v_total_tokens,
    status = case
      when tokens_used + v_total_tokens >= token_allowance then 'exhausted'
      else status
    end,
    updated_at = now()
  where id = p_entitlement_id
  returning tokens_used, tokens_remaining, status
  into v_tokens_used, v_tokens_remaining, v_status;

  insert into public.ai_daily_usage (
    user_id,
    usage_date,
    request_count,
    total_tokens
  )
  values (
    p_user_id,
    current_date,
    1,
    v_total_tokens
  )
  on conflict (user_id, usage_date)
  do update
  set
    request_count = public.ai_daily_usage.request_count + 1,
    total_tokens = public.ai_daily_usage.total_tokens + excluded.total_tokens,
    updated_at = now();

  return query select v_tokens_used, v_tokens_remaining, v_status;
end;
$$;

revoke all on function public.consume_ai_tokens(
  uuid,
  uuid,
  text,
  text,
  text,
  integer,
  integer,
  integer,
  numeric,
  text,
  text
) from public;

grant execute on function public.consume_ai_tokens(
  uuid,
  uuid,
  text,
  text,
  text,
  integer,
  integer,
  integer,
  numeric,
  text,
  text
) to service_role;
