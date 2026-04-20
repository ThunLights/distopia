import { staffs, useAsync } from "domain-service-core";

export function isStaffSync(userId: string): boolean {
  const staffIds = staffs.map(({ discordId }) => discordId as string);
  return staffIds.includes(userId);
}

export const isStaff = useAsync(isStaffSync);
