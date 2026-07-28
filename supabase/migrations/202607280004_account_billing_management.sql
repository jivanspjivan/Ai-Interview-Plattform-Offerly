alter table public.subscriptions
  add column scheduled_plan_tier text
    check (scheduled_plan_tier in ('premium', 'premium_plus')),
  add column scheduled_change_at timestamptz;

comment on column public.subscriptions.scheduled_plan_tier is
  'Paid plan requested through Razorpay but not yet effective.';

create or replace function public.handle_user_identity_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set
    email = coalesce(new.email, email),
    full_name = coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      full_name
    )
  where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_identity_updated
after update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_user_identity_update();
