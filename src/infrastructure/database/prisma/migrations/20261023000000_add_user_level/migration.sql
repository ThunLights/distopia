-- AlterTable
ALTER TABLE "User" ADD COLUMN     "level" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "point" BIGINT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "GuildMemberLevel" (
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" BIGINT NOT NULL DEFAULT 0,
    "point" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "GuildMemberLevel_pkey" PRIMARY KEY ("guildId","userId")
);

-- CreateIndex
CREATE INDEX "GuildMemberLevel_guildId_level_point_idx" ON "GuildMemberLevel"("guildId", "level" DESC, "point" DESC);

-- CreateIndex
CREATE INDEX "User_level_point_idx" ON "User"("level" DESC, "point" DESC);
