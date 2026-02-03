import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

type Json = Record<string, unknown>;

function json(status: number, body: Json) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
  });
}

function clampInt(v: string | null, dflt: number, min: number, max: number): number {
  const n = v ? Number.parseInt(v, 10) : NaN;
  if (!Number.isFinite(n)) return dflt;
  return Math.max(min, Math.min(max, n));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname.replace(/\/+$/, ""); // trim trailing slash

    // ---- Auth gate (shared secret) ----
    const expectedKey = Deno.env.get("AGENT_EDGE_KEY");
    const authHeader = req.headers.get("authorization") || "";
    const providedKey = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!providedKey || providedKey !== expectedKey) {
      console.log("[agent-vault] Unauthorized request attempt");
      return json(401, { error: "unauthorized" });
    }

    // ---- Supabase admin client (service role stays server-side) ----
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRole) {
      console.error("[agent-vault] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return json(500, { error: "server_config_error" });
    }

    const supabase = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false },
    });

    console.log(`[agent-vault] ${req.method} ${pathname}`);

    // ---- Health ----
    if (req.method === "GET" && pathname.endsWith("/health")) {
      return json(200, { ok: true, ts: new Date().toISOString() });
    }

    // ---- GET /repo_map/count ----
    if (req.method === "GET" && pathname.endsWith("/repo_map/count")) {
      const { data, error } = await supabase.rpc("count_repo_map");
      if (error) {
        console.error("[agent-vault] count_repo_map error:", error.message);
        return json(500, { error: "db_error", detail: error.message });
      }
      return json(200, { count: data });
    }

    // ---- GET /repo_map/get?name=<repo_name> ----
    if (req.method === "GET" && pathname.endsWith("/repo_map/get")) {
      const name = (url.searchParams.get("name") || "").trim();

      if (!name) {
        return json(400, { error: "missing name parameter" });
      }
      if (name.length > 200) {
        return json(400, { error: "name too long" });
      }

      const { data, error } = await supabase
        .from("repo_map")
        .select("repo_name,origin,domain_summary,tables,integrations,supabase_functions,stack,shared_tables,metadata")
        .eq("repo_name", name)
        .maybeSingle();

      if (error) {
        console.error("[agent-vault] repo_map get error:", error.message);
        return json(500, { error: "db_error", detail: error.message });
      }
      return json(200, { data: data ?? null });
    }

    // ---- GET /repo_map/search?q=<query>&limit=<n> ----
    if (req.method === "GET" && pathname.endsWith("/repo_map/search")) {
      const q = (url.searchParams.get("q") || "").trim();
      const limit = clampInt(url.searchParams.get("limit"), 10, 1, 50);

      if (!q) {
        return json(400, { error: "missing q parameter" });
      }
      if (q.length > 200) {
        return json(400, { error: "q too long" });
      }

      // Use the existing database function for full-text search
      const { data, error } = await supabase.rpc("search_repo_map", { query: q });

      if (error) {
        console.error("[agent-vault] search_repo_map error:", error.message);
        return json(500, { error: "db_error", detail: error.message });
      }

      // Apply limit (the DB function returns up to 20)
      const results = (data || []).slice(0, limit);
      return json(200, { data: results, count: results.length });
    }

    // ---- GET /learnings/search?q=<query>&limit=<n> ----
    if (req.method === "GET" && pathname.endsWith("/learnings/search")) {
      const q = (url.searchParams.get("q") || "").trim();
      const limit = clampInt(url.searchParams.get("limit"), 10, 1, 50);

      if (!q) {
        return json(400, { error: "missing q parameter" });
      }
      if (q.length > 200) {
        return json(400, { error: "q too long" });
      }

      // Use the existing database function for full-text search
      const { data, error } = await supabase.rpc("search_agent_learnings", { 
        query: q, 
        limit_count: limit 
      });

      if (error) {
        console.error("[agent-vault] search_agent_learnings error:", error.message);
        return json(500, { error: "db_error", detail: error.message });
      }

      return json(200, { data: data || [], count: (data || []).length });
    }

    // ---- POST /learnings (insert new learning) ----
    if (req.method === "POST" && pathname.endsWith("/learnings")) {
      const body = await req.json().catch(() => null);

      if (!body || typeof body !== "object") {
        return json(400, { error: "invalid JSON body" });
      }

      // Map from CGPT's proposed format to actual schema
      // Supports both formats:
      // - CGPT format: { repo, topic, learning, source, meta }
      // - Native format: { learning, category, source, tags, confidence, metadata }
      const payload = {
        learning: String(body.learning ?? "").trim(),
        category: String(body.category || body.topic || "general").trim(),
        source: String(body.source || "agent").trim(),
        tags: Array.isArray(body.tags) 
          ? body.tags.map((t: unknown) => String(t)) 
          : (body.repo ? [String(body.repo)] : null),
        confidence: typeof body.confidence === "number" 
          ? Math.max(0, Math.min(1, body.confidence)) 
          : 0.5,
        metadata: (body.meta && typeof body.meta === "object") 
          ? body.meta 
          : (body.metadata && typeof body.metadata === "object")
            ? body.metadata
            : {},
      };

      // Validation
      if (!payload.learning) {
        return json(400, { error: "missing learning field" });
      }
      if (payload.learning.length > 8000) {
        return json(400, { error: "learning too long (max 8000 chars)" });
      }
      if (payload.category.length > 200) {
        return json(400, { error: "category/topic too long" });
      }
      if (payload.source.length > 100) {
        return json(400, { error: "source too long" });
      }

      const { data, error } = await supabase
        .from("agent_learnings")
        .insert(payload)
        .select("id,learning,category,source,tags,created_at")
        .single();

      if (error) {
        console.error("[agent-vault] insert learning error:", error.message);
        return json(500, { error: "db_error", detail: error.message });
      }

      console.log(`[agent-vault] Inserted learning id=${data.id} source=${payload.source}`);
      return json(200, { data });
    }

    // ---- 404 fallback ----
    return json(404, { error: "not_found", path: pathname });

  } catch (e) {
    console.error("[agent-vault] Unexpected error:", e);
    return json(500, { error: "server_error", detail: String(e?.message || e) });
  }
});
