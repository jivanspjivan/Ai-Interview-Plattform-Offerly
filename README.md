# AI Interview Coach

AI Interview Coach (product name: **Offerly**) is a web application for
practicing role-specific interview questions and receiving actionable feedback.

The project is being built in small, focused features. Each feature is documented
here so the repository history remains easy to follow and useful for learning.

## Current features

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

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
npm run dev         # start the development server
npm run build       # create a production build
npm run start       # run the production build
npm run lint        # check code quality and Next.js rules
npm run type-check  # check TypeScript without generating files
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
- [ ] AI-generated feedback
- [ ] Session history and progress tracking

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
