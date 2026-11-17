import type { ScheduleFeature } from "app-schedule/feature";

const feature: ScheduleFeature = {
  "*/5 * * * *": [(core) => core.message.syncDB(), (core) => core.member.syncDB()],
};

export default feature;
