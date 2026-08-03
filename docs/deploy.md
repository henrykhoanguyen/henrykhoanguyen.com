# Deploy runbook — henrykhoanguyen.com

Target: Cloudflare Pages, static output, custom domain `henrykhoanguyen.com`.

**This is a cutover, not a first deploy.** The domain already serves something —
`henrykhoanguyen.com/Khoa_Nguyen_Resume.pdf` resolves today. Whatever is there
now keeps serving until DNS changes, which is the last step and the only
irreversible-feeling one. Everything before it is safe.

---

## 1. Preflight

All of this runs locally and must be green before anything leaves your machine.

```bash
npm install
npm run check          # svelte-check: 0 errors
npm run lint           # prettier + eslint
npm run test:unit -- --run   # 144 unit tests
npm run test:e2e       # playwright smoke suite
npm run build          # must emit build/
```

Then look at it as a visitor would:

```bash
npm run preview        # serves build/ at http://localhost:4173
```

Note: `_redirects` and `_headers` do nothing in local preview. They are
Cloudflare features and only take effect once deployed.

## 2. Content sign-off

The only gate a machine cannot check.

- [ ] Read all four case studies end to end.
- [ ] **Read the H-E-B case study and role bullets specifically.** They describe
      a current employer, were drafted from notes rather than published material,
      and are prose published in your name. You are the only person who can
      decide what is publishable.
- [ ] Confirm the metrics you are comfortable stating: 13 million vehicles, four
      nines, 500,000 messages/sec, 20–50ms, roughly 20 minutes, 25%, 5%, 30%.
- [ ] Confirm graduation reads 2019 and that this matches LinkedIn.

## 3. Push to GitHub

```bash
git remote add origin git@github.com:henrykhoanguyen/henrykhoanguyen.com.git
git push -u origin master
```

Make the repo public if you want the "source" link to work; private is fine
otherwise, Cloudflare can read either.

## 4. Create the Cloudflare Pages project

Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.

| Setting | Value |
| --- | --- |
| Framework preset | SvelteKit *(or None)* |
| Build command | `npm run build` |
| Build output directory | `build` |
| Root directory | *(leave blank)* |
| Node version | 22 — read from `.nvmrc`, already committed |

If the build fails on Node version, set an environment variable
`NODE_VERSION = 22` explicitly and rebuild.

## 5. Verify on the pages.dev URL — before touching DNS

This is the step that makes the cutover safe. Cloudflare gives you
`<project>.pages.dev` immediately. Your real domain is still untouched.

- [ ] Home, `/projects`, `/about`, and all four case studies load.
- [ ] `⌘K` opens the palette; typing `retail` then Enter navigates.
- [ ] `/projects/tag/pub-sub` loads — this is the slug that would break first if
      tag slugification regressed.
- [ ] A made-up path shows `zsh: no such file or directory`.
- [ ] `/sitemap.xml` and `/robots.txt` return content.
- [ ] View source on any page: exactly one `<link rel="canonical">`.
- [ ] `/Khoa_Nguyen_Resume.pdf` redirects to LinkedIn.

The canonical tags and sitemap will point at `henrykhoanguyen.com` rather than
`pages.dev`. That is correct and needs no change.

## 6. DNS cutover

Cloudflare Pages → your project → Custom domains → Set up a domain →
`henrykhoanguyen.com`.

**Before adding records, look at what is already there.** The domain currently
resolves somewhere — most likely GitHub Pages, given `henrykhoanguyen.github.io`
on your GitHub profile. Removing the old records is part of this step; leaving
them alongside the new ones produces intermittent, confusing results where the
site works for some visitors and not others.

1. Note the existing `A` / `AAAA` / `CNAME` records for the apex and `www`.
2. Delete them.
3. Let Cloudflare add its own records for the Pages project.
4. Add `www.henrykhoanguyen.com` too, redirecting to the apex.

Propagation is usually minutes. TLS certificates issue automatically and can
take up to ~15 minutes; a certificate warning during that window is expected.

## 7. Post-cutover verification

```bash
curl -sI https://henrykhoanguyen.com | head -1                     # 200
curl -sI https://henrykhoanguyen.com/Khoa_Nguyen_Resume.pdf | head -3   # 302 → linkedin
curl -s  https://henrykhoanguyen.com/sitemap.xml | head -3
curl -sI https://henrykhoanguyen.com/_app/immutable/ -o /dev/null -w '%{http_code}\n'
```

- [ ] Load the site on a phone. The `⌘K` hint is hidden below `sm`; nav still fits.
- [ ] Run Lighthouse on `/` and one case study. Investigate anything under 95.
- [ ] Tab through the home page: the skip link is the first stop, focus rings are
      visible in green throughout.
- [ ] Submit `https://henrykhoanguyen.com/sitemap.xml` in Google Search Console.

## 8. Rollback

Cloudflare Pages keeps every deployment. Dashboard → Deployments → pick the last
good one → Rollback. It takes effect immediately and needs no rebuild.

If the problem is DNS rather than the build, restoring the previous records
returns you to the old site.

---

## Routine: adding a project later

No code changes needed.

1. Create `src/content/projects/<slug>.md`. The filename becomes the URL.
2. Frontmatter: `title`, `summary`, `stack`, `date` required; `featured`, `repo`,
   `demo` optional.
3. Body optional. **With** a body, `/projects/<slug>` is generated and the row
   links there. **Without** one, the row links straight to `repo` — and a project
   with neither fails the build rather than shipping a row that links nowhere.
4. `npm run build` to check, then push. Cloudflare deploys on push.

The project appears in the listing, the year grouping, the stack filter, the
sitemap, and the command palette automatically.

## Routine: changing a job

Edit `src/content/experiences/<company>.md`. To start a new role, add a file and
change the previous one's `end` from `present` to its final month. The listing
reorders itself by start date.
