// Baked in at image-build time (docker/dockerfile.prod's GIT_SHA build arg, set by the
// Argo Workflow's build-push step) -- "unknown" for local dev, since there's no build
// pipeline setting it there.
export function getDeployedCommitHash(): string {
  return process.env.GIT_SHA ?? "unknown";
}
