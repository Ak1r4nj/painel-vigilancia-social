-- CreateTable
CREATE TABLE "technicians" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "children" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT
);

-- CreateTable
CREATE TABLE "health_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "childId" TEXT NOT NULL,
    "lastVisit" DATETIME,
    "vaccinesUpToDate" BOOLEAN NOT NULL,
    "alerts" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "health_records_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "education_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "childId" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "attendanceRate" REAL NOT NULL,
    "alerts" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "education_records_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "social_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "childId" TEXT NOT NULL,
    "benefit" TEXT NOT NULL,
    "benefitStatus" TEXT NOT NULL,
    "alerts" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "social_records_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "technicians_email_key" ON "technicians"("email");

-- CreateIndex
CREATE UNIQUE INDEX "health_records_childId_key" ON "health_records"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "education_records_childId_key" ON "education_records"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "social_records_childId_key" ON "social_records"("childId");
