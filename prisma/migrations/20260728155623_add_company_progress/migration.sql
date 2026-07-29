-- CreateTable
CREATE TABLE "CompanyProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companySlug" TEXT NOT NULL,
    "solvedQuestionIds" TEXT NOT NULL DEFAULT '[]',
    "mockTestsCompleted" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CompanyProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyProgress_userId_companySlug_key" ON "CompanyProgress"("userId", "companySlug");
