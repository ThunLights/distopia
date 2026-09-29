#!/bin/bash
# k8s/db/kustomization.yaml deploys the backup CronJob alongside the Cluster, but a
# CronJob just sits there waiting for its schedule -- deploying it here was never
# actually exercising the backup logic itself. Manually trigger one Job from it (same
# thing `kubectl create job --from=cronjob/...` does for an on-demand production run)
# and wait for it to actually succeed, so a change to backup-cronjob.yaml's script or
# DB_HOST (see its own comments for why that's distopia-db-rw, not -r) gets caught here
# instead of only being discovered against real production data.
set -euo pipefail

kubectl create job --from=cronjob/distopia-db-backup distopia-db-backup-test -n distopia
timeout 120 bash -c '
  until [ "$(kubectl get job distopia-db-backup-test -n distopia -o jsonpath="{.status.succeeded}")" = "1" ]; do
    if [ "$(kubectl get job distopia-db-backup-test -n distopia -o jsonpath="{.status.failed}")" = "1" ]; then
      echo "backup job failed" >&2
      exit 1
    fi
    sleep 3
  done
'
kubectl logs -n distopia job/distopia-db-backup-test
