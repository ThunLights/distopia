import type { RequestHandler } from "./$types";

// Kubernetes probe target: must not touch the DB or other services, or a slow dependency makes
// the kubelet restart a pod that is actually fine (it did, probing `/`).
export const GET: RequestHandler = () => new Response("ok");
