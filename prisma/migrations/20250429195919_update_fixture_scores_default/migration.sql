/*
  Warnings:

  - Made the column `homeScore` on table `Fixture` required. This step will fail if there are existing NULL values in that column.
  - Made the column `awayScore` on table `Fixture` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
-- First, update NULL values to 0
UPDATE "Fixture" SET "homeScore" = 0 WHERE "homeScore" IS NULL;
UPDATE "Fixture" SET "awayScore" = 0 WHERE "awayScore" IS NULL;

-- Then make the columns required with default value
ALTER TABLE "Fixture" ALTER COLUMN "homeScore" SET NOT NULL,
                      ALTER COLUMN "homeScore" SET DEFAULT 0;
                      
ALTER TABLE "Fixture" ALTER COLUMN "awayScore" SET NOT NULL,
                      ALTER COLUMN "awayScore" SET DEFAULT 0;
