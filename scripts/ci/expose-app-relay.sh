#!/bin/bash
# Same rationale as the database relay (scripts/ci/expose-db-relay.sh): kubectl
# port-forward is unreliable here, and there's no NodePort/Ingress on this Service by
# design (k8s/app/service.yaml is ClusterIP-only, matching real production's
# Cloudflare-Tunnel-only exposure model).
set -euo pipefail

APP_POD_IP="$(kubectl get pod -n distopia -l app.kubernetes.io/name=distopia-app -o jsonpath='{.items[0].status.podIP}')"
echo "distopia-app pod IP: $APP_POD_IP"

kubectl run distopia-app-relay -n distopia \
  --image=alpine/socat \
  --restart=Never \
  --overrides='{"spec":{"hostNetwork":true,"dnsPolicy":"ClusterFirstWithHostNet"}}' \
  -- "TCP-LISTEN:3000,fork,reuseaddr" "TCP:${APP_POD_IP}:3000"

echo "Waiting for the relay pod to be ready..."
timeout 60 bash -c '
  until kubectl wait --for=condition=Ready pod/distopia-app-relay -n distopia --timeout=10s 2>/dev/null; do
    sleep 3
  done
'

echo "Waiting for the relay to actually proxy a real HTTP response through to the app..."
timeout 60 bash -c 'until curl -sf http://127.0.0.1:3000/ -o /dev/null; do sleep 3; done'
