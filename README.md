# henrykhoanguyen.com

Personal site and portfolio. A green-phosphor terminal that renders a flat
directory listing rather than a grid of cards.

Built with SvelteKit 2 and Svelte 5, prerendered to static HTML, deployed to
Cloudflare Pages.

## Running it

```sh
npm install
npm run dev          # http://localhost:5173
```

| Command                      | What it does                                 |
| ---------------------------- | -------------------------------------------- |
| `npm run dev`                | Dev server                                   |
| `npm run build`              | Prerenders to `build/`                       |
| `npm run preview`            | Serves `build/` at http://localhost:4173     |
| `npm run check`              | `svelte-check`                               |
| `npm run lint`               | Prettier and ESLint                          |
| `npm run format`             | Rewrites with Prettier                       |
| `npm run test:unit -- --run` | Vitest                                       |
| `npm run test:e2e`           | Playwright — builds first, installs browsers |

## How it is put together

Every page is prerendered. There is no server at runtime, no database, and no
client-side data fetching — `npm run build` emits plain HTML that a static host
can serve, and the interactive parts enhance it once JavaScript loads.

**Content is Markdown.** Everything on the site comes from `src/content`:

```
src/content/
  about.md                 name, tagline, skills, links, bio
  experiences/*.md         one file per role
  projects/*.md            one file per project; a body makes it a case study
```

Frontmatter is validated with Zod at build time, so a missing or misspelled
field fails the build naming the file and the field rather than rendering a
half-empty page. Adding a project means adding a Markdown file — the listing,
the year grouping, the stack filter, the sitemap, and the command palette all
pick it up. `docs/deploy.md` has the details.

**The content layer is split by responsibility.** `src/lib/server/content.ts` is
the only module that reads the Markdown, and it lives under `$lib/server` so
SvelteKit refuses to let it reach the browser — otherwise the raw glob it uses
would ship every case study body to every visitor. Everything derived from that
data lives in `src/lib/content/` as pure functions, which is why most of the test
suite needs no DOM.

**Routes.**

| Route                 | Notes                                               |
| --------------------- | --------------------------------------------------- |
| `/`                   | Hero, featured projects, experience summary, skills |
| `/projects`           | Full listing, grouped by year                       |
| `/projects/[slug]`    | Case study, rendered from Markdown by mdsvex        |
| `/projects/tag/[tag]` | Stack filter — a real prerendered route per tag     |
| `/experiences`        | Full history with highlights                        |
| `/about`              | Bio and links                                       |
| `/404`                | Prerendered so a static host has a page to serve    |

The stack filter is a route rather than a query string because
`url.searchParams` cannot be read during prerendering. Each tag page carries a
canonical link back to `/projects`, so search engines are not asked to index
sixteen near-duplicates of one listing.

## The terminal parts

The theme is not only decoration; a few behaviours depend on it.

- **Boot sequence.** The home page assembles bottom-up on first load, hero last.
  It plays once per page load, replays when the header prompt is clicked, and
  does not replay when you arrive back via `← cd ~`. Any key, scroll, or click on
  empty space skips it. Clicking a link does not — finishing early would insert
  the rest of the page above the pointer and move the link out from under the
  click.
- **Command palette.** `⌘K` or `ctrl+K`, or the badge in the header. A native
  `<dialog>`, so focus trapping and Escape are the browser's job.
- **`exit`.** Type it in the palette for a logout sequence that takes the whole
  site with it, and a way back.
- **Skills.** Hovering a skill highlights the roles and projects that used it;
  clicking pins it so it survives the pointer leaving.

All of it respects `prefers-reduced-motion`, and none of it is load-bearing —
with JavaScript disabled every page still renders its content, including the
listings and the stack filter.

## Tests

Unit tests cover the content layer, which is where the logic is: sorting,
grouping, slugification, frontmatter validation, and the colour tokens' contrast
ratios. They are fast and need no browser.

The Playwright suite covers what unit tests structurally cannot — that the
prerendered pages exist, that nothing throws in a real browser, and that the
palette, the skills highlighting, the exit sequence, and the 404 behave when
driven by a real keyboard. It runs with `prefers-reduced-motion` by default, so
tests are not racing the boot animation; the handful that are actually about the
animation opt back in.

## Documentation

| File                      | What is in it                                |
| ------------------------- | -------------------------------------------- |
| `docs/deploy.md`          | Deploy runbook, DNS cutover, routine changes |
| `docs/TODO.md`            | Known gaps and deferred work                 |
| `docs/superpowers/specs/` | The design spec this was built from          |
| `docs/superpowers/plans/` | The implementation plan                      |
