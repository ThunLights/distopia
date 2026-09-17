---
name: conventional-commits
description: Conventional Commits format as actually used in distopia's git history — types and scopes
---

# Conventional Commits

This repo follows [Conventional Commits](https://www.conventionalcommits.org/) by convention
— there is **no `commitlint` or CI check enforcing the format**; `.husky/pre-commit` only runs
secret scanning (`trufflehog` + `gitleaks`), not a message linter. Consistency comes from
everyone (human and agent) following the same pattern, not from tooling. See also
`CLAUDE.md`'s Git Commit/Push Policy for *when* a commit/push is allowed to happen at all —
this doc is only about message *format*.

## Format

```text
<type>[(scope)]: <short imperative summary>

[optional body — explain WHY, not WHAT; the diff already shows what changed]

[optional footer, e.g. Co-Authored-By]
```

- Summary in imperative mood ("add", "fix", "update" — not "added"/"fixes"), under ~70 chars.
- Scope is optional and freeform in this repo — usually a package short name or a feature
  area, not a strictly enforced list. Observed in `git log`: `bot`, `web`, `core`, `command`,
  `owner`, `logger`, `docker`, `deps`, `ci`, `graph`, `record`, `svelte`, `run.sh`.
- Body explains *why* — see `CLAUDE.md`'s "Doing tasks" guidance on this repo's commit style
  more generally (concise, why-focused, no trailing restatement of the diff).

## Types actually used here (ranked by frequency in `git log`)

| Type | Meaning | Notes |
|---|---|---|
| `fix` | Bug fix | Most common type in this repo |
| `feat` | New feature | Second most common |
| `chore` | Maintenance, no source behavior change | Includes dependency/tooling upkeep |
| `chore(deps)` | Dependency version bump | Dependabot and manual bumps alike |
| `refactor` | Code change with no behavior change | |
| `perf` | Performance improvement | |
| `docs` | Documentation only | |
| `ci` | CI/CD pipeline changes | |
| `style` | Formatting-only change | Rare here — usually `format`/lint auto-fixes aren't committed as their own type |

`debug` has appeared once in history as an ad hoc type (a temporary log-level bump for
troubleshooting). It isn't part of the Conventional Commits spec — prefer `fix`/`chore`/`ci`
for anything intended to stay; only reach for a non-standard type like this for genuinely
temporary, clearly-labeled diagnostic commits.

No `!` (breaking-change) marker or `BREAKING CHANGE:` footer has been used in this repo's
history — there's no established convention for it here. If you do introduce a real breaking
change, `type!: summary` with a `BREAKING CHANGE: <explanation>` footer is the spec-correct
way to flag it.

## Footer: `Co-Authored-By`

Commits made via `/open-pr` or `/auto-commit-and-push` end with:

```text
Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

This is appended automatically by those commands — see
`.claude/commands/open-pr.md`/`.claude/commands/auto-commit-and-push.md`. Don't add it to
commits made outside that flow.
