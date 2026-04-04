-- get_learning_context: returns a learning + its linked entities
CREATE OR REPLACE FUNCTION public.get_learning_context(learning_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  learning_row jsonb;
  linked_entities jsonb;
BEGIN
  SELECT to_jsonb(al.*) INTO learning_row
  FROM public.agent_learnings al
  WHERE al.id = learning_uuid;

  IF learning_row IS NULL THEN RETURN NULL; END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'link_role', le.role,
    'link_confidence', le.confidence,
    'entity', to_jsonb(e.*)
  )), '[]'::jsonb)
  INTO linked_entities
  FROM public.learning_entities le
  JOIN public.entities e ON e.id = le.entity_id
  WHERE le.learning_id = learning_uuid;

  result := jsonb_build_object(
    'learning', learning_row,
    'linked_entities', linked_entities
  );

  RETURN result;
END;
$$;

-- get_briefing: convenience summary for agent/UI about an entity
CREATE OR REPLACE FUNCTION public.get_briefing(owner_uuid uuid, entity_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  entity_row jsonb;
  recent_learnings jsonb;
  relationships jsonb;
  open_commitments jsonb;
BEGIN
  SELECT to_jsonb(e.*) INTO entity_row
  FROM public.entities e
  WHERE e.id = entity_uuid AND e.owner_id = owner_uuid;

  IF entity_row IS NULL THEN RETURN NULL; END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', al.id,
    'title', al.title,
    'summary', al.summary,
    'kind', al.kind,
    'domain', al.domain,
    'created_at', al.created_at,
    'role', le.role
  ) ORDER BY al.created_at DESC), '[]'::jsonb)
  INTO recent_learnings
  FROM public.learning_entities le
  JOIN public.agent_learnings al ON al.id = le.learning_id
  WHERE le.entity_id = entity_uuid
  LIMIT 10;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'direction', r.direction,
    'relationship_type', r.relationship_type,
    'entity_id', r.other_id,
    'entity_name', r.other_name,
    'entity_type', r.other_type,
    'confidence', r.confidence
  )), '[]'::jsonb)
  INTO relationships
  FROM (
    SELECT 'outgoing' AS direction, er.relationship_type, te.id AS other_id, te.name AS other_name, te.entity_type AS other_type, er.confidence
    FROM public.entity_relationships er
    JOIN public.entities te ON te.id = er.to_entity_id
    WHERE er.from_entity_id = entity_uuid
    UNION ALL
    SELECT 'incoming', er.relationship_type, fe.id, fe.name, fe.entity_type, er.confidence
    FROM public.entity_relationships er
    JOIN public.entities fe ON fe.id = er.from_entity_id
    WHERE er.to_entity_id = entity_uuid
  ) r;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', c.id,
    'title', c.title,
    'status', c.status,
    'priority', c.priority,
    'due_at', c.due_at
  ) ORDER BY c.due_at ASC NULLS LAST), '[]'::jsonb)
  INTO open_commitments
  FROM public.commitments c
  WHERE c.owner_id = owner_uuid
    AND c.status IN ('open', 'in_progress')
    AND (c.assigned_entity_id = entity_uuid
      OR c.counterparty_entity_id = entity_uuid
      OR c.project_entity_id = entity_uuid);

  result := jsonb_build_object(
    'entity', entity_row,
    'recent_learnings', recent_learnings,
    'relationships', relationships,
    'open_commitments', open_commitments
  );

  RETURN result;
END;
$$;