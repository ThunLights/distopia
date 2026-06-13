/*
  Warnings:

  - You are about to drop the column `banner` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Guild` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Guild" DROP COLUMN "banner",
DROP COLUMN "icon",
DROP COLUMN "name";
