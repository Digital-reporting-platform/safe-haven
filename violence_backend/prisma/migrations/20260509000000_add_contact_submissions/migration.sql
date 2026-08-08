-- CreateEnum
CREATE TYPE "ContactInquiryType" AS ENUM ('GENERAL', 'PRIVACY', 'TECHNICAL', 'LEGAL', 'ACCESSIBILITY', 'PARTNERSHIP', 'BILLING', 'MEDIA');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESPONDED', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ContactUrgency" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "subject" TEXT NOT NULL,
    "inquiryType" "ContactInquiryType" NOT NULL DEFAULT 'GENERAL',
    "urgency" "ContactUrgency" NOT NULL DEFAULT 'NORMAL',
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'NEW',
    "ipAddress" VARCHAR(255),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactSubmission_status_idx" ON "ContactSubmission"("status");

-- CreateIndex
CREATE INDEX "ContactSubmission_inquiryType_idx" ON "ContactSubmission"("inquiryType");

-- CreateIndex
CREATE INDEX "ContactSubmission_urgency_idx" ON "ContactSubmission"("urgency");

-- CreateIndex
CREATE INDEX "ContactSubmission_createdAt_idx" ON "ContactSubmission"("createdAt");
