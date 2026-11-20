---
name: open-pr
description: Commit pending changes, push the current branch, and open (or update) a pull request against the default branch. Runs only when the user explicitly invokes /open-pr (Claude Code) or $open-pr (Codex).
version: 1.0.0
disable-model-invocation: true
---

# Open PR

Commit the currently staged/unstaged changes on this branch and open a pull request. Treat
any text after the command as extra instructions.

## Steps

1. **Sanity checks:**
   - Find the default branch: `gh repo view --json defaultBranchRef --jq .defaultBranchRef.name`.
   - Confirm the current branch (`git branch --show-current`) is not the default branch. If it
     is, stop and tell the user to create a feature branch first.
   - Run `git status` and `git diff` (staged + unstaged) to see what will be committed.
   - Run `git log <default>..HEAD --oneline` to see commits already ahead.
   - Check for an existing PR: `gh pr list --head <branch> --state all --json number,title,url,state`.
     If one is open, push to it instead of creating a duplicate.

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

5. **Create or update the PR:**
   - New PR:
     ```bash
     gh pr create --base <default> --head <branch> --title "<title>" --body "$(cat <<'EOF'
     ## Summary
     - <bullet per logical change>

     ## Test plan
     - [ ] <verification steps actually run>
     EOF
     )"
     ```
     Title under 70 characters. Summarize *all* commits ahead of the default branch, not
     just the latest.
   - Existing open PR: just push.

6. Return the PR URL.

## Notes

- Never force-push, amend published commits, or skip hooks (`--no-verify`) unless explicitly asked.
- Never push directly to the default branch.
- This invocation covers this one commit/push only — see the git-policy skill.
