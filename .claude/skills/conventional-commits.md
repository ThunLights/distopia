---
description: Conventional Commits format as actually used in distopia's git history — types, scopes, and the chore(deploy) prefix the CI pipeline parses
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
| `chore(deploy)` | **Reserved — see below, do not use manually** | Written only by the automated deploy pipeline |
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

## `chore(deploy):` is a reserved, machine-parsed prefix — never write it by hand

`k8s/ci/workflowtemplate.yaml`'s `clone` step checks the triggering commit's subject with a
literal prefix match:

```sh
case "$commit_message" in
  "chore(deploy):"*) echo true > /workspace/is-deploy-commit ;;
  *) echo false > /workspace/is-deploy-commit ;;
esac
```

When `is-deploy-commit` is `true`, the whole build/migrate/push/update-manifest chain is
**skipped** — this is the anti-loop guard that stops the deploy bot's own
`k8s/app/kustomization.yaml` image-tag-bump commit from re-triggering itself. It's written
automatically by the `update-manifest` step (`git commit -m "chore(deploy): bump distopia to
<short-sha>"`), never by a human or by Claude/Codex.

**If you (or an agent) manually write a commit starting with `chore(deploy):`, CI will treat
it as the bot's own commit and silently skip building/deploying it** — even though it's a
real, unbuilt change. Use `chore(deploy-config)`, `chore(k8s)`, or similar for any manual
change to deploy configuration instead.

## Footer: `Co-Authored-By`

Commits made via `/open-pr` or `/auto-commit-and-push` end with:

```text
Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

This is appended automatically by those commands — see
`.claude/commands/open-pr.md`/`.claude/commands/auto-commit-and-push.md`. Don't add it to
commits made outside that flow.
