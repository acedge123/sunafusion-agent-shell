import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const WIKI_BASE = `https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/wiki-engine`;

async function wikiRequest(path: string, options: RequestInit = {}) {
  const edgeKey = import.meta.env.VITE_AGENT_EDGE_KEY || "";
  const res = await fetch(`${WIKI_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${edgeKey}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export interface WikiSource {
  id: string;
  owner_id: string;
  source_type: string;
  title: string | null;
  source_url: string | null;
  status: string;
  tags: string[];
  ingested_at: string;
}

export interface WikiPage {
  id: string;
  owner_id: string;
  slug: string;
  page_type: string;
  title: string;
  summary: string | null;
  body_markdown: string;
  status: string;
  source_count: number;
  created_at: string;
  updated_at: string;
}

export interface WikiArtifact {
  id: string;
  owner_id: string;
  artifact_type: string;
  title: string;
  body_markdown: string | null;
  created_at: string;
}

export function useWiki(ownerId?: string) {
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [sources, setSources] = useState<WikiSource[]>([]);
  const [artifacts, setArtifacts] = useState<WikiArtifact[]>([]);
  const [selectedPage, setSelectedPage] = useState<(WikiPage & { linked_sources?: any[] }) | null>(null);
  const { toast } = useToast();

  const handleError = useCallback((e: unknown) => {
    const msg = e instanceof Error ? e.message : "Unknown error";
    toast({ title: "Wiki Error", description: msg, variant: "destructive" });
  }, [toast]);

  const fetchPages = useCallback(async (pageType?: string, search?: string) => {
    if (!ownerId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ owner_id: ownerId });
      if (pageType) params.set("page_type", pageType);
      if (search) params.set("search", search);
      const data = await wikiRequest(`/pages?${params}`);
      setPages(data.pages ?? []);
    } catch (e) { handleError(e); } finally { setLoading(false); }
  }, [ownerId, handleError]);

  const fetchSources = useCallback(async (status?: string, sourceType?: string) => {
    if (!ownerId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ owner_id: ownerId });
      if (status) params.set("status", status);
      if (sourceType) params.set("source_type", sourceType);
      const data = await wikiRequest(`/sources?${params}`);
      setSources(data.sources ?? []);
    } catch (e) { handleError(e); } finally { setLoading(false); }
  }, [ownerId, handleError]);

  const fetchArtifacts = useCallback(async () => {
    if (!ownerId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ owner_id: ownerId });
      const data = await wikiRequest(`/artifacts?${params}`);
      setArtifacts(data.artifacts ?? []);
    } catch (e) { handleError(e); } finally { setLoading(false); }
  }, [ownerId, handleError]);

  const fetchPage = useCallback(async (pageId: string) => {
    setLoading(true);
    try {
      const data = await wikiRequest(`/pages/${pageId}`);
      setSelectedPage({ ...data.page, linked_sources: data.sources });
    } catch (e) { handleError(e); } finally { setLoading(false); }
  }, [handleError]);

  const compileSource = useCallback(async (sourceId: string) => {
    if (!ownerId) return;
    setLoading(true);
    try {
      await wikiRequest("/compile/source", { method: "POST", body: JSON.stringify({ owner_id: ownerId, source_id: sourceId }) });
      toast({ title: "Compiled", description: "Source compiled into page" });
    } catch (e) { handleError(e); } finally { setLoading(false); }
  }, [ownerId, toast, handleError]);

  const compileTopic = useCallback(async (topic: string) => {
    if (!ownerId) return;
    setLoading(true);
    try {
      await wikiRequest("/compile/topic", { method: "POST", body: JSON.stringify({ owner_id: ownerId, topic }) });
      toast({ title: "Compiled", description: `Topic "${topic}" compiled` });
    } catch (e) { handleError(e); } finally { setLoading(false); }
  }, [ownerId, toast, handleError]);

  const reindex = useCallback(async () => {
    if (!ownerId) return;
    setLoading(true);
    try {
      const data = await wikiRequest("/reindex", { method: "POST", body: JSON.stringify({ owner_id: ownerId }) });
      toast({ title: "Reindexed", description: `${data.pages_indexed} pages indexed` });
    } catch (e) { handleError(e); } finally { setLoading(false); }
  }, [ownerId, toast, handleError]);

  const lint = useCallback(async () => {
    if (!ownerId) return null;
    setLoading(true);
    try {
      const data = await wikiRequest("/lint", { method: "POST", body: JSON.stringify({ owner_id: ownerId }) });
      toast({ title: "Lint Complete", description: `${data.finding_count} finding(s)` });
      return data.findings as string[];
    } catch (e) { handleError(e); return null; } finally { setLoading(false); }
  }, [ownerId, toast, handleError]);

  const answer = useCallback(async (question: string, saveArtifact = false) => {
    if (!ownerId) return null;
    setLoading(true);
    try {
      const data = await wikiRequest("/answer", { method: "POST", body: JSON.stringify({ owner_id: ownerId, question, save_artifact: saveArtifact }) });
      return data;
    } catch (e) { handleError(e); return null; } finally { setLoading(false); }
  }, [ownerId, handleError]);

  return {
    loading, pages, sources, artifacts, selectedPage,
    fetchPages, fetchSources, fetchArtifacts, fetchPage,
    compileSource, compileTopic, reindex, lint, answer,
    setSelectedPage,
  };
}
