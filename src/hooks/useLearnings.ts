import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Learning {
  id: string;
  learning: string;
  category: string | null;
  kind: string | null;
  visibility: string | null;
  source: string | null;
  tags: string[] | null;
  confidence: number | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
  owner_id: string | null;
  subject_type: string | null;
  subject_id: string | null;
  subject_name: string | null;
  title: string | null;
  summary: string | null;
  redaction_level: string | null;
}

interface UseLearningsOptions {
  kind?: string;
  visibility?: string;
  search?: string;
  subjectName?: string;
  limit?: number;
}

interface UseLearningsResult {
  learnings: Learning[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export function useLearnings(options: UseLearningsOptions = {}): UseLearningsResult {
  const { kind, visibility, search, subjectName, limit = 20 } = options;
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);

  const fetchLearnings = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    setIsLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(currentOffset));
      if (kind) params.set("kind", kind);
      if (visibility) params.set("visibility", visibility);
      if (search) params.set("search", search);

      // Query the table directly since RLS allows authenticated reads
      let query = supabase
        .from("agent_learnings")
        .select("id,learning,category,kind,visibility,source,tags,confidence,created_at,metadata,owner_id,subject_type,subject_id,subject_name,title,summary,redaction_level", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(currentOffset, currentOffset + limit - 1);

      if (kind && kind !== "all") {
        // Handle multiple kinds for tabs like "email" which includes email_summary + composio_trigger
        const kindMapping: Record<string, string[]> = {
          research: ["research_summary"],
          memory: ["memory"],
          decision: ["decision"],
          email: ["email_summary"],
          github: ["github_push_summary", "code_change"],
          composio: ["composio_trigger"],
        };
        const kinds = kindMapping[kind] || [kind];
        query = query.in("kind", kinds);
      }

      if (visibility) {
        query = query.eq("visibility", visibility);
      }

      if (subjectName) {
        query = query.eq("subject_name", subjectName);
      }

      const { data, error: queryError, count } = await query;

      if (queryError) {
        throw new Error(queryError.message);
      }

      const typedData = (data || []) as Learning[];

      if (reset) {
        setLearnings(typedData);
        setOffset(limit);
      } else {
        setLearnings(prev => [...prev, ...typedData]);
        setOffset(prev => prev + limit);
      }

      setTotalCount(count ?? typedData.length);
    } catch (err) {
      console.error("[useLearnings] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch learnings");
    } finally {
      setIsLoading(false);
    }
  }, [kind, visibility, search, subjectName, limit, offset]);

  // Initial fetch and reset on filter changes
  useEffect(() => {
    setOffset(0);
    setLearnings([]);
    fetchLearnings(true);
  }, [kind, visibility, search, subjectName]);

  const loadMore = useCallback(() => {
    if (!isLoading && learnings.length < totalCount) {
      fetchLearnings(false);
    }
  }, [isLoading, learnings.length, totalCount, fetchLearnings]);

  const refresh = useCallback(() => {
    setOffset(0);
    setLearnings([]);
    fetchLearnings(true);
  }, [fetchLearnings]);

  const hasMore = learnings.length < totalCount;

  return {
    learnings,
    isLoading,
    error,
    totalCount,
    hasMore,
    loadMore,
    refresh,
  };
}

export function useLearningDetail(id: string | undefined) {
  const [learning, setLearning] = useState<Learning | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLearning(null);
      setIsLoading(false);
      return;
    }

    const fetchLearning = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: queryError } = await supabase
          .from("agent_learnings")
          .select("*")
          .eq("id", id)
          .single();

        if (queryError) {
          throw new Error(queryError.message);
        }

        setLearning(data as Learning);
      } catch (err) {
        console.error("[useLearningDetail] Error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch learning");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearning();
  }, [id]);

  return { learning, isLoading, error };
}
