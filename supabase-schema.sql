-- ChartDB Next — Supabase schema
-- Run in: Dashboard → SQL Editor → New query

CREATE TABLE IF NOT EXISTS public.diagrams (
    id          TEXT        PRIMARY KEY,
    owner_id    UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    data        JSONB       NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.diagram_collaborators (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id  TEXT        NOT NULL REFERENCES public.diagrams (id) ON DELETE CASCADE,
    email       TEXT        NOT NULL,
    user_id     UUID        REFERENCES auth.users (id) ON DELETE SET NULL,
    added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (diagram_id, email)
);

CREATE INDEX IF NOT EXISTS diagrams_owner_id_idx ON public.diagrams (owner_id);
CREATE INDEX IF NOT EXISTS diagram_collaborators_user_id_idx ON public.diagram_collaborators (user_id);

ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagram_collaborators ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER avoids RLS infinite recursion when policies on diagrams
-- call this function (which itself queries diagram_collaborators)
CREATE OR REPLACE FUNCTION public.is_diagram_collaborator(p_diagram_id TEXT)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM diagram_collaborators
        WHERE diagram_id = p_diagram_id
          AND (
              user_id = auth.uid()
              OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
          )
    );
$$;

DROP POLICY IF EXISTS "owner_all"           ON public.diagrams;
DROP POLICY IF EXISTS "collaborator_select" ON public.diagrams;
DROP POLICY IF EXISTS "collaborator_update" ON public.diagrams;

CREATE POLICY "owner_all" ON public.diagrams
    FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "collaborator_select" ON public.diagrams
    FOR SELECT USING (public.is_diagram_collaborator(id));

CREATE POLICY "collaborator_update" ON public.diagrams
    FOR UPDATE USING (public.is_diagram_collaborator(id)) WITH CHECK (public.is_diagram_collaborator(id));

-- Writes go through server-side API routes (service key); no client INSERT policy needed
DROP POLICY IF EXISTS "collaborator_self_select" ON public.diagram_collaborators;

CREATE POLICY "collaborator_self_select" ON public.diagram_collaborators
    FOR SELECT USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));
