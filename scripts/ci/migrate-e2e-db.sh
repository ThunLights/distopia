#!/bin/bash
# The relay being reachable a moment ago doesn't guarantee it still is a few seconds
# later (bun install alone takes ~7s) -- retry rather than assume the first real
# connection attempt succeeds just because the previous step's probe did.
set -eu

bun install --frozen-lockfile
cd src/infrastructure/database

for attempt in 1 2 3 4 5; do
  if bunx prisma migrate deploy; then
    exit 0
  fi
  echo "migrate deploy attempt $attempt failed, retrying in 5s..." >&2
  sleep 5
done
exit 1
