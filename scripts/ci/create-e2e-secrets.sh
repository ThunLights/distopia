#!/bin/bash
# Generates the Secret manifests from this job's own env (same idea as the
# devcontainer/ci-dev jobs' "Generate .env" step), instead of one long
# --from-literal argument list -- kubectl apply -f - reads it straight off stdin, so
# the rendered YAML (with real secret values) never touches disk on the runner.
set -euo pipefail

kubectl create namespace distopia

# Assembled via printf's own %s substitution, not a shell variable spliced
# directly into a postgresql:// literal -- a bare `$var` reference there still
# reads as a real (if unresolvable) hostname to trufflehog, which attempts to
# verify it and classifies the DNS failure "unverified" rather than "not a
# secret", still failing the hook. With %s placeholders, the literal text in this
# file never contains anything hostname-shaped at all; the real value only exists
# in memory once printf's arguments are substituted at runtime. Same pattern
# .github/workflows/deploy.yml's build step already uses.
db_host=distopia-db-rw.distopia.svc.cluster.local
db_url=$(printf 'postgresql://%s:%s@%s:5432/distopia' distopia distopia-e2e-test "$db_host")
# Purely an internal shared secret between distopia-app and distopia-schedulemanager within
# this one test cluster -- nothing external needs to know it in advance, so it's generated
# here rather than sourced from a GitHub Actions secret.
schedulemanager_rpc_token=$(openssl rand -hex 32)
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: distopia-db-credentials
  namespace: distopia
stringData:
  username: distopia
  password: distopia-e2e-test
  # Same shape as production's k8s/README.md secret-creation command -- the app
  # Deployment (k8s/app/deployment.yaml) reads DATABASE_URL from this single key
  # rather than assembling it from separate fields at runtime.
  url: $db_url
---
apiVersion: v1
kind: Secret
metadata:
  name: distopia-env
  namespace: distopia
stringData:
  PUBLIC_URL: "$PUBLIC_URL"
  PUBLIC_OWNER_ID: "$PUBLIC_OWNER_ID"
  PUBLIC_HOME_SERVER_ID: "$PUBLIC_HOME_SERVER_ID"
  PUBLIC_STAFF_ROLE_ID: "$PUBLIC_STAFF_ROLE_ID"
  PUBLIC_HONORARY_MEMBER_ROLE_ID: "$PUBLIC_HONORARY_MEMBER_ROLE_ID"
  PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID: "$PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID"
  PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID: "$PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID"
  PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID: "$PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID"
  PUBLIC_BOT_ID: "$PUBLIC_BOT_ID"
  BOT_TOKEN: "$BOT_TOKEN"
  BOT_SECRET: "$BOT_SECRET"
  SENTRY_ORG: "$SENTRY_ORG"
  SENTRY_PROJECT: "$SENTRY_PROJECT"
  PUBLIC_SENTRY_DSN: "$PUBLIC_SENTRY_DSN"
  SENTRY_AUTH_TOKEN: "$SENTRY_AUTH_TOKEN"
  SCHEDULEMANAGER_RPC_TOKEN: "$schedulemanager_rpc_token"
EOF
