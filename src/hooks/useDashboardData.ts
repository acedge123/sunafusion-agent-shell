import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface KnowledgeNode {
  id: string;
  label: string;
  type: "subject" | "kind" | "category" | "domain";
  count: number;
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  weight: number;
}

export interface DashboardStats {
  totalLearnings: number;
  byKind: Record<string, number>;
  byCategory: Record<string, number>;
  bySubject: { name: string; type: string | null; count: number }[];
  byDomain: { domain: string; count: number }[];
  recentActivity: { date: string; count: number }[];
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all learnings with relevant fields for graph building
      const { data, error: queryError, count } = await supabase
        .from("agent_learnings")
        .select("id,kind,category,domain,subject_name,subject_type,tags,created_at,title,status", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(500);

      if (queryError) throw new Error(queryError.message);

      const learnings = data || [];
      const total = count ?? learnings.length;

      // Aggregate by kind
      const byKind: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      const subjectMap = new Map<string, { type: string | null; count: number }>();
      const domainMap = new Map<string, number>();
      const dateMap = new Map<string, number>();

      // For knowledge graph
      const nodeMap = new Map<string, KnowledgeNode>();
      const edgeMap = new Map<string, number>();

      for (const l of learnings) {
        // Kind aggregation
        const kind = l.kind || "general";
        byKind[kind] = (byKind[kind] || 0) + 1;

        // Category aggregation
        const cat = l.category || "general";
        byCategory[cat] = (byCategory[cat] || 0) + 1;

        // Subject aggregation
        if (l.subject_name) {
          const existing = subjectMap.get(l.subject_name);
          if (existing) {
            existing.count++;
          } else {
            subjectMap.set(l.subject_name, { type: l.subject_type, count: 1 });
          }
        }

        // Domain aggregation
        if (l.domain) {
          domainMap.set(l.domain, (domainMap.get(l.domain) || 0) + 1);
        }

        // Daily activity (last 30 days)
        const date = l.created_at?.slice(0, 10);
        if (date) {
          dateMap.set(date, (dateMap.get(date) || 0) + 1);
        }

        // Build graph nodes & edges
        const kindNodeId = `kind:${kind}`;
        if (!nodeMap.has(kindNodeId)) {
          nodeMap.set(kindNodeId, { id: kindNodeId, label: kind, type: "kind", count: 0 });
        }
        nodeMap.get(kindNodeId)!.count++;

        if (l.subject_name) {
          const subNodeId = `subject:${l.subject_name}`;
          if (!nodeMap.has(subNodeId)) {
            nodeMap.set(subNodeId, { id: subNodeId, label: l.subject_name, type: "subject", count: 0 });
          }
          nodeMap.get(subNodeId)!.count++;

          // Edge: subject <-> kind
          const edgeKey = `${subNodeId}|${kindNodeId}`;
          edgeMap.set(edgeKey, (edgeMap.get(edgeKey) || 0) + 1);
        }

        if (l.domain) {
          const domNodeId = `domain:${l.domain}`;
          if (!nodeMap.has(domNodeId)) {
            nodeMap.set(domNodeId, { id: domNodeId, label: l.domain, type: "domain", count: 0 });
          }
          nodeMap.get(domNodeId)!.count++;

          const edgeKey = `domain:${l.domain}|${kindNodeId}`;
          edgeMap.set(edgeKey, (edgeMap.get(edgeKey) || 0) + 1);

          if (l.subject_name) {
            const edgeKey2 = `subject:${l.subject_name}|domain:${l.domain}`;
            edgeMap.set(edgeKey2, (edgeMap.get(edgeKey2) || 0) + 1);
          }
        }

        const catNodeId = `category:${cat}`;
        if (!nodeMap.has(catNodeId)) {
          nodeMap.set(catNodeId, { id: catNodeId, label: cat, type: "category", count: 0 });
        }
        nodeMap.get(catNodeId)!.count++;

        if (l.subject_name) {
          const edgeKey = `subject:${l.subject_name}|${catNodeId}`;
          edgeMap.set(edgeKey, (edgeMap.get(edgeKey) || 0) + 1);
        }
      }

      const nodes = Array.from(nodeMap.values());
      const edges: KnowledgeEdge[] = Array.from(edgeMap.entries()).map(([key, weight]) => {
        const [source, target] = key.split("|");
        return { source, target, weight };
      });

      const bySubject = Array.from(subjectMap.entries()).map(([name, v]) => ({
        name,
        type: v.type,
        count: v.count,
      })).sort((a, b) => b.count - a.count);

      const byDomain = Array.from(domainMap.entries()).map(([domain, count]) => ({
        domain,
        count,
      })).sort((a, b) => b.count - a.count);

      const recentActivity = Array.from(dateMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30);

      setStats({
        totalLearnings: total,
        byKind,
        byCategory,
        bySubject,
        byDomain,
        recentActivity,
        nodes,
        edges,
      });
    } catch (err) {
      console.error("[useDashboardData]", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, isLoading, error, refresh: fetchData };
}
