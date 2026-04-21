import { DISCORD_INVITE_LINK, staffs, supporters } from "domain-service-core";

export function getPublicConstants() {
  return {
    supporters,
    staffs,
    DISCORD_INVITE_LINK,
  };
}
