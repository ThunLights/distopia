import type { AppCore } from "app-core";

import { ScheduleTaskManager } from "./ScheduleTaskManager";

export type SetScheduleTaskArgs = {
  core: AppCore;
  updatePanels: () => Promise<void>;
  homeServerId: string;
  specialDirectorsRoleId: string;
  directorsRoleId: string;
  subDirectorsRoleId: string;
};

export function setScheduleTask(args: SetScheduleTaskArgs) {
  const {
    core,
    updatePanels,
    homeServerId,
    specialDirectorsRoleId,
    directorsRoleId,
    subDirectorsRoleId,
  } = args;
  const manager = new ScheduleTaskManager();

  manager.add(
    "*/5 * * * *",
    async () => {
      await core.jwt.update();
      await core.message.syncDB();
      await core.member.syncDB();
    },
    // Prevent a slow run from overlapping the next tick, which caused
    // concurrent guildRecordOneDay upserts to deadlock (Postgres 40P01)
    // with the */20 job below.
    { noOverlap: true },
  );

  manager.add(
    "*/20 * * * *",
    async () => {
      await core.oauth2.updateTokens();
      await core.friend.updateCache();

      await core.guild.removeUnJoinedGuildData();
      await core.voice.update();
      await core.activeRate.update();
      await core.ranking.cleanCache();
      await core.updateHomeGuildRoles(
        homeServerId,
        specialDirectorsRoleId,
        directorsRoleId,
        subDirectorsRoleId,
      );
      await core.record.update();
      await core.statChannel.update();
      await updatePanels();
      await core.user.setActivity();
    },
    // This job's runtime scales with guild count (sequential Discord API
    // calls); without noOverlap a slow run can still be executing when the
    // next tick fires, causing concurrent guildRecord upserts to deadlock.
    { noOverlap: true },
  );

  return manager;
}
