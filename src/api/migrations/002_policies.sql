-- 002_policies.sql
-- Recommended Row Level Security (RLS) policies for `profiles` and `photos`.
-- Run this in your Supabase project's SQL Editor (SQL > New query).

-- WARNING: Review policies before running in production. These give public SELECT access
-- to profiles/photos for discovery. Adjust to your privacy requirements.

-- Enable RLS on the tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Allow inserting a profile ONLY if the insert row's id equals the authenticated user's id
CREATE POLICY "Profiles: insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow updates only by the owner (auth.uid() must match profiles.id)
CREATE POLICY "Profiles: update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow deleting only by the owner
CREATE POLICY "Profiles: delete own profile" ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Allow public/select for discovery (adjust if you want to restrict fields or make profiles private)
CREATE POLICY "Profiles: public select" ON public.profiles
  FOR SELECT
  USING (true);


-- PHOTOS POLICIES
-- Insert: allow only if profile_id equals authenticated user id
CREATE POLICY "Photos: insert own" ON public.photos
  FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Select: allow public reading of photos (for discovery/profile display)
CREATE POLICY "Photos: public select" ON public.photos
  FOR SELECT
  USING (true);

-- Update/Delete: allow only if the photo belongs to the user's profile
-- Update: allow only if the photo belongs to the authenticated user's profile
CREATE POLICY "Photos: update own" ON public.photos
  FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Delete: allow only if the photo belongs to the authenticated user's profile
CREATE POLICY "Photos: delete own" ON public.photos
  FOR DELETE
  USING (profile_id = auth.uid());

-- NOTE: If you use Supabase Storage to host profile images, configure Storage policies
-- separately (Supabase Console > Storage > Policies) so that users can upload/download
-- only their own files. Storage policies are separate from table RLS.
