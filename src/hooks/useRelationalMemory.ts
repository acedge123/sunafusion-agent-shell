import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Entity {
  id: string;
  owner_id: string;
  entity_type: string;
  external_key: string | null;
  name: string;
  aliases: string[];
  status: string;
  summary: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EntityLink {
  id: string;
  learning_id: string;
  entity_id: string;
  role: string | null;
  confidence: number;
  entity?: Entity;
}

export interface Commitment {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_at: string | null;
  assigned_entity_id: string | null;
  counterparty_entity_id: string | null;
  project_entity_id: string | null;
  source_learning_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EntityRelationship {
  id: string;
  from_entity_id: string;
  relationship_type: string;
  to_entity_id: string;
  confidence: number;
  source_learning_id: string | null;
}

interface UseEntitiesOptions {
  search?: string;
  entityType?: string;
  limit?: number;
}

export function useEntities(options: UseEntitiesOptions = {}) {
  const { search, entityType, limit = 50 } = options;
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("entities")
        .select("*")
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(limit);

      if (entityType && entityType !== "all") {
        query = query.eq("entity_type", entityType);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,summary.ilike.%${search}%`);
      }

      const { data, error: e } = await query;
      if (e) throw new Error(e.message);
      setEntities((data || []) as Entity[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch entities");
    } finally {
      setIsLoading(false);
    }
  }, [search, entityType, limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { entities, isLoading, error, refresh: fetch };
}

export function useCommitments(options: { status?: string; limit?: number } = {}) {
  const { status, limit = 50 } = options;
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("commitments")
        .select("*")
        .order("due_at", { ascending: true, nullsFirst: false })
        .limit(limit);

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error: e } = await query;
      if (e) throw new Error(e.message);
      setCommitments((data || []) as Commitment[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch commitments");
    } finally {
      setIsLoading(false);
    }
  }, [status, limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { commitments, isLoading, error, refresh: fetch };
}

export function useLearningEntities(learningId: string | undefined) {
  const [entities, setEntities] = useState<EntityLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!learningId) { setEntities([]); return; }

    const fetchLinks = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from("learning_entities")
          .select("id, learning_id, entity_id, role, confidence, entities(*)")
          .eq("learning_id", learningId);

        const links: EntityLink[] = (data || []).map((row: Record<string, unknown>) => ({
          id: row.id as string,
          learning_id: row.learning_id as string,
          entity_id: row.entity_id as string,
          role: row.role as string | null,
          confidence: row.confidence as number,
          entity: row.entities as unknown as Entity | undefined,
        }));
        setEntities(links);
      } catch {
        // silently fail for linked entities
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinks();
  }, [learningId]);

  return { entities, isLoading };
}
