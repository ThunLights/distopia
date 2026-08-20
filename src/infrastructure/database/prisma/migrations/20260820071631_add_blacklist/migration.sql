-- CreateEnum
CREATE TYPE "BlackListPermission" AS ENUM ('AddTarget', 'EditTarget', 'RemoveTarget');

-- CreateEnum
CREATE TYPE "BlackListAction" AS ENUM ('Log', 'Kick', 'Ban');

-- CreateTable
CREATE TABLE "UserBlackList" (
    "id" SERIAL NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "UserBlackList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlackListTarget" (
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "blackListId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlackListTarget_pkey" PRIMARY KEY ("blackListId","userId")
);

-- CreateTable
CREATE TABLE "BlackListEditor" (
    "blackListId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "allPermissions" BOOLEAN NOT NULL DEFAULT false,
    "permissions" "BlackListPermission"[] DEFAULT ARRAY[]::"BlackListPermission"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlackListEditor_pkey" PRIMARY KEY ("blackListId","userId")
);

-- CreateTable
CREATE TABLE "GuildBlackList" (
    "guildId" TEXT NOT NULL,
    "blackListId" INTEGER NOT NULL,
    "action" "BlackListAction" NOT NULL DEFAULT 'Log',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildBlackList_pkey" PRIMARY KEY ("guildId","blackListId")
);

-- CreateIndex
CREATE INDEX "UserBlackList_ownerId_idx" ON "UserBlackList"("ownerId");

-- CreateIndex
CREATE INDEX "GuildBlackList_blackListId_idx" ON "GuildBlackList"("blackListId");

-- AddForeignKey
ALTER TABLE "BlackListTarget" ADD CONSTRAINT "BlackListTarget_blackListId_fkey" FOREIGN KEY ("blackListId") REFERENCES "UserBlackList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlackListEditor" ADD CONSTRAINT "BlackListEditor_blackListId_fkey" FOREIGN KEY ("blackListId") REFERENCES "UserBlackList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildBlackList" ADD CONSTRAINT "GuildBlackList_blackListId_fkey" FOREIGN KEY ("blackListId") REFERENCES "UserBlackList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
