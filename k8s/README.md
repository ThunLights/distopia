# distopia GitOps pipeline (Argo CD + Argo Workflows + Argo Events + CloudNativePG)

Operational runbook for everything under `k8s/`. This is applied to your own k3s cluster
by you — nothing here is applied automatically by me.

## What's here

| Path | Argo CD Application | Contents |
|---|---|---|
| `k8s/registry/` | `distopia-registry` | Self-hosted `registry:2`, cluster-internal only |
| `k8s/db/` | `distopia-db` | CloudNativePG `Cluster` (replaces the docker-compose Postgres) |
| `k8s/app/` | `distopia-app` | The app itself (`Deployment`/`Service`/`ConfigMap`) |
| `k8s/ci/` | `distopia-ci` | Argo Events (`EventBus`/`EventSource`/`Sensor`) + Argo Workflows (`WorkflowTemplate`) that build, migrate, and deploy on every push to `main` |

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

# 3. Register the four Argo CD Applications.
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
# Application first syncs -- bootstrap.initdb only runs once, at cluster creation. ---
kubectl create secret generic distopia-db-credentials -n distopia \
  --from-literal=username='distopia' \
  --from-literal=password='<choose a password>'

# --- pipeline ---
kubectl create secret generic distopia-github-webhook -n distopia \
  --from-literal=secret="$(openssl rand -hex 20)"

# Fine-grained GitHub PAT scoped to ONLY the thunlights/distopia repo, permission
# "Contents: Read and write", nothing else. Used solely by the update-manifest step to
# push the image-tag bump commit. A dedicated bot account (rather than a personal PAT)
# is recommended so the commit author is unambiguous, but not required.
kubectl create secret generic github-push-token -n distopia \
  --from-literal=token='<fine-grained PAT>'
```

`DATABASE_URL` is composed, not stored directly: both `k8s/app/deployment.yaml` and
`workflowtemplate.yaml`'s `migrate`/`prepare-env` steps read `distopia-db-credentials`'
`username`/`password`, combine them with the host `distopia-db-rw.distopia.svc.cluster.local`
(CloudNativePG's standard read-write Service name for a `Cluster` named `distopia-db`) and
port `5432`, and build the `postgresql:` connection URL themselves at runtime — kept as
separate fields rather than one composed string in this doc (and in the manifests
themselves) since that shape trips secret scanners even with placeholder credentials.

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

Add ingress rules to the host's existing `cloudflared` config pointing at the relevant
Services **directly** — no `Ingress`/Traefik involved:

```yaml
# in the host's cloudflared config.yml, alongside its other sites
ingress:
  - hostname: distopia.top
    service: http://distopia-app.distopia.svc.cluster.local:3000
  - hostname: ci.distopia.top
    service: http://github-eventsource-svc.distopia.svc.cluster.local:12000
  - service: http_status:404
```

Both Services are referenced by **cluster DNS name**, not a hardcoded ClusterIP — neither
is pinned (see the comment in `k8s/app/service.yaml` for why: a hardcoded address valid on
your k3s cluster's service CIDR wouldn't be valid on the CI kind cluster's, and vice
versa), and this way the host config doesn't need updating even if an IP ever changes. This
means the host needs to resolve `*.svc.cluster.local` to CoreDNS. On a systemd-resolved
host (most current Ubuntu/Debian servers):

```bash
# find CoreDNS's ClusterIP (k3s default is 10.43.0.10, but confirm)
kubectl get svc -n kube-system kube-dns -o jsonpath='{.spec.clusterIP}'

# route *.svc.cluster.local (and .cluster.local generally) to it, via whichever
# interface reaches the cluster network (for a single-node k3s host, that's usually the
# node's own primary interface -- adjust for your setup)
resolvectl dns <interface> <coredns-clusterip>
resolvectl domain <interface> "~cluster.local"
```

If you'd rather not set up cluster DNS resolution on the host, reference either Service by
its ClusterIP instead (`kubectl get svc distopia-app -n distopia -o
jsonpath='{.spec.clusterIP}'`) — just know it isn't pinned, so re-check it if the Service
is ever deleted and recreated (a normal `kubectl apply`/Argo CD sync does not do this).

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
