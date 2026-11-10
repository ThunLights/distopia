import type { ScheduleFeature } from "app-schedule/feature";

import { updateStatChannels } from "./StatChannel";

const feature: ScheduleFeature = {
  "*/20 * * * *": [updateStatChannels],
};

export default feature;
