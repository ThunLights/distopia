---
description: Commit pending changes and open a pull request against main
---

Commit the currently staged/unstaged changes on this branch and open a pull request. Optional extra instructions: $ARGUMENTS

## Steps

1. **Sanity checks:**
   - Confirm the current branch is not `main` (`git branch --show-current`).
   - Run `git status` and `git diff` (staged + unstaged) to see what will be committed.
   - Run `git log main..HEAD --oneline` to see commits already ahead of `main`.
   - Check for an existing open PR on this branch: `gh pr list --head <branch> --state all --json number,title,url,state`. If one already exists and is open, push new commits to it instead of creating a duplicate.

2. **Stage deliberately.** Add specific files by name — never `git add -A` or `git add .`. Before committing, review `git status` for anything unexpected (secrets, stray build output, `.env` files) and double-check contents of anything suspicious.

3. **Commit inside the devcontainer, not on the host.** The pre-commit hook (`trufflehog` + `gitleaks` in `.husky/pre-commit`) calls `sudo`, which is disabled on the host — the commit will fail there. Run it through the container instead:

   ```bash
   cd docker
   docker compose exec app sh -c "cd /workspaces/distopia && git commit -m '<message>'"
   ```

   Write a concise commit message focused on *why*, following the repository's existing commit style (`git log` for examples). End it with:
   ```text
   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   ```

4. **Push** the branch: `git push origin <branch>` (add `-u` only if it has no upstream yet).

5. **Create (or update) the PR:**
   - New PR:
     ```bash
     gh pr create --base main --head <branch> --title "<title>" --body "$(cat <<'EOF'
     ## Summary
     - <bullet per logical change>

     ## Test plan
     - [ ] <verification steps actually run, e.g. typecheck/lint/build/tests>
     EOF
     )"
     ```
     Title under 70 characters. Summarize *all* commits ahead of `main`, not just the latest one.
   - Existing open PR: just push — `gh pr create` isn't needed again. Report the PR URL either way.

6. Return the PR URL to the user.

## Notes

- Never force-push, amend published commits, or skip hooks (`--no-verify`) unless explicitly asked.
- Do not push directly to `main`.
- If `docker compose exec app` fails because the devcontainer isn't running, say so — don't fall back to committing on the host, since that silently bypasses the secret-scanning hook.
