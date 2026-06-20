/*
  Warnings:

  - You are about to drop the column `duration` on the `pomodoros` table. All the data in the column will be lost.
  - Added the required column `plannedDuration` to the `pomodoros` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pomodoros" DROP COLUMN "duration",
ADD COLUMN     "actualDuration" INTEGER,
ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'COUNTDOWN',
ADD COLUMN     "pausedAt" TIMESTAMP(3),
ADD COLUMN     "plannedDuration" INTEGER NOT NULL,
ADD COLUMN     "pointsEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'RUNNING',
ADD COLUMN     "totalPausedMs" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "pomodoros_userId_startedAt_idx" ON "pomodoros"("userId", "startedAt");

-- AddForeignKey
ALTER TABLE "pomodoros" ADD CONSTRAINT "pomodoros_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
