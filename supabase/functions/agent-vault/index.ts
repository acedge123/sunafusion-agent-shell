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

    // ============================================================
    // COMPOSIO WEBHOOK (no auth - Composio calls this)
    // ============================================================
    if (req.method === "POST" && pathname.endsWith("/composio/webhook")) {
      console.log("[agent-vault] Composio webhook received");
      
      const body = await req.json().catch(() => null);
      if (!body) {
        console.error("[agent-vault] Webhook: invalid JSON body");
        return json(400, { error: "invalid JSON body" });
      }

      console.log("[agent-vault] Webhook payload:", JSON.stringify(body).slice(0, 500));

      // Get Supabase client for storing the trigger data
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (!supabaseUrl || !serviceRole) {
        console.error("[agent-vault] Webhook: Missing Supabase config");
        return json(500, { error: "server_config_error" });
      }

      const supabase = createClient(supabaseUrl, serviceRole, {
        auth: { persistSession: false },
      });

      // Extract trigger info from Composio payload
      // Composio sends: { type, data, timestamp, log_id, ... } (v2 format)
      const triggerName = body.type || body.trigger_name || body.triggerName || "unknown";
      const triggerData = {
        learning: `Composio trigger: ${triggerName} - ${JSON.stringify(body.data || body.payload || {}).slice(0, 1000)}`,
        category: "composio_trigger",
        source: "composio_webhook",
        tags: [
          body.data?.connection_id || body.connected_account_id || "unknown_account",
          triggerName.toUpperCase()
        ].filter(Boolean),
        confidence: 1.0,
        metadata: {
          raw_payload: body,
          received_at: new Date().toISOString(),
          connected_account_id: body.connected_account_id || body.connectedAccountId,
          trigger_name: body.trigger_name || body.triggerName,
        },
      };

      const { data, error } = await supabase
        .from("agent_learnings")
        .insert(triggerData)
        .select("id,learning,category,source,created_at")
        .single();

      if (error) {
        console.error("[agent-vault] Webhook insert error:", error.message);
        return json(500, { error: "db_error", detail: error.message });
      }

      console.log(`[agent-vault] Webhook stored as learning id=${data.id}`);
      return json(200, { ok: true, learning_id: data.id });
    }

    // ============================================================
    // COMPOSIO WEBHOOK REGISTRATION (internal setup - no external auth needed)
    // GET /composio/setup-webhook - one-time setup to register webhook with Composio
    // ============================================================
    if (req.method === "GET" && pathname.endsWith("/composio/setup-webhook")) {
      const composioKey = Deno.env.get("COMPOSIO_API_KEY");
      if (!composioKey) {
        return json(500, { error: "COMPOSIO_API_KEY not configured" });
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const webhookUrl = `${supabaseUrl}/functions/v1/agent-vault/composio/webhook`;

      console.log(`[agent-vault] Setting up webhook URL: ${webhookUrl}`);

      try {
        const response = await fetch("https://backend.composio.dev/api/v1/webhooks", {
          method: "POST",
          headers: {
            "x-api-key": composioKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: webhookUrl,
            version: "v2",
          }),
        });

        const data = await response.text();
        console.log(`[agent-vault] Webhook setup response (${response.status}): ${data}`);

        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = { raw: data };
        }

        if (!response.ok) {
          return json(response.status, { 
            error: "composio_webhook_registration_failed", 
            detail: parsed,
            status: response.status 
          });
        }

        return json(200, { 
          ok: true, 
          message: "Webhook registered successfully with Composio",
          webhook_url: webhookUrl,
          composio_response: parsed 
        });
      } catch (fetchError) {
        console.error("[agent-vault] Webhook setup failed:", fetchError);
        return json(500, { 
          error: "fetch_error", 
          detail: String(fetchError) 
        });
      }
    }

    // ---- Auth gate (shared secret) - for all other endpoints ----
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

    // ============================================================
    // COMPOSIO PROXY ENDPOINTS
    // ============================================================

    const COMPOSIO_BASE_URL = "https://backend.composio.dev/api/v3";

    // Helper to make Composio API calls
    async function composioFetch(path: string, options: RequestInit = {}): Promise<Response> {
      const composioKey = Deno.env.get("COMPOSIO_API_KEY");
      if (!composioKey) {
        console.error("[agent-vault] COMPOSIO_API_KEY not configured");
        return new Response(JSON.stringify({ error: "composio_not_configured" }), {
          status: 500,
          headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
        });
      }

      const headers: Record<string, string> = {
        "x-api-key": composioKey,
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> || {}),
      };

      console.log(`[agent-vault] Composio request: ${options.method || "GET"} ${path}`);

      try {
        const response = await fetch(`${COMPOSIO_BASE_URL}${path}`, {
          ...options,
          headers,
        });

        // Get raw text first to handle non-JSON responses
        const rawText = await response.text();
        console.log(`[agent-vault] Composio response status: ${response.status}`);
        
        // Log error details for debugging
        if (!response.ok) {
          console.error(`[agent-vault] Composio error response: ${rawText.slice(0, 1000)}`);
        }
        
        // Try to parse as JSON
        let data: unknown;
        try {
          data = JSON.parse(rawText);
        } catch {
          // Not valid JSON - return error with raw response
          console.error(`[agent-vault] Composio returned non-JSON: ${rawText.slice(0, 200)}`);
          return new Response(JSON.stringify({ 
            error: "composio_error", 
            detail: response.ok ? "Invalid response format" : rawText.slice(0, 500),
            status: response.status
          }), {
            status: response.ok ? 500 : response.status,
            headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
          });
        }

        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
        });
      } catch (fetchError) {
        console.error(`[agent-vault] Composio fetch failed:`, fetchError);
        return new Response(JSON.stringify({ 
          error: "composio_fetch_error", 
          detail: String(fetchError) 
        }), {
          status: 500,
          headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
        });
      }
    }

    // ---- GET /composio/toolkits ----
    if (req.method === "GET" && pathname.endsWith("/composio/toolkits")) {
      const params = new URLSearchParams();
      const search = url.searchParams.get("search");
      const limit = url.searchParams.get("limit");
      
      if (search) params.set("search", search);
      if (limit) params.set("limit", limit);

      const queryString = params.toString();
      return composioFetch(`/toolkits${queryString ? `?${queryString}` : ""}`);
    }

    // ---- GET /composio/tools (list with filtering) ----
    if (req.method === "GET" && pathname.endsWith("/composio/tools")) {
      const params = new URLSearchParams();
      const toolkitSlug = url.searchParams.get("toolkit_slug");
      const search = url.searchParams.get("search");
      const tags = url.searchParams.get("tags");
      const limit = url.searchParams.get("limit");

      if (toolkitSlug) params.set("toolkit_slug", toolkitSlug);
      if (search) params.set("search", search);
      if (tags) params.set("tags", tags);
      if (limit) params.set("limit", limit);

      const queryString = params.toString();
      return composioFetch(`/tools${queryString ? `?${queryString}` : ""}`);
    }

    // ---- POST /composio/tools/execute ----
    if (req.method === "POST" && pathname.endsWith("/composio/tools/execute")) {
      const body = await req.json().catch(() => null);

      if (!body || typeof body !== "object") {
        return json(400, { error: "invalid JSON body" });
      }

      // Validate required fields
      if (!body.toolSlug || typeof body.toolSlug !== "string") {
        return json(400, { error: "missing or invalid toolSlug" });
      }

      const toolSlug = body.toolSlug;
      // Remove toolSlug from body since it goes in the URL path
      const { toolSlug: _, ...executeBody } = body;

      console.log(`[agent-vault] Composio execute: ${toolSlug}`);
      console.log(`[agent-vault] Composio execute body:`, JSON.stringify(executeBody));

      // Correct endpoint: /tools/execute/{tool_slug}
      return composioFetch(`/tools/execute/${encodeURIComponent(toolSlug)}`, {
        method: "POST",
        body: JSON.stringify(executeBody),
      });
    }

    // ---- GET /composio/tools/:slug (specific tool) ----
    // Must come after more specific routes
    const composioToolMatch = pathname.match(/\/composio\/tools\/([A-Za-z0-9_-]+)$/);
    if (req.method === "GET" && composioToolMatch) {
      const slug = composioToolMatch[1];

      if (!slug || slug.length > 100) {
        return json(400, { error: "invalid tool slug" });
      }

      return composioFetch(`/tools/${encodeURIComponent(slug)}`);
    }

    // ---- 404 fallback ----
    return json(404, { error: "not_found", path: pathname });

  } catch (e) {
    console.error("[agent-vault] Unexpected error:", e);
    return json(500, { error: "server_error", detail: String(e?.message || e) });
  }
});
