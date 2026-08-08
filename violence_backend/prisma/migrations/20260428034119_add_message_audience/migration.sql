/*
  Warnings:

  - The values [UNDER_INVESTIGATION,ASSIGNED_TO_PROFESSIONAL,IN_PROGRESS,ARCHIVED] on the enum `ReportStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[trackingNumber]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MessageAudience" AS ENUM ('ALL', 'SURVIVOR', 'ASSIGNED_PROFESSIONAL', 'SUPPORT_PROVIDER', 'COUNSELOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "ReportStatus_new" AS ENUM ('PENDING_REVIEW', 'RECEIVED', 'ASSIGNED', 'IN_SUPPORT', 'RESOLVED', 'CLOSED', 'REJECTED');
ALTER TABLE "public"."Report" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Report" ALTER COLUMN "status" TYPE "ReportStatus_new" USING ("status"::text::"ReportStatus_new");
ALTER TYPE "ReportStatus" RENAME TO "ReportStatus_old";
ALTER TYPE "ReportStatus_new" RENAME TO "ReportStatus";
DROP TYPE "public"."ReportStatus_old";
ALTER TABLE "Report" ALTER COLUMN "status" SET DEFAULT 'PENDING_REVIEW';
COMMIT;

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'GUEST';

-- DropForeignKey
ALTER TABLE "CaseComment" DROP CONSTRAINT "CaseComment_authorId_fkey";

-- AlterTable
ALTER TABLE "CaseComment" ADD COLUMN     "audience" "MessageAudience" NOT NULL DEFAULT 'ALL',
ADD COLUMN     "isSystemMessage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "senderRole" "UserRole" NOT NULL DEFAULT 'SURVIVOR',
ALTER COLUMN "authorId" DROP NOT NULL,
ALTER COLUMN "isPublic" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "classificationConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "statusHistory" JSONB,
ADD COLUMN     "trackingNumber" TEXT;

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "participant1Id" TEXT NOT NULL,
    "participant2Id" TEXT NOT NULL,
    "subject" TEXT,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentRequest" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedToId" TEXT NOT NULL,
    "proposedDateTime" TIMESTAMP(3) NOT NULL,
    "message" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "responseMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_participant1Id_idx" ON "Conversation"("participant1Id");

-- CreateIndex
CREATE INDEX "Conversation_participant2Id_idx" ON "Conversation"("participant2Id");

-- CreateIndex
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "AppointmentRequest_caseId_idx" ON "AppointmentRequest"("caseId");

-- CreateIndex
CREATE INDEX "AppointmentRequest_requestedById_idx" ON "AppointmentRequest"("requestedById");

-- CreateIndex
CREATE INDEX "AppointmentRequest_requestedToId_idx" ON "AppointmentRequest"("requestedToId");

-- CreateIndex
CREATE INDEX "AppointmentRequest_status_idx" ON "AppointmentRequest"("status");

-- CreateIndex
CREATE INDEX "CaseComment_senderRole_idx" ON "CaseComment"("senderRole");

-- CreateIndex
CREATE INDEX "CaseComment_audience_idx" ON "CaseComment"("audience");

-- CreateIndex
CREATE INDEX "CaseComment_createdAt_idx" ON "CaseComment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Report_trackingNumber_key" ON "Report"("trackingNumber");

-- CreateIndex
CREATE INDEX "Report_trackingNumber_idx" ON "Report"("trackingNumber");

-- AddForeignKey
ALTER TABLE "CaseComment" ADD CONSTRAINT "CaseComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_participant1Id_fkey" FOREIGN KEY ("participant1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_participant2Id_fkey" FOREIGN KEY ("participant2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
