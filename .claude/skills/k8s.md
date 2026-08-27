---
description: Kubernetes/k3s manifests under k8s/, CloudNativePG, the self-hosted registry, and the kind-based e2e-prod CI job
---

# Kubernetes / k3s Guide

Production runs on a self-hosted **k3s** cluster. Everything under `k8s/` is applied by
Argo CD (see the `argo` skill for the GitOps pipeline itself) — this skill covers the
manifests, the database, and the CI job that exercises them in a throwaway `kind` cluster.
Full operational runbook: `k8s/README.md`.

## Directory Layout

| Path | Contents |
|---|---|
| `k8s/registry/` | Self-hosted `registry:2` (htpasswd auth), cluster-internal only, no Ingress |
| `k8s/db/` | CloudNativePG `Cluster` + `NetworkPolicy` + daily backup `CronJob` |
| `k8s/app/` | The app itself — `Deployment`/`Service`/`ConfigMap` |
| `k8s/ci/` | Argo Events + Argo Workflows pipeline resources (see `argo` skill) |
| `k8s/network/` | `hostNetwork` relay so the host's Cloudflare Tunnel can reach in-cluster Services via fixed loopback ports |
| `k8s/argocd/` | The five Argo CD `Application` objects |

Each directory is its own `kustomization.yaml` (no Helm anywhere in this repo).

## CloudNativePG (`k8s/db/`)

- `cluster.yaml`: `instances: 1` (no HA — a conscious tradeoff, not a bug; bumping to 3 is
  a one-line change). The Cluster CRD field is `spec.storage.storageClass`, **not**
  `storageClassName` (that's the plain PVC spec field name — confirmed via
  `kubectl explain cluster.spec.storage` against the real CRD, easy to get wrong).
- `bootstrap.initdb.secret` points at a **user-provided** secret
  (`distopia-db-credentials`), not CNPG's own auto-generated one — this is what makes the
  DB username/password configurable instead of random. `username` in that secret MUST
  match `cluster.yaml`'s `owner` field. This secret also carries a `url` key (see
  "DATABASE_URL convention" below) — an extra key CNPG simply ignores.
  CNPG's standard Service names for a `Cluster` named `distopia-db`:
  `distopia-db-rw` (primary, read-write), `distopia-db-ro` (replicas only, empty with
  `instances: 1`), `distopia-db-r` (any instance — prefer this for read-only workloads
  like backups, since it keeps working unchanged if `instances` is ever raised).
  Primary pod name: `distopia-db-1`.
- `backup-cronjob.yaml`: daily `pg_dump` onto its own PVC, 14-day retention. This is a
  **same-host** safety net (protects against bad migrations/accidental drops, not disk/node
  loss) — see `k8s/README.md`'s "Database backups" section for the restore procedure and
  why CloudNativePG's native `barmanObjectStore` (off-host WAL archiving + PITR) is the
  real follow-up once any S3-compatible storage is available.
- `networkpolicy.yaml` restricts CNPG to intra-namespace traffic — **not enforced** under
  k3s's default Flannel CNI without Calico/Cilium or similar. Don't rely on it for real
  isolation without confirming enforcement is active.

## DATABASE_URL convention

The app and every pipeline step that needs the database read `DATABASE_URL` as a **single
value** from `distopia-db-credentials`' `url` key via `secretKeyRef` — never composed from
separate `DB_USER`/`DB_PASSWORD`/`DB_HOST` fields at runtime. The value itself is composed
exactly once, by hand, when the secret is created (`k8s/README.md` section 2).

**Never assemble a full connection-string literal — scheme, credentials, and host all in
one contiguous piece of text — directly in a committed file** (manifest, script, doc),
even with placeholder credentials — trufflehog's Postgres detector matches that shape and
then actually attempts to verify it by connecting/resolving the host. A `127.0.0.1` host
gets recognized as local and skipped, but anything real-looking
(including a `*.svc.cluster.local` name, or even a bare `$var`/`${var}` reference sitting in
that position) gets a real DNS lookup attempt; the resulting failure is classified
"unverified" rather than "not a secret" and **still fails the pre-commit hook**. The
established safe pattern (used in both `k8s/ci/workflowtemplate.yaml` and
`k8s/README.md`) is to assemble the value with `printf`'s own `%s` substitution so the
literal text in the file never contains anything hostname-shaped:

```bash
db_host=distopia-db-rw.distopia.svc.cluster.local
db_url=$(printf 'postgresql://%s:%s@%s:5432/distopia' "$user" "$pass" "$db_host")
```

## App Deployment (`k8s/app/deployment.yaml`)

- `replicas: 1` is **load-bearing**, not a default — the app logs into the Discord gateway
  and runs in-process `node-cron` jobs itself, so a second concurrent instance causes
  duplicate event handling.
- `strategy: RollingUpdate` with `maxSurge: 1, maxUnavailable: 0` (not `Recreate`) — a
  brief window with two pods during rollout is accepted in exchange for zero downtime.
- Config sources: `distopia-config` ConfigMap (`PORT`, non-secret) via `envFrom`,
  `distopia-env` Secret (`BOT_TOKEN`, `PUBLIC_*`, `SENTRY_*`) via `envFrom`, and
  `DATABASE_URL` via its own `secretKeyRef` (see above) — the app reads all of it through
  `$env/dynamic/*` + `dotenv` at runtime, nothing baked into the image.
- No `Ingress`/`NodePort`/`LoadBalancer` anywhere — `k8s/app/service.yaml` is `ClusterIP`
  only, deliberately **not pinning `clusterIP`** (k3s's and kind's service CIDRs don't
  overlap, so a hardcoded address would break one or the other). Public traffic reaches it
  via a host-level Cloudflare Tunnel, through the loopback relay described below.

## Network Exposure (`k8s/network/tunnel-relay.yaml`)

A `hostNetwork: true` Deployment (two `alpine/socat` containers) that plain-binds two
fixed ports on the node's own loopback interface (`bind=127.0.0.1` — not reachable from
outside the node even without `ufw`'s help) and forwards to the real Services by their
normal cluster DNS names:

| Loopback port | Forwards to | For |
|---|---|---|
| `127.0.0.1:3095` | `distopia-app:3000` | `distopia.top` |
| `127.0.0.1:3096` | `github-eventsource-svc:12000` | `ci.distopia.top` |

The host's `cloudflared` config then just points at plain `localhost` ports
(`http://127.0.0.1:3095`, `http://127.0.0.1:3096`) — this avoids needing the host to
resolve `*.svc.cluster.local` itself (no `resolvectl`/systemd-resolved setup to keep
working across reboots). Since it forwards to Services, not a specific Pod IP, it keeps
working unmodified across normal rollouts.

## k3s-Specific Setup

- **Disable Traefik and ServiceLB** (`/etc/rancher/k3s/config.yaml`: `disable: [traefik,
  servicelb]`, then restart k3s). A `LoadBalancer` Service binds a host port regardless of
  whether any `Ingress` references it, and k3s (like Docker) manipulates `iptables`
  directly for `LoadBalancer`/`NodePort` in a way that bypasses `ufw` — this is *why* they
  must be disabled, not just left unused.
- k3s's default StorageClass is `local-path` — `k8s/db/cluster.yaml` and
  `k8s/registry/pvc.yaml` both reference it by that name directly.
- With Traefik/ServiceLB off and nothing in `k8s/` creating an Ingress/NodePort/
  LoadBalancer, `ufw default deny incoming` + `ufw allow 22/tcp` is fully accurate — no
  80/443 needed, since Cloudflare Tunnel only makes outbound connections.

## Registry (`k8s/registry/`)

Plain `registry:2` with htpasswd auth, `ClusterIP` only, no Ingress — pushed to only by
Kaniko (Argo Workflow) and pulled from only by the app Deployment's `imagePullSecrets`.
`REGISTRY_STORAGE_DELETE_ENABLED: "true"` is set, but there's **no garbage collection** —
every push adds a new `<short-sha>`-tagged image forever, so the 20Gi PVC will eventually
fill on a long-lived project. The readiness probe is TCP, not HTTP — `registry:2` requires
auth on every endpoint including `/v2/`, so a plain `httpGet` probe would see 401.

## Testing manifests in CI: the `e2e-prod` job

`.github/workflows/ci.yml`'s `e2e-prod` job deploys the **real, unmodified** `k8s/db` and
`k8s/app` manifests into a throwaway `kind` cluster (config: `.github/kind-config.yaml`) —
not a `docker run` approximation — so CI catches manifest-level bugs, not just
Dockerfile-level ones. Order: kind cluster → alias kind's `standard` StorageClass as
`local-path` → install the CNPG operator → create namespace/secrets → `kubectl apply -k
k8s/db` → wait for the DB pod → **verify ClusterIP Service routing works** (see below) →
expose the DB externally for `bun install`/`prisma migrate deploy`/`docker build` → build
the production image → `kind load docker-image` → `kubectl apply -k k8s/app` → expose the
app externally → run the real Playwright E2E suite (`test:e2e:prod`) against it.

### Known-broken things in this environment (don't re-discover them)

Getting the database reachable from the **runner** (outside the cluster) went through
several failed approaches before landing on the current fix — this list exists so the next
change here doesn't re-walk the same path:

1. **`kubectl port-forward`** — its SPDY tunnel is unreliable under `kind` on
   GitHub-hosted runners: it accepts one connection fine, then resets the very next one
   with "connection reset by peer", reproducibly (confirmed via real CI log evidence, not
   a rare flake).
2. **A `NodePort` Service reached via `kind`'s `extraPortMappings` hostPort
   (`127.0.0.1`)** — even with a correct selector and a real, ready `Endpoints` address, a
   genuine Postgres protocol probe (`pg_isready`) got "no response" indefinitely. A bare
   TCP `connect()` "succeeding" there is a false positive — Docker's own proxy/DNAT can
   complete the handshake without ever handing bytes through to the actual backend.
3. **The same NodePort via the kind node container's own Docker bridge IP** instead of
   `127.0.0.1` (to rule out hairpin-NAT specifically) — identical failure.
4. Inspecting the node directly settled it: `docker exec <node> iptables -t nat -L
   KUBE-NODEPORTS` was **completely empty** — kube-proxy in this `kind`+GitHub Actions
   environment does not program NodePort DNAT at all (a version-specific
   nftables/iptables-legacy backend mismatch is the leading suspect; the exact root cause
   doesn't change the fix).

**The fix**: bypass kube-proxy and Kubernetes Services entirely for anything the runner
needs to reach. A tiny `hostNetwork: true` pod (`alpine/socat`) does a plain OS-level port
bind on the node and forwards straight to a target pod's own IP (`kubectl get pod ... -o
jsonpath='{.status.podIP}'`) — an ordinary process bind and pod-to-pod CNI route, neither
of which depend on kube-proxy. `kind`'s `extraPortMappings` (the one part of this stack
that has worked reliably throughout) then publishes that node port out to the runner. This
same pattern is used twice: once for the database (port 30432) and once for the deployed
app (port 3000, since there's deliberately no NodePort/Ingress on `k8s/app/service.yaml`,
matching production's Cloudflare-Tunnel-only exposure model).

The one thing **not** routed around: the deployed app itself connects to Postgres via the
normal ClusterIP Service DNS name baked into its `DATABASE_URL`, exactly like real
production. The "Verify in-cluster Service routing works" step probes that specific path
early (`kubectl run ... --image=postgres:17-alpine --command -- pg_isready -h
distopia-db-rw ...`) and fails fast with a clear message if it's broken, instead of a
confusing rollout timeout several minutes later.

### Other gotchas hit while building this job

- **`kubectl wait` errors immediately** with "not found" if the target resource doesn't
  exist yet — it does not wait for creation, only for a condition on an already-existing
  object. Right after `kubectl apply`, the operator/controller often hasn't created the
  pod yet. Always wrap it in a retry loop:
  ```bash
  timeout 180 bash -c '
    until kubectl wait --for=condition=Ready pod/x -n ns --timeout=10s 2>/dev/null; do
      sleep 3
    done
  '
  ```
- A Kubernetes `Endpoints`/`EndpointSlice` object can be non-empty while containing only
  `notReadyAddresses` — checking `.subsets` alone is a false positive; check
  `.subsets[*].addresses` specifically if you ever need to gate on real readiness.
- `kubectl exec ... pg_isready` only proves postgres itself answers inside the container —
  it says nothing about the pod's Kubernetes `Ready` **condition**, which is what actually
  gates Service endpoint publication. Use `kubectl wait --for=condition=Ready` when the
  thing you actually depend on is Service routing, not raw process liveness.

## Common Commands

```bash
# Watch rollout status
kubectl rollout status deployment/distopia-app -n distopia

# Force a re-rollout after rotating a Secret (no image change needed)
kubectl rollout restart deployment/distopia-app -n distopia

# Check CNPG cluster health
kubectl get cluster distopia-db -n distopia
kubectl exec -n distopia distopia-db-1 -c postgres -- pg_isready

# Dump diagnostics
kubectl get all -n distopia
kubectl describe pod -n distopia -l app.kubernetes.io/name=distopia-app
kubectl logs -n distopia deployment/distopia-app --tail=200
kubectl get events -n distopia --sort-by=.lastTimestamp

# Render a kustomization locally without applying
kustomize build k8s/app
```
