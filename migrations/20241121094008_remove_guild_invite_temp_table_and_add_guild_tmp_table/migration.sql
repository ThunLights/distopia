/*
  Warnings:

  - You are about to drop the `GuildInviteTemp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GuildInviteTemp";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "GuildTmp" (
    "guildId" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "invite" TEXT NOT NULL,
    "icon" TEXT,
    "banner" TEXT
);
