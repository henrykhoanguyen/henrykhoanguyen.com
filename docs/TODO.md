# TODO

Deferred work, roughly in the order it is worth doing. Nothing here blocks
deploying — the launch gate is content sign-off in `docs/deploy.md`, not this
file.

## Content

- [ ] **Rewrite the one-line role summaries.** `src/content/experiences/*.md`,
      the `summary` field. These are the only words about each job that appear on
      the home page, so they carry more weight than their length suggests. You
      said you would take these yourself when time came; the current text is a
      placeholder that reads acceptably rather than well.

- [ ] **Decide what the home page skills row contains.** Two lists exist and they
      are built differently. `/about` renders the curated 16 in `about.md`. The
      home row is derived from every `stack` across your content, so it shows 23.
      The extra seven are `Angular`, `Express`, `MongoDB`, `Node.js`, `Oracle`,
      `PHP`, and `WordPress`, arriving from the football analyzer and the UCI
      role. Alphabetical order puts `Angular` second, which is a loud opening for
      a backend and data engineer.
      Three ways out, all cheap. Leave it, since the tags are true and the case
      studies carry the argument. Or trim `stack` in
      `german-football-analyzer.md` and `uci-medical-center.md` to what you would
      defend in an interview, which also shrinks the `/projects` stack filter,
      since it reads the same field. Or point the row at the curated list by
      swapping `getSkills()` for `getAbout().skills` in
      `src/routes/+page.server.ts` — that one costs you the guarantee that every
      chip highlights something, because the two lists would then drift
      independently.

- [ ] **Revisit the resume.** The site hosts no PDF; `/Khoa_Nguyen_Resume.pdf`
      302s to LinkedIn via `static/_redirects`. That was the right call while the
      old PDF still said "GM — Present". Once you have a current one, hosting it
      again is a two-line change, and recruiters do look for it.

## Testing

- [ ] **Run the full e2e suite and fix what it finds.** `npm run test:e2e`. The
      coverage for skill highlighting, intro replay, and the exit sequence was
      written but never executed — the sandbox could not download Playwright's
      browsers. Expect a selector or two to need adjusting on the first run. This
      is worth doing before the DNS cutover, not after.

## Cleanup after cutover

- [ ] **Retire the old GitHub Pages site.** Once Cloudflare serves the domain,
      remove the custom domain from the old repository's Pages settings and
      delete its `CNAME` file. Leaving the claim in place does no harm day to
      day, but it means a stray DNS change silently resurrects the old site
      instead of failing loudly.

## Someday

- [ ] Case study images or diagrams. The streaming architecture pieces would
      carry better with one diagram each, and the phosphor theme has no image
      treatment yet — worth designing deliberately rather than dropping in a PNG.
- [ ] More palette commands. `theme`, `help`, and a resume shortcut all fit the
      existing `PaletteAction` shape without new machinery.
