#!/bin/bash
# Builds the same image .github/workflows/deploy.yml's build step builds, against this
# job's own kind-cluster database instead of deploy.yml's throwaway one. --network
# host lets `prisma generate --sql` reach the relay-exposed database above.
# Build-time-only .env (deleted before the runtime layer, same as the real pipeline) --
# BOT_TOKEN/PUBLIC_*/etc. are intentionally not in here, only what `bun run build`
# itself needs. SENTRY_AUTH_TOKEN is deliberately excluded too -- see
# docker/dockerfile.prod for why.
set -euo pipefail

cat > .env <<EOF
DATABASE_URL=$DATABASE_URL
SENTRY_ORG=$SENTRY_ORG
SENTRY_PROJECT=$SENTRY_PROJECT
PUBLIC_SENTRY_DSN=$PUBLIC_SENTRY_DSN
EOF
docker build --network host -f docker/dockerfile.prod \
  --build-arg GIT_SHA="${GITHUB_SHA::7}" -t distopia:e2e .
rm -f .env
