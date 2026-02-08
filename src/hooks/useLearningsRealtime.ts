import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Learning } from "./useLearnings";

interface UseLearningsRealtimeOptions {
  kindFilter?: string;
  onNewLearning: (learning: Learning) => void;
  enabled?: boolean;
}

export function useLearningsRealtime({
  kindFilter,
  onNewLearning,
  enabled = true,
}: UseLearningsRealtimeOptions) {
  const handleInsert = useCallback(
    (payload: { new: unknown }) => {
      const newLearning = payload.new as Learning;

      // Filter by kind if specified
      if (kindFilter && kindFilter !== "all") {
        const kindMapping: Record<string, string[]> = {
          research: ["research_summary"],
          memory: ["memory"],
          decision: ["decision"],
          email: ["email_summary"],
          github: ["github_push_summary", "code_change"],
          composio: ["composio_trigger"],
        };
        const kinds = kindMapping[kindFilter] || [kindFilter];
        if (!kinds.includes(newLearning.kind || "general")) {
          return;
        }
      }

      onNewLearning(newLearning);
    },
    [kindFilter, onNewLearning]
  );

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel("learnings-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_learnings",
        },
        handleInsert
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, handleInsert]);
}
