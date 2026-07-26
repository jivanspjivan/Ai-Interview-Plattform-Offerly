# AI Interview Coach

AI Interview Coach (product name: **Offerly**) is a web application for
practicing role-specific interview questions and receiving actionable feedback.

The project is being built in small, focused features. Each feature is documented
here so the repository history remains easy to follow and useful for learning.

## Current feature: application foundation and landing page

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
└── app/
    ├── globals.css   # design tokens, layout, and responsive styles
    ├── layout.tsx    # shared HTML shell, font, and page metadata
    └── page.tsx      # landing page route rendered at /
```

For the code flow, architectural reasoning, and interview preparation notes, see
[tsc.md](tsc.md).

## Feature roadmap

- [x] Application foundation and responsive landing page
- [x] Offerly product identity
- [ ] Interview setup form
- [ ] Mock interview session
- [ ] Answer recording and transcription
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
