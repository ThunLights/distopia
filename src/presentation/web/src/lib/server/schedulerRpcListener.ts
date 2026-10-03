import { env as privateEnv } from "$env/dynamic/private";
import { schedulerRoutes } from "./schedulerRpcServer";
import { connectNodeAdapter } from "@connectrpc/connect-node";
import { requireBearerAuth } from "infra-rpc";
import { createServer } from "node:http";

// ClusterIP-only (see k8s/app/schedulemanager-networkpolicy.yaml) -- only
// presentation-schedulemanager is allowed to reach this port. The bearer token is defense in
// depth on top of that NetworkPolicy, not a substitute for it.
export function startSchedulerRpcServer() {
  const { SCHEDULEMANAGER_RPC_PORT, SCHEDULEMANAGER_RPC_TOKEN } = privateEnv;
  if (!SCHEDULEMANAGER_RPC_PORT || !SCHEDULEMANAGER_RPC_TOKEN) {
    throw new Error("SCHEDULEMANAGER_RPC_PORT and SCHEDULEMANAGER_RPC_TOKEN are required");
  }

  const handler = connectNodeAdapter({
    routes: schedulerRoutes,
    interceptors: [requireBearerAuth(SCHEDULEMANAGER_RPC_TOKEN)],
  });

  createServer(handler).listen(Number(SCHEDULEMANAGER_RPC_PORT));
}
