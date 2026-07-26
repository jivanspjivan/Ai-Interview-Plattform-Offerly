# Technical Study Companion

This document explains how AI Interview Coach works as it grows. It is written
to help you understand the code, describe the project in an interview, and
answer follow-up questions instead of only memorizing implementation details.

## 1. Project summary

AI Interview Coach helps candidates practice realistic interview questions and
improve through structured feedback. The product name shown in the interface is
**Offerly**, reflecting the outcome users are working toward: becoming ready to
earn an offer.

The project currently contains its first feature: a responsive landing page
built on a production-ready Next.js foundation. The landing page communicates
the product idea and provides a stable base for later interactive features.

The product identity is intentionally defined in two visible layers:

- `layout.tsx` owns browser-facing metadata such as the title and description.
- `page.tsx` owns the brand name rendered inside the page interface.

Metadata belongs in the layout because Next.js can generate the document
`<head>` from the exported `metadata` object without manually writing HTML tags.

## 2. Current architecture

The application uses the Next.js **App Router**, where folders and files inside
`src/app` define routes and shared layouts.

```text
Browser requests /
        |
        v
src/app/layout.tsx
  - creates the HTML and body shell
  - loads the Manrope font
  - defines default metadata
        |
        v
src/app/page.tsx
  - returns the landing page UI
  - maps feature data into repeated cards
        |
        v
src/app/globals.css
  - supplies design tokens and component styles
  - adapts the layout for tablet and mobile screens
```

`page.tsx` is a **Server Component** by default. It does not include
`"use client"` because this page currently needs no browser state, effects, or
event handlers. Next.js renders its HTML on the server and sends it to the
browser.

## 3. Request flow

When a visitor opens `/`:

1. Next.js matches the request to `src/app/page.tsx`.
2. The root layout wraps the page with the shared HTML structure.
3. Next.js renders the Server Components.
4. The browser receives the generated HTML and CSS.
5. Responsive CSS changes the layout according to the viewport width.

There is no database or external API in this flow yet. Those boundaries will be
introduced and documented when their features are implemented.

## 4. Important implementation decisions

### Why use the App Router?

The App Router provides file-based routing, nested layouts, Server Components,
route handlers, loading states, and error boundaries in one model. It fits this
project because future interview sessions can have their own nested layouts and
server-side data loading.

### Why is the page a Server Component?

A component should stay on the server when it does not need browser-only APIs or
interactive React state. This reduces the JavaScript sent to the browser. A
future recording control will be a Client Component because microphone access
and recording state exist in the browser.

### Why define CSS variables in `:root`?

Values such as `--ink`, `--cream`, and `--lime` are design tokens. They keep the
visual language consistent and make a future theme change easier because common
values have one source of truth.

### Why keep icons inside the component?

The current icons are tiny SVG components with no third-party dependency. This
keeps the first feature small. If the number of icons grows, they should move
into a shared component directory or an established icon package.

### Why map over the features array?

The three process cards share the same shape. Storing their content as data and
mapping it into markup avoids duplicated structure and makes additions less
error-prone. In a larger application, the data may come from a CMS or API.

## 5. TypeScript concepts used

- `Metadata` is imported as a type and validates Next.js page metadata.
- `Readonly<{ children: React.ReactNode }>` describes the layout's props and
  prevents accidental prop mutation.
- Strict mode is enabled in `tsconfig.json`, so unsafe implicit types are caught
  during development.
- The `@/*` alias points to `src/*` and will keep future imports readable.

Note that `tsc.md` means **Technical Study Companion**. The actual TypeScript
compiler configuration is `tsconfig.json`.

## 6. Accessibility and performance

- The document language is declared with `lang="en"`.
- Navigation and visual examples have descriptive accessible labels.
- Decorative SVG icons are hidden from screen readers.
- Semantic elements such as `nav`, `main`, `section`, and `article` describe the
  page structure.
- Reduced-motion preferences disable smooth scrolling and button transitions.
- The page uses Server Components and sends no feature-specific client
  JavaScript.

## 7. How to explain this feature in an interview

> I started the AI Interview Coach with a Next.js App Router foundation and a
> responsive product landing page. I kept the route as a Server Component
> because it has no client-side state, which minimizes browser JavaScript. I
> created reusable design tokens in CSS, rendered repeated content from data,
> added accessibility semantics, and configured strict TypeScript, linting, and
> production build checks. I am implementing recording, AI feedback, and
> persistence as separate features so their architecture and commit history stay
> easy to review.

## 8. Likely cross-questions

### What is the difference between a Server Component and a Client Component?

A Server Component renders on the server and cannot use browser APIs, React
state, or effects. A Client Component includes `"use client"` and can be
interactive, but its JavaScript is sent to the browser. Use the server by default
and create a client boundary only where interactivity begins.

### Does Server Component rendering mean the page has no JavaScript?

Not always. Next.js still needs framework behavior when client-side navigation
or Client Components are present. For this specific page, none of its own
components require client-side JavaScript.

### Why use Next.js instead of plain React?

React is the UI library. Next.js adds routing, server rendering, optimized font
loading, metadata handling, production build tooling, and server endpoints.
Those features will support both the public UI and future AI-backed workflows.

### How is the page responsive?

The main desktop layout uses CSS Grid. Media queries switch it to a single
column, wrap role labels, simplify navigation, and stack process cards at
smaller widths. Fluid `clamp()` values scale major headings between minimum and
maximum sizes.

### How would you test this feature?

First run lint, strict type checking, and a production build. Then add component
or end-to-end tests for visible headings, navigation destinations, and responsive
behavior. Automated browser testing will be most valuable when forms and
interview flows become interactive.

### What would you improve before production?

Add automated tests, analytics with user consent, a complete footer and legal
pages, real call-to-action destinations, security headers, and monitoring. The
static copy should also be validated with real users before optimizing it.

## 9. Learning checklist

Before moving to the next feature, you should be able to explain:

- how `layout.tsx` and `page.tsx` compose the `/` route;
- why the landing page does not use `"use client"`;
- how strict TypeScript and ESLint catch different classes of problems;
- how CSS Grid and media queries create the responsive layout;
- which parts of the current UI are demonstrations rather than live AI results.
