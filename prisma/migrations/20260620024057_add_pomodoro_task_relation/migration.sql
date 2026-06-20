/*
  Warnings:

  - You are about to drop the column `actualDuration` on the `pomodoros` table. All the data in the column will be lost.
  - You are about to drop the column `mode` on the `pomodoros` table. All the data in the column will be lost.
  - You are about to drop the column `pausedAt` on the `pomodoros` table. All the data in the column will be lost.
  - You are about to drop the column `plannedDuration` on the `pomodoros` table. All the data in the column will be lost.
  - You are about to drop the column `pointsEarned` on the `pomodoros` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `pomodoros` table. All the data in the column will be lost.
  - You are about to drop the column `totalPausedMs` on the `pomodoros` table. All the data in the column will be lost.
  - Added the required column `duration` to the `pomodoros` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pomodoros" DROP COLUMN "actualDuration",
DROP COLUMN "mode",
DROP COLUMN "pausedAt",
DROP COLUMN "plannedDuration",
DROP COLUMN "pointsEarned",
DROP COLUMN "status",
DROP COLUMN "totalPausedMs",
ADD COLUMN     "duration" INTEGER NOT NULL;
