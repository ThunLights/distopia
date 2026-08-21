-- AlterTable
ALTER TABLE "BlackListTarget" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "GuildBlackList" ADD COLUMN     "banTags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "UserBlackList" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
