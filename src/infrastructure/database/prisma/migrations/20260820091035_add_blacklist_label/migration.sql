-- AlterTable
ALTER TABLE "UserBlackList" ADD COLUMN     "label" TEXT;

-- Backfill existing rows with a placeholder label before enforcing NOT NULL
UPDATE "UserBlackList" SET "label" = 'ブラックリスト ' || "id" WHERE "label" IS NULL;

-- AlterTable
ALTER TABLE "UserBlackList" ALTER COLUMN "label" SET NOT NULL;
