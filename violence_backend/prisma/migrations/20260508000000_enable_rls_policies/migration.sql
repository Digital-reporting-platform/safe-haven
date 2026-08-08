-- Enable Row Level Security on all public tables
-- This migration addresses all 26 RLS security warnings from Supabase

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Evidence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CaseAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CaseComment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceProvider" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceProviderReview" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SupportRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CaseFeedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ForumPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ForumComment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MissingPerson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sighting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AnalyticsSnapshot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MLTrainingData" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AppointmentRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OTP" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobOpportunity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SavedJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobApplication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_supportProviders" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER TABLE POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON "User"
  FOR SELECT
  USING (auth.uid()::text = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON "User"
  FOR UPDATE
  USING (auth.uid()::text = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON "User"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'SYSTEM')
    )
  );

-- Admins can manage users
CREATE POLICY "Admins can manage users" ON "User"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'SYSTEM')
    )
  );

-- ============================================================================
-- REPORT TABLE POLICIES
-- ============================================================================

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON "Report"
  FOR SELECT
  USING ("reporterId" = auth.uid()::text);

-- Users can create reports
CREATE POLICY "Users can create reports" ON "Report"
  FOR INSERT
  WITH CHECK ("reporterId" = auth.uid()::text OR "isAnonymous" = true);

-- Users can update their own pending reports
CREATE POLICY "Users can update own reports" ON "Report"
  FOR UPDATE
  USING ("reporterId" = auth.uid()::text AND status = 'PENDING_REVIEW');

-- Admins can manage all reports
CREATE POLICY "Admins can manage reports" ON "Report"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'MODERATOR', 'SYSTEM')
    )
  );

-- ============================================================================
-- EVIDENCE TABLE POLICIES
-- ============================================================================

-- Users can view evidence for their own reports
CREATE POLICY "Users can view own evidence" ON "Evidence"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Report" r
      WHERE r.id = "Evidence"."reportId"
      AND r."reporterId" = auth.uid()::text
    )
  );

-- Users can add evidence to their own reports
CREATE POLICY "Users can add evidence" ON "Evidence"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Report" r
      WHERE r.id = "reportId"
      AND r."reporterId" = auth.uid()::text
    )
  );

-- Admins can manage all evidence
CREATE POLICY "Admins can manage evidence" ON "Evidence"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'MODERATOR', 'SYSTEM')
    )
  );

-- ============================================================================
-- CASE ASSIGNMENT POLICIES
-- ============================================================================

-- Admins can manage all assignments
CREATE POLICY "Admins can manage assignments" ON "CaseAssignment"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'MODERATOR', 'SYSTEM')
    )
  );

-- Users can view assignments for their reports
CREATE POLICY "Users can view own assignments" ON "CaseAssignment"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Report" r
      WHERE r.id = "CaseAssignment"."reportId"
      AND r."reporterId" = auth.uid()::text
    )
  );

-- ============================================================================
-- CASE COMMENT POLICIES
-- ============================================================================

-- Users can view comments on their reports
CREATE POLICY "Users can view own comments" ON "CaseComment"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Report" r
      WHERE r.id = "CaseComment"."reportId"
      AND r."reporterId" = auth.uid()::text
    )
  );

-- Users can add comments to their reports
CREATE POLICY "Users can add comments" ON "CaseComment"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Report" r
      WHERE r.id = "reportId"
      AND r."reporterId" = auth.uid()::text
    )
  );

-- Admins can manage all comments
CREATE POLICY "Admins can manage comments" ON "CaseComment"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'MODERATOR', 'SYSTEM')
    )
  );

-- ============================================================================
-- SERVICE PROVIDER POLICIES
-- ============================================================================

-- Everyone can view verified service providers
CREATE POLICY "Public can view verified providers" ON "ServiceProvider"
  FOR SELECT
  USING ("isVerified" = true);

-- Admins can manage service providers
CREATE POLICY "Admins can manage providers" ON "ServiceProvider"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'SYSTEM')
    )
  );

-- ============================================================================
-- SERVICE PROVIDER REVIEW POLICIES
-- ============================================================================

-- Everyone can view reviews
CREATE POLICY "Public can view reviews" ON "ServiceProviderReview"
  FOR SELECT
  USING (true);

-- Authenticated users can add reviews
CREATE POLICY "Users can add reviews" ON "ServiceProviderReview"
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can manage reviews
CREATE POLICY "Admins can manage reviews" ON "ServiceProviderReview"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'MODERATOR', 'SYSTEM')
    )
  );

-- ============================================================================
-- SUPPORT REQUEST POLICIES
-- ============================================================================

-- Users can view their own support requests
CREATE POLICY "Users can view own requests" ON "SupportRequest"
  FOR SELECT
  USING ("userId" = auth.uid()::text);

-- Users can create support requests
CREATE POLICY "Users can create requests" ON "SupportRequest"
  FOR INSERT
  WITH CHECK ("userId" = auth.uid()::text);

-- Admins can manage all support requests
CREATE POLICY "Admins can manage requests" ON "SupportRequest"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'SYSTEM')
    )
  );

-- ============================================================================
-- CASE FEEDBACK POLICIES
-- ============================================================================

-- Users can view feedback for their cases
CREATE POLICY "Users can view own feedback" ON "CaseFeedback"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "CaseAssignment" ca
      JOIN "Report" r ON r.id = ca."reportId"
      WHERE ca.id = "CaseFeedback"."caseAssignmentId"
      AND r."reporterId" = auth.uid()::text
    )
  );

-- Users can add feedback to their cases
CREATE POLICY "Users can add feedback" ON "CaseFeedback"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "CaseAssignment" ca
      JOIN "Report" r ON r.id = ca."reportId"
      WHERE ca.id = "caseAssignmentId"
      AND r."reporterId" = auth.uid()::text
    )
  );

-- Admins can manage all feedback
CREATE POLICY "Admins can manage feedback" ON "CaseFeedback"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'SYSTEM')
    )
  );

-- ============================================================================
-- FORUM POST POLICIES
-- ============================================================================

-- Everyone can view published forum posts
CREATE POLICY "Public can view published posts" ON "ForumPost"
  FOR SELECT
  USING (status = 'PUBLISHED');

-- Users can view their own posts (any status)
CREATE POLICY "Users can view own posts" ON "ForumPost"
  FOR SELECT
  USING ("authorId" = auth.uid()::text);

-- Users can create forum posts
CREATE POLICY "Users can create posts" ON "ForumPost"
  FOR INSERT
  WITH CHECK ("authorId" = auth.uid()::text);

-- Users can update their own posts
CREATE POLICY "Users can update own posts" ON "ForumPost"
  FOR UPDATE
  USING ("authorId" = auth.uid()::text);

-- Moderators can manage all posts
CREATE POLICY "Moderators can manage posts" ON "ForumPost"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'MODERATOR', 'SYSTEM')
    )
  );

-- ============================================================================
-- FORUM COMMENT POLICIES
-- ============================================================================

-- Everyone can view comments on published posts
CREATE POLICY "Public can view comments" ON "ForumComment"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "ForumPost" fp
      WHERE fp.id = "ForumComment"."postId"
      AND fp.status = 'PUBLISHED'
    )
  );

-- Authenticated users can add comments
CREATE POLICY "Users can add comments to posts" ON "ForumComment"
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Moderators can manage all comments
CREATE POLICY "Moderators can manage comments" ON "ForumComment"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'MODERATOR', 'SYSTEM')
    )
  );

-- ============================================================================
-- MISSING PERSON POLICIES
-- ============================================================================

-- Everyone can view active missing persons
CREATE POLICY "Public can view missing persons" ON "MissingPerson"
  FOR SELECT
  USING (status IN ('ACTIVE', 'PENDING'));

-- Authenticated users can create missing person reports
CREATE POLICY "Users can create missing reports" ON "MissingPerson"
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can manage missing persons
CREATE POLICY "Admins can manage missing persons" ON "MissingPerson"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'MODERATOR', 'SYSTEM')
    )
  );

-- ============================================================================
-- SIGHTING POLICIES
-- ============================================================================

-- Everyone can view verified sightings
CREATE POLICY "Public can view verified sightings" ON "Sighting"
  FOR SELECT
  USING ("isVerified" = true);

-- Authenticated users can report sightings
CREATE POLICY "Users can report sightings" ON "Sighting"
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can manage sightings
CREATE POLICY "Admins can manage sightings" ON "Sighting"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'MODERATOR', 'SYSTEM')
    )
  );

-- ============================================================================
-- ANALYTICS SNAPSHOT POLICIES
-- ============================================================================

-- Admins can manage analytics
CREATE POLICY "Admins can manage analytics" ON "AnalyticsSnapshot"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'SYSTEM')
    )
  );

-- ============================================================================
-- AUDIT LOG POLICIES
-- ============================================================================

-- Admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON "AuditLog"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'SYSTEM')
    )
  );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON "AuditLog"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role = 'SYSTEM'
    )
  );

-- ============================================================================
-- ML TRAINING DATA POLICIES
-- ============================================================================

-- Admins can manage ML training data
CREATE POLICY "Admins can manage ML data" ON "MLTrainingData"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'SYSTEM')
    )
  );

-- ============================================================================
-- SYSTEM SETTING POLICIES
-- ============================================================================

-- Admins can manage system settings
CREATE POLICY "Admins can manage settings" ON "SystemSetting"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'SYSTEM')
    )
  );

-- ============================================================================
-- CONVERSATION POLICIES
-- ============================================================================

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations" ON "Conversation"
  FOR SELECT
  USING (
    "participant1Id" = auth.uid()::text 
    OR "participant2Id" = auth.uid()::text
  );

-- Users can create conversations
CREATE POLICY "Users can create conversations" ON "Conversation"
  FOR INSERT
  WITH CHECK (
    "participant1Id" = auth.uid()::text 
    OR "participant2Id" = auth.uid()::text
  );

-- Users can update their conversations
CREATE POLICY "Users can update conversations" ON "Conversation"
  FOR UPDATE
  USING (
    "participant1Id" = auth.uid()::text 
    OR "participant2Id" = auth.uid()::text
  );

-- Admins can manage all conversations
CREATE POLICY "Admins can manage conversations" ON "Conversation"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'SYSTEM')
    )
  );

-- ============================================================================
-- MESSAGE POLICIES
-- ============================================================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view own messages" ON "Message"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Conversation" c
      WHERE c.id = "Message"."conversationId"
      AND (c."participant1Id" = auth.uid()::text OR c."participant2Id" = auth.uid()::text)
    )
  );

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages" ON "Message"
  FOR INSERT
  WITH CHECK (
    "senderId" = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM "Conversation" c
      WHERE c.id = "conversationId"
      AND (c."participant1Id" = auth.uid()::text OR c."participant2Id" = auth.uid()::text)
    )
  );

-- Users can update their own messages
CREATE POLICY "Users can update own messages" ON "Message"
  FOR UPDATE
  USING ("senderId" = auth.uid()::text);

-- Admins can manage all messages
CREATE POLICY "Admins can manage messages" ON "Message"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'MODERATOR', 'SYSTEM')
    )
  );

-- ============================================================================
-- APPOINTMENT REQUEST POLICIES
-- ============================================================================

-- Users can view appointment requests they are involved in
CREATE POLICY "Users can view own appointments" ON "AppointmentRequest"
  FOR SELECT
  USING (
    "requestedById" = auth.uid()::text 
    OR "requestedToId" = auth.uid()::text
  );

-- Users can create appointment requests
CREATE POLICY "Users can create appointments" ON "AppointmentRequest"
  FOR INSERT
  WITH CHECK ("requestedById" = auth.uid()::text);

-- Users can update appointments they are involved in
CREATE POLICY "Users can update appointments" ON "AppointmentRequest"
  FOR UPDATE
  USING (
    "requestedById" = auth.uid()::text 
    OR "requestedToId" = auth.uid()::text
  );

-- Admins can manage all appointments
CREATE POLICY "Admins can manage appointments" ON "AppointmentRequest"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'SYSTEM')
    )
  );

-- ============================================================================
-- OTP POLICIES
-- ============================================================================

-- Users can view their own OTPs
CREATE POLICY "Users can view own OTPs" ON "OTP"
  FOR SELECT
  USING ("userId" = auth.uid()::text);

-- System can manage OTPs
CREATE POLICY "System can manage OTPs" ON "OTP"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role = 'SYSTEM'
    )
  );

-- ============================================================================
-- JOB OPPORTUNITY POLICIES
-- ============================================================================

-- Everyone can view verified job opportunities
CREATE POLICY "Public can view jobs" ON "JobOpportunity"
  FOR SELECT
  USING ("isVerified" = true);

-- Admins can manage job opportunities
CREATE POLICY "Admins can manage jobs" ON "JobOpportunity"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'SYSTEM')
    )
  );

-- ============================================================================
-- SAVED JOB POLICIES
-- ============================================================================

-- Users can view their own saved jobs
CREATE POLICY "Users can view saved jobs" ON "SavedJob"
  FOR SELECT
  USING ("userId" = auth.uid()::text);

-- Users can save jobs
CREATE POLICY "Users can save jobs" ON "SavedJob"
  FOR INSERT
  WITH CHECK ("userId" = auth.uid()::text);

-- Users can delete their saved jobs
CREATE POLICY "Users can delete saved jobs" ON "SavedJob"
  FOR DELETE
  USING ("userId" = auth.uid()::text);

-- ============================================================================
-- JOB APPLICATION POLICIES
-- ============================================================================

-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON "JobApplication"
  FOR SELECT
  USING ("userId" = auth.uid()::text);

-- Users can create applications
CREATE POLICY "Users can create applications" ON "JobApplication"
  FOR INSERT
  WITH CHECK ("userId" = auth.uid()::text);

-- Users can update their own applications
CREATE POLICY "Users can update applications" ON "JobApplication"
  FOR UPDATE
  USING ("userId" = auth.uid()::text);

-- Admins can manage all applications
CREATE POLICY "Admins can manage applications" ON "JobApplication"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'SYSTEM')
    )
  );

-- ============================================================================
-- SUPPORT PROVIDERS JUNCTION TABLE POLICIES
-- ============================================================================

-- Admins can manage support provider assignments
CREATE POLICY "Admins can manage support assignments" ON "_supportProviders"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE id = auth.uid()::text 
      AND role IN ('ADMIN', 'SYSTEM')
    )
  );
