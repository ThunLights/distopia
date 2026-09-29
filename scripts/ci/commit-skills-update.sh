#!/bin/bash
set -euo pipefail

if [ -z "$(git status --porcelain)" ]; then
  echo "No skill changes -- nothing to do."
  exit 0
fi

branch="chore/skills-update-${RUN_ID}"
git checkout -b "$branch"
git add skills-lock.json .agents .claude/skills
git commit -m "chore(skills): scheduled update via bunx skills" \
  -m "Co-Authored-By: claude[bot] <claude[bot]@users.noreply.github.com>"
git push -u origin "$branch"
gh pr create --base main --head "$branch" \
  --title "chore(skills): scheduled update" \
  --body "Automated \`bunx skills update\` run. Diff is whatever changed upstream in each installed skill's source repo since the last update -- review before merging."
