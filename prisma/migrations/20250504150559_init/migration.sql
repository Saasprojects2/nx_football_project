-- CreateEnum
CREATE TYPE "PenaltyOutcome" AS ENUM ('SCORED', 'MISSED', 'SAVED');

-- AlterTable
ALTER TABLE "Fixture" ADD COLUMN     "awaypenaltyScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "homepenaltyScore" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "MatchEvent" ADD COLUMN     "penaltyOutcome" "PenaltyOutcome";
