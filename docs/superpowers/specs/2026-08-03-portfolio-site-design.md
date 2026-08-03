# henrykhoanguyen.com — design

Date: 2026-08-03
Status: approved

## Purpose

A personal site for Khoa Nguyen, software and data engineer. Two jobs, in priority order:

1. Let a recruiter or hiring manager understand who Khoa is and what he has shipped in under 60 seconds.
2. Host project write-ups that can grow into full case studies over time.

Success looks like: a recruiter lands on `/`, reads the positioning line, scans the project list and experience timeline, and leaves via the LinkedIn or email link. No dead ends, no scrolling for the point.

Explicit non-goals: no blog, no newsletter, no CMS, no analytics dashboard, no server runtime.

## Constraints

- Content authored in markdown, in-repo, edited in a text editor.
- Fully static output. No server, no database, no runtime API calls.
- The strongest material is proprietary employer work with no public repo and no demo. The site must present a project convincingly with no outbound link.
- Must scale to ~15 projects without a layout rewrite.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | SvelteKit 2, Svelte 5 (runes), TypeScript |
| Markdown | mdsvex 0.12.x |
| Styling | Tailwind v4 (CSS `@theme` config — no `tailwind.config.js`) |
| Components | shadcn-svelte (Svelte 5 / Tailwind v4 line) |
| Adapter | `@sveltejs/adapter-static` |
| Validation | Zod |
| Highlighting | Shiki, via mdsvex |
| Hosting | Cloudflare Pages, git-push deploys, custom domain `henrykhoanguyen.com` |
| Testing | Vitest, Playwright, svelte-check, ESLint, Prettier |

Tailwind v4 keeps its config in CSS. Any shadcn-svelte guide that edits `tailwind.config.js` is out of date and must not be followed.

## Content model

All content is markdown. Content lives outside `src/routes` so routing and authoring stay separable.

```
src/content/
  projects/*.md      one file per project
  experience/*.md    one file per role
  about.md           bio and skills
```

Slugs derive from filenames. There is no `slug` frontmatter field, so a URL can never drift from its file.

### Frontmatter schemas

Defined in `src/lib/content/schema.ts` using Zod.

**Project**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | yes | Display name, e.g. `stream-ingest` |
| `summary` | string | yes | One line, shown in the directory listing |
| `stack` | string[] | yes | Shown right-aligned; also drives filtering |
| `date` | ISO date string | yes | Sort key; year drives the gutter grouping |
| `featured` | boolean | no, default `false` | Controls appearance on `/` |
| `repo` | URL | no | |
| `demo` | URL | no | |

**Experience**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `company` | string | yes | |
| `role` | string | yes | |
| `start` | ISO date string | yes | Sort key, descending |
| `end` | ISO date string or `"present"` | yes | |
| `highlights` | string[] | yes | Short outcome-focused bullets |
| `stack` | string[] | no | |

**About / site metadata**

`about.md` carries site-level identity in its frontmatter, so no separate config file exists and the "markdown for everything" rule holds. Its body is the long-form bio on `/about`.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | yes | Used in the hero and `<title>` |
| `tagline` | string | yes | The one-line positioning statement under the hero |
| `skills` | string[] | yes | Rendered on `/about` |
| `links` | array of `{ label, url }` | yes | Contact and social links in the footer. LinkedIn stands in for the resume |

There is no `resume` field. The site hosts no resume PDF — see Resume handling below.

At least one project file and one experience file must exist for the build to succeed. An empty site is a bug, not a valid state.

### The content layer

`src/lib/content/index.ts` is the only module in the codebase that calls `import.meta.glob`. It exports `getProjects()`, `getProject(slug)`, `getExperience()`, and `getAbout()`. Routes call these functions and never touch glob patterns or frontmatter parsing.

Index pages read frontmatter only:

```ts
import.meta.glob('/src/content/projects/*.md', { eager: true, import: 'metadata' })
```

Case study bodies are dynamically imported on the detail route, so no project body is bundled into the home page.

### The empty-body rule

A project with valid frontmatter and no markdown body is a valid project. It renders in the directory listing, and its row links directly to `repo`.

A project with a body additionally generates `/projects/<slug>`, and its row links there instead.

Emptiness is derived from the compiled module, not from a frontmatter flag — there is no switch to forget to flip. Writing a body is the only action needed to publish a case study.

If a project has no body and no `repo`, the schema fails the build. A row that links nowhere is never shipped.

## Routes

| Route | Contents |
| --- | --- |
| `/` | Hero, featured projects, full experience timeline, contact links |
| `/projects` | All projects, grouped by year, filterable by stack tag |
| `/projects/[slug]` | Case study. Prerendered only for projects with bodies |
| `/about` | Longer bio, skills, contact and LinkedIn |

Experience lives on `/` rather than its own route. With a handful of roles a dedicated page would read as empty, and keeping it on the home page holds the recruiter's skim path to one scroll.

`/projects/[slug]` supplies its prerender list from `entries()`, sourced from the content layer. The empty-body rule is therefore enforced by the build, not by convention.

### Stack filtering on `/projects`

The filter is rendered in character rather than as a UI control: a `$ filter --stack` line above the listing, followed by the distinct stack tags as inline mono toggles. Selecting one dims non-matching rows rather than removing them, so the year gutter stays stable and the page does not reflow.

Filter state lives in the URL as `?stack=python`, which keeps it shareable and prerender-safe. With no query parameter the full list renders, so the page is fully functional without JavaScript.

Tag list is derived from project frontmatter at build time. There is no hardcoded tag vocabulary.

## Visual design

An old-school green phosphor terminal, structured as a directory listing. The listing layout follows rauchg.com: a flat three-column grid with no cards and no row borders — year gutter, title, right-aligned metadata — with the year rendered only when it changes.

This structure is chosen over cards because it stays dense and scannable at fifteen projects, where a card grid becomes a wall.

### Color

Dark only. Green phosphor has no honest light-mode equivalent, so there is no theme toggle.

Green is a three-stop scale, not a single color. A single-green interface is period-accurate and genuinely hard to read past a few lines.

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#0a0f0a` | Page background |
| `--green-bright` | `#3bf75e` | Prompts, links, caret, focus rings |
| `--green-text` | `#d3f9d8` | Primary text |
| `--green-dim` | `#6b9a72` | Metadata, dates, stack tags, secondary nav |
| `--rule` | `#1e3a22` | Hairline dividers |

All three text stops must meet WCAG AA against `--bg`. Contrast is verified in CI, not by eye.

### Typography

JetBrains Mono throughout, including case study bodies. Self-hosted, subset to woff2, `font-display: swap`.

Case study bodies are set at 15px, line-height 1.75, max width 70ch. Prose font is a single CSS variable, so switching bodies to a sans face later is a one-line change if long-form reading proves uncomfortable.

### Section headers

Section headers render as shell commands in `--green-bright`: `$ ls ./projects`, `$ ls ./experience`. This is the aesthetic's load-bearing device and should stay consistent rather than becoming decorative elsewhere.

### shadcn-svelte usage

The flat listing removes the need for Card and Badge. Components actually used:

- **Command** — `⌘K` palette for jump-to-project. The one component that reads as native on a terminal-styled site.
- **Sheet** — mobile navigation.
- **Button** — external links: LinkedIn, GitHub, email.
- **Tooltip** — abbreviations and stack tags.

Components are added via the shadcn-svelte CLI and then restyled to the green scale. Their defaults are a starting point, not the target look.

## Error handling

A static site has three real failure modes. Each has exactly one guard.

1. **Malformed or missing frontmatter.** Zod validation throws at build with the offending filename and the failing field. Broken content cannot reach production.
2. **A case study route with no backing file.** Structurally impossible — the route list is derived from the files themselves.
3. **A mistyped URL.** Custom `+error.svelte` renders `zsh: no such file or directory: /foo` in character, with links back to `/` and `/projects`.

## Accessibility

Non-negotiable despite the aesthetic.

- AA contrast on all three green stops, asserted in CI.
- Visible `focus-visible` rings in `--green-bright`.
- Directory listings marked up as `<ul>`, not grids of divs. The visual grid is presentation only.
- Skip-to-content link.
- `prefers-reduced-motion` disables the blinking caret.
- The `$` prompt glyphs are decorative and hidden from screen readers.

## Testing

Scoped to where the logic actually is. The content layer is the only part of this codebase with behavior worth asserting.

**Vitest — content layer**

- Valid frontmatter parses; each required field, when missing, fails with a message naming the file.
- Projects sort by date descending.
- Year grouping emits the year only on the first entry of each year.
- Empty-body detection: body present, body absent, whitespace-only body.
- A project with neither body nor `repo` fails validation.
- Stack tag extraction returns a deduplicated, sorted list across all projects.

**Vitest — contrast**

The three green text stops are asserted against `--bg` by computing WCAG relative luminance from the token values in `src/lib/styles/tokens.ts`, which is the single source the CSS imports. Failing AA fails the build. This is a numeric assertion, not a visual review.

**Playwright — smoke**

- Every prerendered route returns 200.
- No console errors on any route.
- Nav and the `⌘K` palette navigate correctly.
- A known-bad URL renders the custom 404.

**CI** — `svelte-check`, ESLint, Prettier.

No component-level unit tests. For markup this simple they would cost more than they catch.

## Build and deploy

- `prerender = true` in the root layout. Output is plain HTML.
- Cloudflare Pages, building from the repo on push. Custom domain `henrykhoanguyen.com`.
- `_headers` sets immutable caching on hashed assets.
- Per-page `<title>` and meta tags, prerendered `sitemap.xml`, `robots.txt`.
- No RSS feed. There is no blog.

## Content inventory

Sourced from the LinkedIn profile export (authoritative for dates and titles), the public resume PDF, and the GitHub profile.

**Experience**

- H-E-B, Austin TX — Software Engineer, May 2024 – present. Current role. Data streaming continuing the GM line of work, backend services and APIs, and warehouse-side data work in BigQuery and SQL. Specific outcome bullets to be supplied by Khoa; the LinkedIn entry carries none.
- General Motors, Austin TX — Software Engineer, Strategic Incubation Office, Jan 2021 – May 2024. Java, Akka, and Apache Pulsar streaming supporting communication for over 13 million vehicles. Redis and Cassandra to cut microservice latency. Azure CI/CD with Kubernetes and Docker, +5% delivery efficiency. Spring Boot streaming features for cross-functional testing, −25% time to production readiness. Ubuntu Linux infrastructure build and migration. Incident-handling training contributing to four nines.
- UCI Medical Center, Irvine CA — Web Developer, Oct 2020 – Jan 2021. Radiology department site on PHP and WordPress; A/B tested layouts.
- UC Irvine — BS Computer Science.

De Anza College CS Lab Assistant (2015–2018) is omitted. It predates the professional record by six years and dilutes a recruiter-facing timeline.

The resume PDF and LinkedIn disagree on graduation timing (March 2020 versus 2017–2019). Khoa confirms the correct value before it is published; the site states one date.

**Projects at launch** — all three are written case studies. Two have no repo link.

1. *Vehicle data streaming platform* (GM) — Java, Akka, and Apache Pulsar carrying telemetry for 13 million vehicles. Redis in front of Cassandra to cut latency. Metrics, dashboards, and alerting supporting four-nines operation.
2. *Spring Boot streaming test harness* (GM) — UDP streaming and Avro-over-Pulsar extending end-to-end test coverage across services. Azure CI/CD with Docker into Kubernetes. 500,000 messages per second with configurable throughput; cut time to production readiness 25%.
3. *German Football Data Analyzer* (personal) — the one public repo worth keeping. Angular, Node, Express, MongoDB, CSV parsing into a REST API. The sole open-source entry.

A fourth case study from H-E-B is strongly desirable, since the two strongest entries are otherwise from a previous employer and a recruiter reads that as work that stopped in 2024. The BigQuery and SQL work is the best candidate: it is the only warehouse-side material in the inventory, and it covers the "data engineering" half of the target roles that the GM streaming work does not. Pending material from Khoa.

## Positioning

Hero tagline positions Khoa as a backend engineer with streaming depth. This is deliberately broader than "streaming engineer" — it keeps generalist backend roles in play — while still leading with the differentiator rather than the LinkedIn headline's "Java | Full Stack," which undersells the strongest material.

The tagline lives in `about.md` frontmatter and is the single place this positioning is expressed. It is not duplicated in page copy.

## Resume handling

The site hosts no resume PDF. The footer and `/about` link to LinkedIn instead. This removes the drift that left the published PDF two years stale, at the cost of not handing recruiters a file.

**`/Khoa_Nguyen_Resume.pdf` must not 404.** That URL is live today and may appear on already-submitted applications. A `_redirects` entry maps it to the LinkedIn profile with a 302. A 302 rather than 301 keeps the path reusable if a hosted resume returns later.

**Deliberately excluded.** The remaining 35 GitHub repos are pre-2021 MEAN-stack and bootcamp-era work — SpotifyBrowser, Ionic_Sleeper, mern_shopping_list, movies-website, KCSearchEngine. They misrepresent a streaming and data engineering candidate and are omitted rather than listed. The GitHub profile link in the footer remains, so nothing is hidden.

The `german_football` Heroku demo URL on the resume is dead, since Heroku removed free dynos in late 2022. Do not carry it into `demo`. Either omit the field or point it at a working deployment.

## Publishing guardrail

Case studies describe employer work. Content is limited to what Khoa has already published himself — the LinkedIn profile and the previously public resume: architecture at the level of named public technologies, and metrics already stated there. No internal system names, no proprietary configuration, no unpublished figures, no customer or fleet data. Those two documents are the ceiling.

This applies with extra care to H-E-B, the current employer, where nothing has been published yet. Its bullets and case study come from Khoa directly and are his call to publish.

## Launch scope

Ships with three written case studies, since the strongest material has nothing to link to:

- Three project files, each with a complete body. Two carry no `repo` or `demo`.
- `about.md` complete, including tagline, skills, and footer links.
- Experience files for H-E-B, General Motors, and UCI Medical Center.
- `_redirects` mapping the old resume PDF path to LinkedIn.

Writing the case studies is the critical path, not the build. Further projects are added afterward, one file at a time, with no code changes.

One content blocker must clear before launch: H-E-B role bullets, since the current position cannot ship empty. The fourth H-E-B case study is not a blocker but should follow quickly.

## Deferred

Out of scope for v1, recorded so they are not silently reintroduced: blog and RSS, tag pages, per-project OG image generation, view counters, light mode, search beyond the `⌘K` palette.
