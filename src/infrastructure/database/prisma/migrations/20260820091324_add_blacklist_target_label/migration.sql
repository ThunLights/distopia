/*
  Warnings:

  - Added the required column `label` to the `BlackListTarget` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BlackListTarget" ADD COLUMN     "label" TEXT NOT NULL;
