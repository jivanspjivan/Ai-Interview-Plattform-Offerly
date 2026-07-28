create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (char_length(role) between 1 and 120),
  interview_type text not null check (interview_type in ('behavioral', 'technical', 'mixed')),
  experience_level text not null check (experience_level in ('Entry level', 'Mid level', 'Senior', 'Leadership')),
  planned_duration integer not null check (planned_duration in (15, 30, 45)),
  elapsed_seconds integer not null default 0 check (elapsed_seconds >= 0),
  question_count integer not null check (question_count > 0),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.interview_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  question_prompt text not null,
  question_type text not null check (question_type in ('behavioral', 'technical')),
  transcript text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, question_id)
);

create table public.interview_feedback (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid not null unique references public.interview_answers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  overall_score integer not null check (overall_score between 0 and 100),
  summary text not null,
  structure_score integer not null check (structure_score between 0 and 100),
  relevance_score integer not null check (relevance_score between 0 and 100),
  clarity_score integer not null check (clarity_score between 0 and 100),
  evidence_score integer not null check (evidence_score between 0 and 100),
  strengths text[] not null default '{}',
  improvements text[] not null default '{}',
  next_step text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index interview_sessions_user_created_idx
  on public.interview_sessions(user_id, created_at desc);
create index interview_sessions_user_status_idx
  on public.interview_sessions(user_id, status);
create index interview_answers_session_idx
  on public.interview_answers(session_id);
create index interview_feedback_user_idx
  on public.interview_feedback(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger interview_sessions_set_updated_at
before update on public.interview_sessions
for each row execute function public.set_updated_at();

create trigger interview_answers_set_updated_at
before update on public.interview_answers
for each row execute function public.set_updated_at();

create trigger interview_feedback_set_updated_at
before update on public.interview_feedback
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, email, full_name)
select
  id,
  coalesce(email, ''),
  nullif(trim(raw_user_meta_data ->> 'full_name'), '')
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_answers enable row level security;
alter table public.interview_feedback enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles for update
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "sessions_select_own"
on public.interview_sessions for select
using ((select auth.uid()) = user_id);

create policy "sessions_insert_own"
on public.interview_sessions for insert
with check ((select auth.uid()) = user_id);

create policy "sessions_update_own"
on public.interview_sessions for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "sessions_delete_own"
on public.interview_sessions for delete
using ((select auth.uid()) = user_id);

create policy "answers_select_own"
on public.interview_answers for select
using ((select auth.uid()) = user_id);

create policy "answers_insert_own"
on public.interview_answers for insert
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.interview_sessions
    where interview_sessions.id = session_id
      and interview_sessions.user_id = (select auth.uid())
  )
);

create policy "answers_update_own"
on public.interview_answers for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "answers_delete_own"
on public.interview_answers for delete
using ((select auth.uid()) = user_id);

create policy "feedback_select_own"
on public.interview_feedback for select
using ((select auth.uid()) = user_id);

create policy "feedback_insert_own"
on public.interview_feedback for insert
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.interview_answers
    where interview_answers.id = answer_id
      and interview_answers.user_id = (select auth.uid())
  )
);

create policy "feedback_update_own"
on public.interview_feedback for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "feedback_delete_own"
on public.interview_feedback for delete
using ((select auth.uid()) = user_id);
