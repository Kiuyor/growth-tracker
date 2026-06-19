-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clerkId" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "deadline" DATETIME,
    "category" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles" ("clerkId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subtasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subtasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "point_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "sourceId" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "point_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles" ("clerkId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "icon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles" ("clerkId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_checks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT true,
    "streak" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "daily_checks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles" ("clerkId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mood_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "moodScore" INTEGER NOT NULL,
    "tags" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mood_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles" ("clerkId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pomodoros" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "taskId" TEXT,
    "startedAt" DATETIME NOT NULL,
    "endedAt" DATETIME,
    CONSTRAINT "pomodoros_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profiles" ("clerkId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_clerkId_key" ON "user_profiles"("clerkId");

-- CreateIndex
CREATE INDEX "tasks_userId_status_idx" ON "tasks"("userId", "status");

-- CreateIndex
CREATE INDEX "tasks_userId_priority_idx" ON "tasks"("userId", "priority");

-- CreateIndex
CREATE INDEX "point_logs_userId_createdAt_idx" ON "point_logs"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_checks_userId_date_key" ON "daily_checks"("userId", "date");
