-- ==============================================================================
-- HAVEN Real Estate Platform — Security & Storage Migration
-- Migration: 202609220002_create_security_and_storage.sql
-- Description: Enables Row Level Security (RLS) across all 9 HAVEN core tables,
--              creates table authorization policies, sets up the public agents view,
--              implements the hardened status-only inquiry update RPC function, and
--              configures Supabase Storage buckets with path-based authorization.
-- ==============================================================================

-- ==============================================================================
-- 1. ENABLE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. TABLE POLICIES: profiles
-- ==============================================================================
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ==============================================================================
-- 3. TABLE POLICIES: agents
-- ==============================================================================
CREATE POLICY "agents_select_own" ON public.agents
FOR SELECT TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY "agents_insert_own" ON public.agents
FOR INSERT TO authenticated
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "agents_update_own" ON public.agents
FOR UPDATE TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- ==============================================================================
-- 4. PUBLIC AGENTS VIEW (Exposes safe public agent & profile fields)
-- ==============================================================================
CREATE OR REPLACE VIEW public.agents_public AS
SELECT 
    a.id,
    a.profile_id,
    p.full_name,
    p.avatar_url,
    a.company_name,
    a.professional_title,
    a.bio,
    a.created_at
FROM public.agents a
JOIN public.profiles p ON a.profile_id = p.id;

GRANT SELECT ON public.agents_public TO anon, authenticated;

-- ==============================================================================
-- 5. TABLE POLICIES: properties
-- ==============================================================================
CREATE POLICY "properties_select_policy" ON public.properties
FOR SELECT TO anon, authenticated
USING (
    status = 'published'
    OR (
        auth.uid() IS NOT NULL
        AND agent_id IN (SELECT a.id FROM public.agents a WHERE a.profile_id = auth.uid())
    )
);

CREATE POLICY "properties_insert_policy" ON public.properties
FOR INSERT TO authenticated
WITH CHECK (
    agent_id IN (SELECT a.id FROM public.agents a WHERE a.profile_id = auth.uid())
);

CREATE POLICY "properties_update_policy" ON public.properties
FOR UPDATE TO authenticated
USING (
    agent_id IN (SELECT a.id FROM public.agents a WHERE a.profile_id = auth.uid())
)
WITH CHECK (
    agent_id IN (SELECT a.id FROM public.agents a WHERE a.profile_id = auth.uid())
);

CREATE POLICY "properties_delete_policy" ON public.properties
FOR DELETE TO authenticated
USING (
    agent_id IN (SELECT a.id FROM public.agents a WHERE a.profile_id = auth.uid())
);

-- ==============================================================================
-- 6. TABLE POLICIES: property_images
-- ==============================================================================
CREATE POLICY "property_images_select_policy" ON public.property_images
FOR SELECT TO anon, authenticated
USING (
    property_id IN (
        SELECT p.id FROM public.properties p
        WHERE p.status = 'published'
           OR (auth.uid() IS NOT NULL AND p.agent_id IN (SELECT a.id FROM public.agents a WHERE a.profile_id = auth.uid()))
    )
);

CREATE POLICY "property_images_insert_policy" ON public.property_images
FOR INSERT TO authenticated
WITH CHECK (
    property_id IN (
        SELECT p.id FROM public.properties p
        JOIN public.agents a ON p.agent_id = a.id
        WHERE a.profile_id = auth.uid()
    )
);

CREATE POLICY "property_images_update_policy" ON public.property_images
FOR UPDATE TO authenticated
USING (
    property_id IN (
        SELECT p.id FROM public.properties p
        JOIN public.agents a ON p.agent_id = a.id
        WHERE a.profile_id = auth.uid()
    )
)
WITH CHECK (
    property_id IN (
        SELECT p.id FROM public.properties p
        JOIN public.agents a ON p.agent_id = a.id
        WHERE a.profile_id = auth.uid()
    )
);

CREATE POLICY "property_images_delete_policy" ON public.property_images
FOR DELETE TO authenticated
USING (
    property_id IN (
        SELECT p.id FROM public.properties p
        JOIN public.agents a ON p.agent_id = a.id
        WHERE a.profile_id = auth.uid()
    )
);

-- ==============================================================================
-- 7. TABLE POLICIES: property_features
-- ==============================================================================
CREATE POLICY "property_features_select_policy" ON public.property_features
FOR SELECT TO anon, authenticated
USING (
    property_id IN (
        SELECT p.id FROM public.properties p
        WHERE p.status = 'published'
           OR (auth.uid() IS NOT NULL AND p.agent_id IN (SELECT a.id FROM public.agents a WHERE a.profile_id = auth.uid()))
    )
);

CREATE POLICY "property_features_insert_policy" ON public.property_features
FOR INSERT TO authenticated
WITH CHECK (
    property_id IN (
        SELECT p.id FROM public.properties p
        JOIN public.agents a ON p.agent_id = a.id
        WHERE a.profile_id = auth.uid()
    )
);

CREATE POLICY "property_features_update_policy" ON public.property_features
FOR UPDATE TO authenticated
USING (
    property_id IN (
        SELECT p.id FROM public.properties p
        JOIN public.agents a ON p.agent_id = a.id
        WHERE a.profile_id = auth.uid()
    )
)
WITH CHECK (
    property_id IN (
        SELECT p.id FROM public.properties p
        JOIN public.agents a ON p.agent_id = a.id
        WHERE a.profile_id = auth.uid()
    )
);

CREATE POLICY "property_features_delete_policy" ON public.property_features
FOR DELETE TO authenticated
USING (
    property_id IN (
        SELECT p.id FROM public.properties p
        JOIN public.agents a ON p.agent_id = a.id
        WHERE a.profile_id = auth.uid()
    )
);

-- ==============================================================================
-- 8. TABLE POLICIES: favorites
-- ==============================================================================
CREATE POLICY "favorites_select_policy" ON public.favorites
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "favorites_insert_policy" ON public.favorites
FOR INSERT TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND property_id IN (SELECT id FROM public.properties WHERE status = 'published')
);

CREATE POLICY "favorites_delete_policy" ON public.favorites
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- ==============================================================================
-- 9. TABLE POLICIES: collections
-- ==============================================================================
CREATE POLICY "collections_select_policy" ON public.collections
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "collections_insert_policy" ON public.collections
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "collections_update_policy" ON public.collections
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "collections_delete_policy" ON public.collections
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- ==============================================================================
-- 10. TABLE POLICIES: collection_properties
-- ==============================================================================
CREATE POLICY "collection_properties_select_policy" ON public.collection_properties
FOR SELECT TO authenticated
USING (
    collection_id IN (SELECT c.id FROM public.collections c WHERE c.user_id = auth.uid())
);

CREATE POLICY "collection_properties_insert_policy" ON public.collection_properties
FOR INSERT TO authenticated
WITH CHECK (
    collection_id IN (SELECT c.id FROM public.collections c WHERE c.user_id = auth.uid())
    AND property_id IN (SELECT id FROM public.properties WHERE status = 'published')
);

CREATE POLICY "collection_properties_delete_policy" ON public.collection_properties
FOR DELETE TO authenticated
USING (
    collection_id IN (SELECT c.id FROM public.collections c WHERE c.user_id = auth.uid())
);

-- ==============================================================================
-- 11. TABLE POLICIES: inquiries
-- ==============================================================================
CREATE POLICY "inquiries_select_policy" ON public.inquiries
FOR SELECT TO authenticated
USING (
    user_id = auth.uid()
    OR property_id IN (
        SELECT p.id FROM public.properties p
        JOIN public.agents a ON p.agent_id = a.id
        WHERE a.profile_id = auth.uid()
    )
);

-- Regular authenticated users can submit inquiries for published properties.
-- Agents cannot submit inquiries as buyers in the MVP.
CREATE POLICY "inquiries_insert_policy" ON public.inquiries
FOR INSERT TO authenticated
WITH CHECK (
    user_id = auth.uid()
    AND status = 'new'
    AND property_id IN (
        SELECT p.id FROM public.properties p
        WHERE p.status = 'published'
          AND p.agent_id = inquiries.agent_id
    )
    AND NOT EXISTS (
        SELECT 1 FROM public.agents a
        WHERE a.profile_id = auth.uid()
    )
);

-- Direct UPDATE and DELETE on inquiries are denied for all roles in RLS.
-- Status changes are handled via the update_inquiry_status RPC function below.

-- ==============================================================================
-- 12. RPC FUNCTION: update_inquiry_status
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_inquiry_status(
    p_inquiry_id UUID,
    p_status TEXT
)
RETURNS public.inquiries
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_inquiry public.inquiries;
    v_property_agent_profile_id UUID;
    v_current_status TEXT;
BEGIN
    -- 1. Ensure authenticated caller
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- 2. Fetch existing inquiry status and verify property owner agent
    SELECT i.status, a.profile_id INTO v_current_status, v_property_agent_profile_id
    FROM public.inquiries i
    JOIN public.properties p ON i.property_id = p.id
    JOIN public.agents a ON p.agent_id = a.id
    WHERE i.id = p_inquiry_id;

    IF v_property_agent_profile_id IS NULL THEN
        RAISE EXCEPTION 'Inquiry not found or associated property/agent missing.';
    END IF;

    IF v_property_agent_profile_id <> auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: You can only update inquiries for properties you own.';
    END IF;

    -- 3. Strict MVP state transitions: new -> contacted -> closed
    IF v_current_status = 'new' AND p_status = 'contacted' THEN
        -- Allowed transition: new -> contacted
        NULL;
    ELSIF v_current_status = 'contacted' AND p_status = 'closed' THEN
        -- Allowed transition: contacted -> closed
        NULL;
    ELSE
        RAISE EXCEPTION 'Invalid status transition from "%" to "%". Allowed flow is strictly new -> contacted -> closed.', v_current_status, p_status;
    END IF;

    -- 4. Perform status update only
    UPDATE public.inquiries
    SET status = p_status,
        updated_at = now()
    WHERE id = p_inquiry_id
    RETURNING * INTO v_inquiry;

    RETURN v_inquiry;
END;
$$;

-- Harden function permissions: revoke from public, grant strictly to authenticated
REVOKE ALL ON FUNCTION public.update_inquiry_status(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_inquiry_status(UUID, TEXT) TO authenticated;

-- ==============================================================================
-- 13. SUPABASE STORAGE: Buckets & Policies
-- Note: In the MVP, property-images is intentionally a public bucket.
-- Property images are public assets with access visibility controlled at the
-- listing level via property status and public queries.
-- ==============================================================================

-- Storage Buckets Creation
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('property-images', 'property-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies for property-images
CREATE POLICY "property_images_public_read" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'property-images');

CREATE POLICY "property_images_agent_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] IN (
        SELECT p.id::text FROM public.properties p
        JOIN public.agents a ON p.agent_id = a.id
        WHERE a.profile_id = auth.uid()
    )
);

CREATE POLICY "property_images_agent_update" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] IN (
        SELECT p.id::text FROM public.properties p
        JOIN public.agents a ON p.agent_id = a.id
        WHERE a.profile_id = auth.uid()
    )
)
WITH CHECK (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] IN (
        SELECT p.id::text FROM public.properties p
        JOIN public.agents a ON p.agent_id = a.id
        WHERE a.profile_id = auth.uid()
    )
);

CREATE POLICY "property_images_agent_delete" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] IN (
        SELECT p.id::text FROM public.properties p
        JOIN public.agents a ON p.agent_id = a.id
        WHERE a.profile_id = auth.uid()
    )
);

-- Storage Policies for avatars
CREATE POLICY "avatars_public_read" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_user_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars_user_update" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "avatars_user_delete" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
