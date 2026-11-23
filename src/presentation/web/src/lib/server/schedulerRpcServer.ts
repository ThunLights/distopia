import { core } from "./core";
import type { ConnectRouter } from "@connectrpc/connect";
import { SchedulerService } from "infra-rpc";

export function schedulerRoutes(router: ConnectRouter) {
  router.service(SchedulerService, {
    async refreshCaches() {
      await core.friend.updateCache();
      await core.guild.updateActiveGuilds();
      await core.ranking.cleanCache();
      return {};
    },
  });
}
