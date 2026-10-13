-- CreateTable
CREATE TABLE "UserVerifyLog" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "fingerprint" JSONB,
    "fingerprintHashes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserVerifyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserVerifyLog_userId_idx" ON "UserVerifyLog"("userId");

-- CreateIndex
CREATE INDEX "UserVerifyLog_guildId_idx" ON "UserVerifyLog"("guildId");
