-- CreateEnum
CREATE TYPE "TtsProvider" AS ENUM ('WebVoiceVox', 'SakuraAi');

-- AlterTable
ALTER TABLE "GuildSetting" ADD COLUMN     "ttsProvider" "TtsProvider" NOT NULL DEFAULT 'WebVoiceVox';
