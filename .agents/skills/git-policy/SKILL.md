---
name: git-policy
description: Guardrail for every git/GitHub write operation. Never run `git commit`, `git push`, or `gh pr create` unless the user explicitly invoked the open-pr or auto-commit-and-push skill in the current message. Use whenever you are about to commit, push, or open a PR, or the user asks in plain language to commit, push, ship, merge, "reflect" (反映), or save changes to git.
version: 1.0.0
---

# Git Policy

## Commit/push requires an explicit command

**Never run `git commit` or `git push` (or `gh pr create`/`gh pr merge`) unless the user's
current message explicitly invokes one of these skills:**

| Skill | Claude Code | Codex | Does |
|---|---|---|---|
| open-pr | `/open-pr` | `$open-pr` | commit, push, open/update a PR |
| auto-commit-and-push | `/auto-commit-and-push` | `$auto-commit-and-push` | commit and push only, no PR |

Plain-language approval is **not** enough — "commit and push this", "反映してください",
"yes go ahead", "ship it" all count as plain language. When asked that way, do not act;
tell the user which of the two commands to invoke instead.

An earlier invocation does not carry forward. Each commit/push needs its own fresh
invocation in the message that asks for it.

Read-only git/gh commands (`git status`, `git diff`, `git log`, `gh pr view`, `gh api` GETs)
are always fine.

## Always, even when a command is invoked

- Stage files by name. Never `git add -A` / `git add .`.
- Check `git status` for secrets, `.env` files, and stray build output before committing.
- If the repo uses Changesets (a `.changeset/` directory) and the change affects a published
  package, add a changeset (`.changeset/<name>.md`) in the same commit. Skip it for changes
  that don't need a release (docs, CI, tests only). If the bump would be `major`, ask the
  user to confirm before committing.
- Never force-push, amend published commits, or skip hooks (`--no-verify`) unless the user
  explicitly asks.
- Never push directly to the default branch (`main`/`master`).
- If a hook fails or can't run in the current environment (e.g. it needs a devcontainer),
  report it. Don't fall back to a path that skips the hook.
- Never delete, overwrite, or `git checkout --`/`git restore`/`git clean` gitignored or
  uncommitted files (`.env` especially) — there's no history to recover them from.
