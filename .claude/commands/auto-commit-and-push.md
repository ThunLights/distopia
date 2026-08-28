---
description: Commit pending changes and push the current branch — no PR creation
---

Commit the currently staged/unstaged changes on this branch and push. Do not open or update a pull request as part of this command — use `/open-pr` for that. Optional extra instructions: $ARGUMENTS

## Steps

1. **Sanity checks:**
   - Confirm the current branch is not `main` (`git branch --show-current`). If it is `main`, stop and tell the user — create a feature branch first rather than committing here.
   - Run `git status` and `git diff` (staged + unstaged) to see what will be committed.

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

5. Report what was committed and pushed (commit hash + branch). Do not run `gh pr create` or otherwise touch any PR here — if a PR is also wanted, tell the user to invoke `/open-pr` separately (or invoke it yourself only if they ask for that in the same request).

## Notes

- Never force-push, amend published commits, or skip hooks (`--no-verify`) unless explicitly asked.
- Do not push directly to `main`.
- If `docker compose exec app` fails because the devcontainer isn't running, say so — don't fall back to committing on the host, since that silently bypasses the secret-scanning hook.
