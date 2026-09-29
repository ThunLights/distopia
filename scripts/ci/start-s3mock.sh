#!/bin/bash
# backup-cronjob.yaml's upload-r2 container reads distopia-db-r2-credentials, which in
# real production points at a Cloudflare R2 bucket -- there is no such secret here, so
# without this step the Job below would just sit in CreateContainerConfigError until
# the timeout. A real R2 bucket for CI would mean putting live cloud credentials in a
# GitHub secret and leaving test objects behind on every run; a throwaway S3Mock Pod
# inside this already-throwaway kind cluster exercises the exact same `aws s3 sync`
# command with no external dependency and nothing to clean up afterwards.
#
# adobe/s3mock, not MinIO -- confirmed directly: quay.io/minio/minio (the previous
# mock here) now 401s on an anonymous pull of any tag, the same way Docker Hub's
# minio/minio already did (see git blame on this step for that history) -- MinIO has
# locked down anonymous pulls everywhere, not just Docker Hub. adobe/s3mock is a
# dedicated S3-API test double (no real storage backend, in-memory), pulls
# anonymously, and needs no credentials at all -- COM_ADOBE_TESTING_S3MOCK_STORE_
# INITIAL_BUCKETS creates the bucket at startup, so the separate "create the bucket by
# hand" step this used to need against MinIO is gone too.
set -euo pipefail

cat <<'EOF' | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: distopia-r2-mock
  namespace: distopia
spec:
  replicas: 1
  selector:
    matchLabels: { app: distopia-r2-mock }
  template:
    metadata:
      labels: { app: distopia-r2-mock }
    spec:
      containers:
        - name: s3mock
          image: adobe/s3mock:5.2.3
          env:
            - name: COM_ADOBE_TESTING_S3MOCK_STORE_INITIAL_BUCKETS
              value: distopia-db-backup-test
          ports:
            - containerPort: 9090
          # Deployment "Available" only reflects the container starting, not
          # Spring Boot finishing startup (~4s) -- without this, the backup Job
          # below could start its upload before S3Mock is actually accepting
          # connections on 9090.
          readinessProbe:
            httpGet:
              path: /favicon.ico
              port: 9090
---
apiVersion: v1
kind: Service
metadata:
  name: distopia-r2-mock
  namespace: distopia
spec:
  selector: { app: distopia-r2-mock }
  ports:
    - port: 9090
      targetPort: 9090
EOF
kubectl wait --for=condition=Available deployment/distopia-r2-mock -n distopia --timeout=60s

# S3Mock ignores these values (no auth by default) -- the aws-cli in
# backup-cronjob.yaml's upload-r2 container still requires *some* access
# key/secret to be set, so these are dummy placeholders, not real credentials.
kubectl create secret generic distopia-db-r2-credentials -n distopia \
  --from-literal=access-key-id=distopia-ci \
  --from-literal=secret-access-key=distopia-ci-test \
  --from-literal=endpoint=http://distopia-r2-mock.distopia.svc.cluster.local:9090 \
  --from-literal=bucket=distopia-db-backup-test
