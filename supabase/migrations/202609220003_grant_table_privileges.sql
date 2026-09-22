-- ==============================================================================
-- HAVEN Real Estate Platform — Table Privileges
-- Migration: 202609220003_grant_table_privileges.sql
-- Description: Grants the minimum table privileges required for RLS policies.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Public read access
-- RLS policies still control which rows are actually visible.
-- ------------------------------------------------------------------------------

GRANT SELECT ON public.profiles
TO anon;

GRANT SELECT ON public.agents
TO anon;

GRANT SELECT ON public.properties
TO anon;

GRANT SELECT ON public.property_images
TO anon;

GRANT SELECT ON public.property_features
TO anon;

-- agents_public already has its explicit SELECT grant in migration 002.
-- ------------------------------------------------------------------------------

-- ------------------------------------------------------------------------------
-- Authenticated users
-- RLS policies control which rows can actually be read/created/updated/deleted.
-- ------------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.profiles
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.agents
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.properties
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.property_images
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.property_features
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.favorites
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.collections
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.collection_properties
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.inquiries
TO authenticated;