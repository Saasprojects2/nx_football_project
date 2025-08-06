/*
  Warnings:

  - You are about to drop the column `courners` on the `LeaderboardEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LeaderboardEntry" DROP COLUMN "courners",
ADD COLUMN     "corners" INTEGER NOT NULL DEFAULT 0;
