alter table public.profiles
  add column is_suspended boolean not null default false;

alter table public.interview_sessions
  add column current_question integer not null default 0 check (current_question >= 0),
  add column paused_at timestamptz;

create table public.billing_activity (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  payment_id text,
  amount integer,
  currency text,
  created_at timestamptz not null default now()
);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.operational_events (
  id uuid primary key default gen_random_uuid(),
  severity text not null check (severity in ('info', 'warn', 'error')),
  event_key text not null,
  trace_id text not null,
  source_file text not null,
  source_function text not null,
  message text not null check (char_length(message) <= 500),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  recipient text not null,
  template text not null,
  subject text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed')),
  attempts integer not null default 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index billing_activity_user_created_idx
  on public.billing_activity(user_id, created_at desc);
create index admin_audit_created_idx
  on public.admin_audit_logs(created_at desc);
create index operational_events_created_idx
  on public.operational_events(created_at desc);
create index operational_events_key_idx
  on public.operational_events(event_key, severity);
create index email_outbox_status_idx
  on public.email_outbox(status, created_at);

alter table public.billing_activity enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.operational_events enable row level security;
alter table public.email_outbox enable row level security;

create policy "billing_activity_select_own"
on public.billing_activity for select
using ((select auth.uid()) = user_id);

-- Writes and administrative reads for operational tables use service_role only.
