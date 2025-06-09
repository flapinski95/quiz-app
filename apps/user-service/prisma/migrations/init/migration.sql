-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "keycloakId" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "bio" TEXT,
    "totalQuizzesPlayed" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuizHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserQuizHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTopicStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "avgScore" DOUBLE PRECISION NOT NULL,
    "quizCount" INTEGER NOT NULL,

    CONSTRAINT "UserTopicStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveQuizSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActiveQuizSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_keycloakId_key" ON "UserProfile"("keycloakId");

-- CreateIndex
CREATE INDEX "UserQuizHistory_userId_idx" ON "UserQuizHistory"("userId");

-- CreateIndex
CREATE INDEX "UserQuizHistory_quizId_idx" ON "UserQuizHistory"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTopicStats_userId_category_key" ON "UserTopicStats"("userId", "category");

-- CreateIndex
CREATE INDEX "ActiveQuizSession_userId_idx" ON "ActiveQuizSession"("userId");

-- AddForeignKey
ALTER TABLE "UserQuizHistory" ADD CONSTRAINT "UserQuizHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTopicStats" ADD CONSTRAINT "UserTopicStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActiveQuizSession" ADD CONSTRAINT "ActiveQuizSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

