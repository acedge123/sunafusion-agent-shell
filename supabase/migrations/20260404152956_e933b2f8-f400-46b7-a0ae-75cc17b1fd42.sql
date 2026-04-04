
-- ============================================================
-- RELATIONAL MEMORY UPGRADE
-- Tables: entities, learning_entities, entity_relationships, commitments
-- ============================================================

-- 1. ENTITIES TABLE
CREATE TABLE public.entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  entity_type text NOT NULL,
  external_key text NULL,
  name text NOT NULL,
  aliases text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  summary text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_entities_owner_type_name ON public.entities (owner_id, entity_type, name);
CREATE UNIQUE INDEX idx_entities_owner_type_extkey ON public.entities (owner_id, entity_type, external_key) WHERE external_key IS NOT NULL;
CREATE INDEX idx_entities_aliases ON public.entities USING gin (aliases);

-- RLS
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select own entities" ON public.entities FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner can insert own entities" ON public.entities FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can update own entities" ON public.entities FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner can delete own entities" ON public.entities FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Service role full access entities" ON public.entities FOR ALL TO service_role USING (true) WITH CHECK (true);

-- updated_at trigger
CREATE TRIGGER set_entities_updated_at BEFORE UPDATE ON public.entities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. LEARNING_ENTITIES JOIN TABLE
CREATE TABLE public.learning_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  learning_id uuid NOT NULL REFERENCES public.agent_learnings(id) ON DELETE CASCADE,
  entity_id uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  role text NULL,
  confidence real NOT NULL DEFAULT 1.0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_learning_entities_unique ON public.learning_entities (learning_id, entity_id, COALESCE(role, ''));
CREATE INDEX idx_learning_entities_owner_learning ON public.learning_entities (owner_id, learning_id);
CREATE INDEX idx_learning_entities_owner_entity ON public.learning_entities (owner_id, entity_id);

ALTER TABLE public.learning_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select own learning_entities" ON public.learning_entities FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner can insert own learning_entities" ON public.learning_entities FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can delete own learning_entities" ON public.learning_entities FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Service role full access learning_entities" ON public.learning_entities FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. ENTITY_RELATIONSHIPS TABLE
CREATE TABLE public.entity_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  from_entity_id uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  relationship_type text NOT NULL,
  to_entity_id uuid NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  confidence real NOT NULL DEFAULT 0.8,
  source_learning_id uuid NULL REFERENCES public.agent_learnings(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_entity_rels_unique ON public.entity_relationships (from_entity_id, relationship_type, to_entity_id);
CREATE INDEX idx_entity_rels_owner_from ON public.entity_relationships (owner_id, from_entity_id);
CREATE INDEX idx_entity_rels_owner_to ON public.entity_relationships (owner_id, to_entity_id);
CREATE INDEX idx_entity_rels_owner_type ON public.entity_relationships (owner_id, relationship_type);

ALTER TABLE public.entity_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select own entity_relationships" ON public.entity_relationships FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner can insert own entity_relationships" ON public.entity_relationships FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can update own entity_relationships" ON public.entity_relationships FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner can delete own entity_relationships" ON public.entity_relationships FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Service role full access entity_relationships" ON public.entity_relationships FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER set_entity_relationships_updated_at BEFORE UPDATE ON public.entity_relationships
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. COMMITMENTS TABLE
CREATE TABLE public.commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  title text NOT NULL,
  description text NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  due_at timestamptz NULL,
  assigned_entity_id uuid NULL REFERENCES public.entities(id) ON DELETE SET NULL,
  counterparty_entity_id uuid NULL REFERENCES public.entities(id) ON DELETE SET NULL,
  project_entity_id uuid NULL REFERENCES public.entities(id) ON DELETE SET NULL,
  source_learning_id uuid NULL REFERENCES public.agent_learnings(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_commitments_owner_status_due ON public.commitments (owner_id, status, due_at);
CREATE INDEX idx_commitments_owner_assigned ON public.commitments (owner_id, assigned_entity_id);
CREATE INDEX idx_commitments_owner_counterparty ON public.commitments (owner_id, counterparty_entity_id);
CREATE INDEX idx_commitments_owner_project ON public.commitments (owner_id, project_entity_id);

ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select own commitments" ON public.commitments FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner can insert own commitments" ON public.commitments FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner can update own commitments" ON public.commitments FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner can delete own commitments" ON public.commitments FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Service role full access commitments" ON public.commitments FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER set_commitments_updated_at BEFORE UPDATE ON public.commitments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. RPC HELPER: search_entities
CREATE OR REPLACE FUNCTION public.search_entities(
  owner_uuid uuid,
  query_text text,
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS SETOF public.entities
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.entities
  WHERE owner_id = owner_uuid
    AND (
      name ILIKE '%' || query_text || '%'
      OR summary ILIKE '%' || query_text || '%'
      OR query_text = ANY(aliases)
    )
  ORDER BY updated_at DESC
  LIMIT limit_count
  OFFSET offset_count;
$$;

-- 6. RPC HELPER: get_entity_context
CREATE OR REPLACE FUNCTION public.get_entity_context(entity_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  entity_row jsonb;
  learnings_arr jsonb;
  rels_out jsonb;
  rels_in jsonb;
  open_commitments jsonb;
BEGIN
  SELECT to_jsonb(e.*) INTO entity_row FROM public.entities e WHERE e.id = entity_uuid;
  IF entity_row IS NULL THEN RETURN NULL; END IF;

  SELECT COALESCE(jsonb_agg(to_jsonb(al.*) ORDER BY al.created_at DESC), '[]'::jsonb)
  INTO learnings_arr
  FROM public.learning_entities le
  JOIN public.agent_learnings al ON al.id = le.learning_id
  WHERE le.entity_id = entity_uuid
  LIMIT 20;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'relationship_type', er.relationship_type,
    'to_entity', to_jsonb(te.*)
  )), '[]'::jsonb)
  INTO rels_out
  FROM public.entity_relationships er
  JOIN public.entities te ON te.id = er.to_entity_id
  WHERE er.from_entity_id = entity_uuid;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'relationship_type', er.relationship_type,
    'from_entity', to_jsonb(fe.*)
  )), '[]'::jsonb)
  INTO rels_in
  FROM public.entity_relationships er
  JOIN public.entities fe ON fe.id = er.from_entity_id
  WHERE er.to_entity_id = entity_uuid;

  SELECT COALESCE(jsonb_agg(to_jsonb(c.*) ORDER BY c.due_at ASC NULLS LAST), '[]'::jsonb)
  INTO open_commitments
  FROM public.commitments c
  WHERE c.status IN ('open', 'in_progress')
    AND (c.assigned_entity_id = entity_uuid
      OR c.counterparty_entity_id = entity_uuid
      OR c.project_entity_id = entity_uuid);

  result := jsonb_build_object(
    'entity', entity_row,
    'recent_learnings', learnings_arr,
    'outgoing_relationships', rels_out,
    'incoming_relationships', rels_in,
    'open_commitments', open_commitments
  );

  RETURN result;
END;
$$;
