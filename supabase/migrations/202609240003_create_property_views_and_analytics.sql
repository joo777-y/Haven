-- ==============================================================================
-- HAVEN Real Estate Platform — Property Views & Analytics Migration
-- Migration: 202609240003_create_property_views_and_analytics.sql
-- Description: Creates the property_views tracking table with 12-hour session
--              deduplication, strict RLS isolation, record_property_view RPC,
--              and get_agent_property_analytics RPC for advisor dashboards.
-- ==============================================================================

-- 1. Create Table: property_views
CREATE TABLE IF NOT EXISTS public.property_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance & deduplication lookups
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON public.property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewer_id ON public.property_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON public.property_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_property_views_dedup_session ON public.property_views(property_id, session_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_views_dedup_viewer ON public.property_views(property_id, viewer_id, viewed_at DESC);

-- 2. Enable Row Level Security
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: property_views
-- INSERT: Anonymous and authenticated visitors can record views on published properties
CREATE POLICY "property_views_insert_policy" ON public.property_views
FOR INSERT TO anon, authenticated
WITH CHECK (
    property_id IN (SELECT id FROM public.properties WHERE status = 'published')
    AND (
        (auth.uid() IS NULL AND viewer_id IS NULL)
        OR (auth.uid() IS NOT NULL AND (viewer_id = auth.uid() OR viewer_id IS NULL))
    )
);

-- SELECT: Only the owning agent can inspect views for their properties
CREATE POLICY "property_views_select_agent" ON public.property_views
FOR SELECT TO authenticated
USING (
    property_id IN (
        SELECT p.id FROM public.properties p
        JOIN public.agents a ON p.agent_id = a.id
        WHERE a.profile_id = auth.uid()
    )
);

-- Deny direct UPDATE and DELETE for all roles (views are append-only audit records)

-- 4. Privileges: Revoke all from public, grant strictly needed operations
REVOKE ALL ON public.property_views FROM PUBLIC;
GRANT INSERT ON public.property_views TO anon, authenticated;
GRANT SELECT ON public.property_views TO authenticated;

-- 5. Helper RPC: record_property_view
-- Safely inserts a view record after enforcing:
-- a) Property must be published
-- b) Excludes owning agent's own views
-- c) Enforces 12-hour deduplication window per viewer/session
CREATE OR REPLACE FUNCTION public.record_property_view(
    p_property_id UUID,
    p_session_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_agent_profile_id UUID;
    v_property_status TEXT;
    v_viewer_id UUID;
    v_recent_view_exists BOOLEAN;
    v_session_id TEXT;
BEGIN
    -- 1. Validate and normalize session_id
    v_session_id := trim(p_session_id);
    IF v_session_id IS NULL OR length(v_session_id) = 0 OR length(v_session_id) > 100 THEN
        RETURN FALSE;
    END IF;

    -- 2. Check property status and resolve owning agent profile ID
    SELECT p.status, a.profile_id
    INTO v_property_status, v_agent_profile_id
    FROM public.properties p
    JOIN public.agents a ON p.agent_id = a.id
    WHERE p.id = p_property_id;

    IF v_property_status IS NULL OR v_property_status <> 'published' THEN
        RETURN FALSE;
    END IF;

    -- 3. Exclude owning agent's self-views
    v_viewer_id := auth.uid();
    IF v_viewer_id IS NOT NULL AND v_viewer_id = v_agent_profile_id THEN
        -- Owning agent viewing their own property; do not count towards analytics
        RETURN FALSE;
    END IF;

    -- 4. Check 12-hour deduplication window using normalized session_id
    SELECT EXISTS (
        SELECT 1
        FROM public.property_views pv
        WHERE pv.property_id = p_property_id
          AND pv.viewed_at >= now() - INTERVAL '12 hours'
          AND (
              (v_viewer_id IS NOT NULL AND pv.viewer_id = v_viewer_id)
              OR pv.session_id = v_session_id
          )
    ) INTO v_recent_view_exists;

    IF v_recent_view_exists THEN
        -- View already recorded within deduplication window
        RETURN FALSE;
    END IF;

    -- 5. Record the view using normalized session_id
    INSERT INTO public.property_views (property_id, viewer_id, session_id, viewed_at)
    VALUES (p_property_id, v_viewer_id, v_session_id, now());

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.record_property_view(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_property_view(UUID, TEXT) TO anon, authenticated;

-- 6. RPC Function: get_agent_property_analytics
-- Returns aggregated property performance metrics (views, saves, inquiries, conversion rate)
-- strictly for the authenticated agent caller. Never trusts client-supplied agent_id.
CREATE OR REPLACE FUNCTION public.get_agent_property_analytics()
RETURNS TABLE (
    property_id UUID,
    property_title TEXT,
    property_slug TEXT,
    property_price NUMERIC,
    property_status TEXT,
    property_city TEXT,
    property_cover_image TEXT,
    views_count BIGINT,
    unique_viewers_count BIGINT,
    favorites_count BIGINT,
    inquiries_count BIGINT,
    inquiry_conversion_rate NUMERIC,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_agent_id UUID;
BEGIN
    -- 1. Authenticate caller
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- 2. Resolve agent ID securely from auth.uid()
    SELECT a.id INTO v_agent_id
    FROM public.agents a
    WHERE a.profile_id = auth.uid();

    IF v_agent_id IS NULL THEN
        RETURN;
    END IF;

    -- 3. Aggregate property metrics
    RETURN QUERY
    SELECT 
        p.id AS property_id,
        p.title AS property_title,
        p.slug AS property_slug,
        p.price AS property_price,
        p.status AS property_status,
        p.city AS property_city,
        (
            SELECT img.image_url 
            FROM public.property_images img 
            WHERE img.property_id = p.id 
            ORDER BY img.is_cover DESC, img.sort_order ASC 
            LIMIT 1
        ) AS property_cover_image,
        COALESCE(v.total_views, 0)::BIGINT AS views_count,
        COALESCE(v.unique_viewers, 0)::BIGINT AS unique_viewers_count,
        COALESCE(f.total_favorites, 0)::BIGINT AS favorites_count,
        COALESCE(i.total_inquiries, 0)::BIGINT AS inquiries_count,
        CASE 
            WHEN COALESCE(v.total_views, 0) > 0 
            THEN ROUND((COALESCE(i.total_inquiries, 0)::NUMERIC / v.total_views::NUMERIC) * 100, 2)
            ELSE 0.00
        END AS inquiry_conversion_rate,
        p.created_at
    FROM public.properties p
    -- Left join views aggregation
    LEFT JOIN (
        SELECT 
            pv.property_id,
            COUNT(pv.id) AS total_views,
            COUNT(DISTINCT COALESCE(pv.viewer_id::TEXT, pv.session_id)) AS unique_viewers
        FROM public.property_views pv
        GROUP BY pv.property_id
    ) v ON p.id = v.property_id
    -- Left join favorites aggregation
    LEFT JOIN (
        SELECT 
            fav.property_id,
            COUNT(fav.id) AS total_favorites
        FROM public.favorites fav
        GROUP BY fav.property_id
    ) f ON p.id = f.property_id
    -- Left join inquiries aggregation
    LEFT JOIN (
        SELECT 
            inq.property_id,
            COUNT(inq.id) AS total_inquiries
        FROM public.inquiries inq
        GROUP BY inq.property_id
    ) i ON p.id = i.property_id
    WHERE p.agent_id = v_agent_id
    ORDER BY p.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_agent_property_analytics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_agent_property_analytics() TO authenticated;
