-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'REMOTE', 'VOLUNTEER', 'CONTRACT', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "TrainingModality" AS ENUM ('ONLINE', 'IN_PERSON', 'HYBRID');

-- CreateEnum
CREATE TYPE "TrainingLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS');

-- CreateEnum
CREATE TYPE "ApplicationType" AS ENUM ('JOB', 'TRAINING');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "type" "JobType" NOT NULL DEFAULT 'FULL_TIME',
    "location" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "link" TEXT,
    "source" TEXT NOT NULL DEFAULT 'Job Portal',
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "salary" TEXT,
    "deadline" TIMESTAMP(3),
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingProgram" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "description" TEXT,
    "duration" TEXT NOT NULL,
    "modality" "TrainingModality" NOT NULL DEFAULT 'ONLINE',
    "spots" INTEGER NOT NULL DEFAULT 0,
    "level" "TrainingLevel" NOT NULL DEFAULT 'BEGINNER',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "link" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "ApplicationType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "jobPostingId" TEXT,
    "trainingProgramId" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastStatusChange" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOpportunity" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "minRecoveryLevel" INTEGER NOT NULL DEFAULT 1,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobPosting_type_idx" ON "JobPosting"("type");

-- CreateIndex
CREATE INDEX "JobPosting_category_idx" ON "JobPosting"("category");

-- CreateIndex
CREATE INDEX "JobPosting_verified_idx" ON "JobPosting"("verified");

-- CreateIndex
CREATE INDEX "JobPosting_isActive_idx" ON "JobPosting"("isActive");

-- CreateIndex
CREATE INDEX "JobPosting_postedAt_idx" ON "JobPosting"("postedAt");

-- CreateIndex
CREATE INDEX "TrainingProgram_modality_idx" ON "TrainingProgram"("modality");

-- CreateIndex
CREATE INDEX "TrainingProgram_level_idx" ON "TrainingProgram"("level");

-- CreateIndex
CREATE INDEX "TrainingProgram_isActive_idx" ON "TrainingProgram"("isActive");

-- CreateIndex
CREATE INDEX "TrainingProgram_createdAt_idx" ON "TrainingProgram"("createdAt");

-- CreateIndex
CREATE INDEX "JobApplication_userId_idx" ON "JobApplication"("userId");

-- CreateIndex
CREATE INDEX "JobApplication_targetType_idx" ON "JobApplication"("targetType");

-- CreateIndex
CREATE INDEX "JobApplication_targetId_idx" ON "JobApplication"("targetId");

-- CreateIndex
CREATE INDEX "JobApplication_jobPostingId_idx" ON "JobApplication"("jobPostingId");

-- CreateIndex
CREATE INDEX "JobApplication_trainingProgramId_idx" ON "JobApplication"("trainingProgramId");

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");

-- CreateIndex
CREATE INDEX "JobApplication_submittedAt_idx" ON "JobApplication"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobOpportunity_externalId_key" ON "JobOpportunity"("externalId");

-- CreateIndex
CREATE INDEX "JobOpportunity_source_idx" ON "JobOpportunity"("source");

-- CreateIndex
CREATE INDEX "JobOpportunity_category_idx" ON "JobOpportunity"("category");

-- CreateIndex
CREATE INDEX "JobOpportunity_minRecoveryLevel_idx" ON "JobOpportunity"("minRecoveryLevel");

-- CreateIndex
CREATE INDEX "JobOpportunity_isVerified_idx" ON "JobOpportunity"("isVerified");

-- CreateIndex
CREATE INDEX "JobOpportunity_createdAt_idx" ON "JobOpportunity"("createdAt");

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_trainingProgramId_fkey" FOREIGN KEY ("trainingProgramId") REFERENCES "TrainingProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
