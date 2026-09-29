#!/bin/bash
# .husky/pre-commit runs trufflehog + gitleaks; install them here so a commit made later
# in the same job doesn't fail the hook. Pinned to the same versions as
# docker/dockerfile's TRUFFLEHOG_VERSION/GITLEAKS_VERSION ARGs (not `main`) -- see the
# Dependency Version Pins table in CLAUDE.md.
set -euo pipefail

curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/v3.96.0/scripts/install.sh | sh -s -- -b /usr/local/bin
git clone -b v8.30.1 --depth 1 https://github.com/gitleaks/gitleaks.git "$RUNNER_TEMP/gitleaks"
cd "$RUNNER_TEMP/gitleaks" && make build
sudo mv gitleaks /usr/local/bin
