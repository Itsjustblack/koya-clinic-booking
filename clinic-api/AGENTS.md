# Scope

Do only what I approve or ask for. Don't go past it — no extra fixes, no follow-on changes, no cleanup of things you notice along the way. If you see something worth doing beyond the current ask, name it and the trade-offs, then wait for me to say go.

# Writing

These govern every body of text you write or return: replies in the terminal, docs, comments, commit messages, files you author. They do not govern code or technical terms. Swap in everyday words only where precision survives.

## Style

1. No worn metaphors or figures of speech — the ones already familiar from print. Fresh ones are fine.
2. Never use a long word where a short one will do.
3. Cut every word that carries nothing. Keep the ones that carry rhythm or spare the reader a second pass.
4. Never use the passive where you can use the active.
5. Never use a foreign phrase, a scientific word or a jargon word if you can think of an everyday English equivalent.
6. Break any of these rules sooner than say anything outright barbarous.

## Explaining technical concepts

I am a junior full-stack developer. I know beginner-level full-stack dev, nothing about networking (ICE, STUN, TURN, sockets, protocols) or encryption/crypto (key exchange, hashing, SRTP, DTLS). Pitch every explanation of these topics at that level: plain language, simple analogies, define a term in beginner words the first time it comes up instead of assuming I know it. Keep it short — plain language, not padded length.

## Code comments

One line each. If a comment needs two lines, cut it down or leave it out — the code says the rest. No block comments spread over several lines, no multi-line JSDoc where a single `/** ... */` line does.

## Commits

Title only, no body. Start with a Conventional Commits prefix (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `build:`, `ci:`, `perf:`, `style:`) that matches the actual nature of the change — a bug fix is `fix:`, not `feat:`, even when the diff adds a parameter or branch. State what changed and why after the prefix. A reviewer should know what it does in one read.

Before:

```
feat: Implement comprehensive refactor of authentication module with robust error handling
```

After:

```
fix: retry auth on 401 instead of dropping the request
```

The first rates the work, leaves you guessing what it does, and uses the wrong prefix for a fix. The second names the type correctly, says what changed and why, and stops.

## Progress reports

When you answer a question or finish a task, reply in one paragraph: what changed, what failed, what comes next. Add a simple example or two so I can see what happened rather than just read a claim about it. No emoji checkmarks, no "Successfully", no "Perfect", no wall of bullets.

Don't rate the work, describe it. That rules out achievement language as a class, not just the usual offenders: comprehensive, robust, seamless, powerful, leverage, delve, it's worth noting.

Exemption: an explicit request for a list or a long write-up lifts these defaults, but only once you have judged the length genuinely necessary. The request is not automatic licence to pad.

## Pull requests (Quidax/QuidaxAdmin repos)

Repos under QuidaxAdmin gate PRs on a CI check (`pr-checklist.yml`, calling the reusable workflow in `quidax3-common-pipelines`). It validates the branch name, the PR title, and the PR body. Write every PR — and every `PR_DRAFT.md` — to pass all of the following before it goes up:

**Branch name** — one of:
- `(feature|bugfix|hotfix|chore)/<JIRA-KEY>-short-description`, where `<JIRA-KEY>` is a letter, then 1-9 more letters or digits, a hyphen, then digits (e.g. `MPE-715`), and `short-description` is strict kebab-case — lowercase letters, digits, hyphens only, no dots. A version like "2.0" in the description breaks this — write it as "v2" or "2-0" instead.
- `release/v<major>.<minor>.<patch>` — three numeric parts exactly (e.g. `release/v1.2.3`), not any free-form version string.

This gate only runs on branches cut from `main`; branches cut from `develop` skip it.

**PR title** — must match `<JIRA-KEY>: short description`, e.g. `MPE-715: implement payment retries`. This is the PR title format, separate from the Conventional Commits prefix used for individual commit titles (see Commits above) — the two follow different rules, don't conflate them.

**PR body** — must not be empty, and must contain a JIRA key (in title or body) matching a letter, 1-9 letters/digits, a hyphen, then digits.

**Required sections** — the body needs all of these as real markdown headings (`#` through `######`, e.g. `## Summary`) with non-empty content under each. Bold text or a trailing colon instead of a `#` heading does not count as a section:
- Summary
- Reason for Change — its own section, separate from Summary even if the reasoning overlaps; don't fold it in when trimming a PR description for length
- JIRA — must contain a direct link in the form `https://quidax.atlassian.net/browse/<JIRA-KEY>`
- Testing
- Steps to Reproduce
- Deployment Notes
- QA Approval — exactly one of `- [x] QA approved` or `- [x] QA not required` checked; never both, never neither
- Backward Compatibility — exactly one of `- [x] No breaking changes` or `- [x] Breaking changes (explain below)` checked; when "Breaking changes" is checked, add a real explanation below it (15+ characters) — the checkbox line alone isn't enough

## Git

Never push directly to `develop` or `main`. Every change goes through a ticket or PR branch (`feature|bugfix|hotfix|chore/<JIRA-KEY>-short-description`), even for small fixes.

## PR drafts

Write every PR draft as a Markdown file in the repo — `PR_DRAFT.md` at the repo root — so I can open and edit it. Never stage or commit that file.

# Quidax codebases

## SQL

In any Quidax codebase, always qualify a table name with its database: `exchange.user`, not `user`. The codebase spans several databases, and a bare table name is ambiguous.

Before you change a query, run `EXPLAIN` on it. Check which index it uses, and whether that still holds at scale, not just on a small test table.

# Dev servers

Kill any test or dev server you start once you are done with it. A background instance left running can hold the port and swallow requests meant for a server I start myself, hiding my own logs from me.

---

Check every prose output against these rules before sending.
