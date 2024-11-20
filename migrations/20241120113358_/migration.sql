/*
  Warnings:

  - Added the required column `invite` to the `Guild` table without a default value. This is not possible if the table is not empty.

*/
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
INSERT INTO "new_Guild" ("banner", "category", "description", "guildId", "icon", "name", "userId") SELECT "banner", "category", "description", "guildId", "icon", "name", "userId" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
