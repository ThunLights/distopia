/*
  Warnings:

  - The primary key for the `GuildRecordOneDay` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "GuildRecordOneDay" DROP CONSTRAINT "GuildRecordOneDay_pkey",
ALTER COLUMN "date" SET DATA TYPE DATE,
ADD CONSTRAINT "GuildRecordOneDay_pkey" PRIMARY KEY ("guildId", "date");
