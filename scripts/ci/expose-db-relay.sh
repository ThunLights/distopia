#!/bin/bash
# The runner (bun install/prisma migrate/docker build) still needs to reach postgres
# from OUTSIDE the cluster -- see e2e-prod's job-level comment in ci.yml for why NodePort
# doesn't work here. Connect a hostNetwork relay directly to the pod's own IP (not the
# Service), so this step's correctness never depends on the ClusterIP check earlier in
# that job -- an ordinary OS-level port bind and pod-to-pod CNI routing, nothing
# kube-proxy has to program.
set -euo pipefail

DB_POD_IP="$(kubectl get pod distopia-db-1 -n distopia -o jsonpath='{.status.podIP}')"
echo "distopia-db-1 pod IP: $DB_POD_IP"

kubectl run distopia-db-relay -n distopia \
  --image=alpine/socat \
  --restart=Never \
  --overrides='{"spec":{"hostNetwork":true,"dnsPolicy":"ClusterFirstWithHostNet"}}' \
  -- "TCP-LISTEN:30432,fork,reuseaddr" "TCP:${DB_POD_IP}:5432"

echo "Waiting for the relay pod to be ready..."
timeout 60 bash -c '
  until kubectl wait --for=condition=Ready pod/distopia-db-relay -n distopia --timeout=10s 2>/dev/null; do
    sleep 3
  done
'

echo "DATABASE_URL=postgresql://distopia:distopia-e2e-test@127.0.0.1:30432/distopia" >> "$GITHUB_ENV"

# A real Postgres protocol exchange (not just a TCP connect) confirms the relay
# genuinely forwards to postgres, not just that something is listening on the port.
sudo apt-get update -y >/dev/null && sudo apt-get install -y --no-install-recommends postgresql-client >/dev/null
echo "Waiting for the relay to actually proxy a real Postgres handshake through to the pod..."
timeout 60 bash -c '
  until PGCONNECT_TIMEOUT=3 pg_isready -h 127.0.0.1 -p 30432 -U distopia -d distopia; do
    sleep 3
  done
'
