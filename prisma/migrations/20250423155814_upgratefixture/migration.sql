-- AlterTable
ALTER TABLE "Fixture" ADD COLUMN     "containerId" TEXT,
ADD COLUMN     "time" TEXT,
ADD COLUMN     "venue" TEXT;

-- CreateTable
CREATE TABLE "FixtureContainer" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "matchType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixtureContainer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FixtureContainer_tournamentId_idx" ON "FixtureContainer"("tournamentId");

-- CreateIndex
CREATE INDEX "Fixture_containerId_idx" ON "Fixture"("containerId");

-- AddForeignKey
ALTER TABLE "FixtureContainer" ADD CONSTRAINT "FixtureContainer_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "FixtureContainer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
