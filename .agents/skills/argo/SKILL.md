---
name: argo
description: Argo CD + Argo CD Image Updater GitOps deploy (ghcr.io push detected -> Deployment rolled, no git write-back)
---

# Argo (CD + Image Updater) GitOps Guide

Deploys are GitOps-driven: `.github/workflows/deploy.yml` builds the production image and
pushes it to `ghcr.io/thunlights/distopia` on every push to `main` — **that workflow never
touches the cluster or writes back to git**. Argo CD Image Updater then polls
`ghcr.io/thunlights/distopia` directly and rolls out the new image via Argo CD, with no
commit involved anywhere. Everything cluster-side lives under `k8s/argocd/` (the four
`Application` objects). Full runbook: `k8s/README.md`. For the manifests this deploys, see
the `k8s` skill.

## The Four Argo CD Applications (`k8s/argocd/`)

| Application | Watches | `prune` |
|---|---|---|
| `distopia-db` | `k8s/db` | **false** |
| `distopia-app` | `k8s/app` (annotated for Argo CD Image Updater, see below) | true |
| `distopia-redis` | `k8s/redis` | true |
| `distopia-network` | `k8s/network` (host Cloudflare Tunnel relay, see the `k8s` skill) | true |

All four use `syncPolicy.automated.selfHeal: true` and `syncOptions: [CreateNamespace=true]`.
`distopia-db` is deliberately **not** auto-pruned, unlike the other three — it owns stateful
data (the live CloudNativePG `Cluster`/PVC). If its manifest were ever accidentally removed
from git, auto-prune would delete the live resource along with it; with prune off it just
shows up as "OutOfSync" for a human to look at. Pruning it for real is a deliberate
`argo cd app sync distopia-db --prune`.

Bootstrap order matters: create the namespace and all secrets (see `k8s/README.md` section
2) **before** `kubectl apply -k k8s/argocd` — `distopia-db-credentials` in particular must
exist before `distopia-db`'s `Cluster` first initializes, since
`bootstrap.initdb.secret` is only read once, at cluster creation.

## Argo CD Image Updater: shipping a build (no git write-back)

Driven entirely by annotations on `k8s/argocd/app-app.yaml`:

```yaml
argocd-image-updater.argoproj.io/image-list: distopia=ghcr.io/thunlights/distopia
argocd-image-updater.argoproj.io/distopia.update-strategy: alphabetical
argocd-image-updater.argoproj.io/distopia.allow-tags: regexp:^[0-9]{10}-[0-9a-f]{7,10}$
argocd-image-updater.argoproj.io/write-back-method: argocd
```

Image Updater polls `ghcr.io/thunlights/distopia` on its own interval (default ~2 min),
picks whichever matching tag sorts alphabetically highest, and patches that tag into the
`distopia-app` `Application`'s `spec.source.kustomize.images` directly (`write-back-method:
argocd` — a live object in the `argocd` namespace, not a git commit). Argo CD's normal
auto-sync then rolls the `Deployment`. No `pull-secret` annotation and no `registries.conf`
entry — `ghcr.io/thunlights/distopia` is a public package, so Image Updater polls it
anonymously (verify this under the package's own Settings after the first push).

**`update-strategy: alphabetical` on the epoch-prefixed tag, not `newest-build`, is
deliberate.** `newest-build` sorts by each image's *build-completion* timestamp — two pushes
landing on `main` close together spawn separate GitHub Actions runs with unordered build
durations, so an older commit's image can finish building (and get pushed) after a newer
commit's. Under `newest-build` that would deploy the OLDER commit, since its build happened
to finish last. Sorting alphabetically on `<committer-epoch>-<short-sha>` sidesteps this
entirely: the epoch only depends on the commit itself, never on how long its build took, so
the alphabetically highest tag is always the true newest source commit, on the very next
poll if not sooner — no in-workflow locking or git ancestry check needed. `deploy.yml`'s
`Compute image tags` step writes it, reading the pushed commit's own committer timestamp
(`git show -s --format=%ct`), not a build timestamp.

`k8s/app/kustomization.yaml` deliberately has no `images:` override — `deployment.yaml`'s
own `:latest` is just the bootstrap fallback before the first Image Updater patch lands.
Kustomize's image transformer patches every container referencing that image name, so the
`migrate` initContainer (see below) always runs from the same new image as the main
container.

## Database migrations: an initContainer, not a pipeline step

`k8s/app/deployment.yaml`'s `migrate` initContainer runs `bunx prisma migrate deploy`
against the real `distopia-db-credentials`, using the exact image about to run as the main
container. It runs once per new Pod — i.e. once per rollout, since `replicas: 1` means the
still-running old Pod is never recreated in place — and the command is idempotent, so a
crash-loop restart re-running it is harmless, just redundant. This means migrations must
stay backward-compatible with the still-running old replica until its rollout finishes
(standard expand/contract practice).

This is a different database than the one `deploy.yml` migrates at build time (a throwaway
Postgres service container, just so `prisma generate --sql` — Prisma's typedSql preview
feature — has an already-migrated schema to type-check raw SQL against; it's not pure
offline codegen). The real production migration only ever happens here, via this
initContainer, against the real database.

## Secrets Argo CD reads

All created by hand, never committed (`k8s/README.md` section 2 has the exact commands):

| Secret | Used by |
|---|---|
| `distopia-env` | The app Deployment (`envFrom`) |
| `distopia-db-credentials` | CNPG's `bootstrap.initdb.secret` and the app Deployment (both the main container and the `migrate` initContainer, via its `url` key) |

`deploy.yml` (GitHub Actions, not this cluster) needs no k8s Secret at all — its build-time
`.env` carries `DATABASE_URL` (a throwaway Postgres service container, not production) plus
sourcemap upload config, sourced from its own `secrets.SENTRY_PROJECT_PROD`/
`secrets.SENTRY_AUTH_TOKEN_PROD` repo secrets (`SENTRY_ORG` is hardcoded, not sensitive) —
never `ci.yml`'s `secrets.SENTRY_AUTH_TOKEN`, which is scoped to CI. Upload still stays
opt-in: `vite.config.ts`'s `autoUploadSourceMaps: !!process.env.SENTRY_AUTH_TOKEN` skips it
cleanly if those repo secrets aren't set, rather than failing the build, and
`PUBLIC_SENTRY_DSN` was never a build-time value in the first place (`$env/dynamic/public`,
read at request time) — see `k8s/README.md` section 2's note right after the `distopia-env`
block. The only k8s-adjacent secret `deploy.yml` needs is the ambient `secrets.GITHUB_TOKEN`
(scoped to `packages: write` in the job, no PAT needed) — not a k8s Secret either.

## Common Commands

```bash
# Manually trigger a build (e.g. the very first one, before any image exists)
gh workflow run deploy.yml --repo thunlights/distopia --ref main

# Watch the most recent run
gh run watch --repo thunlights/distopia

# Argo CD: check sync/health status of everything
argocd app list

# Argo CD: manually sync (and, if you really mean to, prune) an Application
argocd app sync distopia-app
argocd app sync distopia-db --prune   # only if you actually want to delete drifted resources

# Inspect what Image Updater is doing
kubectl logs -n argocd deployment/argocd-image-updater -f
```

## Notes

- Argo CD polls git every ~3 minutes by default. This only matters for actual manifest
  edits under `k8s/` now, since shipping a new app build doesn't touch git at all — add a
  GitHub webhook pointed at Argo CD's own `/api/webhook` endpoint for near-instant syncs of
  real manifest edits if you want it; optional (latency only, not correctness).
- Rotating `distopia-env`/`distopia-db-credentials` takes effect on the next Pod restart
  (`kubectl rollout restart deployment/distopia-app -n distopia`) — no rebuild needed.
  Changing DB credentials also needs that restart to reach the `migrate` initContainer, but
  never a rebuild — `deploy.yml`'s build-time database is a separate, throwaway one.
