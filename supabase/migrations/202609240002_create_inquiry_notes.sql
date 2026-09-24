-- ==============================================================================
-- HAVEN Real Estate Platform — Private Advisor Notes Migration
-- Migration: 202609240002_create_inquiry_notes.sql
-- Description: Creates the inquiry_notes table for private advisor notes on
--              client inquiries. Strictly isolated to the listing agent.
--              Buyers and other agents have ZERO access.
-- ==============================================================================

-- 1. Create table: inquiry_notes
CREATE TABLE IF NOT EXISTS public.inquiry_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_inquiry_notes_inquiry UNIQUE (inquiry_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inquiry_notes_inquiry_id ON public.inquiry_notes(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_notes_agent_id ON public.inquiry_notes(agent_id);

-- Automatic updated_at trigger
DROP TRIGGER IF EXISTS set_inquiry_notes_updated_at ON public.inquiry_notes;
CREATE TRIGGER set_inquiry_notes_updated_at
BEFORE UPDATE ON public.inquiry_notes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 2. Enable Row Level Security
ALTER TABLE public.inquiry_notes ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: Strictly scoped to the authenticated agent who owns the listing/inquiry
-- SELECT: Only the owning agent can read notes
CREATE POLICY "inquiry_notes_select_agent"
ON public.inquiry_notes
FOR SELECT
TO authenticated
USING (
    agent_id IN (
        SELECT a.id FROM public.agents a
        WHERE a.profile_id = auth.uid()
    )
);

-- INSERT: Only the owning agent can create notes for their inquiries
CREATE POLICY "inquiry_notes_insert_agent"
ON public.inquiry_notes
FOR INSERT
TO authenticated
WITH CHECK (
    agent_id IN (
        SELECT a.id FROM public.agents a
        WHERE a.profile_id = auth.uid()
    )
    AND inquiry_id IN (
        SELECT i.id FROM public.inquiries i
        WHERE i.agent_id = inquiry_notes.agent_id
    )
);

-- UPDATE: Only the owning agent can edit their notes
CREATE POLICY "inquiry_notes_update_agent"
ON public.inquiry_notes
FOR UPDATE
TO authenticated
USING (
    agent_id IN (
        SELECT a.id FROM public.agents a
        WHERE a.profile_id = auth.uid()
    )
)
WITH CHECK (
    agent_id IN (
        SELECT a.id FROM public.agents a
        WHERE a.profile_id = auth.uid()
    )
);

-- DELETE: Only the owning agent can delete their notes
CREATE POLICY "inquiry_notes_delete_agent"
ON public.inquiry_notes
FOR DELETE
TO authenticated
USING (
    agent_id IN (
        SELECT a.id FROM public.agents a
        WHERE a.profile_id = auth.uid()
    )
);

-- 4. Explicit Table Privileges: Revoke from public/anon, grant strictly to authenticated
REVOKE ALL ON public.inquiry_notes FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiry_notes TO authenticated;
