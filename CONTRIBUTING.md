# Contributing to henrykhoanguyen.com

`main` is protected. Agents never push to it directly. Every agent change
reaches `main` through a pull request that Khoa approves and merges. Khoa's own
account is the only one allowed to push to `main` directly.

This matters more here than in a private repo: Cloudflare Pages deploys from
`main`, so a merge is a publish.

## The rule

1. Branch off `main`.
2. Commit your work on that branch.
3. Push the branch and open a pull request.
4. CI runs on the pull request. Fix it until it is green.
5. Khoa reviews, approves and merges. Only Khoa can merge.

A direct push to `main` from any account other than Khoa's is rejected by the
server, so there is nothing to remember — the wrong move simply fails.

## Branch names

| Who              | Pattern                 | Example                     |
| ---------------- | ----------------------- | --------------------------- |
| Paperclip agents | `work/<task-id>-<slug>` | `work/kho-13-forgejo-ci`    |
| People           | `<name>/<slug>`         | `khoa/boot-sequence-timing` |

The task id ties the branch back to the Paperclip task that asked for the work.

## Before you open the pull request

Run what CI runs:

```sh
npm ci
npm run lint              # prettier --check . && eslint .
npm run check             # svelte-check
npm run test:unit -- --run
npm run build
npx playwright test       # after: npx playwright install chromium
```

`npm run format` fixes anything `npm run lint` complains about.

**On Windows, `npm run lint` fails on every file.** The clone has CRLF line
endings and Prettier expects LF, so all ~90 files are reported. It is not your
change. Check the real formatting with:

```sh
npx prettier --check --end-of-line auto .
```

CI runs on Linux with LF checkouts, so `npm run lint` there is the honest
answer.

## Node version

`.nvmrc` is the single source of truth. Cloudflare Pages reads it when it builds
the deploy, and CI reads it through `node-version-file`, so a green CI run is
evidence about the same Node the live site is built with. Change it in one place
and both follow.

## Commits

- One logical change per commit; a readable `git log` is the point.
- Subject in the imperative, under ~72 characters: `Fix palette focus trap`.
- Keep mechanical changes (a Prettier pass, a rename) in their own commit so the
  real change stays reviewable.
- Agent commits end with `Co-Authored-By: Paperclip <noreply@paperclip.ing>`.

## Pull requests

`.forgejo/PULL_REQUEST_TEMPLATE.md` fills in the shape: what changed, why, how to
check it, which checks you ran, and the rollback. Link the Paperclip task.

Anything that changes what a visitor sees should say so in words a reviewer can
check against the deploy preview.

## CI

`.forgejo/workflows/ci.yml` runs two jobs on every pull request and on `main`:

- **check** — `npm run lint`, `npm run check`, `npm run test:unit -- --run`, `npm run build`
- **e2e** — Playwright against a real preview build, Chromium only

The runner takes one job at a time, so the two run back to back rather than side
by side. Expect to wait.

If a job fails because nothing started — no runner registered, a download timed
out — that is infrastructure, not your change. Say so on the task rather than
bending the code to satisfy it, and never disable a check to get a merge.
