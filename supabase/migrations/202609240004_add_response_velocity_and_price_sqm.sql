-- ==============================================================================
-- HAVEN Real Estate Platform — Response Velocity & Price Per SQM Migration
-- Migration: 202609240004_add_response_velocity_and_price_sqm.sql
-- Description: 
--   1. Adds inquiries.first_contacted_at column.
--   2. Updates update_inquiry_status RPC to set first_contacted_at on new -> contacted.
--   3. Adds get_agent_response_velocity RPC to calculate advisor speed metrics.
--   4. Adds properties.price_per_sqm generated stored column with index.
-- ==============================================================================

-- 1. Inquiries: Add first_contacted_at column
ALTER TABLE public.inquiries 
ADD COLUMN IF NOT EXISTS first_contacted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_inquiries_first_contacted_at ON public.inquiries(first_contacted_at);

-- 2. Update RPC FUNCTION: update_inquiry_status
-- Preserves existing authorization & strict state transitions while tracking first_contacted_at
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
    v_first_contacted_at TIMESTAMPTZ;
BEGIN
    -- 1. Ensure authenticated caller
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- 2. Fetch existing inquiry status and verify property owner agent
    SELECT i.status, i.first_contacted_at, a.profile_id 
    INTO v_current_status, v_first_contacted_at, v_property_agent_profile_id
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
        -- Allowed transition: new -> contacted (Record initial first_contacted_at timestamp)
        v_first_contacted_at := COALESCE(v_first_contacted_at, now());
    ELSIF v_current_status = 'contacted' AND p_status = 'closed' THEN
        -- Allowed transition: contacted -> closed (Preserve existing first_contacted_at)
        NULL;
    ELSE
        RAISE EXCEPTION 'Invalid status transition from "%" to "%". Allowed flow is strictly new -> contacted -> closed.', v_current_status, p_status;
    END IF;

    -- 4. Perform status and timestamp update
    UPDATE public.inquiries
    SET status = p_status,
        first_contacted_at = v_first_contacted_at,
        updated_at = now()
    WHERE id = p_inquiry_id
    RETURNING * INTO v_inquiry;

    RETURN v_inquiry;
END;
$$;

REVOKE ALL ON FUNCTION public.update_inquiry_status(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_inquiry_status(UUID, TEXT) TO authenticated;

-- 3. RPC Function: get_agent_response_velocity
-- Computes advisor response speed metrics (average response time in hours/seconds, total contacted)
CREATE OR REPLACE FUNCTION public.get_agent_response_velocity()
RETURNS TABLE (
    total_inquiries BIGINT,
    responded_inquiries BIGINT,
    pending_inquiries BIGINT,
    avg_response_hours NUMERIC,
    avg_response_seconds NUMERIC,
    fastest_response_hours NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

    -- 3. Aggregate velocity metrics strictly for this agent's inquiries
    RETURN QUERY
    SELECT
        COUNT(i.id)::BIGINT AS total_inquiries,
        COUNT(i.first_contacted_at)::BIGINT AS responded_inquiries,
        COUNT(CASE WHEN i.status = 'new' THEN 1 END)::BIGINT AS pending_inquiries,
        ROUND(AVG(EXTRACT(EPOCH FROM (i.first_contacted_at - i.created_at)) / 3600.0)::NUMERIC, 2) AS avg_response_hours,
        ROUND(AVG(EXTRACT(EPOCH FROM (i.first_contacted_at - i.created_at)))::NUMERIC, 0) AS avg_response_seconds,
        ROUND(MIN(EXTRACT(EPOCH FROM (i.first_contacted_at - i.created_at)) / 3600.0)::NUMERIC, 2) AS fastest_response_hours
    FROM public.inquiries i
    WHERE i.agent_id = v_agent_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_agent_response_velocity() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_agent_response_velocity() TO authenticated;

-- 4. Properties: Add price_per_sqm generated column with index
-- Safely handles area = 0, NULL area, and NULL price without division errors
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS price_per_sqm NUMERIC
GENERATED ALWAYS AS (
    CASE 
        WHEN area IS NOT NULL AND area > 0 AND price IS NOT NULL AND price >= 0 
        THEN ROUND(price / area, 2) 
        ELSE NULL 
    END
) STORED;

CREATE INDEX IF NOT EXISTS idx_properties_price_per_sqm ON public.properties(price_per_sqm);
