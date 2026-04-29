# CLAUDE.md

Context for Claude Code (and other AI assistants) working in this repo.

## What this project is

A static, client-side TIN lookup site for the **NBR Risk-Based Audit
Selection** list (Assessment Year 2023–24, Bangladesh). Live at
https://check-tin.asif.dev. Tech explainer at
https://check-tin.asif.dev/how-it-works.

The whole product is essentially: a single React page that fetches one
JSON file and does an O(1) hash lookup against it. The privacy story
(your TIN never leaves your browser) is the core feature — every
change should preserve that property.

## Deployment model — important

- The repo is deployed via **Lovable** to **Cloudflare Workers** on
  every push to `main`.
- `vite.config.ts` is intentionally a one-liner that re-exports
  `defineConfig()` from `@lovable.dev/vite-tanstack-config`. That
  preset already wires up `tanstackStart`, `viteReact`, `tailwindcss`,
  `tsConfigPaths`, `cloudflare`, `componentTagger` (dev),
  `VITE_*` env injection, `@` path alias, React/TanStack dedupe,
  error logger plugins, and sandbox detection.
- **Do not** add any of those plugins manually — duplicates will
  break the build. If you need extra Vite config, pass it via
  `defineConfig({ vite: { ... } })`.
- `wrangler.jsonc` points `main` at `@tanstack/react-start/server-entry`
  with `nodejs_compat`. The Lovable preset handles the actual bundling.

## Codebase shape

```
public/data/audit.json        # ~4.2 MB, the entire dataset
src/routes/__root.tsx         # Head meta, Umami <script>, root shell
src/routes/index.tsx          # The TIN checker (single page of substance)
src/routes/how-it-works.tsx   # Static explainer
src/server/umami.functions.ts # createServerFn that reads Umami Admin API
src/lib/analytics.ts          # window.umami.track() wrapper
src/components/ui/*           # shadcn/ui primitives (don't hand-edit lightly)
src/routeTree.gen.ts          # Generated — never hand-edit
```

Routing is **file-based** via `@tanstack/router-plugin`. Adding a route
= adding a file under `src/routes/` and letting `routeTree.gen.ts`
regenerate on next dev/build.

## Data: `public/data/audit.json`

```ts
type AuditDB = {
  zones:   string[];   // index → zone name
  circles: string[];   // index → circle name
  data: Record<
    string,            // TIN (12 digits, string key)
    [zoneIdx: number, circleIdx: number, submissionType: string, assessmentYear: string, source?: 0 | 1 | 2]
  >;
};
```

- `source`: `0` = list 1 (49-zone master, 72,196 entries),
  `1` = list 2 (8-zone supplementary, 15,489), `2` = both.
- **Total**: 87,685 records. The press release headline figure of
  **72,341** comes from the original NBR announcement and predates
  the second published list — keep that in mind when editing copy.
  The headline number `72,341` should only appear in references to
  the press release itself (e.g. the press release alt text). The
  user-facing dataset size is `87,685`, sourced from the constant
  `totalRecords` in `src/routes/index.tsx`.

If the dataset changes, update both:

1. `totalRecords` constant in `src/routes/index.tsx`.
2. The two SEO descriptions: `src/routes/__root.tsx` (root meta) and
   `src/routes/index.tsx` (route head meta).

## TIN handling rules

- TINs are **12 digits**, string-keyed in the JSON.
- Input field strips non-digits and clamps to 12 chars
  (`src/routes/index.tsx`, the `onChange` handler).
- Submit is disabled until length === 12.
- TINs are **masked** for display (`maskTin()`): first 2 + bullets
  + last 2. Keep this when rendering TINs anywhere user-visible.
- **Never log, send, or persist a TIN.** Even analytics events only
  record `tin_length`, never the digits themselves
  (`src/lib/analytics.ts`). This is a hard rule — preserving it is
  the entire reason the privacy claims on `/how-it-works` are honest.

## Analytics

- Tracker: self-hosted Umami at `agent-analytics.asif.dev`,
  `data-website-id="dff585f9-cb8c-44a9-84a7-fc45e2eca443"`. The
  `<script>` is injected via `__root.tsx` `head.scripts`.
- `window.umami.track(name, params)` is wrapped by
  `trackEvent` / the `analytics` object in `src/lib/analytics.ts`.
  Event names and params already in use:
    - `tin_lookup` (`tin_length`)
    - `tin_found` (`zone`, `year`)
    - `tin_not_found`
    - `source_document_viewed` / `source_document_downloaded`
    - `external_link_click` (`url`)
    - `error` (`where`, `message`)
- Public counter (`getUmamiCounts` in `src/server/umami.functions.ts`)
  is a TanStack `createServerFn` that calls the Umami **Admin** API
  with username/password to mint a JWT (cached 6h, re-issued on 401).
  It returns `{ visitors, tinChecks, error }`. If env vars are
  unset or auth fails, it returns zeros and the UI hides the
  counter — never throws.
- Required env vars (Cloudflare Worker secrets in prod, `.dev.vars`
  locally — already gitignored):
  - `UMAMI_HOST`, `UMAMI_WEBSITE_ID`, `UMAMI_USERNAME`, `UMAMI_PASSWORD`.

## Styling

- Tailwind v4 with `tw-animate-css`. Theme tokens (e.g.
  `--gradient-hero`, `--shadow-elegant`, `--success`, `--warning`,
  `--accent`) are defined in `src/styles.css` and referenced as
  `bg-[image:var(--gradient-hero)]` etc. Add new tokens there rather
  than hardcoding colors.
- shadcn/ui config: `components.json` — style `new-york`, base
  `slate`, alias `@/components/ui`.
- Use `cn()` from `src/lib/utils.ts` to compose class strings.

## Conventions

- **TypeScript strict.** Keep it that way. Run `bun run lint` /
  `bun run format` before committing.
- **No new files unless needed.** The site is intentionally tiny;
  prefer extending `index.tsx` over creating new modules.
- **Don't break SSR.** `umami.functions.ts` is a server function;
  client-only globals (`window.umami`) must be guarded with
  `typeof window !== "undefined"` (already done in `analytics.ts`).
- **Don't introduce a TIN-bearing network request.** Any change that
  would send the user's TIN to a server invalidates the privacy
  promise on `/how-it-works` — get explicit user approval first.

## Known caveats

- `audit.json` is ~4.2 MB. The site warm-loads it after first paint
  (`loadDB()` in `index.tsx`). Don't move this to a per-lookup fetch.
- Token cache in `umami.functions.ts` lives in a module variable —
  it's per-Worker-isolate, not global. Cold isolates re-login.
  That's fine; just don't expect strict 1-token-per-deployment.
- `routeTree.gen.ts` regenerates on dev/build. If you add or rename
  a route file, run a build (or let dev server regenerate) before
  committing the gen file.

## Branch / git workflow

- Trunk: `main` (deployed by Lovable).
- For Claude Code on the web sessions, the assigned working branch
  is documented in the session prompt (e.g.
  `claude/add-documentation-*`). Develop and push there; do not push
  to `main` from automation.
- Don't open PRs unless the user asks.
