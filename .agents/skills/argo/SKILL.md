---
name: argo
description: Argo CD + Argo CD Image Updater + Argo Workflows + Argo Events GitOps pipeline (push to main -> build -> deploy)
---

# Argo (CD + Image Updater + Workflows + Events) GitOps Guide

Production deploys are fully GitOps-driven, entirely inside the self-hosted k3s cluster —
**no GitHub-hosted CI ever holds registry push credentials**. A push to `main` is detected
by Argo Events and built/pushed by Argo Workflows (Kaniko, no Docker daemon) — that's the
whole Workflow, it never writes back to git. Argo CD Image Updater then polls the registry
directly and rolls out the new image via Argo CD, with no commit involved anywhere.
Everything lives under `k8s/ci/` (the pipeline itself) and `k8s/argocd/` (the five
`Application` objects). Full runbook: `k8s/README.md`. For the manifests the pipeline
builds/deploys, see the `k8s` skill.

## The Five Argo CD Applications (`k8s/argocd/`)

| Application | Watches | `prune` |
|---|---|---|
| `distopia-registry` | `k8s/registry` | **false** |
| `distopia-db` | `k8s/db` | **false** |
| `distopia-app` | `k8s/app` (annotated for Argo CD Image Updater, see below) | true |
| `distopia-ci` | `k8s/ci` (the pipeline is GitOps-managed too) | true |
| `distopia-network` | `k8s/network` (host Cloudflare Tunnel relay, see the `k8s` skill) | true |

All five use `syncPolicy.automated.selfHeal: true` and `syncOptions: [CreateNamespace=true]`.
`distopia-db` and `distopia-registry` are deliberately **not** auto-pruned, unlike the
other three — they own stateful data (the live CloudNativePG `Cluster`/PVC, and every image
ever pushed to the registry PVC). If either manifest were ever accidentally removed from
git, auto-prune would delete the live resource along with it; with prune off it just shows
up as "OutOfSync" for a human to look at. Pruning either one for real is a deliberate
`argo cd app sync <name> --prune`.

Bootstrap order matters: create the namespace and all secrets (see `k8s/README.md` section
2) **before** `kubectl apply -k k8s/argocd` — `distopia-db-credentials` in particular must
exist before `distopia-db`'s `Cluster` first initializes, since
`bootstrap.initdb.secret` is only read once, at cluster creation.

## Argo Events: detecting the push (`k8s/ci/`)

- `eventbus.yaml` — a plain single-node native NATS `EventBus` named `default`. Argo
  Events requires one to exist in every namespace with EventSources/Sensors — easy to
  forget, and everything else silently fails to trigger without it.
- `eventsource.yaml` — receives GitHub's `push` webhook. Runs in **manual webhook mode**
  (no `apiToken` given), so it does **not** auto-register itself with GitHub's API —
  register the webhook by hand (repo Settings → Webhooks), payload URL pointed at whatever
  hostname your Cloudflare Tunnel maps to this Service
  (`github-eventsource-svc.distopia.svc.cluster.local:12000`, auto-created by the Argo
  Events controller). This avoids ever granting the cluster a GitHub token with
  repo-hook-admin scope.
- `sensor.yaml` — filters for `body.ref == refs/heads/main` and the right repo, then
  creates a `Workflow` from the `distopia-build-deploy` `WorkflowTemplate`, passing
  `body.after` (the pushed commit SHA) as the `revision` parameter.

No anti-loop filter is needed on `sensor.yaml`: the Workflow it triggers only builds and
pushes an image, it never commits back to git, so there is no self-triggering commit to
exclude in the first place.

## Argo Workflows: `distopia-build-deploy` (`k8s/ci/workflowtemplate.yaml`)

A `WorkflowTemplate` with a 4-task DAG, all running inside a single shared
`volumeClaimTemplates` PVC (`workspace`, auto-deleted when the Workflow completes):

```
clone ──┬─→ prepare-env ─┐
        └─→ migrate ─────┴─→ build-push
```

| Task | Image | Does |
|---|---|---|
| `clone` | `alpine/git` | Shallow-clones and checks out the **exact triggering revision** (not just the branch tip — a fast-follow push during the build can't get silently included) |
| `prepare-env` | `alpine` | Writes a build-time-only `.env` from `distopia-env` + `distopia-db-credentials`' `url` key — just what `bun run build` needs |
| `migrate` | `oven/bun` | `bun install` + `bunx prisma migrate deploy`, reading `DATABASE_URL` directly via `secretKeyRef` (see the `k8s` skill's DATABASE_URL convention) |
| `build-push` | `gcr.io/kaniko-project/executor` | Builds `docker/dockerfile.prod` with Kaniko (no privileged Docker daemon) and pushes to the in-cluster registry, tagged both `<short-sha>` and `latest` — the last task, nothing deploys from here |

## Argo CD Image Updater: shipping the build (no git write-back)

`build-push` is the end of the Workflow — deploying from the new image is Argo CD Image
Updater's job, driven entirely by annotations on `k8s/argocd/app-app.yaml`:

```yaml
argocd-image-updater.argoproj.io/image-list: distopia=distopia-registry.distopia.svc.cluster.local:5000/distopia
argocd-image-updater.argoproj.io/distopia.update-strategy: newest-build
argocd-image-updater.argoproj.io/distopia.allow-tags: regexp:^[0-9a-f]{7,10}$
argocd-image-updater.argoproj.io/distopia.pull-secret: pullsecret:distopia/distopia-registry-pull
argocd-image-updater.argoproj.io/write-back-method: argocd
```

Image Updater polls the registry on its own interval (default ~2 min), picks whichever
`<short-sha>`-tagged image the registry reports as most recently **built** (`newest-build`
— `latest` is excluded from candidates via `allow-tags`), and patches that tag into the
`distopia-app` `Application`'s `spec.source.kustomize.images` directly
(`write-back-method: argocd` — a live object in the `argocd` namespace, not a git commit).
Argo CD's normal auto-sync then rolls the `Deployment`.

Sorting by build time rather than push-completion order is what keeps two overlapping
Workflow runs from racing: an older commit's image can finish building after a newer
commit's, but Image Updater re-evaluates "which matching tag was actually built most
recently" on every poll, so it converges on the truly newest image within one more interval
even if it briefly deployed an out-of-order one. No in-workflow locking or git ancestry
check is needed.

`k8s/app/kustomization.yaml` deliberately has no `images:` override — `deployment.yaml`'s
own `:latest` is just the bootstrap fallback before the first Image Updater patch lands.

**Why `migrate` runs before `build-push`, not after**: `infra-database`'s build step
(`prisma generate --sql`, Prisma's typedSql preview feature) needs to connect to a real,
**already-migrated** database to type-check the raw SQL under `prisma/sql/*.sql` — it's
not pure offline codegen. This means migrations must stay backward-compatible with the
still-running old replica until its rollout finishes (standard expand/contract practice).

**Why `migrate` isn't an initContainer on the app Deployment**: an initContainer runs once
per Pod — with `replicas: 1` that's usually fine, but during a `RollingUpdate` the new Pod
starting alongside the old one would run it again unnecessarily, and it couples migration
timing to Pod scheduling instead of running exactly once per deploy, deterministically,
before the image even exists.

Every task template now has `resources.requests`/`limits` (added after a review flagged
their absence — an unbounded Kaniko build in particular could starve the actually-running
app/db on a single-node host during every deploy). `build-push` gets the most headroom
(it's genuinely the heaviest step); tune all of them to your host's real capacity.

### RBAC (`k8s/ci/rbac.yaml`)

Two `ServiceAccount`s, both namespace-scoped (neither needs cluster-wide access):
- `distopia-sensor-sa` — used by the Sensor to `create`/`get`/`list`/`watch` `Workflow`
  objects.
- `distopia-workflow-sa` — used by the Workflow's own pods; can manage `pods`/`pods/log`
  and `persistentvolumeclaims`, and `workflowtaskresults` (Argo's own bookkeeping CRD).

If you hit an RBAC-denied error on some verb, that's expected to happen at least once when
extending the pipeline — add the specific verb needed rather than widening scope broadly.

## Secrets this pipeline reads

All created by hand, never committed (`k8s/README.md` section 2 has the exact commands):

| Secret | Used by |
|---|---|
| `distopia-registry-htpasswd` | The registry Deployment itself (auth backend) |
| `distopia-registry-pull` (`dockerconfigjson`) | Kaniko (`build-push`, to push) **and** the app Deployment (`imagePullSecrets`, to pull) — same registry, same creds, one secret covers both |
| `distopia-env` | `prepare-env` (build-time `.env`) and the app Deployment (`envFrom`) |
| `distopia-db-credentials` | CNPG's `bootstrap.initdb.secret`, `prepare-env`/`migrate` (via its `url` key), and the app Deployment |
| `distopia-github-webhook` | The EventSource, to validate GitHub's webhook signature |

Argo CD Image Updater also reads `distopia-registry-pull` directly (referenced via its
`pull-secret` annotation, not created separately) to authenticate against the registry when
polling for new tags.

## Common Commands

```bash
# Manually trigger a build (e.g. the very first one, before any image exists)
argo submit -n distopia --from workflowtemplate/distopia-build-deploy \
  -p revision=$(git rev-parse HEAD)

# Watch the most recent Workflow run
argo watch -n distopia @latest

# List recent Workflow runs
argo list -n distopia

# Argo CD: check sync/health status of everything
argocd app list

# Argo CD: manually sync (and, if you really mean to, prune) an Application
argocd app sync distopia-app
argocd app sync distopia-db --prune   # only if you actually want to delete drifted resources
```

## Notes

- Argo CD polls git every ~3 minutes by default. This only matters for actual manifest
  edits under `k8s/` now, since shipping a new app build no longer touches git at all — add
  a GitHub webhook pointed at Argo CD's own `/api/webhook` endpoint for near-instant syncs
  of real manifest edits if you want it; independent of the Argo Events webhook above,
  optional (latency only, not correctness).
- Argo CD Image Updater must be installed cluster-wide (see `k8s/README.md` section 0) and
  configured with a `registries.conf` entry for `distopia-registry`, since it's a plain-HTTP
  internal registry that also requires auth (`insecure: true` + `credentials:
  pullsecret:...`).
- Rotating `distopia-env`/`distopia-db-credentials`/the registry secrets takes effect on
  the next Pod restart (`kubectl rollout restart deployment/distopia-app -n distopia`) — no
  rebuild needed. Changing DB credentials is the one exception: `migrate`/`prepare-env`
  also read `distopia-db-credentials`, so a fresh Workflow run (or at least re-running
  `bunx prisma migrate deploy` by hand) picks up the change for the pipeline side.
