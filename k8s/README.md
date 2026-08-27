# distopia GitOps pipeline (Argo CD + Argo Workflows + Argo Events + CloudNativePG)

Operational runbook for everything under `k8s/`. This is applied to your own k3s cluster
by you — nothing here is applied automatically by me.

## What's here

| Path | Argo CD Application | Contents |
|---|---|---|
| `k8s/registry/` | `distopia-registry` | Self-hosted `registry:2`, cluster-internal only |
| `k8s/db/` | `distopia-db` | CloudNativePG `Cluster` (replaces the docker-compose Postgres) + a daily `pg_dump` backup `CronJob` |
| `k8s/app/` | `distopia-app` | The app itself (`Deployment`/`Service`/`ConfigMap`) |
| `k8s/ci/` | `distopia-ci` | Argo Events (`EventBus`/`EventSource`/`Sensor`) + Argo Workflows (`WorkflowTemplate`) that build, migrate, and deploy on every push to `main` |
| `k8s/network/` | `distopia-network` | `hostNetwork` relay so the host's Cloudflare Tunnel can reach `distopia-app`/the webhook `EventSource` via loopback ports you choose yourself |

Nothing here ever pushes an image to an external registry (no ghcr.io, no Docker Hub) —
build and push both happen inside the cluster, against `registry:2`, which has no Ingress
and is not reachable from outside the cluster.

## 0. Prerequisites (cluster-level, not managed by this repo)

Argo CD, Argo Workflows, Argo Events, and the CloudNativePG operator must already be
installed cluster-wide. Install commands for these were relayed separately in chat rather
than committed here, since they're one-time cluster bootstrap, not app-specific config.
In short: Argo Workflows and Argo Events need to be installed in **cluster** (not
namespace-scoped) mode so they pick up the `WorkflowTemplate`/`EventSource`/`Sensor`
resources living in the `distopia` namespace below.

**Also disable k3s's built-in Traefik and ServiceLB.** Public traffic reaches this cluster
exclusively through a host-level Cloudflare Tunnel (see "Cloudflare Tunnel and network
exposure" below) — nothing here should ever bind a host-facing port, and k3s's default
Traefik does exactly that (a `LoadBalancer` Service on 80/443) regardless of whether any
`Ingress` object references it. If your k3s install already has Traefik running, disable
both:

```bash
# /etc/rancher/k3s/config.yaml
disable:
  - traefik
  - servicelb
```

then `systemctl restart k3s` (adjust for however k3s was installed/is managed on this
host). This repo doesn't create any `Ingress`/`LoadBalancer`/`NodePort` resources, so once
Traefik/ServiceLB are off, nothing in this cluster can bind a public port at all.

## 1. Bootstrap order

```bash
# 1. Everything lives in one namespace.
kubectl create namespace distopia

# 2. Create the secrets below (section 2) BEFORE syncing anything. This matters more than
#    it looks: distopia-db-credentials specifically MUST exist before distopia-db's
#    Cluster first initializes -- bootstrap.initdb.secret is only read once, at cluster
#    creation, so creating it late means CloudNativePG has already generated (and will
#    keep using) its own random password instead.

# 3. Register the five Argo CD Applications.
kubectl apply -k k8s/argocd

# 4. distopia-app will show "Degraded"/ImagePullBackOff at first -- expected, there is no
#    image in the registry yet. Trigger one build by hand:
argo submit -n distopia --from workflowtemplate/distopia-build-deploy \
  -p revision=$(git rev-parse HEAD)

# 5. Once that Workflow finishes (`argo watch -n distopia @latest`), distopia-app will
#    have a real image tag committed to k8s/app/kustomization.yaml and Argo CD will sync
#    it automatically. From here on, every push to main does this for you.
```

## 2. Secrets to create by hand (none of these are committed)

```bash
# --- registry ---
htpasswd -Bbn <registry-user> <registry-password> > /tmp/htpasswd
kubectl create secret generic distopia-registry-htpasswd -n distopia \
  --from-file=htpasswd=/tmp/htpasswd

# Used both by Kaniko (push) and by the app Deployment's imagePullSecrets (pull) --
# same registry, same credentials, so one secret covers both.
kubectl create secret docker-registry distopia-registry-pull -n distopia \
  --docker-server=distopia-registry.distopia.svc.cluster.local:5000 \
  --docker-username=<registry-user> \
  --docker-password=<registry-password>

# --- app runtime config -- injected as live env vars into the Pod (k8s/app/deployment.yaml
# envFrom), never baked into the image. DATABASE_URL is not in here -- see
# distopia-db-credentials below. ---
kubectl create secret generic distopia-env -n distopia \
  --from-literal=PUBLIC_URL='https://distopia.top' \
  --from-literal=PUBLIC_OWNER_ID='...' \
  --from-literal=PUBLIC_HOME_SERVER_ID='...' \
  --from-literal=PUBLIC_STAFF_ROLE_ID='...' \
  --from-literal=PUBLIC_HONORARY_MEMBER_ROLE_ID='...' \
  --from-literal=PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID='...' \
  --from-literal=PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID='...' \
  --from-literal=PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID='...' \
  --from-literal=PUBLIC_BOT_ID='...' \
  --from-literal=BOT_TOKEN='...' \
  --from-literal=BOT_SECRET='...' \
  --from-literal=SENTRY_ORG='thunlights' \
  --from-literal=SENTRY_PROJECT='distopia-ci' \
  --from-literal=PUBLIC_SENTRY_DSN='...' \
  --from-literal=SENTRY_AUTH_TOKEN='...'

# --- DB credentials -- your own choice of username/password (equivalent to the old
# docker/.env's DB_USER/DB_PW), given to CloudNativePG's Cluster (k8s/db/cluster.yaml) as
# bootstrap.initdb.secret so it doesn't auto-generate its own. `username` MUST match
# cluster.yaml's `owner` field (default "distopia"). Create this BEFORE the distopia-db
# Application first syncs -- bootstrap.initdb only runs once, at cluster creation.
#
# `url` is the single DATABASE_URL value both the app (k8s/app/deployment.yaml) and the
# Workflow's migrate/prepare-env steps read directly, composed here by hand rather than at
# runtime -- host/port/dbname are always distopia-db-rw.distopia.svc.cluster.local:5432/
# distopia (CloudNativePG's standard read-write Service name for a Cluster named
# distopia-db). Assembled with printf's own %s substitution rather than spliced directly
# into a postgresql:// literal -- a `$var`/`${var}` reference sitting there still reads as
# a real (if unresolvable) hostname to some secret scanners, which attempt to verify it and
# flag the DNS failure as "unverified" rather than "not a secret". ---
db_password='<choose a password>'
db_host=distopia-db-rw.distopia.svc.cluster.local
db_url=$(printf 'postgresql://%s:%s@%s:5432/distopia' distopia "$db_password" "$db_host")
kubectl create secret generic distopia-db-credentials -n distopia \
  --from-literal=username='distopia' \
  --from-literal=password="$db_password" \
  --from-literal=url="$db_url"

# --- pipeline ---
kubectl create secret generic distopia-github-webhook -n distopia \
  --from-literal=secret="$(openssl rand -hex 20)"

# Fine-grained GitHub PAT scoped to ONLY the thunlights/distopia repo, permission
# "Contents: Read and write", nothing else. Used solely by the update-manifest step to
# push the image-tag bump commit. A dedicated bot account (rather than a personal PAT)
# is recommended so the commit author is unambiguous, but not required.
kubectl create secret generic github-push-token -n distopia \
  --from-literal=token='<fine-grained PAT>'

# --- network relay (see "Cloudflare Tunnel and network exposure" below) -- pick two
# loopback ports of your own choosing. Never share these two specific numbers anywhere
# outside your own server config (not in an issue, a commit, chat, etc.) -- this repo is
# public, and unlike a real credential these can't be rotated after the fact if leaked. ---
kubectl create secret generic distopia-tunnel-relay-config -n distopia \
  --from-literal=app-port='<port for distopia.top, your choice>' \
  --from-literal=ci-port='<port for ci.distopia.top, your choice>'
```

`DATABASE_URL` is read as a single value everywhere it's needed — `k8s/app/deployment.yaml`
and `workflowtemplate.yaml`'s `migrate`/`prepare-env` steps all read `distopia-db-credentials`'
`url` key directly via `secretKeyRef`, rather than assembling it from separate `username`/
`password`/host fields at runtime. The composition happens exactly once, above, when you
create the secret by hand — if you ever change the password, update both `password` and
`url` together (they'd otherwise silently drift apart).

The container's listening port also comes from a plain (non-secret) `distopia-config`
ConfigMap — `k8s/app/configmap.yaml`, `PORT: "3000"` — equivalent to the old
`docker/.env`'s `PROD_PORT`. `@sveltejs/adapter-node` reads `PORT` directly. Changing it
means updating that ConfigMap **and** `containerPort`/`service.yaml`'s `targetPort` to
match (plain Kubernetes YAML can't cross-reference a ConfigMap value into another
manifest's field the way `docker-compose`'s `${PROD_PORT:-3000}` could).

## 3. Register the GitHub webhook

`k8s/ci/eventsource.yaml` runs in manual mode (no GitHub API token given to the cluster),
so register the webhook yourself:

1. GitHub repo → Settings → Webhooks → Add webhook
2. Payload URL: `https://ci.distopia.top/push` — whatever public hostname you point at
   this EventSource in your Cloudflare Tunnel config (see "Cloudflare Tunnel and network
   exposure" below); adjust if you used a different hostname
3. Content type: `application/json`
4. Secret: the same value you put in `distopia-github-webhook`'s `secret` key above
5. "Which events would you like to trigger this webhook?" → Just the `push` event
6. Active: checked

## 4. One-time data migration from the docker-compose Postgres

Do this after `distopia-db`'s `Cluster` is `Ready` (`kubectl get cluster distopia-db -n
distopia`) but before pointing traffic at the new app (i.e. before step 4 of the bootstrap
above, or by re-running the migration Workflow step against fresh data if you do it after).

```bash
# 1. Dump from the existing container (see docker/docker-compose.yml for its name/creds).
docker exec distopia-db pg_dump -U user -d distopia --format=custom -f /tmp/distopia.dump
docker cp distopia-db:/tmp/distopia.dump ./distopia.dump

# 2. Copy into the new cluster's primary pod (CNPG names it <cluster-name>-1).
kubectl cp ./distopia.dump distopia/distopia-db-1:/tmp/distopia.dump

# 3. Restore, remapping ownership from the old "user" role to the new "distopia" role
#    that CloudNativePG's initdb.owner created.
kubectl exec -n distopia distopia-db-1 -- \
  pg_restore -U distopia -d distopia --no-owner --role=distopia /tmp/distopia.dump

# 4. Sanity check.
kubectl exec -n distopia distopia-db-1 -- psql -U distopia -d distopia -c '\dt'
```

Once confirmed, the old `docker compose` Postgres container/volume can be decommissioned.

## 5. Faster Argo CD sync (optional)

Argo CD polls git every ~3 minutes by default. For near-instant syncs after the
update-manifest step pushes, add a second GitHub webhook pointed at Argo CD's own
`/api/webhook` endpoint (see Argo CD's docs for the exact payload URL/secret for your
install) — this is independent of the Argo Events webhook above and not required for
correctness, just latency.

## 6. Database backups

`k8s/db/backup-cronjob.yaml` runs a daily `pg_dump` (custom format, same shape as the
one-time migration dump above) onto its own PVC (`distopia-db-backup-data`), pruning dumps
older than 14 days. This is a minimal safety net against operational mistakes (a bad
migration, an accidental `DROP TABLE`, application bugs) — it is **not** protection against
losing the node/disk, since that PVC almost certainly lives on the same local-path storage
as the database's own PVC on a single-node host. Once you have any S3-compatible object
storage available, prefer CloudNativePG's native `.spec.backup.barmanObjectStore` on the
`Cluster` instead (continuous WAL archiving + point-in-time recovery, off this host) and
retire this CronJob.

To restore from one of these dumps, first spin up a temporary pod with the backup PVC
mounted (there's no long-running Pod for it otherwise — CronJobs only run one on schedule):

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: distopia-db-backup-browse
  namespace: distopia
spec:
  containers:
    - name: browse
      image: busybox
      command: ["sleep", "3600"]
      volumeMounts:
        - name: backup-data
          mountPath: /backup
  volumes:
    - name: backup-data
      persistentVolumeClaim:
        claimName: distopia-db-backup-data
EOF

kubectl exec -n distopia distopia-db-backup-browse -- ls /backup   # find the dump you want
kubectl cp distopia/distopia-db-backup-browse:/backup/distopia-<timestamp>.dump ./restore.dump
kubectl delete pod distopia-db-backup-browse -n distopia

kubectl cp ./restore.dump distopia/distopia-db-1:/tmp/restore.dump
kubectl exec -n distopia distopia-db-1 -- \
  pg_restore -U distopia -d distopia --clean --no-owner --role=distopia /tmp/restore.dump
```

## Cloudflare Tunnel and network exposure

Public traffic (the site, the GitHub webhook) reaches this cluster exclusively through a
**host-level `cloudflared`** (running as its own systemd service alongside whatever else
this host publishes through Cloudflare Tunnel — not managed by this repo). `cloudflared`
only ever makes an **outbound** connection to Cloudflare's edge; it needs no inbound port
opened at all. Combined with Traefik/ServiceLB being disabled (see section 0), **nothing in
this cluster binds a host-facing port, ever** — `ufw`'s "22 only" policy is fully accurate
and doesn't need 80/443 opened at all, since Cloudflare Tunnel doesn't use them.

```bash
ufw default deny incoming
ufw allow 22/tcp
ufw enable
```

k3s (like Docker) manipulates iptables directly for `LoadBalancer`/`NodePort` Services in a
way that bypasses `ufw` — that's *why* Traefik/ServiceLB must be disabled rather than just
left unused; a `LoadBalancer` Service sitting idle still binds the host port regardless of
whether any `Ingress` sends it traffic. With them off and no `NodePort`/`LoadBalancer`
anywhere in `k8s/`, there's nothing left for that bypass to apply to.

### Pointing cloudflared at this cluster

`k8s/network/tunnel-relay.yaml` (Argo CD Application `distopia-network`) runs a small
`hostNetwork` Deployment that plain-binds two loopback ports on the node — whichever ones
you chose when creating `distopia-tunnel-relay-config` (section 2 above) — and forwards to
`distopia-app`/the webhook `EventSource` by their normal cluster DNS names. This avoids
needing the host to resolve `*.svc.cluster.local` itself (no `resolvectl`/systemd-resolved
setup to keep working across reboots).

Point the host's existing `cloudflared` config at whichever two loopback ports you chose:

```yaml
# in the host's cloudflared config.yml, alongside its other sites
ingress:
  - hostname: distopia.top
    service: http://127.0.0.1:<the app-port you chose>
  - hostname: ci.distopia.top
    service: http://127.0.0.1:<the ci-port you chose>
  - service: http_status:404
```

**Do not commit, post, or otherwise publish the two actual port numbers anywhere** —
this repo is public, and unlike a real credential a leaked port number can't be rotated
after the fact the same way (traffic to it is still just loopback-only, but there's no
reason to hand out the specific numbers either). Keep them only in your own
`cloudflared` config and in the `distopia-tunnel-relay-config` Secret on your server.

Each port is bound with socat's `bind=127.0.0.1` option specifically, so neither is
reachable from outside the node even without `ufw`'s help — this is defense-in-depth on
top of "22 is the only allowed inbound port" already covering it. The relay always
forwards to the Services (not a specific Pod IP), so it keeps working unmodified across
normal rollouts — only re-check anything here if you rename either Service.

`k8s/registry/networkpolicy.yaml` and `k8s/db/networkpolicy.yaml` additionally restrict the
registry and CloudNativePG to intra-namespace traffic only, as defense-in-depth beyond "no
Service exposes them." **This requires a NetworkPolicy-enforcing CNI** — k3s's default
Flannel does not enforce `NetworkPolicy` (the resource applies but has no effect) unless
you install Calico, Cilium, or similar. If you're relying on these policies for real
isolation, confirm enforcement is active rather than assuming from the manifest alone.

## Notes / known constraints

- `replicas: 1` is load-bearing, not just a default — the app logs into the Discord
  gateway and runs in-process `node-cron` jobs itself (`hooks.server.ts`), so a second
  concurrent instance causes duplicate event handling. `k8s/app/deployment.yaml` uses
  `RollingUpdate` with `maxSurge: 1, maxUnavailable: 0` (zero-downtime, brief overlap
  during rollout accepted) rather than `Recreate`.
- No app secret is ever baked into the image or the registry. The app reads its runtime
  config (`BOT_TOKEN`, `PUBLIC_*`, `DATABASE_URL`, ...) via `$env/dynamic/*` + `dotenv`
  (see `hooks.server.ts`), resolved fresh every time the container starts from the env vars
  `k8s/app/deployment.yaml` injects (`distopia-env` Secret, `distopia-config` ConfigMap,
  `distopia-db-credentials`) — the same mechanism also picks up a plain mounted `.env` file
  if you'd rather run the image that way (e.g. local `docker run` testing), since `dotenv`
  never overrides a value that's already set in the real environment. `bun run build` still
  needs a *separate*, build-time-only `.env` (just `DATABASE_URL` + `SENTRY_*`, written by
  the Workflow's `prepare-env` step) purely because `prisma generate --sql` needs to
  introspect a real database at build time — that file is deleted before the runtime image
  layer is created and never contains `BOT_TOKEN`/`PUBLIC_*`.
- Rotating `distopia-env`, `distopia-db-credentials`, or the registry secrets takes effect
  on the **next Pod restart** (`kubectl rollout restart deployment/distopia-app -n
  distopia`) — no rebuild needed, unlike before. `bunx prisma migrate deploy` (used
  standalone, not via `bun run setup`) is the only thing that still needs a rebuild-time
  action if you change DB credentials, since the Workflow's `migrate`/`prepare-env` steps
  read `distopia-db-credentials` too.
- `distopia-db`'s and `distopia-registry`'s Argo CD Applications (`k8s/argocd/app-db.yaml`,
  `app-registry.yaml`) run with `prune: false`, unlike `distopia-app`/`distopia-ci`. Both own
  stateful data (the CNPG `Cluster` and its PVC; the registry's image-storage PVC) — an
  accidental removal of either manifest from git should show up as "OutOfSync" for someone
  to look at, not silently delete a live database or the entire image history. Pruning those
  two, if you ever actually want to, is a deliberate `argo cd app sync <name> --prune`.
- The Workflow's steps (`k8s/ci/workflowtemplate.yaml`) all carry resource requests/limits
  now, most importantly `build-push` (Kaniko, the heaviest one) — tune them to your actual
  host's capacity; too tight a limit gets a step OOMKilled mid-run rather than just slower.
