-- AlterTable
ALTER TABLE "GuildSetting" ADD COLUMN     "ticketRoles" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Keep the role already configured on each guild
UPDATE "GuildSetting" SET "ticketRoles" = ARRAY["ticketRole"] WHERE "ticketRole" IS NOT NULL;

-- AlterTable
ALTER TABLE "GuildSetting" DROP COLUMN "ticketRole";
