-- AlterTable
ALTER TABLE "MatchEvent" ADD COLUMN     "minutesPlayed" INTEGER;

-- AlterTable
ALTER TABLE "PlayerStats" ADD COLUMN     "tournamentId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isPlaying" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "matchesPlayed" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PlayerTournamentStats" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "minutesPlayed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerTournamentStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerTournamentStats_playerId_tournamentId_key" ON "PlayerTournamentStats"("playerId", "tournamentId");

-- AddForeignKey
ALTER TABLE "PlayerStats" ADD CONSTRAINT "PlayerStats_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTournamentStats" ADD CONSTRAINT "PlayerTournamentStats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTournamentStats" ADD CONSTRAINT "PlayerTournamentStats_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
