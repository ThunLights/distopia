# distopia GitOps pipeline (Argo CD + Argo CD Image Updater + CloudNativePG)

Operational runbook for everything under `k8s/`. This is applied to your own k3s cluster
by you — nothing here is applied automatically by me.

## What's here

| Path | Argo CD Application | Contents |
|---|---|---|
| `k8s/db/` | `distopia-db` | CloudNativePG `Cluster` (replaces the docker-compose Postgres) + a daily `pg_dump` backup `CronJob` |
| `k8s/redis/` | `distopia-redis` | Cluster-internal Redis (no auth), managed by `OT-CONTAINER-KIT/redis-operator`'s standalone `Redis` CRD with a PVC — persists which guild's TTS session is bound to which voice/text channel, so a rolling update's new pod can rejoin where the old one left off; see "TTS session persistence" below |
| `k8s/app/` | `distopia-app` | The app itself (`Deployment`/`Service`/`ConfigMap`); the `Application`'s annotations also drive Argo CD Image Updater |
| `k8s/network/` | `distopia-network` | `hostNetwork` relay so the host's Cloudflare Tunnel can reach `distopia-app` via a loopback port you choose yourself |

The build pipeline lives outside `k8s/` entirely now: `.github/workflows/deploy.yml` builds
the production image and pushes it to `ghcr.io/thunlights/distopia` on every push to `main`.
Nothing here builds or pushes an image — see "Shipping a new build" below.

## 0. Prerequisites (cluster-level, not managed by this repo)

Argo CD, Argo CD Image Updater, and the CloudNativePG operator must already be installed
cluster-wide. Install commands for these were relayed separately in chat rather than
committed here, since they're one-time cluster bootstrap, not app-specific config.

`OT-CONTAINER-KIT/redis-operator` (the CRD `k8s/redis/redis.yaml` depends on) also needs to
be installed cluster-wide, into its own `ot-operators` namespace — same "one-time bootstrap,
not app-specific config" posture as the operators above:

```bash
helm repo add ot-helm https://ot-container-kit.github.io/helm-charts/
helm repo update
helm install redis-operator ot-helm/redis-operator \
  --namespace ot-operators --create-namespace \
  --version 0.26.1
```

Pin `--version` to whatever's current when you actually run this — `0.26.1` was latest as of
writing. The operator watches `Redis`/`RedisReplication`/`RedisSentinel`/`RedisCluster`
CRDs cluster-wide by default, so it picks up `k8s/redis/redis.yaml` in the `distopia`
namespace with no extra per-namespace config.

Image Updater needs no special configuration for `ghcr.io` — it's a well-known registry
Image Updater already knows how to poll, and `ghcr.io/thunlights/distopia` is a public
package (see "Shipping a new build" below), so no `registries.conf` entry or pull-secret
credential is needed at all — a real simplification over the old self-hosted-registry setup
this replaced, which needed both plus an `insecure: true` HTTP escape hatch.

> **Version note:** Image Updater v1.x (the `ImageUpdater` CRD, not the older
> annotation-only controller) reconciles a separate `ImageUpdater` resource
> (`k8s/argocd/imageupdater.yaml`) and otherwise does nothing — confirmed the hard way, the
> controller logs "No ImageUpdater CRs to process" and never looks at any Application until
> that CR exists. That CR's `useAnnotations: true` is what makes it fall back to reading
> the `argocd-image-updater.argoproj.io/*` annotations on `k8s/argocd/app-app.yaml`, same as
> the older annotation-only versions.
>
> If your installed version turns out to be the older annotation-only controller instead,
> also remove `imageupdater.yaml` from `k8s/argocd/kustomization.yaml`'s `resources` list —
> deleting the live object alone (`kubectl delete -f k8s/argocd/imageupdater.yaml`) isn't
> enough, since the next `kubectl apply -k k8s/argocd` would just try to apply the
> `ImageUpdater` kind again and fail if the CRD isn't installed. The annotations on
> `app-app.yaml` are sufficient by themselves once it's removed from both places.

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

# 3. Register the four Argo CD Applications.
kubectl apply -k k8s/argocd

# 4. distopia-app will show "Degraded"/ImagePullBackOff at first -- expected, there is no
#    image at ghcr.io/thunlights/distopia yet (deployment.yaml's own :latest doesn't exist
#    until the first build). Trigger one build by hand -- either push to main, or:
gh workflow run deploy.yml --repo thunlights/distopia --ref main

# 5. Once that run finishes (`gh run watch --repo thunlights/distopia`), :latest exists and
#    distopia-app comes up. Argo CD Image Updater then notices the tagged image
#    (distopia:<epoch>-<short-sha>) on its own polling cycle (a few minutes) and switches
#    the Deployment to it automatically -- see "Shipping a new build" below. From here on,
#    every push to main does this for you with no manual step.
```

## 2. Secrets to create by hand (none of these are committed)

```bash
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
  --from-literal=SENTRY_PROJECT='...' \
  --from-literal=PUBLIC_SENTRY_DSN='...' \
  --from-literal=SENTRY_AUTH_TOKEN='...' \
  --from-literal=VOICEVOX_API_KEY='...' \
  --from-literal=SAKURA_AI_ENGINE_API_KEY='...'
```

`SENTRY_PROJECT`/`PUBLIC_SENTRY_DSN`/`SENTRY_AUTH_TOKEN` here must be your **production**
Sentry project's own values, not `ci.yml`'s CI-scoped ones — `SENTRY_ORG` is the only Sentry
value actually shared between the two. Unlike the other values in this secret,
`.github/workflows/deploy.yml` does **not** need a copy of these three: `PUBLIC_SENTRY_DSN`
is read at request time via `$env/dynamic/public` (never a build-time value in the first
place), and sourcemap upload (`SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN`) is opt-in at
build time -- `vite.config.ts`'s `autoUploadSourceMaps: !!process.env.SENTRY_AUTH_TOKEN`
skips it cleanly when absent, rather than failing the build. `deploy.yml`'s own build-time
`.env` deliberately carries only `DATABASE_URL` as a result. If you want production
sourcemap upload too, add this job's own `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN`
env entries from dedicated repo secrets (Settings → Secrets and variables → Actions) --
never reuse `ci.yml`'s `secrets.SENTRY_AUTH_TOKEN`, which is scoped to CI, not production
releases.

```bash
# --- DB credentials -- your own choice of username/password (equivalent to the old
# docker/.env's DB_USER/DB_PW), given to CloudNativePG's Cluster (k8s/db/cluster.yaml) as
# bootstrap.initdb.secret so it doesn't auto-generate its own. `username` MUST match
# cluster.yaml's `owner` field (default "distopia"). Create this BEFORE the distopia-db
# Application first syncs -- bootstrap.initdb only runs once, at cluster creation.
#
# `url` is the single DATABASE_URL value both the app and the `migrate` initContainer
# (k8s/app/deployment.yaml) read directly, composed here by hand rather than at
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

# --- DB backup off-site copy (Cloudflare R2) -- consumed by k8s/db/backup-cronjob.yaml's
# upload-r2 step, which mirrors the daily pg_dump PVC to this bucket via the S3-compatible
# API. Create an R2 bucket and an API token scoped to just that bucket in the Cloudflare
# dashboard first; `endpoint` is `https://<account-id>.r2.cloudflarestorage.com`. ---
kubectl create secret generic distopia-db-r2-credentials -n distopia \
  --from-literal=access-key-id='<R2 API token access key id>' \
  --from-literal=secret-access-key='<R2 API token secret access key>' \
  --from-literal=endpoint='https://<account-id>.r2.cloudflarestorage.com' \
  --from-literal=bucket='<R2 bucket name>'

# --- network relay (see "Cloudflare Tunnel and network exposure" below) -- pick a loopback
# port of your own choosing. Never share this specific number anywhere outside your own
# server config (not in an issue, a commit, chat, etc.) -- this repo is public, and unlike a
# real credential it can't be rotated after the fact if leaked. ---
kubectl create secret generic distopia-tunnel-relay-config -n distopia \
  --from-literal=app-port='<port for distopia.top, your choice>'
```

`DATABASE_URL` is read as a single value everywhere it's needed — `k8s/app/deployment.yaml`
(both the main container and the `migrate` initContainer) reads `distopia-db-credentials`'
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

## 3. One-time data migration from the docker-compose Postgres

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

## 4. Faster Argo CD sync (optional)

Argo CD polls git every ~3 minutes by default. This only matters for actual manifest edits
in `k8s/` now (a `Deployment` change, a new Secret reference, etc.) — shipping a new app
build doesn't touch git at all (see "Shipping a new build" below), so it isn't gated by this
poll interval. For near-instant syncs of real manifest edits, add a GitHub webhook pointed
at Argo CD's own `/api/webhook` endpoint (see Argo CD's docs for the exact payload URL/secret
for your install) — not required for correctness, just latency.

## Shipping a new build

Every push to `main` runs `.github/workflows/deploy.yml`: migrate a throwaway database (just
for `prisma generate --sql` to introspect at build time -- see the workflow's own comment),
build the production image, and push `ghcr.io/thunlights/distopia:<committer-epoch>-<short-
sha>` (and `:latest`). That workflow never touches the cluster or writes back to git --
nothing commits an image tag anywhere.

> **First-push check:** GHCR packages don't always inherit the repository's public
> visibility automatically. After the very first push, check the package's own Settings
> (github.com/thunlights/distopia/pkgs/container/distopia → Package settings) and set
> visibility to Public if it isn't already -- Image Updater and the app's `imagePullSecrets`
> -less pull both assume anonymous access works. If the org's default Actions "Workflow
> permissions" is set to read-only, the push step will fail with 403/denied -- switch it to
> "Read and write permissions" (Settings → Actions → General) or grant `packages: write` more
> narrowly for this workflow specifically.

Instead, **Argo CD Image Updater** (installed per section 0, configured via the annotations
on `k8s/argocd/app-app.yaml`) polls `ghcr.io/thunlights/distopia` directly, on its own
interval (default ~2 minutes), for tags matching `distopia.allow-tags`'s regexp (the
`<epoch>-<short-sha>` tags only — `latest` is excluded so it isn't mistaken for a real
candidate). Its `update-strategy: alphabetical` picks whichever matching tag sorts highest
and, since `write-back-method` is `argocd` rather than `git`, patches that tag straight into
the `distopia-app` `Application`'s `spec.source.kustomize.images` — a live object in the
`argocd` namespace, not a git commit. Argo CD's normal auto-sync then rolls `distopia-app`'s
`Deployment` to that image, same as it would for any other spec change. Kustomize's image
transformer patches every container referencing that image, so the `migrate` initContainer
(see "Database migrations" below) always runs from the same new image as the main container.

The tag's leading `<committer-epoch>` (the pushed commit's own committer timestamp, computed
by the workflow's `Compute image tags` step, not by anything build-related) is what makes
this safe against two pushes landing on `main` close together, which spawn separate workflow
runs with unordered build durations — an older commit's image can finish building (and get
pushed) after a newer commit's. Sorting alphabetically on each commit's own timestamp is
immune to that: unlike an `update-strategy: newest-build` (which sorts by build-*completion*
time and would wrongly pick the older commit if its build happened to finish last), the epoch
prefix here never changes based on how long the build took, so whichever tag Image Updater
sees as highest is always the actual newest source commit — on the very next poll if not
immediately, with no in-workflow locking or git ancestry check required.

To change the poll interval or inspect what Image Updater is doing:

```bash
kubectl logs -n argocd deployment/argocd-image-updater -f
```

### Database migrations

The real production migration (as opposed to the throwaway database `deploy.yml` migrates
just to build against) runs from `k8s/app/deployment.yaml`'s `migrate` initContainer, using
the exact image about to run as the main container. It runs once per new Pod -- i.e. once per
rollout, since `replicas: 1` means the still-running old Pod is never recreated in place --
and `prisma migrate deploy` is idempotent, so a crash-loop restart re-running it is harmless,
just redundant. This does mean migrations must stay backward-compatible with the still-
running old replica until its rollout finishes (standard expand/contract practice) -- same
constraint the old in-cluster pipeline had.

## Registry image retention

Every push to `main` adds a new `<epoch>-<short-sha>` tag and re-pushes `latest` to
`ghcr.io/thunlights/distopia` — nothing in "Shipping a new build" above ever deletes one.
Unlike the old self-hosted registry, there's no CronJob here to write: GitHub Container
Registry has its own retention, in the package's own Settings
(github.com/thunlights/distopia/pkgs/container/distopia → Package settings → "Manage
versions" for one-off deletes, or a retention policy for automatic cleanup by age/count).
Configure whatever policy suits your storage budget there — never delete the tag matching
`distopia-app`'s currently-running image by hand (`kubectl get deployment distopia-app -n
distopia -o jsonpath='{.spec.template.spec.containers[0].image}'` shows which tag that is).

## Retiring the old self-hosted-registry pipeline

If you're upgrading a cluster that already ran the old in-cluster registry/Argo Workflows
pipeline, `kubectl apply -k k8s/argocd` (step 1 above) does **not** retire the old
`distopia-ci`/`distopia-registry` Applications on its own — `kubectl apply -k` only ever
adds/updates the resources listed in `k8s/argocd/kustomization.yaml`, it never deletes an
existing Application just because its file was removed from that list. Argo CD keeps
reconciling both against their now-git-deleted source paths (`k8s/ci`, `k8s/registry`)
regardless.

- `distopia-ci` (`prune: true`) self-heals once Argo CD notices `k8s/ci` is gone from git —
  its managed `EventBus`/`EventSource`/`Sensor`/RBAC get pruned automatically. Only the
  now-empty Application shell needs a manual follow-up: `kubectl delete application
  distopia-ci -n argocd`.
- `distopia-registry` (`prune: false`, deliberately) does **not** self-heal — it just goes
  `OutOfSync` and leaves the old registry `Deployment`/`Service`/`PVC`/`NetworkPolicy`
  running, untouched, indefinitely. In particular, `distopia-registry-data` (the PVC) holds
  every image ever pushed to the old registry — decide on purpose whether you still want
  that image history around (e.g. as a rollback fallback for a few days) before deleting
  anything. Once you're confident `ghcr.io/thunlights/distopia` is working and you no longer
  need the old images:
  ```bash
  kubectl delete application distopia-registry -n argocd
  kubectl delete deployment,service,pvc,networkpolicy -n distopia -l app=distopia-registry
  ```

Also outside this repo's scope but worth doing once you've confirmed the new pipeline
works: remove the GitHub webhook (repo Settings → Webhooks) that used to point at
`ci.distopia.top/push` — its deliveries will just start failing harmlessly once
`k8s/ci`'s `EventSource` is gone, but it's dead weight — and drop the `ci.distopia.top`
route from your own `cloudflared` config and Cloudflare Tunnel dashboard.

## 5. Database backups

`k8s/db/backup-cronjob.yaml` runs a daily `pg_dump` (custom format, same shape as the
one-time migration dump above) onto its own PVC (`distopia-db-backup-data`), pruning dumps
older than 14 days, then mirrors that PVC to a Cloudflare R2 bucket (`upload-r2`, via
`aws s3 sync --delete`) so the same 14-day retention applies off-host too — without a
separate remote-pruning step, since `--delete` just makes R2 match whatever pg-dump already
pruned locally. This is a minimal safety net against operational mistakes (a bad migration,
an accidental `DROP TABLE`, application bugs) *and* against losing the node/disk entirely,
now that a copy also lives outside the cluster. It is **not** point-in-time recovery — up to
a day of writes between dumps can still be lost. If that ever matters more than the
simplicity here, prefer CloudNativePG's native `.spec.backup.barmanObjectStore` on the
`Cluster` instead (continuous WAL archiving, can point at the same R2 bucket) and retire this
CronJob.

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

Public traffic (the site) reaches this cluster exclusively through a
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
`hostNetwork` Deployment that plain-binds a loopback port on the node — whichever one you
chose when creating `distopia-tunnel-relay-config` (section 2 above) — and forwards to
`distopia-app` by its normal cluster DNS name. This avoids needing the host to resolve
`*.svc.cluster.local` itself (no `resolvectl`/systemd-resolved setup to keep working across
reboots).

Point the host's existing `cloudflared` config at whichever loopback port you chose:

```yaml
# in the host's cloudflared config.yml, alongside its other sites
ingress:
  - hostname: distopia.top
    service: http://127.0.0.1:<the app-port you chose>
  - service: http_status:404
```

**Do not commit, post, or otherwise publish the actual port number anywhere** —
this repo is public, and unlike a real credential a leaked port number can't be rotated
after the fact the same way (traffic to it is still just loopback-only, but there's no
reason to hand out the specific number either). Keep it only in your own
`cloudflared` config and in the `distopia-tunnel-relay-config` Secret on your server.

The port is bound with socat's `bind=127.0.0.1` option specifically, so it isn't
reachable from outside the node even without `ufw`'s help — this is defense-in-depth on
top of "22 is the only allowed inbound port" already covering it. The relay always
forwards to the Service (not a specific Pod IP), so it keeps working unmodified across
normal rollouts — only re-check anything here if you rename that Service.

`k8s/db/networkpolicy.yaml` and `k8s/redis/networkpolicy.yaml` additionally restrict
CloudNativePG's and Redis's ingress, as defense-in-depth beyond "no Service exposes them."
**k3s actually enforces `NetworkPolicy` out of the box** — it runs a built-in
kube-router-based network policy controller alongside Flannel, unlike a bare Flannel
install on other distros where the resource is silently a no-op. This was confirmed the
hard way: `distopia-db-allow-intra-namespace`'s original same-namespace-only rule blocked
the CNPG operator's own cross-namespace health/status checks (`cnpg-system` namespace),
surfacing as `Phase: Instance Status Extraction Error: HTTP communication issue` on the
`Cluster` resource even though postgres itself stayed healthy — it now explicitly allows
`cnpg-system` too. If your cluster runs a different CNI (or k3s with the policy controller
disabled), confirm enforcement is actually active rather than assuming from the manifest
alone either way.

## TTS session persistence (Redis)

`replicas: 1` (see "Notes" below) means every rolling update briefly kills the process that
holds every live Discord voice connection for the read-aloud (`/tts join`) feature — the new
pod starts with no memory of who it should be connected to. `distopia-redis` closes that gap:

- `Tts.saveVoiceSession`/`clearVoiceSession` (`src/application/core/src/Tts.ts`) keep a
  `tts:voice-session:<guildId>` key in Redis in sync with the in-memory session, on every
  join/leave, regardless of which caller triggers it (`/tts join`, `/tts leave`, or
  `VoiceStateUpdateHandler`'s auto-leave when a channel empties out) — see
  `src/presentation/bot/src/utils/tts/session.ts`.
- On `clientReady`, `restoreSessions` reads every persisted session from Redis and rejoins
  each one (re-checking Connect/Speak permissions, same as a fresh `/tts join`) — fire-and-
  forget, so a slow voice reconnect never blocks command registration.
- No AUTH (see `k8s/redis/redis.yaml`'s own comment for why) — a PVC does persist the
  other repo-redis-backed state this Redis now also holds (rate limits, caches, sessions;
  see `src/domain/repository/redis`), but TTS voice session pointers specifically still
  tolerate loss fine: losing them on a restart just means one missed auto-resume, not real
  data loss.

> **Known gap:** `clearVoiceSession` deletes `tts:voice-session:<guildId>` unconditionally,
> with no owner/lease check. During the old-pod/new-pod overlap `RollingUpdate` already
> accepts (see "Notes" below), it's possible for the old pod's `VoiceStateUpdateHandler` to
> delete a pointer the new pod just wrote (e.g. the old pod's channel empties out right after
> the new pod already rejoined and persisted). Worst case, that one guild simply doesn't
> auto-resume on the *next* restart — the same already-accepted "no PVC" degradation above,
> not data corruption or a crash. A Redis lease/compare-and-delete would close this
> narrow, rollout-window-only race, but is real added complexity for a low-probability,
> low-impact case — out of scope here; revisit if it turns out to matter in practice.

## Notes / known constraints

- `replicas: 1` is load-bearing, not just a default — the app logs into the Discord
  gateway and runs in-process `node-cron` jobs itself (`hooks.server.ts`), so a second
  concurrent instance causes duplicate event handling. `k8s/app/deployment.yaml` uses
  `RollingUpdate` with `maxSurge: 1, maxUnavailable: 0` (zero-downtime, brief overlap
  during rollout accepted) rather than `Recreate`.
- No app secret is ever baked into the image or pushed to ghcr.io. The app reads its
  runtime config (`BOT_TOKEN`, `PUBLIC_*`, `DATABASE_URL`, ...) via `$env/dynamic/*` +
  `dotenv` (see `hooks.server.ts`), resolved fresh every time the container starts from the
  env vars `k8s/app/deployment.yaml` injects (`distopia-env` Secret, `distopia-config`
  ConfigMap, `distopia-db-credentials`) — the same mechanism also picks up a plain mounted
  `.env` file if you'd rather run the image that way (e.g. local `docker run` testing),
  since `dotenv` never overrides a value that's already set in the real environment.
  `bun run build` still needs a *separate*, build-time-only `.env` (just `DATABASE_URL`,
  written by `.github/workflows/deploy.yml`'s build step) purely because `prisma generate
  --sql` needs to introspect a real database at build time — that file is deleted before
  the runtime image layer is created and never contains `BOT_TOKEN`/`PUBLIC_*`, and the
  database it points at is a throwaway one the workflow itself spins up, never the real
  production database. No Sentry value is needed at build time either: sourcemap upload is
  opt-in (see the note after `distopia-env`'s creation command above), and
  `PUBLIC_SENTRY_DSN` is a runtime-only value regardless.
- Rotating `distopia-env` or `distopia-db-credentials` takes effect on the **next Pod
  restart** (`kubectl rollout restart deployment/distopia-app -n distopia`) — no rebuild
  needed. Changing DB credentials specifically also needs that restart to reach the
  `migrate` initContainer (it reads `distopia-db-credentials` too, same as the main
  container), but never a rebuild — the build-time database `deploy.yml` migrates is a
  separate, throwaway one, unrelated to the real `distopia-db-credentials` value.
- `distopia-db`'s Argo CD Application (`k8s/argocd/app-db.yaml`) runs with `prune: false`,
  unlike `distopia-app`/`distopia-network`. It owns stateful data (the CNPG `Cluster` and
  its PVC) — an accidental removal of its manifest from git should show up as "OutOfSync"
  for someone to look at, not silently delete a live database. Pruning it, if you ever
  actually want to, is a deliberate `argo cd app sync distopia-db --prune`.
- `.github/workflows/deploy.yml` never writes back to git, touches the cluster, or needs a
  GitHub push token beyond the ambient `GITHUB_TOKEN` (scoped to `packages: write` for the
  ghcr.io push) — see "Shipping a new build" above for how Argo CD Image Updater picks up
  and deploys each build instead.
