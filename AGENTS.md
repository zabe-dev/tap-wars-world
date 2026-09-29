# Introduction

This is a template `AGENTS.md` — a standing set of instructions for any AI
coding agent (Claude Code, Cursor, Codex, Copilot, or similar) working in
this repository. It exists so every agent session starts with real project
context instead of guessing defaults, and so conventions stay consistent
whether a human or an agent writes the next line of code.

**How to use this file, per project:**

- Copy this file to the root of a new project (same level as
  `package.json`) before any agent starts working.
- Update the stack list, folder structure, and any library-specific
  sections below to match what's actually installed — this file should
  always describe the real project, not an aspiration. If a library
  listed here isn't in use, remove its section rather than leaving stale
  instructions behind.
- Treat every rule below as binding unless it's explicitly marked as a
  preference or a "use judgment" case — most sections say which they are.
- This file grows with the project. When a new pattern, library, or
  recurring mistake shows up, add a rule for it here rather than
  correcting the same thing repeatedly across sessions.

**For the agent reading this:**

- Read this entire file before writing any code, not just the section
  that seems most relevant — several sections interact (e.g. staging,
  file size limits, and third-party API usage all apply to the same
  feature at once).
- If a request conflicts with something in this file, say so explicitly
  and ask rather than silently picking one side.
- If Next.js auto-generates or re-adds a `<!-- BEGIN:nextjs-agent-rules
-->` managed block at the top of this file (it does this automatically
  on `next dev` when it detects an AI agent and no such block exists),
  leave it in place — it's Next.js pointing you at its own bundled,
  version-matched docs and is meant to coexist with everything below it.

## Next.js Version Policy

- Always run the **latest stable** Next.js release, not whatever version
  is familiar from training data. Check `package.json` for the installed
  version before writing any Next.js-specific code — don't assume.
- When starting the project or doing a version bump, install with
  `bun add next@latest` and re-check `node_modules/next/dist/docs/`
  afterward, since APIs and conventions can change between majors
  (this is explicitly called out in the managed block above — Next.js
  itself warns that a new major "may differ from your training data").
- Before using any Next.js API, briefly confirm it still exists and works
  the way you expect in the installed version via the bundled docs —
  don't rely on memory of an older App Router API (e.g. Server Actions,
  caching directives, and config options have all changed across recent
  majors).
- When a breaking change forces a different pattern than what's already
  in the codebase, don't silently leave both old and new patterns mixed
  in — flag it and propose migrating the rest, or note it clearly in
  `PROGRESS.md` as follow-up work.
- Stay on stable releases for this project — don't adopt a canary/RC
  build unless a specific feature is explicitly needed and the trade-off
  is discussed first.

# Project Agent Instructions

## Stack Decision: Choosing Your API Layer (Static Site vs. Hono Backend)

This template supports two tracks. Decide which one applies **once, at
project start**, using the table below — don't revisit or second-guess
the decision mid-project.

| If the project has...                                                                                                                                                                                                                               | Track                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Only this Next.js app calling its own backend, no webhooks, no other clients planned                                                                                                                                                                | **Track A — Static Site.** Next.js Route Handlers + Server Actions only. Skip Hono entirely. Remove the Hono line from the stack list, the `server/` folder and `api/[[...route]]` route from the Folder Structure, and the entire "Hono" subsection under Architectural Patterns. |
| Any one of: a mobile app or public API planned, incoming webhooks (payments, email delivery, OAuth callbacks), per-route middleware needs (custom rate limits, custom CORS), or real abuse/scale risk (voting, submissions, user-generated content) | **Track B — Hono Backend.** Use Hono per the sections below.                                                                                                                                                                                                                       |

If it's unclear which row applies, ask the person building the project
the specific question that resolves it (e.g. "will anything besides this
app's own pages call this backend?") — then apply the table. Once
decided, build accordingly and don't relitigate the choice later in the
project.

**Throughout this file, anything labeled "(Track B — Hono only)" applies
only to projects using the Hono Backend track and should be skipped
entirely on the Static Site track. Anything not labeled applies to both
tracks.**

This same table logic applies to every other optional stack item below:
Cloudflare R2, Resend, Redis, and Framer Motion are defaults for a
typical full-stack app, not requirements. If a project has no file
uploads, delete the Cloudflare R2 section; no transactional email, delete
the Resend section; no need for shared rate limiting or cross-request
caching, delete the Redis section; no need for animation, delete Framer
Motion. Decide once per item at project start, then move on. (shadcn/ui
and other prebuilt component frameworks are never a default option here
— see "UI Components" below — there is no per-project decision to make
there; they are simply never used.)

You are working on a production app built with:

- **Runtime:** Bun
- **Framework:** Next.js (App Router) + TypeScript — always the latest
  stable release, see note above
- **API layer:** Hono (Track B only — mounted as a Next.js route
  handler, or standalone — see "Architectural Patterns"). Skipped
  entirely on Track A.
- **Database:** PostgreSQL, connected via a single `DATABASE_URL`, using
  Drizzle ORM
- **Validation:** Zod
- **Auth:** Better-Auth
- **Object storage:** Cloudflare R2
- **Email:** Resend
- **Cache / rate limiting:** Redis (Upstash or self-hosted) via a single
  shared client in `lib/redis.ts` — see "Redis" under Architectural
  Patterns for the required key-naming convention
- **Styling:** Tailwind CSS and/or CSS Modules (see "UI Components" —
  never a bare global stylesheet)
- **Animation:** Framer Motion (`motion` package)
- **Icons:** Iconify (`@iconify/react`) — never hand-draw or hand-code
  icon SVGs

Prioritize clarity and long-term maintainability over cleverness. When in
doubt, choose the option a new teammate could understand in under a minute.
Never introduce a new library, pattern, or abstraction to solve something
this stack already handles — ask first.

## Staged Development & Progress Tracking

Don't attempt a large feature or task in one uninterrupted pass. Break it
into stages, complete and verify one before moving to the next, and keep a
running record so progress survives across sessions.

**Working in stages**

- Before starting a non-trivial task, briefly outline the stages you'll
  work through (e.g. "1. schema + migration, 2. Zod schema + query
  functions, 3. Hono route, 4. UI, 5. tests" on Track B, or "1. schema +
  migration, 2. Zod schema + query functions, 3. Server Action, 4. UI, 5. tests" on Track A) rather than writing everything at once.
- Finish and sanity-check one stage (it compiles, the test passes, the
  route responds) before starting the next. Don't leave a stage half-done
  to jump ahead.
- If a task is small (a one-line fix, a copy change), staging is
  unnecessary overhead — use judgment. Staging is for work that touches
  multiple files/layers (schema → query → route/action → UI).

**Verify before building on top — don't stack unverified work**
The goal of staging is to avoid discovering a foundational problem after
three more features were built on top of it, which then all need
reworking. To actually prevent that:

- A stage isn't "done" because the code compiles or looks right — it's
  done once you've actually run it (a test, a manual call, a rendered
  page) and confirmed the behavior, not just the syntax.
- Before building a new feature on top of an existing piece (a query, a
  route/action, a shared component), do a quick check that the existing
  piece still behaves as expected — don't assume last session's work is
  still correct just because it was marked done in `PROGRESS.md`.
- When a new feature reveals a flaw in something underneath it, fix the
  root cause at its layer immediately rather than patching around it at
  the layer you're currently working in. A workaround in the UI for a bad
  query is exactly the kind of thing that causes repeated backtracking
  later.
- Check integration points explicitly at each boundary — e.g. after
  adding a route or Server Action, actually confirm the exact response
  shape the frontend will consume, rather than assuming and finding out
  when the UI stage breaks.
- Prefer writing the test for a stage as part of that stage, not deferred
  to a final "add tests" pass — a test written right after the code is
  what catches a regression before the next feature is built on top of
  the bug.

**PROGRESS.md**

- Maintain a `PROGRESS.md` at the project root as a running log of what's
  been done, what's in progress, and what's next. Update it as you
  complete each stage, not just at the end of a session.
- Keep entries short and scannable — this is a log, not documentation.
  Format:
    ```md
    ## 2026-08-29 — Invoice export feature

    - [x] Add `invoices.exportedAt` column + migration
    - [x] `getInvoicesForExport` query in lib/db/queries/invoices.ts
    - [ ] Hono route: POST /api/invoices/export
    - [ ] UI: export button + optimistic pending state
          Next: wire up the Hono route, then the UI button.
    ```
- Newest entries at the top. Don't delete old entries — they're a
  history of what's shipped, useful when picking work back up later or
  onboarding someone new.
- When picking up a task, check `PROGRESS.md` first for unfinished items
  before starting something new from scratch.
- `PROGRESS.md` is committed to the repo, not gitignored — it's project
  history, not a scratch file.

## Agent Token Efficiency

Minimizing token usage is important — a shorter, well-targeted session
gets more done per context window and costs less, without sacrificing
correctness. Treat this as a standing constraint on _how_ you work, not
a reason to skip a step above (staging, verification, tests still apply
in full).

- **Read narrowly, not exhaustively.** Use targeted line ranges, `grep`,
  or search instead of dumping an entire large file into context when
  only one function or section is relevant. Reserve a full-file read for
  when you genuinely need the whole thing (e.g. before a large refactor).
- **Edit with diffs, not full rewrites.** Change only the lines that need
  to change (a targeted edit) rather than regenerating and re-pasting an
  entire file when a small part of it changed. Reserve a full rewrite for
  when the majority of the file is actually changing.
- **Don't re-paste content the person or the repo already has.** Once a
  file has been shown or written, refer to it by name/path instead of
  quoting it back in full in a later message or commit description.
- **Summarize, don't dump, verbose tool output.** Test runs, build logs,
  and long command output get condensed to the relevant result (pass/
  fail, the specific error, the specific line) rather than pasted in full
  when reporting back — paste the raw log only when actually debugging
  that log line-by-line.
- **Batch related tool calls** instead of issuing many small sequential
  ones where a single call (or a small parallel batch) would do.
- **Keep comments, commit messages, and `PROGRESS.md` entries short and
  scannable** (see their respective sections above) — a few words that
  convey the _why_ beats a paragraph restating the diff.
- **Don't restate unchanged code** in an explanation — describe what
  changed and why, and point to the file/line rather than reproducing
  surrounding code that didn't change.
- None of this trades away correctness: still read enough to be sure a
  change is safe, still verify each stage actually runs (see "Staged
  Development"), and still write complete tests and documentation where
  required elsewhere in this file. Token efficiency governs _how much
  incidental text moves around_, not how carefully the work itself is
  done.

## Folder Structure

Organize by **feature**, not by file type. Only put something in a shared
top-level folder if it's genuinely used across 3+ features. Use the
structure matching your track from the Stack Decision above.

**Track A — Static Site (no Hono):**

```
app/
  (marketing)/
    pricing/
      page.tsx
  dashboard/
    settings/
      page.tsx
      _components/            # private, route-only components
      actions.ts              # Server Actions for this route
  loading.tsx                  # global root loading fallback (renders <LoadingDots />)
  not-found.tsx                # global root not-found fallback
  error.tsx                    # global root error boundary

lib/
  auth/
    index.ts                   # Better-Auth server instance/config
    client.ts                  # Better-Auth client for use in components
  db/
    index.ts                   # Drizzle client (Postgres connection via DATABASE_URL)
    schema/
      users.ts
      invoices.ts
      index.ts                 # barrel export of all tables
    queries/                   # reusable query functions, grouped by domain
      users.ts
  storage/
    r2.ts                      # R2 client + upload/download/delete helpers
  email/
    resend.ts                  # Resend client
    templates/                 # email templates (React Email or plain HTML)
  redis.ts                    # Redis client + key-prefix helpers (see "Redis")
  schemas/                     # Zod schemas, grouped by domain
    user.ts
    invoice.ts
  env.ts                       # Zod-validated env var schema, single source of truth
  errors.ts                    # shared AppError type/class
  utils.ts                     # small pure helpers only, no business logic

drizzle/
  migrations/                  # generated Drizzle migrations, never hand-edited

types/
  index.ts                     # barrel export
  user.ts                      # domain types NOT already covered by a Zod
  invoice.ts                   # schema's z.infer<> (see "TypeScript Types")

components/
  ui/                          # shared, generic, reusable primitives (built
                                # from scratch by hand — see "UI Components")
                                # includes loading-dots.tsx (<LoadingDots />),
                                # the app's one global loading component,
                                # used by the global loading.tsx and
                                # anywhere else a small inline loading
                                # state is needed

PROGRESS.md                    # running log of completed/in-progress/next
                                # work — see "Staged Development & Progress
                                # Tracking"
```

**Track B — With Hono Backend:**

```
app/
  (marketing)/
    pricing/
      page.tsx
  dashboard/
    settings/
      page.tsx
      _components/            # private, route-only components
  api/
    [[...route]]/
      route.ts                # Hono app mounted here (catch-all)
  loading.tsx                  # global root loading fallback (renders <LoadingDots />)
  not-found.tsx                # global root not-found fallback
  error.tsx                    # global root error boundary

server/                        # Hono API implementation, framework-agnostic
  routes/
    users.ts
    invoices.ts
  middleware/
    auth.ts                    # Better-Auth session middleware for Hono
  index.ts                     # Hono app assembly, exported for the route handler

lib/
  auth/
    index.ts                   # Better-Auth server instance/config
    client.ts                  # Better-Auth client for use in components
  db/
    index.ts                   # Drizzle client (Postgres connection via DATABASE_URL)
    schema/
      users.ts
      invoices.ts
      index.ts                 # barrel export of all tables
    queries/                   # reusable query functions, grouped by domain
      users.ts
  storage/
    r2.ts                      # R2 client + upload/download/delete helpers
  email/
    resend.ts                  # Resend client
    templates/                 # email templates (React Email or plain HTML)
  redis.ts                    # Redis client + key-prefix helpers (see "Redis")
  schemas/                     # Zod schemas, grouped by domain
    user.ts
    invoice.ts
  env.ts                       # Zod-validated env var schema, single source of truth
  errors.ts                    # shared AppError type/class
  utils.ts                     # small pure helpers only, no business logic

drizzle/
  migrations/                  # generated Drizzle migrations, never hand-edited

types/
  index.ts                     # barrel export
  user.ts                      # domain types NOT already covered by a Zod
  invoice.ts                   # schema's z.infer<> (see "TypeScript Types")
  api.ts                       # shared request/response shapes for Hono <-> client

components/
  ui/                          # shared, generic, reusable primitives (built
                                # from scratch by hand — see "UI Components")
                                # includes loading-dots.tsx (<LoadingDots />),
                                # the app's one global loading component,
                                # used by the global loading.tsx and
                                # anywhere else a small inline loading
                                # state is needed

PROGRESS.md                    # running log of completed/in-progress/next
                                # work — see "Staged Development & Progress
                                # Tracking"
```

Rules (both tracks):

- Business logic (queries, R2 operations, email sending) never lives inside
  a component, Server Action, or route handler directly — it lives in
  `lib/` and is called from there.
- (Track B) Hono routes in `server/routes/` stay thin: parse/validate
  input, call a `lib/` function, return a response. No business logic
  inline in a route.
- (Track A) Server Actions in `actions.ts` files stay equally thin:
  parse/validate input, call a `lib/` function, return a result. No
  business logic inline in an action.
- Drizzle schema files are the single source of truth for table shape —
  never define the same shape twice in a separate type.
- Do not create new top-level folders without proposing it first.

## Readability Standards

- Optimize for the reader, not the writer. A few extra lines of clear code
  beats a dense one-liner.
- Functions do one thing. If describing it needs "and," split it.
- Name things for what they are, not how they're implemented
  (`getActiveUsers`, not `queryUsersWhereStatusFlag`).
- No magic numbers/strings — extract to named constants.
- Avoid nesting beyond 3 levels; prefer early returns / guard clauses.
- Comments explain _why_, not _what_.
- No commented-out code left in commits.

### File size — split, don't dump

Never let one file accumulate everything related to a feature. These are
the hard limits — if you're about to exceed one, stop and split instead
of pushing through:

- **Components:** ~120 lines. If a component is growing past this, pull out
  sub-sections into their own components (even small, single-use ones) in
  a co-located file or `_components/` folder. A component file should
  describe _one_ piece of UI, not a whole page's worth of markup.
- **Functions:** ~30–40 lines. If a function needs a comment to separate
  "step 1 / step 2 / step 3," those steps are probably separate functions.
- **Route handlers (Hono, Track B) and Server Actions (Track A):** thin
  by definition — parse input, call a `lib/` function, return a response.
  If a handler is doing more than that, the extra logic belongs in `lib/`.
- **Files overall:** ~250–300 lines is a signal to split, not a hard wall
  to hit exactly. When a file crosses it, look for a natural seam
  (a sub-component, a helper module, a second concern) and extract it.

When splitting, prefer splitting by _responsibility_ over splitting
arbitrarily by line count — e.g. `invoice-form.tsx` +
`invoice-form-line-items.tsx` + `use-invoice-form.ts`, not
`invoice-form-part-1.tsx` / `invoice-form-part-2.tsx`.

## Architectural Patterns

**Next.js (both tracks)**

- Server Components by default. Add `"use client"` only when the component
  needs interactivity, browser APIs, or hooks.
- Pages fetch data directly in Server Components (via `lib/db/queries`) when
  the data is simple and page-specific. On Track B, use the Hono API layer
  only when the same logic needs to be reused across the web app and
  external/mobile clients, or needs its own middleware chain (e.g. rate
  limiting, webhooks). On Track A, all mutations go through Server Actions.

**Hono (Track B — Hono only. Skip this entire subsection on Track A.)**

- One Hono app assembled in `server/index.ts`, mounted into Next.js via the
  catch-all route handler at `app/api/[[...route]]/route.ts`.
- Group routes by domain (`server/routes/users.ts`, etc.) and compose them
  onto the main app with `.route()`.
- All Hono route handlers validate input with Zod (`@hono/zod-validator` or
  manual `.parse()`) before touching the database or any external service.
- Auth-gated routes use a shared Better-Auth middleware — never re-check
  sessions ad hoc inside individual handlers.

**Drizzle / PostgreSQL (both tracks)**

- All queries go through Drizzle — no raw SQL unless Drizzle genuinely
  can't express it, and if so, isolate it in `lib/db/queries` with a comment
  explaining why.
- Schema changes always go through `drizzle-kit generate` — migrations are
  generated, never hand-written or hand-edited.
- Reusable queries live in `lib/db/queries/<domain>.ts`, not inlined in
  routes, actions, or components. A query function should be named for the
  question it answers (`getInvoicesForUser`, not `dbQuery1`).
- The database is a plain PostgreSQL instance addressed via a single
  `DATABASE_URL` connection string — see "Performance & Caching" for
  connection-pooling guidance.

**Zod (both tracks)**

- Every external input boundary (form submission, Server Action input,
  Hono route body/params, webhook payload, R2 upload metadata) is
  validated with a Zod schema before use.
- Schemas live in `lib/schemas/`, one file per domain, and are the source
  of truth for the corresponding TypeScript type via `z.infer<>` — don't
  hand-write a parallel interface.

**Better-Auth (both tracks)**

- Auth config and server instance live in `lib/auth/index.ts` only — never
  instantiate Better-Auth elsewhere.
- Session checks in Server Components use the server instance directly;
  Server Actions check the session at the top of the action (Track A);
  Hono routes use the shared middleware (Track B); client components use
  `lib/auth/client.ts`.
- Never roll custom session/JWT handling alongside Better-Auth — if
  something's missing, extend Better-Auth's config/plugins first.

**Cloudflare R2 (both tracks)**

- All R2 access goes through `lib/storage/r2.ts` (upload, signed URL
  generation, delete). No direct S3-client calls scattered elsewhere.
- Never expose R2 credentials to the client — uploads happen via a
  server-generated signed URL or a server-side route/action, never direct
  client-to-R2 with static keys.
- Validate file type/size (Zod or manual checks) before generating an
  upload URL.

**Resend (both tracks)**

- All email sending goes through `lib/email/resend.ts`. Templates live in
  `lib/email/templates/`, kept separate from send logic.
- Don't inline HTML strings for emails in route handlers, Server Actions,
  or components.

**Redis (both tracks)**

- One shared Redis client instantiated in `lib/redis.ts` — never call
  `new Redis(...)` (or the equivalent for your client library) inline in
  a route, action, or component.
- **Every key must be prefixed with the app's name**, so multiple apps can
  safely share one Redis instance without key collisions. Format:
  `<appname>:<domain>:<identifier>`, colon-separated, all lowercase. For
  an app at `example.com`, that's `example:<domain>:<identifier>` — e.g.
  `example:ratelimit:user:42`, `example:sessions:abc123`,
  `example:cache:invoices:user:42`. Never write a bare, unprefixed key
  (`user:42`, `ratelimit:42`) directly against the shared instance.
- Define the app prefix once as a constant in `lib/redis.ts` (e.g.
  `const APP_PREFIX = "example"`) and build every key through a small
  helper (`buildKey("ratelimit", "user", userId)` →
  `example:ratelimit:user:42`) rather than concatenating prefix strings
  ad hoc at each call site — this is what makes a future rename or a
  shared-instance migration a one-line change instead of a grep-and-replace.
- Set an explicit TTL on every cache entry — don't let a key live forever
  unless it's intentionally permanent (e.g. a long-lived session key with
  its own explicit expiry). A key with no TTL and no clear reason for one
  is a slow memory leak in the Redis instance.
- Used for: rate-limiter counters shared across serverless/edge instances
  (see "Concurrency & Efficiency"), caching expensive or third-party
  results (see "Third-Party API Usage"), and any other cross-request state
  that doesn't belong in Postgres. Session storage itself stays with
  Better-Auth's configured store unless there's a specific reason to move
  it to Redis.

**UI Components (both tracks)**

- Build every component from scratch, by hand, in `components/ui/` (or a
  route's `_components/`) — this is what gives full control over markup,
  styling, and behavior, and means any component can be freely modified
  later without fighting a library's internal structure or overrides.
- **Never use shadcn/ui or any other prebuilt component framework/kit**
  (Radix-based kits, Chakra, MUI, Mantine, Ant Design, or similar) — no
  exceptions, even "just to start" or "just this one form." If a pattern
  feels like it needs a whole library, build the minimal hand-written
  version of just what's needed instead.
- **Never rely on a single global stylesheet** (`globals.css` or
  equivalent) for component or page styling. A global stylesheet may exist
  only for genuinely global concerns — a CSS reset, `:root` design-token
  custom properties, `@font-face` declarations, base typography on `html`/
  `body` — never for styling a specific component or page, which leaks
  scope and causes specificity fights as the app grows. Before adding
  anything to `globals.css`, ask "does every page need this?" — if not, it
  belongs in Tailwind classes or a CSS Module instead.
- **Pick one primary styling approach** for the project — Tailwind utility
  classes or CSS Modules — and use it consistently by default. Only use
  both together when there's a genuine need (e.g. Tailwind for layout and
  spacing throughout, with CSS Modules reserved specifically for the
  complex-CSS exceptions below) — don't reach for both as a default
  combination without a concrete reason tied to a specific piece of UI.
- Style with Tailwind utility classes directly in JSX by default, when
  Tailwind is the (or a) chosen approach. Extract a class string to a
  variable or a `cva`-style variant helper only once a component has
  several visual variants — don't prematurely abstract.
- Fall back to CSS Modules when Tailwind genuinely can't express what's
  needed, or when forcing it into utility classes would be noticeably
  harder to read/maintain than a few lines of real CSS. Examples: complex
  keyframe animations Framer Motion doesn't cover, intricate `:has()`/
  sibling selectors, gradient masks, or fine-grained print styles. This is
  an exception for genuine limitations, not a way to avoid learning a
  Tailwind utility — if there's a reasonably direct Tailwind equivalent,
  use it instead.
- When using CSS Modules, co-locate the file with the component
  (`invoice-chart.module.css` next to `invoice-chart.tsx`), use CSS
  Modules (not a global stylesheet) to avoid class name collisions, and
  leave a short comment on why Tailwind wasn't used for that piece.
- Keep components accessible by default: semantic HTML elements, proper
  `aria-*` attributes, visible focus states — don't rely on a library to
  provide this for you since we're not using one.

**Icons (both tracks)**

- All icons come from Iconify (`@iconify/react`'s `<Icon icon="..." />`)
  — never hand-write icon SVGs or copy-paste one-off SVG markup.
- Pick one or two icon sets for visual consistency (e.g. `lucide` or
  `heroicons` via Iconify) rather than mixing icon sets across the app.
- For social/brand icons specifically, use the **Akar Icons** set via
  Iconify rather than pulling social logos from the general-purpose icon
  set, and rather than hand-drawing a brand icon — never hand-draw a
  social/brand icon when Akar Icons already covers it. Look up the exact
  icon name on icon-sets.iconify.design/akar-icons before using it; don't
  guess at a name or a suffix.
- Wrap `<Icon>` in a shared component if you need consistent sizing/color
  defaults across the app, rather than repeating props everywhere.

**Animation (both tracks)**

- Use Framer Motion (`motion`) for transitions, layout animation, and
  gesture-driven interaction — not raw CSS keyframes for anything beyond a
  trivial hover state.
- Keep animation logic out of business-logic components: a component that
  fetches or mutates data shouldn't also own complex motion variants —
  wrap the animated presentation in its own small component.
- Respect `prefers-reduced-motion` for non-essential animations.

**General (both tracks)**

- State management: built-in React state/context first. No new state
  library without explicit sign-off.
- Errors are handled explicitly (`error.tsx`, try/catch with meaningful
  messages, typed error responses from Server Actions or Hono) — no
  silent failures.

## Loading & Optimistic UI

Skeleton/Suspense and optimistic updates solve different problems — use
the right one for the situation, not whichever is more familiar.

**Skeletons + Suspense — for reads (first-load / navigation)**

- Use when the user is waiting to see data for the first time: page loads,
  tab switches, paginated lists.
- Implement via Next.js `loading.tsx` files and `<Suspense>` boundaries —
  don't hand-roll loading state with `useState` when the framework
  primitive covers it.
- A skeleton must match the real content's exact dimensions (height,
  grid, spacing) so swapping in real data causes zero layout shift. A
  skeleton that doesn't match the final layout is worse than a spinner.
- A global `app/loading.tsx` is required at the root — this is the
  fallback for full page navigations before route-specific content is
  ready. It renders the app's **global loading component**: a simple
  bouncing three-dot indicator (staggered opacity/translateY animation
  via Framer Motion), centered on the viewport — not a full-page
  skeleton, since the root loading state doesn't know the shape of the
  destination page's content. Respect `prefers-reduced-motion` here too
  — fall back to a static/non-animated dots or pulsing-opacity treatment
  rather than the staggered bounce.
- The bouncing three-dot indicator is built once as a single shared
  component, `components/ui/loading-dots.tsx` (`<LoadingDots />`), and
  that component **is** the app's one canonical global loading
  indicator — don't hand-roll a spinner, a different dot style, or any
  other loading visual elsewhere in the app. `app/loading.tsx` renders
  it; reuse the same component anywhere else a small inline loading
  state is needed (e.g. inside a button's pending state) instead of
  introducing a second loading design.
- `loading.tsx` files render into the `children` slot of the nearest
  layout, not as a standalone page — if the header/footer live in
  `app/layout.tsx` (or a nested layout), they'll render around the
  loading state automatically. Never manually re-import or re-render the
  header/footer inside a `loading.tsx` file itself; it should contain
  only `<LoadingDots />`, nothing else. If a fallback is showing a
  header/footer twice, that's a sign the header/footer got duplicated
  into the loading file instead of living solely in the shared layout —
  fix it there, not by hiding one copy with CSS. The same slot behavior
  applies to `not-found.tsx` and `error.tsx` — don't duplicate the
  header/footer into those either.
- Route-specific `loading.tsx` files (e.g. `app/dashboard/loading.tsx`)
  should still use content-matched skeletons where the destination
  layout is known — `<LoadingDots />` is reserved for the global root
  fallback (and small inline pending states) only, not a substitute for a
  real skeleton wherever the target layout is predictable.

**Optimistic updates — for writes (mutations/actions)**

- Use when the user takes an action and the likely result is already
  known: toggling, liking, marking complete, submitting a comment.
- Implement with React's `useOptimistic` paired with a Server Action (or
  a Hono mutation on Track B), not manual local-state juggling.
- Reserve optimistic updates for actions with a low, acceptable failure
  rate. For actions with real failure modes worth surfacing clearly
  (payments, file uploads to R2, anything Better-Auth-gated with
  meaningful consequences), wait for confirmation and show explicit
  pending/error states instead (e.g. a disabled button with the shared
  `<LoadingDots />` global loading component or a spinner icon, not an
  optimistic result).
- Always handle the rollback path — if the mutation fails, revert the
  optimistic state and surface the error (via the shared `AppError`
  shape), don't leave the UI showing a result that didn't actually happen.

**Rule of thumb:** loading existing data → skeleton. Acting on existing
data → optimistic. Don't reach for optimistic updates just to avoid
building a skeleton, and don't skeleton-wrap something that should feel
instant.

## TypeScript Types

- Centralize types in the `types/` folder — don't scatter one-off
  `interface`/`type` declarations across component files.
- If a type already comes from a Zod schema (`z.infer<typeof userSchema>`),
  don't redeclare it in `types/` — re-export the inferred type from
  `types/` instead so there's one place to import it from:
    ```ts
    // types/user.ts
    export type { User } from "@/lib/schemas/user";
    ```
- `types/` is for types that aren't derived from a schema: shared
  request/response shapes for Hono endpoints (Track B), component prop
  types shared across multiple components, and generic utility types.
- A component's own props type (used only by that component) can stay
  local to the component file — it doesn't need to move to `types/`.
- Never use `any`. Use `unknown` and narrow, or define the proper type.

## Environment Variables & Secrets

- All env vars are declared in `.env.local` for local dev (never committed —
  confirm it's in `.gitignore`) and in the hosting platform's dashboard
  (Vercel/Cloudflare) for staging/production.
- Maintain an `.env.example` with every required key present but empty/
  placeholder values, kept in sync whenever a new env var is added.
  **Group related variables under a comment header by concern** — don't
  dump every key as one flat, unordered list. For example:

    ```
    # Database
    DATABASE_URL=

    # Auth (Better-Auth)
    BETTER_AUTH_SECRET=
    BETTER_AUTH_URL=

    # Storage (Cloudflare R2)
    R2_ACCESS_KEY_ID=
    R2_SECRET_ACCESS_KEY=
    R2_BUCKET_NAME=

    # Email (Resend)
    RESEND_API_KEY=

    # Cache / Rate Limiting (Redis)
    REDIS_URL=
    ```

    Add new groups (or new keys under an existing group) as the project
    grows, rather than appending ungrouped keys to the bottom of the file.

- Validate env vars at startup with a Zod schema (`lib/env.ts`) — fail fast
  with a clear error if something required is missing, rather than letting
  a `undefined` leak into a Drizzle/R2/Resend client at runtime.
- Naming: `SCREAMING_SNAKE_CASE`, prefixed by concern where it helps
  disambiguate (`DATABASE_URL`, `R2_ACCESS_KEY_ID`, `R2_BUCKET_NAME`,
  `RESEND_API_KEY`, `BETTER_AUTH_SECRET`, `REDIS_URL`).
- Client-exposed env vars (Next.js `NEXT_PUBLIC_*`) must never contain
  secrets — only public config (e.g. a public bucket URL). Double-check
  before prefixing anything with `NEXT_PUBLIC_`.
- Secrets are never logged, never included in error messages returned to
  the client, and never hard-coded as a fallback default in code.

## Stack Decision: Deployment Target

Decide this once, at project start, the same way you decided on Hono —
don't add Docker tooling speculatively if the project will never use it.

| If the project...                                                                                                                                                                       | Use                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deploys to Vercel (or another platform with native Next.js build support) and has no requirement to run outside that platform (no on-prem, no other cloud, no self-hosted orchestrator) | **Skip Docker entirely.** Delete the "Docker & Deployment" section below and its line in "Before You Finish." Let the platform's native build handle it. |
| Needs to run on a container orchestrator (self-hosted, ECS/Cloud Run/Fly.io/Kubernetes, or explicitly required for portability across environments)                                     | **Docker**, per the "Docker & Deployment" section below.                                                                                                 |

If it's unclear which applies, ask the specific question that resolves
it (e.g. "will this ever run anywhere besides Vercel?") — then apply the
table and don't relitigate it later in the project.

**If Docker applies, a second decision: local dev too, or prod builds only?**

| If local dev...                                                                                                                                             | Use                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Only needs the Next.js app running locally, and the database is a hosted PostgreSQL instance reachable via `DATABASE_URL` (no local Postgres needed)        | **No Docker Compose for local dev.** Docker is prod-build-only; run `bun run dev` locally against the hosted database as normal.                                                                                                                       |
| Needs a fully offline-capable local environment (no network dependency on the hosted database), or the team explicitly wants dev/prod parity via containers | **Docker Compose for local dev**, containerizing only the services that need it (e.g. a local Postgres instance) — don't containerize a hosted, already-reachable Postgres service via `DATABASE_URL` unless there's a specific offline-dev reason to. |

## Docker & Deployment

- If deploying via Docker, use a multi-stage `Dockerfile`: a `deps` stage
  installing with Bun, a `builder` stage running `bun run build`, and a
  minimal `runner` stage that copies only the built output — never ship
  `node_modules`/dev dependencies or source `.ts` files in the final
  image.
- Use the official `oven/bun` base image, pinned to a specific version
  tag (not `latest`), matching whatever Bun version is in
  `package.json`/`.bun-version`.
- Set `output: "standalone"` in `next.config.js` so the final image only
  needs the Next.js standalone build output plus the Bun runtime — not
  the full source tree or monorepo.
- `.dockerignore` must exclude `.env*`, `node_modules`, `.next/cache`,
  `.git`, and any local-only artifacts — never bake env files or secrets
  into an image layer.
- Runtime env vars (`DATABASE_URL`, `REDIS_URL`, R2/Resend/Better-Auth
  secrets) are injected at container start (platform env config, `--env-file`, or
  orchestrator secrets) — never hard-coded or passed as a Docker `ARG`,
  since build args can leak into image history/layers.
- Expose a lightweight `GET /api/health` route for container
  orchestrator liveness/readiness probes — it should only confirm the
  process is up, never call the DB, R2, or Resend (a slow/down
  third-party shouldn't fail your health check).
- If using Docker Compose for local dev, only containerize services that
  need it (e.g. a local Postgres if not using a hosted `DATABASE_URL`
  for dev) — don't add a redundant local Postgres container unless
  there's a specific offline-dev reason to.
- Confirm the final image size and layer count stay reasonable
  (multi-stage build should mean the runner stage is small) — a bloated
  image is a sign a stage is copying more than it needs to.

## Security Practices

- Every Server Action (Track A) or Hono route (Track B) that mutates or
  reads user-specific data checks ownership/authorization explicitly —
  never trust a client-supplied `userId`/`id` param without verifying it
  belongs to the authenticated session.
- (Track B) Rate-limit sensitive routes (auth endpoints, file uploads,
  email-sending routes) at the Hono middleware level — don't rely on
  Cloudflare alone. (Track A) Apply the same rate limiting to the
  equivalent Server Actions via a shared store (see "Concurrency &
  Efficiency").
- Validate file uploads for both MIME type and size before generating an
  R2 signed URL — a Zod check on the declared type isn't enough on its
  own; verify server-side where feasible.
- (Track B) Set CORS explicitly on the Hono app (allowed origins, methods,
  headers) — never wildcard `*` in production.
- Escape/sanitize any user-generated content rendered as HTML (e.g. in
  emails or dashboards) to prevent injection — don't assume Zod validation
  alone covers this.
- Never construct SQL manually from user input, even for the rare raw-SQL
  case — use Drizzle's parameterized query builders.
- Treat all Better-Auth session/cookie handling as security-critical: don't
  modify its cookie/session config without understanding the security
  implication, and don't build a parallel auth mechanism alongside it.

## Error Handling & Logging

- Define a shared `AppError` type/class (`lib/errors.ts`) with a `code` and
  a user-safe `message` — throw/return this instead of raw `Error` objects
  or ad hoc string messages.
- (Track B) Hono error responses follow one consistent JSON shape across
  every route (e.g. `{ error: { code, message } }`) so the frontend can
  handle errors generically instead of per-endpoint. (Track A) Server
  Actions return the same consistent shape for their error case.
- Never leak internal details (stack traces, raw DB errors, raw Resend/R2
  provider errors) to the client — log the full detail server-side, return
  a sanitized message to the client.
- Use Next.js `error.tsx` boundaries for route-level UI errors; don't let
  unhandled exceptions render a blank page.
- Log server-side errors with enough context to debug (route/action, user
  id if available, relevant input) but never log secrets, full request
  bodies containing PII, or auth tokens.
- Don't swallow errors silently (`catch {}` with no action) — at minimum,
  log them; if recoverable, handle explicitly, if not, rethrow as an
  `AppError`.

## Performance & Caching

- Be deliberate with Next.js caching: use `fetch` cache options / route
  segment config intentionally rather than accepting whatever the default
  happens to be — comment when a page or fetch is intentionally dynamic
  vs cached.
- Be mindful of PostgreSQL connection limits. Use a single shared Drizzle
  client instance (`lib/db/index.ts`) with proper connection pooling (a
  `pg` `Pool`, or a serverless/edge-friendly Postgres driver if deploying
  to an edge or serverless runtime) — never open a new connection per
  request.
- Batch or paginate large Drizzle queries — never fetch an unbounded list
  and filter/paginate in application code.
- R2 signed URLs should have a sensible, explicit expiry (short for
  one-time uploads, longer for read access as needed) — don't default to
  the library's max expiry without thinking about it.
- Use Next.js `<Image>` for any user-facing images (including R2-hosted
  ones) rather than raw `<img>`, so optimization/lazy-loading is handled.
- Avoid animating layout-affecting properties (width/height/top/left) with
  Framer Motion where a transform-based animation (`x`, `y`, `scale`,
  `opacity`) would achieve the same effect with better performance.

## Concurrency & Efficiency

- **Parallelize independent fetches.** If two or more `await`s in a Server
  Component, Server Action, or Hono route don't depend on each other's
  result, run them with `Promise.all` (or `Promise.allSettled` if partial
  failure is acceptable) instead of awaiting sequentially.

    ```ts
    // Bad: serial round-trips
    const user = await getUser(id);
    const invoices = await getInvoicesForUser(id);

    // Good: parallel
    const [user, invoices] = await Promise.all([getUser(id), getInvoicesForUser(id)]);
    ```

- **No N+1 queries.** Never loop over rows and issue a Drizzle query per
  row. Use a relational `with` query, a `join`, or a single `inArray()`
  lookup instead. Each extra round-trip to Postgres adds real latency —
  treat a query-in-a-loop as a bug, not a style nitpick.
- **Know which cache layer you're using:**
    - React's `cache()` — dedupes identical calls within a single render
      pass (e.g. the same `getUser` called from a layout and a page).
    - Next.js `unstable_cache` / `revalidateTag` / `revalidatePath` — cross-
      request caching with explicit invalidation; use this for data that's
      expensive to compute and safe to serve slightly stale.
    - Hono-level response caching (Track B) — for computed endpoints hit
      repeatedly with the same input (e.g. a public stats endpoint).
      Pick the right one deliberately; don't stack ad hoc caching on top of
      Next.js's own fetch cache without understanding the interaction.
- **Don't block the response on slow side effects.** Sending a Resend
  email or another non-critical side effect shouldn't hold up the
  response the user is waiting on. Fire it after returning the response
  (`after()` in Next.js, or a queue) and handle its failure independently
  — a flaky email provider should never fail or slow down the primary
  action.
- **Rate limiter state must be shared, not in-memory.** A counter in a
  module-level variable doesn't work across serverless/edge instances —
  use the shared Redis client (`lib/redis.ts`) with a properly prefixed
  key (e.g. `example:ratelimit:route:ip`) for any rate limit that needs to
  hold across requests.
- **Stream large responses** instead of buffering the whole payload —
  Next.js streaming SSR for large pages, Hono's streaming helpers for
  large API responses (Track B) — rather than assembling everything in
  memory before sending.

## Third-Party API Usage & Credit Limits

Third-party services (Resend, R2, or any future integration billed by
usage/request count) are a real cost, not just a technical dependency.
Treat their limits as seriously as a rate limit on your own API.

- IMPORTANT/MANDATORY: Use rtk-ai and caveman skill in ultra settings.
- **Cache before you call.** If a third-party response doesn't change
  often (lookup data, computed results, anything not user-specific and
  real-time), cache it (`unstable_cache`, or the shared Redis client with
  a properly prefixed key and a sensible TTL) instead of re-fetching on
  every request. Never call a paid API inside a loop or on every render
  when the result could be cached.
- **Dedupe concurrent identical calls.** If multiple requests could
  trigger the same third-party call at the same time (e.g. several users
  loading a page that hits the same external lookup), dedupe with
  in-flight request coalescing or React's `cache()` rather than firing one
  call per request.
- **Set a request budget per integration.** Know each third-party
  service's rate/credit limit and stay meaningfully under it — build in
  your own internal cap (e.g. via the shared rate-limit store) rather than
  relying on the provider to reject you when you hit the ceiling.
- **Always implement retry with backoff, not retry-in-a-loop.** Transient
  failures get exponential backoff with a max attempt count; never retry
  in a tight loop, which can spike usage and burn through credits fast
  during an outage.
- **Fail gracefully, don't cascade-retry.** If a third-party service is
  down or rate-limiting you, surface a clear `AppError` and stop — don't
  let a retry storm from multiple users compound the problem and burn
  through remaining credits.
- **Log usage-relevant signals**, not just errors: track call volume per
  integration if the provider doesn't expose usage dashboards, so a
  runaway loop or unexpected traffic spike is caught before it exhausts a
  credit limit.
- **Batch when the provider supports it.** Prefer a bulk endpoint (e.g.
  sending multiple emails in one Resend batch call, if available) over N
  individual calls when the provider offers a batched alternative.
- **New third-party integrations go through the Dependency Policy above**
  — including a look at the provider's rate limits and pricing tiers
  before wiring it in, not after hitting a cap in production.

## Git & Commit Conventions

- Commit messages follow Conventional Commits: `feat:`, `fix:`, `refactor:`,
  `chore:`, `test:`, `docs:` — with a short imperative summary
  (`feat: add invoice PDF export`, not `updated stuff`).
- **One type of change per commit — never combine them.** A `feat` commit
  contains only the new feature; a `fix` commit contains only the bug fix;
  a `refactor` commit contains only the restructuring; a `style`/`chore`
  commit contains only formatting or config changes. If work on a feature
  turns up an unrelated bug, fix it in its own separate `fix:` commit, not
  folded into the `feat:` commit — even if both changes are small.
- If you catch yourself about to write a commit message with "and" joining
  two different kinds of change (e.g. "add export button and fix typo in
  header"), that's a signal to split it into two commits first.
- Commit as you complete each stage (see Staged Development) rather than
  batching multiple stages into one commit at the end — this keeps history
  readable and makes a later revert or bisect actually useful.
- Branch naming: `type/short-description` (`feat/invoice-export`,
  `fix/auth-redirect-loop`).
- Keep PRs scoped to one concern — a feature, a fix, or a refactor, not a
  mix. If a change grows to touch unrelated areas, split it.
- Never commit directly to `main`/`production` — always via a
  reviewed PR, even for small fixes.
- Don't commit generated artifacts (`.next/`, `node_modules/`, build
  output) — confirm `.gitignore` covers them.

## Dependency Policy

- Before adding a new package, check whether the existing stack (Bun,
  Next.js, Hono, Drizzle, Zod, Better-Auth, Redis, Tailwind, Framer
  Motion, Iconify) already solves the problem — most needs should be met
  without a new dependency.
- Propose new dependencies explicitly (name + why + what it replaces or
  adds) rather than installing silently as part of an unrelated task.
- Prefer well-maintained, widely-used packages with active releases over
  niche or unmaintained ones — check last-publish date and download counts
  before adding.
- Pin dependency versions deliberately; don't introduce a dependency with
  a wide-open version range without reason.
- Component frameworks (shadcn/ui, Radix-based kits, Chakra, MUI,
  Mantine, or similar) are excluded from this policy entirely — they are
  never added, proposed, or discussed as an option. See "UI Components."

## Documentation

- Every exported function/type in `lib/`, `server/` (Track B), and
  `types/` gets a short doc comment (what it does, params, and anything
  non-obvious about behavior) — internal, unexported helpers don't need
  this unless the logic is genuinely non-obvious.
- Document _why_, not _what the code already says_ — a doc comment
  restating the function signature in prose adds nothing.
- Keep a root `README.md` current with setup steps (env vars, `bun
install`, `bun run dev`, running migrations) — update it whenever a
  setup step changes.
- Non-obvious architectural decisions (e.g. "Hono is mounted inside
  Next.js instead of standalone because X") get a short note in this file
  or a linked doc, not just left as tribal knowledge.

## Naming Conventions

- Files: `kebab-case.ts(x)` (e.g. `user-profile-card.tsx`,
  `invoice-schema.ts`).
- Components: `PascalCase` matching the default export (`UserProfileCard`).
- Hooks: `camelCase` prefixed with `use` (`useAuthStatus`).
- (Track B) Hono route files: named after the resource, plural
  (`users.ts`, `invoices.ts`).
- Server Actions / query functions: verb-first, descriptive
  (`createInvoice`, `getInvoicesForUser`) — never `handler`, `doThing`, or
  `helper`.
- Drizzle tables: `camelCase` variable name, plural
  (`export const users = pgTable("users", ...)`).
- Zod schemas: suffix with `Schema` (`userSchema`, `createInvoiceSchema`);
  inferred types drop the suffix (`type User = z.infer<typeof userSchema>`).
- Types/interfaces: `PascalCase`, no `I`/`T` prefix.
- Booleans: prefix with `is`, `has`, `should`.
- Constants: `SCREAMING_SNAKE_CASE` for true constants/config; otherwise
  `camelCase`.
- Named exports by default. Default exports only where the framework
  requires them (`page.tsx`, `layout.tsx`, `route.ts`).
- Files in `types/`: `kebab-case.ts`, named after the domain (`user.ts`,
  `invoice.ts`, `api.ts`), one barrel `index.ts` re-exporting the rest.
- Shared animation variants (Framer Motion): suffix with `Variants`
  (`fadeInVariants`, `slideUpVariants`).
- CSS Module files: `kebab-case.module.css`, matching the component name
  (`invoice-chart.tsx` → `invoice-chart.module.css`).
- Redis keys: lowercase, colon-separated, always `<appname>:<domain>:
<identifier>` (e.g. `example:ratelimit:user:42`) — built through the
  shared `buildKey` helper in `lib/redis.ts`, never concatenated ad hoc
  at the call site.

## Testing Expectations

Three distinct levels of testing apply here — know which one a given
piece of work actually needs rather than defaulting to one or skipping
the question entirely.

**Unit tests — always, for logic (both tracks)**

- Use Bun's built-in test runner (`bun test`) unless the project has
  already standardized on something else.
- Every `lib/db/queries` function, every Zod schema, and every pure
  helper needs a unit test covering the happy path and at least one
  failure/validation case.
- Mock external services at the boundary — R2 client, Resend client, and
  Better-Auth session checks are mocked in unit tests; don't hit a real
  external service or a real database here.
- Zod schemas: test that invalid input is rejected, not just that valid
  input passes.
- This is the default, minimum bar for any new logic. Skipping unit tests
  isn't a judgment call — write them.

**Integration tests — for anything crossing a real boundary (both tracks)**

- Use when a test needs to exercise a Hono route end-to-end (Track B) or
  a Server Action end-to-end (Track A), a real database query against
  actual Postgres, or the interaction between two internal layers (e.g.
  a route/action calling a query calling the DB).
- Use a separate test database (a dedicated Postgres database/schema, or
  a branch if your Postgres provider supports branching) for these —
  never run integration tests against the production or shared dev
  database.
- (Track B) Every Hono route needs at least one integration test hitting
  the real route (not just the underlying function in isolation).
  (Track A) Every Server Action needs the equivalent.
- Needed for: any new API route or Server Action, any auth-gated flow,
  any Drizzle query with joins or relational complexity worth verifying
  against a real DB.

**E2E tests — only for critical user-facing flows (both tracks)**

- Use a browser-driving tool (e.g. Playwright) to test a full flow
  through the actual UI, as a real user would.
- Reserve these for flows where a break would be severe and hard to catch
  otherwise: sign-up/login (Better-Auth), any payment or checkout path,
  file upload (R2), and any flow sending a transactional email (Resend)
  end-to-end.
- Don't write E2E tests for every page or every component state — they're
  slow and expensive to maintain. If a unit or integration test can catch
  the same bug, prefer that instead. Ask "would this break silently and
  badly in production without an E2E test?" — if no, skip it.
- New E2E tests are proposed explicitly (which flow, why it needs this
  level) rather than added by default alongside every feature.

**General rules across all levels**

- Don't skip or delete a failing test to unblock a build — fix it or flag
  it explicitly.
- Every bug fix ships with a regression test that fails without the fix.

## Before You Finish

- Re-read the diff as if reviewing someone else's PR.
- Confirm folder placement matches the structure above, for your track.
- Confirm no business logic leaked into a component or a thin route/action.
- Confirm new external input is validated with Zod.
- Confirm Drizzle schema changes have a generated migration.
- Confirm tests exist for new logic and pass locally with `bun test` —
  unit tests for the logic itself, an integration test if a new route/
  action or DB boundary was added, and an E2E test only if this touches a
  critical flow (auth, payment, upload, transactional email).
- Confirm no file/component/function has silently grown past the size
  limits above — split before finishing, not after.
- Confirm new shared types live in `types/`, not scattered inline.
- Confirm icons use Iconify, not hand-written SVGs, and social/brand
  icons use the Akar Icons set with a verified name.
- Confirm no shadcn/ui or any other component framework was pulled in —
  every component is hand-built, with no exceptions.
- Confirm no styling leaked into a bare global stylesheet, and that the
  project's one chosen primary approach (Tailwind or CSS Modules) was
  used consistently.
- Confirm every new Redis key goes through `lib/redis.ts`'s `buildKey`
  helper and is properly prefixed with the app name (`example:...`), with
  an explicit TTL unless intentionally permanent.
- Confirm no secrets are logged, hard-coded, or leaked to the client.
- Confirm new/changed env vars are reflected in `.env.example` under the
  correct grouped section (not appended as a flat, ungrouped line) and in
  the `lib/env.ts` schema.
- Confirm errors thrown/returned use `AppError` and don't leak internal
  detail to the client.
- Confirm the commit message follows Conventional Commits, contains only
  one type of change (not a feat mixed with a fix or a refactor), and the
  PR is scoped to one concern.
- Confirm reads use Suspense/skeletons matching real content dimensions,
  the global `app/loading.tsx` renders only the shared `<LoadingDots />`
  global loading component (no duplicated header/footer, no alternate
  spinner design), and writes use optimistic updates only where a
  failure is low-stakes and a rollback path exists.
- Confirm independent fetches run in parallel (`Promise.all`) and no
  Drizzle query runs inside a loop (N+1).
- Confirm any new third-party API call is cached/deduped where possible,
  has retry-with-backoff (not retry-in-a-loop), and stays under a known
  request/credit budget.
- If this project deploys via Docker, confirm no secrets/env files ended
  up in the image (`docker history <image>` or a build-time check), and
  that `.dockerignore` is current.
- Confirm `PROGRESS.md` is updated with what was completed and what's
  next before ending the session.
- Confirm each stage was actually verified (run, not just written) before
  the next stage was built on top of it — no assumptions carried forward
  unchecked.
- Confirm the session stayed token-efficient per "Agent Token
  Efficiency" — no full-file dumps where a diff would do, no verbose
  tool output pasted unsummarized.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
