---
description: Argo CD + Argo Workflows + Argo Events GitOps pipeline (push to main -> build -> deploy)
---

# Argo (CD + Workflows + Events) GitOps Guide

Production deploys are fully GitOps-driven, entirely inside the self-hosted k3s cluster —
**no GitHub-hosted CI ever holds registry push credentials**. A push to `main` is detected
by Argo Events, built and pushed by Argo Workflows (Kaniko, no Docker daemon), and rolled
out by Argo CD. Everything lives under `k8s/ci/` (the pipeline itself) and
`k8s/argocd/` (the five `Application` objects). Full runbook: `k8s/README.md`. For the
manifests the pipeline builds/deploys, see the `k8s` skill.

## The Five Argo CD Applications (`k8s/argocd/`)

| Application | Watches | `prune` |
|---|---|---|
| `distopia-registry` | `k8s/registry` | **false** |
| `distopia-db` | `k8s/db` | **false** |
| `distopia-app` | `k8s/app` | true |
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

### Anti-loop filter

The Workflow's own `update-manifest` step pushes a commit back to `main` (to bump the
image tag) — without a guard, that would re-trigger the same Sensor forever. `sensor.yaml`
rejects any push whose head commit message starts with `chore(deploy):`, the exact prefix
`update-manifest` always uses:

```yaml
exprs:
  - expr: "headCommitMessage[0:14] != 'chore(deploy):'"
    fields:
      - name: headCommitMessage
        path: body.head_commit.message
```

This is a string-prefix match, not a real identity check — if the commit-message
convention in `workflowtemplate.yaml`'s `update-manifest` step ever changes, update this
filter in the same change, or the loop guard silently stops working.

## Argo Workflows: `distopia-build-deploy` (`k8s/ci/workflowtemplate.yaml`)

A `WorkflowTemplate` with a 5-task DAG, all running inside a single shared
`volumeClaimTemplates` PVC (`workspace`, auto-deleted when the Workflow completes):

```
clone ──┬─→ prepare-env ─┐
        └─→ migrate ─────┴─→ build-push ─→ update-manifest
```

| Task | Image | Does |
|---|---|---|
| `clone` | `alpine/git` | Shallow-clones and checks out the **exact triggering revision** (not just the branch tip — a fast-follow push during the build can't get silently included) |
| `prepare-env` | `alpine` | Writes a build-time-only `.env` from `distopia-env` + `distopia-db-credentials`' `url` key — just what `bun run build` needs |
| `migrate` | `oven/bun` | `bun install` + `bunx prisma migrate deploy`, reading `DATABASE_URL` directly via `secretKeyRef` (see the `k8s` skill's DATABASE_URL convention) |
| `build-push` | `gcr.io/kaniko-project/executor` | Builds `docker/dockerfile.prod` with Kaniko (no privileged Docker daemon) and pushes to the in-cluster registry, tagged both `<short-sha>` and `latest` |
| `update-manifest` | `alpine/git` | Installs `kustomize`, bumps `k8s/app`'s pinned image tag, commits as `chore(deploy): bump distopia to <short-sha>`, pushes to `main` |

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
| `github-push-token` | `update-manifest`, to push the tag-bump commit — a fine-grained PAT scoped to only this repo, `Contents: Read and write` |

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

- Argo CD polls git every ~3 minutes by default. For near-instant syncs after
  `update-manifest` pushes, add a second GitHub webhook pointed at Argo CD's own
  `/api/webhook` endpoint — independent of the Argo Events webhook above, optional
  (latency only, not correctness).
- `update-manifest` installs `kustomize` via `wget | bash` against the `master` branch's
  install script on every single run — works, but is an unpinned, per-run network
  dependency. Worth pinning to a specific release or switching to a base image with
  `kustomize` already baked in if you're touching this step anyway.
- Rotating `distopia-env`/`distopia-db-credentials`/the registry secrets takes effect on
  the next Pod restart (`kubectl rollout restart deployment/distopia-app -n distopia`) — no
  rebuild needed. Changing DB credentials is the one exception: `migrate`/`prepare-env`
  also read `distopia-db-credentials`, so a fresh Workflow run (or at least re-running
  `bunx prisma migrate deploy` by hand) picks up the change for the pipeline side.
