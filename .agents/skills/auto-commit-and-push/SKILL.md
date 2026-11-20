---
name: auto-commit-and-push
description: Commit pending changes and push the current branch, without creating or updating a pull request. Runs only when the user explicitly invokes /auto-commit-and-push (Claude Code) or $auto-commit-and-push (Codex).
version: 1.0.0
disable-model-invocation: true
---

# Auto Commit and Push

Commit the currently staged/unstaged changes on this branch and push. Do not open or update
a pull request — that's what open-pr is for. Treat any text after the command as extra
instructions.

## Steps

1. **Sanity checks:**
   - Find the default branch: `gh repo view --json defaultBranchRef --jq .defaultBranchRef.name`
     (or `git symbolic-ref --short refs/remotes/origin/HEAD` without `gh`).
   - Confirm the current branch (`git branch --show-current`) is not the default branch. If it
     is, stop and tell the user to create a feature branch first.
   - Run `git status` and `git diff` (staged + unstaged) to see what will be committed.

2. **Stage deliberately.** Add specific files by name — never `git add -A` or `git add .`.
   Review `git status` for anything unexpected (secrets, stray build output, `.env` files)
   and inspect anything suspicious.

3. **Commit where the hooks run.** If the repo's pre-commit hook only works inside a
   container (e.g. it calls `sudo` or a tool installed only in the devcontainer), run
   `git commit` through that container. If that environment isn't running, say so — don't
   commit from the host and silently bypass the hook.

   Write a concise message focused on *why*, matching the repo's existing style
   (`git log` for examples). Append the co-author trailer your harness specifies, if any.

4. **Push:** `git push origin <branch>` (add `-u` only if it has no upstream yet).

5. Report the commit hash and branch. Don't run `gh pr create` or touch any PR — if a PR is
   wanted, tell the user to invoke open-pr.

## Notes

- Never force-push, amend published commits, or skip hooks (`--no-verify`) unless explicitly asked.
- Never push directly to the default branch.
- This invocation covers this one commit/push only — see the git-policy skill.
