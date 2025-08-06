-- AlterTable
ALTER TABLE "MatchEvent" ADD COLUMN     "metadata" TEXT;

-- AlterTable
ALTER TABLE "PlayerStats" ADD COLUMN     "isOnField" BOOLEAN NOT NULL DEFAULT false;
