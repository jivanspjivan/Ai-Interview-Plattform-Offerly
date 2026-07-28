create table public.api_rate_limits (
  identifier text not null,
  action text not null,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1 check (request_count > 0),
  primary key (identifier, action)
);

alter table public.api_rate_limits enable row level security;

create or replace function public.consume_rate_limit(
  p_identifier text,
  p_action text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_row public.api_rate_limits%rowtype;
begin
  if
    char_length(p_identifier) < 1
    or char_length(p_identifier) > 128
    or char_length(p_action) < 1
    or char_length(p_action) > 80
    or p_limit < 1
    or p_window_seconds < 1
  then
    raise exception 'Invalid rate limit configuration';
  end if;

  insert into public.api_rate_limits (
    identifier,
    action,
    window_started_at,
    request_count
  )
  values (p_identifier, p_action, now(), 1)
  on conflict (identifier, action) do update
  set
    window_started_at = case
      when public.api_rate_limits.window_started_at
        <= now() - make_interval(secs => p_window_seconds)
      then now()
      else public.api_rate_limits.window_started_at
    end,
    request_count = case
      when public.api_rate_limits.window_started_at
        <= now() - make_interval(secs => p_window_seconds)
      then 1
      else public.api_rate_limits.request_count + 1
    end
  returning * into current_row;

  return query select
    current_row.request_count <= p_limit,
    greatest(0, p_limit - current_row.request_count),
    current_row.window_started_at + make_interval(secs => p_window_seconds);
end;
$$;

revoke all on table public.api_rate_limits from public, anon, authenticated;
revoke execute on function public.consume_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer)
  to service_role;

comment on table public.api_rate_limits is
  'Server-only fixed-window counters used to protect Offerly API routes.';
