# AI Interview Coach

AI Interview Coach (product name: **Offerly**) is a web application for
practicing role-specific interview questions and receiving actionable feedback.

The project is being built in small, focused features. Each feature is documented
here so the repository history remains easy to follow and useful for learning.

## Current features

### Polished responsive product experience

The public experience now includes a refined responsive homepage, sticky
navigation across the main routes, and a compact three-column footer with
practice, account, and social destinations. The homepage uses accessible,
reduced-motion-aware interactions for its hero coaching preview, testimonial
gallery, company showcase, and step-by-step practice flow.

The animated coaching preview demonstrates a live answer waveform, timer,
progressive feedback, and a score count-up. Illustrative reviews reveal as they
enter the viewport and can be filtered by role area. A two-row company showcase
presents 35 illustrative preparation targets across product, enterprise, IT
services, startup, and fintech categories; these examples are not placement
claims.

### Illustrative testimonial gallery

The landing page includes a responsive 15-card testimonial preview with ten
India-based and five US-based sample profiles, star ratings, dates, roles, and
sample company outcomes. Every entry is visibly labeled as illustrative until
it can be replaced with a verified customer review.

### Account and plan pages

Offerly now includes responsive `/login`, `/register`, and `/plans` routes.
The pricing page presents Basic, Premium, and Premium Plus tiers.

Authentication is integrated with Supabase SSR. Email/password registration,
login, Google OAuth, email verification callbacks, password recovery, secure
cookie refresh, logout, guest-only redirects, and the protected `/dashboard`
route are implemented. The flows become active after Supabase project
credentials and provider settings are configured.

### Authenticated dashboard

Authenticated users have a shared `/dashboard` workspace with responsive
Overview and Account navigation, practice actions, account status, session and
streak summaries, and clear empty states for upcoming history and progress
features. `/dashboard/account` displays the verified Supabase identity,
sign-in method, and account creation date while profile editing remains reserved
for the database milestone.

### Interview persistence

The Supabase migration in `supabase/migrations` defines user profiles, interview
sessions, answers, and structured feedback with indexes, automatic timestamps,
profile creation, and owner-only Row Level Security. Signed-in practice sessions
are created automatically; transcripts and AI feedback are upserted per
question, and sessions are marked completed or abandoned.

The dashboard reads saved session totals, current practice streak, recent
sessions, and average feedback scores from Supabase. Practice still works
without persistence when the database is not configured or the user is signed
out.

### Session history and progress

The authenticated dashboard includes filterable, sortable, paginated session
history at `/dashboard/history`. Each owner-protected detail page displays the
saved configuration, transcripts, structured scores, strengths, improvements,
and next action. Users can repeat a saved setup or delete the session and all
related records after confirmation.

`/dashboard/progress` calculates overall and category averages, strongest and
weakest skills, recent score movement, role-level averages, and seven-day
practice activity from the user’s saved data. Loading and empty states keep both
areas useful before the first session is recorded.

### Razorpay subscriptions and plan limits

The authenticated `/dashboard/billing` page displays the current plan, monthly
session and feedback usage, paid-plan choices, billing period, and cancellation
controls. Razorpay Subscriptions checkout is created server-side, the immediate
checkout response is verified with HMAC, and raw-body webhooks are validated and
deduplicated before subscription access changes.

Basic accounts receive three saved practice sessions and three AI feedback
reports per calendar month. Active Premium and Premium Plus subscriptions remove
those limits. Paid access is granted only after an `active` subscription webhook
has been verified.

Billing reliability also includes user-triggered Razorpay reconciliation,
scheduled plan-change cancellation, pending/halted payment guidance, and a
sanitized activity timeline. Webhook event IDs keep processing idempotent.

### Automated reliability tests

Vitest protects the billing and entitlement rules that control paid access.
The suite covers plan validation, Basic-plan limits, UTC monthly boundaries,
Razorpay HMAC verification, subscription-status normalization, and out-of-order
webhook handling. Run it with `npm test`, or use `npm run test:watch` while
developing.

Playwright adds browser-level coverage for the public conversion journey,
interview setup and validation, plan links, guest protection, invalid session
links, response security headers, and desktop/mobile overflow. Its isolated
`.next-e2e` server does not interfere with a developer server already running
from the repository.

Authenticated persistence, OpenAI, and Razorpay browser journeys require
dedicated external-service test accounts and remain the next test layer; the
default suite deliberately clears those credentials so it is deterministic and
cannot create real users, AI charges, or payments.

### Admin user dashboard

Allowlisted administrators can open `/dashboard/admin` to review total users,
active subscribers, paid subscription records, and free accounts. The
searchable, paginated user table shows account availability, current plan,
subscription lifecycle status, interview count, join date, and last sign-in.
The page uses the Supabase service role only on the server and redirects
non-admin users back to their dashboard.

Administrators can open user detail pages, suspend or restore access, export a
CSV user/subscription inventory, and review a durable audit trail.
`/dashboard/admin/monitoring` summarizes billing attention, email delivery,
rate-limit traffic, and traceable operational events.

### Recovery, generated questions, reports, and email

Active interviews save a browser recovery checkpoint and periodically sync the
question position and elapsed time. Candidates can pause the timer, continue
offline, and resume after a reload. Role- and seniority-specific questions are
generated through the protected OpenAI endpoint, with the local question bank
as a no-cost and offline fallback.

Saved session reports include a consolidated score, readiness benchmark, and
print/PDF export. Completion notifications use a retryable email outbox. Invoke
`POST /api/cron/email-outbox` with `Authorization: Bearer $CRON_SECRET` from the
deployment scheduler; delivery uses Resend when its environment values are set.

### Account and subscription management

The account dashboard supports profile-name updates, confirmation-based email
changes, authenticated password changes, and permanent deletion confirmed with
the account email. Confirmed identity updates synchronize back to the public
profile record. Deletion
removes the Supabase Auth user and all cascading profile, interview, feedback,
and billing records. If recurring billing is still live, Offerly must cancel it
successfully before any user data is erased.

Active paid subscribers can upgrade from Premium to Premium Plus immediately or
schedule a Premium Plus to Premium downgrade for the end of the current cycle.
The billing UI displays pending plan changes and scheduled cancellations.
Effective entitlements continue to follow signed Razorpay webhooks rather than
optimistic browser responses. Razorpay does not permit a cancelled subscription
to be reactivated; users can begin a new checkout after cancellation completes.

### API security and rate limiting

Sensitive and resource-intensive endpoints use an atomic, Supabase-backed rate
limiter that works across multiple application instances. AI feedback is limited
to 10 requests per 10 minutes per user and transcription to 12; session and
billing routes use separate limits suited to their expected traffic. Rejected
requests return HTTP `429` with `Retry-After` and rate-limit metadata.

Cookie-authenticated mutations reject cross-site browser requests. JSON and
audio payload sizes are bounded before external API work, webhook bodies remain
HMAC-verified, and global response headers add CSP, clickjacking protection,
MIME sniffing protection, HTTPS enforcement, referrer controls, and a restricted
browser permissions policy.

### Legal, support, and structured monitoring

Public `/privacy`, `/terms`, `/refund-policy`, and `/support` pages explain
personal-data processing, acceptable use, subscriptions, cancellation, refund
review, account deletion, and secure support requests. Registration links point
to real legal routes, and the homepage footer exposes the trust section.

Server diagnostics use Winston rather than direct console calls. Each critical
entry is single-line JSON with a timestamp, severity, `file`, `function`,
request `traceId`, meaningful event `key`, bounded message, and safe metadata.
Messages are capped at 500 characters, metadata strings at 250, error stacks at
1,200, and complete serialized entries at 4,000. Keys associated with passwords,
authorization, cookies, secrets, tokens, signatures, transcripts, audio, and
email are redacted automatically.

Trace IDs are propagated through protected and API requests and returned through
the `x-trace-id` response header. Search that value in hosting logs to connect a
reported failure to its server entry. Winston writes to standard output by
default. Local rotating logs can be enabled with `LOG_TO_FILE=true`; they use
`logs/offerly.log`, rotate at 5 MB, and retain three files.

```ts
import { getTraceId, logContext, logger } from "@/lib/logger";

const traceId = getTraceId(request);
logger.error(
  "Subscription update failed.",
  logContext({
    file: "src/app/api/billing/change/route.ts",
    function: "POST",
    traceId,
    key: "billing.plan_change_failed",
    error,
  }),
);
```

### AI interview feedback

Candidates can request structured coaching after transcribing an answer. A
server-side `/api/feedback` route evaluates the role, level, question, and
answer with OpenAI while keeping credentials private. It returns schema-checked
scores for structure, relevance, clarity, and evidence, plus strengths,
improvements, and one concrete next action.

### Answer transcription

Recorded answers can be sent to the server-side `/api/transcribe` route and
converted into text with OpenAI's `gpt-4o-mini-transcribe` model. The route
validates audio format and size before forwarding it, keeps the API key on the
server, and returns actionable errors to the recording interface. Transcripts
remain associated with their question for the current browser session.

### Browser answer recording

Each interview question includes microphone controls powered by the browser
`MediaRecorder` API. Candidates can record, stop, play back, delete, and
re-record an answer. Recordings remain in browser memory for the current session,
and question navigation is disabled while the microphone is actively recording.
Permission denials and unsupported browsers receive a visible error message.

### Mock interview session

Submitting the interview setup now opens `/interview/session` with the selected
role, format, level, and duration. The session presents locally defined
questions one at a time, tracks progress and elapsed time, and ends with a
completion summary. Invalid or incomplete session links return to setup.

### Interview setup form

The landing page call-to-action opens `/interview/new`, where a candidate can
configure a practice session by choosing:

- a target role;
- behavioral, technical, or mixed interview questions;
- an experience level;
- a 15, 30, or 45-minute duration.

The form validates the role, keeps the draft in React state, and passes the
configuration to the mock interview route through URL search parameters. The
role field offers up to four matches from a categorized local catalog while
still accepting custom job titles.

### Application foundation and landing page

The first feature establishes the Next.js application and a responsive landing
page that explains the product's core practice loop:

1. Choose relevant interview questions.
2. Practice answers out loud.
3. Use evidence-based feedback to improve.

This feature is intentionally static. Recording, authentication, AI feedback,
and persistence will be added separately so each capability has a focused commit
and can be understood in isolation.

## Product identity

- **Name:** Offerly
- **Tagline:** Practice better. Get offer-ready.
- **Purpose:** Help candidates turn deliberate interview practice into the
  confidence and skills needed to earn an offer.

The brand name and browser metadata live in `src/app/page.tsx` and
`src/app/layout.tsx`. Keeping product copy separate from framework configuration
makes future branding changes easy to locate.

## Tech stack

- Next.js 16 with the App Router
- React 19
- TypeScript with strict type checking
- Winston structured server logging
- Resend-compatible transactional email outbox
- CSS with responsive layouts and reduced-motion support
- ESLint with the Next.js Core Web Vitals rules

## Local setup

Prerequisites:

- Node.js 20.9 or newer
- npm

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Apply all SQL files in `supabase/migrations` in filename order before enabling
the operational features. Copy `.env.example` and configure Supabase, OpenAI,
Razorpay, Resend, the public site URL, and a long random cron secret.

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` and configure:

```bash
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_EMAILS=admin@example.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@example.com
LOG_LEVEL=info
LOG_TO_FILE=false
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_separate_webhook_secret
RAZORPAY_PREMIUM_PLAN_ID=plan_your_premium_plan_id
RAZORPAY_PREMIUM_PLUS_PLAN_ID=plan_your_premium_plus_plan_id
```

In Supabase Auth URL Configuration, set the site URL to the application origin
and allow `/auth/callback` as a redirect URL. Enable the Google provider and add
its OAuth credentials before using “Continue with Google.” Keep email
confirmation enabled for the verification flow.

Apply the database migration after linking the Supabase CLI:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

See `supabase/README.md` for the SQL editor alternative.
The API security migration is required in every deployed environment; protected
routes intentionally return `503` if the shared rate-limit store is unavailable.
Apply the account and billing management migration before enabling plan changes.

Create ₹199/month and ₹399/month plans in Razorpay, then add their plan IDs to
the environment. Configure an HTTPS webhook pointing to
`/api/webhooks/razorpay` with a separate webhook secret and subscribe to the
subscription lifecycle events. Test the full flow with Razorpay Test Mode keys
before using Live Mode.

Set `ADMIN_EMAILS` to a comma-separated list of administrator account email
addresses. These accounts must also be registered in Supabase. Never expose the
Supabase service-role key through a `NEXT_PUBLIC_` environment variable.

## Available scripts

```bash
npm run dev         # start the development server
npm run build       # create a production build
npm run start       # run the production build
npm run lint        # check code quality and Next.js rules
npm run type-check  # check TypeScript without generating files
npm test            # run the automated test suite once
npm run test:watch  # rerun relevant tests while developing
npm run test:e2e    # run Chromium browser journeys
npm run test:e2e:ui # open Playwright's interactive test runner
```

Install the browser binary once before the first end-to-end run:

```bash
npx playwright install chromium
```

## Project structure

```text
src/
├── app/
│   ├── interview/new/
│   │   ├── page.tsx          # server-rendered setup route
│   │   └── setup.module.css  # route-specific layout styles
│   ├── interview/session/
│   │   └── page.tsx          # validates setup and renders the session
│   ├── globals.css           # shared design tokens and landing styles
│   ├── layout.tsx            # shared HTML shell, font, and metadata
│   └── page.tsx              # landing page route rendered at /
└── components/
    ├── interview-setup-form.tsx
    ├── interview-setup-form.module.css
    ├── interview-session.tsx
    └── interview-session.module.css
```

For the code flow, architectural reasoning, and interview preparation notes, see
[tsc.md](tsc.md).

## Feature roadmap

- [x] Application foundation and responsive landing page
- [x] Offerly product identity
- [x] Interview setup form
- [x] Mock interview session
- [x] Answer recording
- [x] Answer transcription
- [x] AI-generated feedback
- [x] Responsive UI polish and accessible homepage animations
- [x] Sticky navigation and expanded footer
- [x] Illustrative company preparation showcase
- [x] Supabase authentication and protected dashboard foundation
- [x] Responsive authenticated dashboard and account summary
- [x] Supabase persistence schema, RLS, and saved interview data
- [x] Session history and progress tracking
- [x] Razorpay subscription checkout, billing, and plan limits
- [x] Automated billing and entitlement reliability tests
- [x] Protected admin user and subscription dashboard
- [x] Distributed API rate limiting and security headers
- [x] Playwright public-journey, security, and responsive browser tests
- [x] Profile editing, password changes, and subscription-safe account deletion
- [x] Razorpay subscription upgrades and scheduled downgrades
- [x] Privacy, terms, refund, and support pages
- [x] Winston structured logging with trace IDs and redaction

## Branch strategy

- `main` contains stable, release-ready code.
- `develop` is the integration branch for completed work.
- `feature/<short-name>` branches are created from `develop` for new features.
- `fix/<short-name>` branches are created from `develop` for non-production fixes.
- `hotfix/<short-name>` branches may be created from `main` for urgent production fixes.

Normal changes follow this path:

```text
feature/* or fix/* -> develop -> main
```

After a hotfix is merged into `main`, merge it back into `develop` as well.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the working procedure.
