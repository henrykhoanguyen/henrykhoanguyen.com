# Deploy runbook — henrykhoanguyen.com

Target: Cloudflare Pages, static output, custom domain `henrykhoanguyen.com`.

**This is a cutover, not a first deploy.** The domain is registered at Namecheap
and currently serves a GitHub Pages site. That site keeps serving until step 6d,
and every step before it is reversible.

The one-paragraph version: push to a new GitHub repo, let Cloudflare build it and
verify the result on a `pages.dev` URL, move the nameservers from Namecheap to
Cloudflare while the old site carries on serving, and only then point the domain
at the new project. Two things can genuinely hurt — DNSSEC left enabled during
the nameserver move, and `MX` records not carried across — and both are called
out in step 6.

---

## 1. Preflight

All of this runs locally and must be green before anything leaves your machine.

```bash
npm install
npm run check          # svelte-check: 0 errors
npm run lint           # prettier + eslint
npm run test:unit -- --run   # 230 unit tests
npm run test:e2e       # playwright smoke suite
npm run build          # must emit build/
```

`test:e2e` installs browsers on first run and builds the site itself before
starting, so it takes a few minutes cold. It covers the parts of the site that
only exist in a browser — the boot sequence and its replay rules, skill
highlighting, the palette, the exit sequence, and the stack filter with
JavaScript disabled. Those are also the parts most likely to break silently,
since a broken animation still returns HTTP 200.

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
- [ ] Read the one-line `summary` on each role in
      `src/content/experiences/*.md`. These are the only words about your jobs
      that appear on the home page, so they carry more weight than their length
      suggests — and you said you would revisit them.
- [ ] Check the `skills` list in `src/content/about.md`. Every entry is a claim a
      recruiter may ask you to defend, and hovering one highlights exactly where
      you say you used it.

Everything else that could be improved is in `docs/TODO.md` and is not a launch
blocker — including the home page skills row, which currently shows more than the
curated list on `/about`.

## 3. Push to GitHub

Create a **new, empty** repository named `henrykhoanguyen.com` — no README, no
`.gitignore`, no licence, since this repo already has commits and GitHub's
initial files would collide.

Deliberately not the existing `henrykhoanguyen.github.io`. Keeping them separate
means the old site keeps serving, untouched, right up until DNS moves — which is
what makes every step before the cutover reversible.

```bash
git remote add origin git@github.com:henrykhoanguyen/henrykhoanguyen.com.git
git push -u origin master
```

Public or private are both fine; Cloudflare can read either.

## 4. Create the Cloudflare Pages project

Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.

| Setting                | Value                                      |
| ---------------------- | ------------------------------------------ |
| Framework preset       | SvelteKit _(or None)_                      |
| Build command          | `npm run build`                            |
| Build output directory | `build`                                    |
| Root directory         | _(leave blank)_                            |
| Node version           | 22 — read from `.nvmrc`, already committed |

If the build fails on Node version, set an environment variable
`NODE_VERSION = 22` explicitly and rebuild.

## 5. Verify on the pages.dev URL — before touching DNS

This is the step that makes the cutover safe. Cloudflare gives you
`<project>.pages.dev` immediately. Your real domain is still untouched.

Pages and content:

- [ ] Home, `/projects`, `/experiences`, `/about`, and all four case studies load.
- [ ] `/projects/tag/pub-sub` loads — this is the slug that would break first if
      tag slugification regressed.
- [ ] A made-up path shows `zsh: no such file or directory`.
- [ ] `/sitemap.xml` and `/robots.txt` return content.
- [ ] View source on any page: exactly one `<link rel="canonical">`.
- [ ] `/Khoa_Nguyen_Resume.pdf` redirects to LinkedIn.

The interactive layer — none of it is exercised by a plain page load, and all of
it depends on client JavaScript that only runs on the deployed bundle:

- [ ] The boot sequence plays once on first load: skills, then experiences, then
      projects, then the hero. Any key, click, or scroll skips it.
- [ ] Reload the tab — it plays again. Click `← cd ~` from a subpage — it does
      not. Click the header prompt — it does.
- [ ] Hover a skill: unrelated rows dim. Click one: it stays. Click dead space:
      it clears.
- [ ] `⌘K` opens the palette; typing `retail` then Enter navigates. The badge is
      clickable too.
- [ ] Type `exit` in the palette: the logout sequence plays, the nav and footer
      go with it, and `click to restore` brings the site back.
- [ ] The login banner shows a plausible date and sits directly above the prompt.
      First visit has nothing to compare against, so open a private window to see
      what a stranger sees.
- [ ] The header prompt reads `proj@henrykhoanguyen ~/retail-data-platform` on a
      case study, and `home@…  ~` on the home page.

The one thing to check with JavaScript disabled: every page still renders its
content, including the listings and the stack filter, since those are real
prerendered routes rather than client-side state.

The canonical tags and sitemap will point at `henrykhoanguyen.com` rather than
`pages.dev`. That is correct and needs no change.

## 6. Move DNS from Namecheap to Cloudflare

You cannot skip this. Cloudflare Pages will attach a _subdomain_ from any DNS
provider via a CNAME, but an **apex domain must be a Cloudflare zone** — which
means the nameservers move. `henrykhoanguyen.com` is an apex domain.

The move splits cleanly into two halves, and keeping them apart is what makes
this safe:

- **6a–6c change who answers DNS.** The site still serves from GitHub Pages
  throughout. Nothing about the website changes.
- **6d switches the website over**, entirely inside the Cloudflare dashboard,
  and is reversible in seconds.

Do not do them in one sitting if you are rushed. Stopping after 6c leaves you in
a perfectly stable state.

### 6a. Inventory what Namecheap is serving today

Namecheap → Domain List → Manage → **Advanced DNS**. Screenshot the whole record
table. This is your rollback reference and it takes ten seconds.

Look specifically for:

- **`MX` records, and any `TXT` record starting `v=spf1`.** If mail for this
  domain goes anywhere — Namecheap email forwarding, Google Workspace, Zoho —
  it is these records that make it work. Nameservers moving without them
  copied across means mail stops, silently, and you find out when someone tells
  you weeks later that their email bounced. This is a bigger risk than the
  website.
- **`TXT` verification records** for Google Search Console or similar. Cheap to
  copy, annoying to rediscover.
- **The GitHub Pages records themselves**, which you will recognise as `A`
  records to `185.199.108.153` through `185.199.111.153`, and probably a `www`
  `CNAME` to `henrykhoanguyen.github.io`.

### 6b. Add the zone to Cloudflare and check the import

Cloudflare dashboard → Add a domain → `henrykhoanguyen.com` → Free plan.

Cloudflare scans your current DNS and imports what it finds. **The scan is best
effort, not a guarantee.** Compare every row against your screenshot and add
anything missing by hand, before going any further.

Leave the GitHub Pages records exactly as they are for now — they are what keeps
the old site up during the switch.

Set the imported GitHub Pages records to **DNS only** (grey cloud, not orange).
Proxying a GitHub Pages origin while it serves its own certificate is the
classic cause of a redirect loop, and there is nothing to gain by proxying a
host you are about to stop using.

### 6c. Disable DNSSEC, then switch the nameservers

**Check Namecheap → Domain → Advanced DNS → DNSSEC first.** If it is enabled,
turn it off and wait for it to clear before changing nameservers. Moving
nameservers with a stale DNSSEC key in place does not degrade the site — it makes
the domain fail to resolve entirely, for everyone, with no error page to explain
it, and the fix has to propagate before anything recovers. This is the single
most damaging mistake available in this whole procedure.

Then: Namecheap → Domain List → Manage → **Nameservers** → **Custom DNS**, and
enter the two nameservers Cloudflare gave you. Save with the green checkmark.

Namecheap will say 24–48 hours. In practice it is usually under an hour.
Cloudflare emails you when the zone goes active.

While you wait, the site keeps serving from GitHub Pages, because the records
Cloudflare imported still point there. That is the intended state.

### 6d. Cut the website over

Only once the Cloudflare zone reads **Active**:

1. Cloudflare → DNS → Records. Delete the four GitHub Pages `A` records, any
   `AAAA` records alongside them, and the `www` `CNAME` to
   `henrykhoanguyen.github.io`. Leave `MX` and `TXT` records alone.
2. Workers & Pages → your project → **Custom domains** → **Set up a domain** →
   `henrykhoanguyen.com`. Cloudflare creates the record itself.
3. Repeat for `www.henrykhoanguyen.com`.

Add the custom domain through the Pages dashboard rather than writing a CNAME by
hand. A hand-written record that Pages has not been told about produces a
[`522` error](https://developers.cloudflare.com/pages/configuration/custom-domains/),
which looks like a server fault and is not one.

Certificates issue automatically, usually within about fifteen minutes. A
certificate warning inside that window is expected and not a sign of failure.

### 6e. Afterwards

Re-enable DNSSEC from the Cloudflare side (DNS → Settings → DNSSEC), which gives
you a `DS` record to paste back into Namecheap. Optional, and safe to do days
later once you are confident the site is stable.

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
- [ ] **Send yourself an email at any address on this domain**, if you have one.
      Mail is the thing a nameserver move breaks quietly, and the sooner you find
      out the less of it you lose.

Then close the loop in `docs/TODO.md`: remove the custom domain from the old
repository's GitHub Pages settings and delete its `CNAME` file. Leaving the claim
in place means a stray DNS change silently resurrects the old site rather than
failing loudly.

## 8. Rollback

Three different failures, three different answers. Work out which one you have
before touching anything.

**A bad deployment** — the site is up but wrong. Cloudflare Pages keeps every
build: Dashboard → Deployments → pick the last good one → Rollback. Immediate,
no rebuild.

**A bad cutover** — the domain is on Cloudflare but the Pages project is
misbehaving. Re-add the four GitHub Pages `A` records in Cloudflare DNS and
remove the custom domain from the Pages project. You are back on the old site in
minutes, and the nameservers do not need to move again.

**Nameservers pointed somewhere broken** — the worst case, and almost always
DNSSEC. Set Namecheap back to **Namecheap BasicDNS** and re-enter the records
from your 6a screenshot. Recovery is bounded by TTL rather than anything you can
speed up, which is exactly why 6a is a step rather than a suggestion.

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
