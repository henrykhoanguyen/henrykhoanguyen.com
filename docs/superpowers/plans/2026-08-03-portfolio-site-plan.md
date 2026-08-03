# henrykhoanguyen.com — implementation plan

Date: 2026-08-03
Spec: `docs/superpowers/specs/2026-08-03-portfolio-site-design.md`

Eight phases. Each ends in a state that runs and can be verified, so work can stop at any phase boundary without leaving the repo broken. Phase 2 comes before any visual work because the content layer is the only part of this codebase with real logic, and everything else consumes it.

All commands assume `npm`. Substitute `pnpm dlx` / `bunx` for `npx` if preferred.

---

## Phase 0 — Scaffold

Create the project and wire up tooling. No custom code.

```
npx sv create . --template minimal --types ts
npx sv add tailwindcss="plugins:typography" mdsvex eslint prettier playwright \
  vitest="usages:unit" sveltekit-adapter="adapter:static" --install npm
npm i -D shiki
```

Every add-on option must be set explicitly or `sv add` drops into interactive prompts. `sveltekit-adapter="adapter:static"` alone is correct — passing `cfTarget:none` is rejected as incompatible.

**There is no `svelte.config.js`.** Current SvelteKit puts the whole configuration inside `vite.config.ts`, and `sv add mdsvex` plus `sv add sveltekit-adapter` already wire `extensions: ['.svelte', '.svx', '.md']`, the mdsvex preprocessor, and `adapter-static`. The remaining edits to `vite.config.ts` are:

- `adapter({ fallback: undefined, strict: true })` — fully prerendered, no SPA fallback
- mdsvex `highlight.highlighter` wired to Shiki using the phosphor theme

Add `src/routes/+layout.ts` with `export const prerender = true` and `trailingSlash = 'never'`.

Delete the generated `src/routes/demo/` and `src/lib/vitest-examples/`.

### shadcn-svelte init runs on Khoa's machine

`shadcn-svelte init` writes `components.json` — already committed — and then fetches from `shadcn-svelte.com/registry`, which the build sandbox cannot reach. `components.json` is valid and complete, so the remaining work is a local run:

```
npx shadcn-svelte@latest init      # answer the preset prompt, accept defaults
```

The CLI will not re-prompt for aliases or CSS path; those are already recorded. Note `--preset` takes a generated ID from shadcn-svelte.com/create, not a name — any preset is fine, since Phase 2 replaces the theme entirely.

**Done when:** `npm run build` emits `build/`, `npm run check` reports zero errors, `npx prettier --check .` is clean, and a `.md` route renders with Shiki-highlighted code in the phosphor colours.

---

## Phase 1 — Content layer

The heart of the system. Written test-first, since these are the only assertions in the project that catch real bugs.

**Files**

- `src/lib/content/schema.ts` — Zod schemas for project, experience, and about frontmatter, exactly as tabled in the spec
- `src/lib/content/index.ts` — the sole owner of `import.meta.glob`; exports `getProjects()`, `getProject(slug)`, `getExperience()`, `getAbout()`, `getStackTags()`
- `src/lib/content/index.test.ts`
- `src/content/projects/*.md`, `src/content/experience/*.md`, `src/content/about.md` — placeholder files with real frontmatter shape, replaced wholesale in Phase 5

**Behavior to implement**

- Slug derives from filename. No `slug` frontmatter field exists.
- Index reads use `{ eager: true, import: 'metadata' }` so case study bodies stay out of the home page bundle. Detail pages dynamically import the full module.
- Validation failures throw naming the file and the failing field.
- A project with neither a body nor a `repo` fails validation.
- Empty-body detection treats whitespace-only bodies as empty.
- Projects sort by `date` descending; experience by `start` descending.
- Year grouping emits a year label only on the first entry of that year.
- `getStackTags()` returns a deduplicated, sorted list across all projects.

**Tests** (from the spec's testing section)

Each required field missing fails with a message naming the file; sort order; year grouping; empty-body detection across present / absent / whitespace-only; no-body-and-no-repo fails; stack tag extraction dedupes and sorts.

**Done when:** `npm run test:unit` passes and no route imports `import.meta.glob`.

---

## Phase 2 — Design tokens and typography

**Files**

- `src/lib/styles/tokens.ts` — the five color values from the spec as the single source of truth
- `src/lib/styles/tokens.test.ts` — WCAG relative luminance computed for each of the three text stops against `--bg`, asserting AA
- Global stylesheet — Tailwind v4 `@theme` block consuming the token values; no `tailwind.config.js` is created or edited
- `static/fonts/` — JetBrains Mono, subset to latin, woff2, with `@font-face` and `font-display: swap`

Prose defaults live in one place: 15px, line-height 1.75, `max-width: 70ch`. The prose font is a single CSS variable so switching to sans later is a one-line change.

Shiki gets a custom theme built from the same five token values rather than an off-the-shelf theme, so code blocks sit inside the green scale instead of importing a second palette. Highlighting runs at build time, so no highlighter ships to the browser.

**Done when:** contrast tests pass, the font loads locally with no request to a font CDN, and a fenced code block renders in the green scale.

---

## Phase 3 — Layout, routes, and the directory listing

**Components** (`src/lib/components/`)

- `DirectoryList.svelte` — the rauchg-style three-column grid. Semantic `<ul>`; the grid is presentation only. Takes rows as props and knows nothing about content loading.
- `PromptHeading.svelte` — the `$ ls ./projects` section header. `$` glyph is `aria-hidden`.
- `Hero.svelte` — name, blinking caret, tagline. Caret animation disabled under `prefers-reduced-motion`.
- `SiteHeader.svelte`, `SiteFooter.svelte`

**Routes**

- `src/routes/+layout.svelte` — header, footer, skip link
- `src/routes/+page.svelte` — hero, featured projects, full experience timeline, contact links
- `src/routes/projects/+page.svelte` — full listing, year-grouped
- `src/routes/projects/[slug]/+page.svelte` and `+page.ts` with `entries()` sourced from the content layer
- `src/routes/about/+page.svelte`
- `src/routes/+error.svelte` — `zsh: no such file or directory: /foo`, with links back to `/` and `/projects`

**Done when:** every route renders from placeholder content, `entries()` generates pages only for projects with bodies, and a bad URL renders the custom error page.

---

## Phase 4 — Interactive pieces

- Stack filter on `/projects`. Rendered in character as a `$ filter --stack` line with inline mono toggles. Selecting dims non-matching rows rather than removing them, so the year gutter does not reflow. State lives in the URL as `?stack=python`; with no query parameter the full list renders, so the page works without JavaScript.
- `npx shadcn-svelte@latest add command sheet button tooltip` — **must be run on Khoa's machine**; the build sandbox cannot reach the shadcn registry. Then restyle each to the green scale. Their defaults are a starting point, not the target.
- Command palette bound to `⌘K` / `Ctrl+K`, listing all projects and the top-level routes.
- Sheet for mobile navigation.

**Done when:** filtering works with JavaScript disabled, the palette opens and navigates, and focus rings are visible throughout.

---

## Phase 5 — Real content

Replace every placeholder with the material in the spec's content inventory.

- `src/content/experience/` — `heb.md`, `general-motors.md`, `uci-medical-center.md`. Education states 2019.
- `src/content/projects/` — four files, current work first:
  1. `retail-data-platform.md` (H-E-B) — the lead. Minutes to 20–50ms belongs in the `summary`, not buried in the body. Two-act narrative: get the data across reliably, then serve it fast.
  2. `vehicle-data-streaming.md` (GM)
  3. `spring-boot-streaming-harness.md` (GM)
  4. `german-football-analyzer.md` — the only entry carrying `repo`. No `demo`; the Heroku URL is dead.
- `src/content/about.md` — tagline positioning Khoa as a backend engineer with streaming depth; skills; links to LinkedIn, GitHub, and email. No `resume` field.

The 35 remaining GitHub repos are not listed. The footer GitHub link means nothing is hidden.

**Publishing gate:** Khoa reviews the H-E-B case study and bullets before deploy. Content stays within what he has already published himself, and the H-E-B material is his call alone.

**Done when:** the build succeeds against real content and Khoa has signed off on the H-E-B pages.

---

## Phase 6 — Prerender, SEO, deploy

- Per-page `<title>` and meta description; Open Graph tags
- `src/routes/sitemap.xml/+server.ts`, prerendered
- `static/robots.txt`
- `static/_redirects` — `/Khoa_Nguyen_Resume.pdf` → LinkedIn profile, 302. A 302 rather than 301 keeps the path reusable if a hosted resume returns.
- `static/_headers` — immutable caching on hashed assets
- Cloudflare Pages project connected to the repo; build command `npm run build`, output directory `build`
- Custom domain `henrykhoanguyen.com`, DNS cut over

**Done when:** the site is live on the custom domain and `henrykhoanguyen.com/Khoa_Nguyen_Resume.pdf` redirects rather than 404s.

---

## Phase 7 — Verification

- Playwright smoke: every prerendered route returns 200, no console errors, nav and `⌘K` navigate correctly, a known-bad URL renders the custom 404
- `npm run check`, ESLint, Prettier clean
- Contrast tests green
- Keyboard-only pass across all routes; screen reader check that the directory listings read as lists and the `$` glyphs are silent
- Lighthouse on `/` and one case study; investigate anything below 95
- Read every page as a recruiter would: does the H-E-B work read as current, and does the strongest number surface within the first screen?

**Done when:** all checks pass and the recruiter read-through holds up.

---

## Sequencing notes

Phases 0–4 depend only on placeholder content and can proceed while the H-E-B wording is still settling. Phase 5 is the only phase gated on Khoa's review, and Phase 6 cannot start until Phase 5 lands, since deploying placeholder content to the live domain would be worse than shipping nothing.

The critical path is writing four case studies, not building the site.

## Risks

- **mdsvex and Svelte 5.** Actively maintained at 0.12.x and working in current SvelteKit projects, but it is the least-settled dependency here. Phase 0 proves the integration before any custom code is written, which is why scaffolding is its own phase.
- **shadcn-svelte defaults fight the aesthetic.** The components assume a neutral light-and-dark theme; the green phosphor scale is not that. Budget restyling time in Phase 4, and drop any component that resists rather than fighting it.
- **The site outlives its content.** Four case studies written once and never touched will read as stale within a year. The empty-body rule exists so adding a fifth project is a single file — the design already accounts for this, but only Khoa can act on it.
