import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AgentFile {
  id: string;
  filename: string;
  original_path: string | null;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  tags: string[] | null;
  description: string | null;
  source: string | null;
  owner_id: string | null;
  created_at: string;
}

export function useAgentFiles() {
  const [files, setFiles] = useState<AgentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("agent_files" as any)
        .select("id,filename,original_path,storage_path,mime_type,size_bytes,tags,description,source,owner_id,created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (err) throw err;
      setFiles((data as unknown as AgentFile[]) || []);
    } catch (e: any) {
      setError(e.message || "Failed to load files");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { files, isLoading, error, refresh: fetch };
}
