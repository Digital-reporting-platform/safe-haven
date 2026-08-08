-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SURVIVOR', 'COUNSELOR', 'MEDICAL_PROFESSIONAL', 'LEGAL_ADVISOR', 'ADMIN', 'MODERATOR', 'SYSTEM');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "IncidentCategory" AS ENUM ('PHYSICAL_VIOLENCE', 'SEXUAL_ASSAULT', 'EMOTIONAL_ABUSE', 'PSYCHOLOGICAL_ABUSE', 'NEGLECT', 'CYBERBULLYING', 'HARASSMENT', 'DISCRIMINATION', 'WORKPLACE_ABUSE', 'DOMESTIC_VIOLENCE', 'CHILD_ABUSE', 'ELDER_ABUSE', 'OTHER');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING_REVIEW', 'UNDER_INVESTIGATION', 'ASSIGNED_TO_PROFESSIONAL', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('COUNSELING', 'MEDICAL_SUPPORT', 'LEGAL_ASSISTANCE', 'EMERGENCY_SUPPORT', 'PREVENTION_EDUCATION', 'RESOURCE_REFERRAL', 'COMBINED_SUPPORT');

-- CreateEnum
CREATE TYPE "CasePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ServiceProviderType" AS ENUM ('COUNSELOR', 'MEDICAL_PROFESSIONAL', 'LEGAL_ADVISOR', 'NGO', 'GOVERNMENT_AGENCY', 'COMMUNITY_CENTER', 'SHELTER', 'HOTLINE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ForumCategory" AS ENUM ('PEER_SUPPORT', 'STORYTELLING', 'QUESTIONS_ANSWERS', 'RESOURCES', 'ANNOUNCEMENTS', 'AWARENESS');

-- CreateEnum
CREATE TYPE "ForumPostStatus" AS ENUM ('PENDING_MODERATION', 'PUBLISHED', 'HIDDEN', 'DELETED');

-- CreateEnum
CREATE TYPE "MissingPersonStatus" AS ENUM ('ACTIVE', 'FOUND', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'SURVIVOR',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "IncidentCategory" NOT NULL,
    "severity" "SeverityLevel" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT NOT NULL DEFAULT 'en',
    "classificationScore" DOUBLE PRECISION,
    "classificationLabel" TEXT,
    "suggestedCaseType" TEXT,
    "suggestedPriority" TEXT,
    "location" TEXT,
    "gpsLat" DOUBLE PRECISION,
    "gpsLng" DOUBLE PRECISION,
    "ipAddress" VARCHAR(255),
    "ipHash" TEXT,
    "deviceFingerprint" VARCHAR(255),
    "riskScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "flaggedAsRepetitive" BOOLEAN NOT NULL DEFAULT false,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseAssignment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "assignedById" TEXT,
    "caseType" "CaseType" NOT NULL,
    "priority" "CasePriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CaseAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseComment" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ServiceProviderType" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "description" TEXT,
    "website" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "availability" TEXT,
    "languages" TEXT[] DEFAULT ARRAY['en']::TEXT[],
    "specializations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceProviderReview" (
    "id" TEXT NOT NULL,
    "serviceProviderId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceProviderReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceProviderId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "SupportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseFeedback" (
    "id" TEXT NOT NULL,
    "caseAssignmentId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumPost" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "ForumCategory" NOT NULL,
    "status" "ForumPostStatus" NOT NULL DEFAULT 'PENDING_MODERATION',
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForumComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissingPerson" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "age" INTEGER,
    "description" TEXT,
    "photoUrl" TEXT,
    "lastSeenLocation" TEXT NOT NULL,
    "lastSeenDate" TIMESTAMP(3) NOT NULL,
    "status" "MissingPersonStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "MissingPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsSnapshot" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalReports" INTEGER NOT NULL DEFAULT 0,
    "reportsByCategory" TEXT NOT NULL,
    "reportsBySeverity" TEXT NOT NULL,
    "resolutionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageResolutionTime" INTEGER NOT NULL DEFAULT 0,
    "anonymousReportCount" INTEGER NOT NULL DEFAULT 0,
    "publicReportCount" INTEGER NOT NULL DEFAULT 0,
    "casesByType" TEXT NOT NULL,
    "uniqueReporters" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AnalyticsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MLTrainingData" (
    "id" TEXT NOT NULL,
    "category" "IncidentCategory" NOT NULL,
    "text" TEXT NOT NULL,
    "severity" "SeverityLevel" NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MLTrainingData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_supportProviders" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_supportProviders_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Report_ipHash_key" ON "Report"("ipHash");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_category_idx" ON "Report"("category");

-- CreateIndex
CREATE INDEX "Report_severity_idx" ON "Report"("severity");

-- CreateIndex
CREATE INDEX "Report_riskScore_idx" ON "Report"("riskScore");

-- CreateIndex
CREATE INDEX "Report_ipHash_idx" ON "Report"("ipHash");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

-- CreateIndex
CREATE INDEX "Evidence_reportId_idx" ON "Evidence"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseAssignment_reportId_key" ON "CaseAssignment"("reportId");

-- CreateIndex
CREATE INDEX "CaseAssignment_reportId_idx" ON "CaseAssignment"("reportId");

-- CreateIndex
CREATE INDEX "CaseAssignment_assignedToId_idx" ON "CaseAssignment"("assignedToId");

-- CreateIndex
CREATE INDEX "CaseAssignment_caseType_idx" ON "CaseAssignment"("caseType");

-- CreateIndex
CREATE INDEX "CaseAssignment_priority_idx" ON "CaseAssignment"("priority");

-- CreateIndex
CREATE INDEX "CaseAssignment_status_idx" ON "CaseAssignment"("status");

-- CreateIndex
CREATE INDEX "CaseComment_reportId_idx" ON "CaseComment"("reportId");

-- CreateIndex
CREATE INDEX "CaseComment_authorId_idx" ON "CaseComment"("authorId");

-- CreateIndex
CREATE INDEX "ServiceProvider_type_idx" ON "ServiceProvider"("type");

-- CreateIndex
CREATE INDEX "ServiceProvider_isVerified_idx" ON "ServiceProvider"("isVerified");

-- CreateIndex
CREATE INDEX "ServiceProviderReview_serviceProviderId_idx" ON "ServiceProviderReview"("serviceProviderId");

-- CreateIndex
CREATE INDEX "SupportRequest_userId_idx" ON "SupportRequest"("userId");

-- CreateIndex
CREATE INDEX "SupportRequest_serviceProviderId_idx" ON "SupportRequest"("serviceProviderId");

-- CreateIndex
CREATE INDEX "SupportRequest_status_idx" ON "SupportRequest"("status");

-- CreateIndex
CREATE INDEX "CaseFeedback_caseAssignmentId_idx" ON "CaseFeedback"("caseAssignmentId");

-- CreateIndex
CREATE INDEX "ForumPost_authorId_idx" ON "ForumPost"("authorId");

-- CreateIndex
CREATE INDEX "ForumPost_category_idx" ON "ForumPost"("category");

-- CreateIndex
CREATE INDEX "ForumPost_status_idx" ON "ForumPost"("status");

-- CreateIndex
CREATE INDEX "ForumPost_createdAt_idx" ON "ForumPost"("createdAt");

-- CreateIndex
CREATE INDEX "ForumComment_postId_idx" ON "ForumComment"("postId");

-- CreateIndex
CREATE INDEX "MissingPerson_status_idx" ON "MissingPerson"("status");

-- CreateIndex
CREATE INDEX "MissingPerson_lastSeenDate_idx" ON "MissingPerson"("lastSeenDate");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsSnapshot_date_key" ON "AnalyticsSnapshot"("date");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "MLTrainingData_category_idx" ON "MLTrainingData"("category");

-- CreateIndex
CREATE INDEX "MLTrainingData_isActive_idx" ON "MLTrainingData"("isActive");

-- CreateIndex
CREATE INDEX "_supportProviders_B_index" ON "_supportProviders"("B");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAssignment" ADD CONSTRAINT "CaseAssignment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAssignment" ADD CONSTRAINT "CaseAssignment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "ServiceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseComment" ADD CONSTRAINT "CaseComment_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseComment" ADD CONSTRAINT "CaseComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProviderReview" ADD CONSTRAINT "ServiceProviderReview_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "ServiceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportRequest" ADD CONSTRAINT "SupportRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportRequest" ADD CONSTRAINT "SupportRequest_serviceProviderId_fkey" FOREIGN KEY ("serviceProviderId") REFERENCES "ServiceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseFeedback" ADD CONSTRAINT "CaseFeedback_caseAssignmentId_fkey" FOREIGN KEY ("caseAssignmentId") REFERENCES "CaseAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_supportProviders" ADD CONSTRAINT "_supportProviders_A_fkey" FOREIGN KEY ("A") REFERENCES "CaseAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_supportProviders" ADD CONSTRAINT "_supportProviders_B_fkey" FOREIGN KEY ("B") REFERENCES "ServiceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
