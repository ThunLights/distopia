-- AlterTable
ALTER TABLE "GuildSetting" ADD COLUMN     "ticketRoles" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Keep the role already configured on each guild. "ticketRole" stays for pods still on the
-- previous version during the rollout; drop it in a later migration.
UPDATE "GuildSetting" SET "ticketRoles" = ARRAY["ticketRole"] WHERE "ticketRole" IS NOT NULL;
