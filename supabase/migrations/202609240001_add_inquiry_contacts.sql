-- ==============================================================================
-- HAVEN Real Estate Platform — Inquiry Contacts Migration
-- Migration: 202609240001_add_inquiry_contacts.sql
-- Description: Provides secure, authorized retrieval of buyer contact details
--              (phone from profiles, email from auth.users) strictly for the
--              verified agent who owns the listing/inquiry.
-- ==============================================================================

-- 1. Create SECURITY DEFINER RPC to fetch inquiries with buyer contact info for authenticated agent
CREATE OR REPLACE FUNCTION public.get_agent_inquiries()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    agent_id UUID,
    property_id UUID,
    message TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    property_id_val UUID,
    property_title TEXT,
    property_slug TEXT,
    property_price NUMERIC,
    property_city TEXT,
    property_country TEXT,
    property_status TEXT,
    property_cover_image TEXT,
    buyer_name TEXT,
    buyer_avatar_url TEXT,
    buyer_phone TEXT,
    buyer_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_agent_id UUID;
BEGIN
    -- 1. Ensure authenticated caller
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- 2. Resolve agent id for caller
    SELECT a.id INTO v_agent_id
    FROM public.agents a
    WHERE a.profile_id = auth.uid();

    IF v_agent_id IS NULL THEN
        RETURN;
    END IF;

    -- 3. Return inquiries for this agent only, joining buyer profile and auth.users email safely
    RETURN QUERY
    SELECT 
        i.id,
        i.user_id,
        i.agent_id,
        i.property_id,
        i.message,
        i.status,
        i.created_at,
        i.updated_at,
        p.id AS property_id_val,
        p.title AS property_title,
        p.slug AS property_slug,
        p.price AS property_price,
        p.city AS property_city,
        p.country AS property_country,
        p.status AS property_status,
        (
            SELECT img.image_url 
            FROM public.property_images img 
            WHERE img.property_id = p.id 
            ORDER BY img.is_cover DESC, img.sort_order ASC 
            LIMIT 1
        ) AS property_cover_image,
        COALESCE(pr.full_name, 'Prospective Buyer') AS buyer_name,
        pr.avatar_url AS buyer_avatar_url,
        pr.phone AS buyer_phone,
        u.email::TEXT AS buyer_email
    FROM public.inquiries i
    JOIN public.properties p ON i.property_id = p.id
    LEFT JOIN public.profiles pr ON i.user_id = pr.id
    LEFT JOIN auth.users u ON i.user_id = u.id
    WHERE i.agent_id = v_agent_id
    ORDER BY i.created_at DESC;
END;
$$;

-- Revoke from public, grant strictly to authenticated users
REVOKE ALL ON FUNCTION public.get_agent_inquiries() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_agent_inquiries() TO authenticated;

-- 2. Add RLS policy allowing agents to read buyer profiles for their own inquiries
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'agents_select_inquiry_profiles'
    ) THEN
        CREATE POLICY "agents_select_inquiry_profiles"
        ON public.profiles
        FOR SELECT
        TO authenticated
        USING (
            id IN (
                SELECT inq.user_id FROM public.inquiries inq
                JOIN public.properties prop ON inq.property_id = prop.id
                JOIN public.agents ag ON prop.agent_id = ag.id
                WHERE ag.profile_id = auth.uid()
            )
        );
    END IF;
END $$;
