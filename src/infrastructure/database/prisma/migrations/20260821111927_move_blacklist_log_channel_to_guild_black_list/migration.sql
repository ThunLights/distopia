/*
  Warnings:

  - You are about to drop the column `logBlackList` on the `GuildSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GuildBlackList" ADD COLUMN     "logChannel" TEXT;

-- Backfill: carry each guild's previous shared log channel onto its existing blacklist applications
UPDATE "GuildBlackList" gbl
SET "logChannel" = gs."logBlackList"
FROM "GuildSetting" gs
WHERE gs."guildId" = gbl."guildId" AND gs."logBlackList" IS NOT NULL;

-- AlterTable
ALTER TABLE "GuildSetting" DROP COLUMN "logBlackList";
