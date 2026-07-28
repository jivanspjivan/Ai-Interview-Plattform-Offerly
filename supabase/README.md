# Supabase database setup

Apply migrations in filename order with the Supabase CLI:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Alternatively, paste each migration into the Supabase SQL editor.

The initial migration creates profiles, interview sessions, answers, feedback,
indexes, timestamp triggers, automatic profile creation, and owner-only Row
Level Security policies. The second migration adds subscriptions and idempotent
billing-event storage. Subscription writes remain service-role-only.
