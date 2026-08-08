-- Fix RLS policies to allow backend service access
-- The backend connects directly to the database and needs to bypass RLS
-- or have policies that work without auth.uid()

-- ============================================================================
-- DROP AND RECREATE POLICIES FOR PUBLIC ACCESS
-- ============================================================================

-- FORUM POSTS: Allow public read access without authentication
DROP POLICY IF EXISTS "Public can view published posts" ON "ForumPost";
CREATE POLICY "Public can view published posts" ON "ForumPost"
  FOR SELECT
  USING (status = 'PUBLISHED' OR auth.uid() IS NULL OR auth.role() = 'service_role');

-- MISSING PERSONS: Allow public read access
DROP POLICY IF EXISTS "Public can view missing persons" ON "MissingPerson";
CREATE POLICY "Public can view missing persons" ON "MissingPerson"
  FOR SELECT
  USING (status IN ('ACTIVE', 'PENDING') OR auth.uid() IS NULL OR auth.role() = 'service_role');

-- SERVICE PROVIDERS: Allow public read access
DROP POLICY IF EXISTS "Public can view verified providers" ON "ServiceProvider";
CREATE POLICY "Public can view verified providers" ON "ServiceProvider"
  FOR SELECT
  USING ("isVerified" = true OR auth.uid() IS NULL OR auth.role() = 'service_role');

-- JOB OPPORTUNITIES: Allow public read access
DROP POLICY IF EXISTS "Public can view jobs" ON "JobOpportunity";
CREATE POLICY "Public can view jobs" ON "JobOpportunity"
  FOR SELECT
  USING ("isVerified" = true OR auth.uid() IS NULL OR auth.role() = 'service_role');

-- FORUM COMMENTS: Allow public read access
DROP POLICY IF EXISTS "Public can view comments" ON "ForumComment";
CREATE POLICY "Public can view comments" ON "ForumComment"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "ForumPost" fp
      WHERE fp.id = "ForumComment"."postId"
      AND fp.status = 'PUBLISHED'
    )
    OR auth.uid() IS NULL 
    OR auth.role() = 'service_role'
  );

-- SIGHTINGS: Allow public read access to verified sightings
DROP POLICY IF EXISTS "Public can view verified sightings" ON "Sighting";
CREATE POLICY "Public can view verified sightings" ON "Sighting"
  FOR SELECT
  USING ("isVerified" = true OR auth.uid() IS NULL OR auth.role() = 'service_role');

-- SERVICE PROVIDER REVIEWS: Allow public read access
DROP POLICY IF EXISTS "Public can view reviews" ON "ServiceProviderReview";
CREATE POLICY "Public can view reviews" ON "ServiceProviderReview"
  FOR SELECT
  USING (true);

-- ============================================================================
-- ADD SERVICE ROLE BYPASS FOR ALL TABLES
-- ============================================================================

-- This allows the backend (connecting as postgres user) to bypass RLS
-- by checking if there's no auth context (backend direct connection)

-- Create a function to check if request is from backend service
CREATE OR REPLACE FUNCTION is_service_role() RETURNS BOOLEAN AS $$
BEGIN
  -- If there's no auth.uid(), it's likely a backend service connection
  -- In production, you might want to use a more sophisticated check
  RETURN auth.uid() IS NULL OR auth.role() = 'service_role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add service role bypass policies for all tables
-- These policies allow full access when is_service_role() returns true

CREATE POLICY "Service role bypass" ON "User"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "Report"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "Evidence"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "CaseAssignment"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "CaseComment"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "ServiceProvider"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "ServiceProviderReview"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "SupportRequest"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "CaseFeedback"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "ForumPost"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "ForumComment"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "MissingPerson"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "Sighting"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "AnalyticsSnapshot"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "AuditLog"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "MLTrainingData"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "SystemSetting"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "Conversation"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "Message"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "AppointmentRequest"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "OTP"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "JobOpportunity"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "SavedJob"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "JobApplication"
  FOR ALL
  USING (is_service_role());

CREATE POLICY "Service role bypass" ON "_supportProviders"
  FOR ALL
  USING (is_service_role());
