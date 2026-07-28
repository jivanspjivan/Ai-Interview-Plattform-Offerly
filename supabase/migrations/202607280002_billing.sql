create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan_tier text not null default 'basic' check (plan_tier in ('basic', 'premium', 'premium_plus')),
  status text not null default 'inactive' check (
    status in ('inactive', 'created', 'authenticated', 'active', 'pending', 'halted', 'cancelled', 'completed', 'expired')
  ),
  razorpay_subscription_id text unique,
  razorpay_plan_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  last_event_at timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.billing_events (
  event_id text primary key,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);

create index subscriptions_status_idx on public.subscriptions(status);
create index subscriptions_razorpay_idx
  on public.subscriptions(razorpay_subscription_id);

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;
alter table public.billing_events enable row level security;

create policy "subscriptions_select_own"
on public.subscriptions for select
using ((select auth.uid()) = user_id);

-- Subscription writes are intentionally server-only. Authenticated users can
-- read their row; verified checkout callbacks and webhooks use the service key.
