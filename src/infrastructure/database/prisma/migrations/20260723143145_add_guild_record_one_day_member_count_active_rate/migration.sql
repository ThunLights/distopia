-- AlterTable
ALTER TABLE "GuildRecordOneDay" ADD COLUMN     "activeRate" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "memberCount" INTEGER NOT NULL DEFAULT 0;
