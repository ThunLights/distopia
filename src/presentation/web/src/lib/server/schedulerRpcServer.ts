import { env as publicEnv } from "$env/dynamic/public";
import { core, updatePanels } from "./core";
import type { ConnectRouter } from "@connectrpc/connect";
import { SchedulerService } from "infra-rpc";

// Bodies below are unchanged from the former app-schedule setScheduleTask -- only the
// trigger moved, from an in-process node-cron tick to an RPC call from
// presentation-schedulemanager. See k8s/README.md for why replicas: 1 still matters here.
export function schedulerRoutes(router: ConnectRouter) {
  router.service(SchedulerService, {
    async runFiveMinuteTasks() {
      await core.jwt.update();
      await core.message.syncDB();
      await core.member.syncDB();
      return {};
    },

    async runTwentyMinuteTasks() {
      await core.oauth2.updateTokens();
      await core.friend.updateCache();

      await core.guild.removeUnJoinedGuildData();
      await core.voice.update();
      await core.activeRate.update();
      await core.ranking.cleanCache();
      await core.updateHomeGuildRoles(
        publicEnv.PUBLIC_HOME_SERVER_ID!,
        publicEnv.PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID!,
        publicEnv.PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID!,
        publicEnv.PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID!,
      );
      await core.record.update();
      await core.statChannel.update();
      await updatePanels();
      await core.user.setActivity();
      return {};
    },
  });
}
