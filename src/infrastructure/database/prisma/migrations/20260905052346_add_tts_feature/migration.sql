-- CreateEnum
CREATE TYPE "TtsIgnoreIdType" AS ENUM ('UserId', 'ChannelId');

-- AlterTable
ALTER TABLE "GuildSetting" ADD COLUMN     "ttsDefaultSpeakerId" INTEGER,
ADD COLUMN     "ttsSkipCodeBlock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "ttsSkipUrl" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ttsSpeakerId" INTEGER;

-- CreateTable
CREATE TABLE "UserDictionary" (
    "userId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDictionary_pkey" PRIMARY KEY ("userId","word")
);

-- CreateTable
CREATE TABLE "GuildDictionary" (
    "guildId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildDictionary_pkey" PRIMARY KEY ("guildId","word")
);

-- CreateTable
CREATE TABLE "GuildTtsIgnoreList" (
    "guildId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "idType" "TtsIgnoreIdType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildTtsIgnoreList_pkey" PRIMARY KEY ("guildId","targetId")
);
