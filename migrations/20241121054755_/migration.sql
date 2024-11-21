/*
  Warnings:

  - You are about to drop the column `time` on the `Guild` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "GuildBump" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "time" BIGINT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guild" (
    "guildId" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "invite" TEXT NOT NULL,
    "icon" TEXT,
    "banner" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL
);
INSERT INTO "new_Guild" ("banner", "category", "description", "guildId", "icon", "invite", "name", "userId") SELECT "banner", "category", "description", "guildId", "icon", "invite", "name", "userId" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
