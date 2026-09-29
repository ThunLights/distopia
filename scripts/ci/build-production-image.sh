#!/bin/bash
# Build-time-only .env (see docker/dockerfile.prod's own comment): DATABASE_URL plus
# SENTRY_ORG/SENTRY_PROJECT for debug-ID injection. SENTRY_AUTH_TOKEN is never in here
# -- PUBLIC_SENTRY_DSN was never a build-time value either -- it's read via
# $env/dynamic/public at request time (hooks.client.ts/instrumentation.server.ts). App
# runtime secrets (BOT_TOKEN, PUBLIC_*, SENTRY_AUTH_TOKEN) are never written here -- see
# k8s/app/deployment.yaml, they're injected live into the Pod, never baked into the
# image.
#
# --network host (not docker/build-push-action's buildx, which builds in an isolated
# network namespace by default) so the build can actually reach the postgres service
# container on localhost -- same reasoning, same flag, as ci.yml's E2E job. Runs on
# every push and pull_request alike -- a Dockerfile/build regression should fail here,
# not surface for the first time on main.
#
# IMAGE_TAG_SHA/IMAGE_TAG_RUN_NUMBER come from the workflow's `Compute image tags` step
# outputs (deploy.yml passes them in via this step's `env:`, since a GitHub Actions
# `${{ steps.*.outputs.* }}` expression can only be substituted at the YAML level).
set -euo pipefail

cat > .env <<EOF
DATABASE_URL=$DATABASE_URL
SENTRY_ORG=$SENTRY_ORG
SENTRY_PROJECT=$SENTRY_PROJECT
EOF

docker build --network host -f docker/dockerfile.prod \
  --build-arg GIT_SHA="$IMAGE_TAG_SHA" \
  -t "ghcr.io/thunlights/distopia:${IMAGE_TAG_RUN_NUMBER}-${IMAGE_TAG_SHA}" \
  -t ghcr.io/thunlights/distopia:latest .
rm -f .env
