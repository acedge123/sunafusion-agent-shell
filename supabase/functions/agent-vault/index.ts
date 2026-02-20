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
        kind: "composio_trigger", // NEW: set the kind for proper filtering
        visibility: "private", // NEW: composio triggers are private by default
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

      // Insert a job for the worker daemon to process
      const { error: jobError } = await supabase
        .from("jobs")
        .insert({
          type: triggerName || "composio_trigger",
          payload: {
            text: `New Composio trigger (${triggerName}). Check latest composio_trigger learnings.`,
            learning_id: data.id,
            trigger_name: triggerName,
            timestamp: new Date().toISOString(),
          },
          status: "queued",
        });

      if (jobError) {
        console.error("[agent-vault] Failed to insert job:", jobError.message);
        // Non-fatal - the learning is still stored
      } else {
        console.log(`[agent-vault] Job queued for learning id=${data.id}`);
      }

      return json(200, { ok: true, learning_id: data.id, job_queued: !jobError });
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

    // ---- Supabase clients ----
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRole) {
      console.error("[agent-vault] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return json(500, { error: "server_config_error" });
    }

    const authHeader = req.headers.get("authorization") || "";

    // ============================================================
    // CHAT SUBMIT (user auth via Supabase JWT)
    // ============================================================
    if (req.method === "POST" && pathname.endsWith("/chat/submit")) {
      // Create client with user's JWT for RLS
      const userClient = createClient(supabaseUrl, anonKey || serviceRole, {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } },
      });

      // Verify user is authenticated
      const { data: { user }, error: authError } = await userClient.auth.getUser();
      if (authError || !user) {
        console.log("[agent-vault] /chat/submit: Unauthorized - no valid user JWT");
        return json(401, { error: "unauthorized" });
      }

      console.log(`[agent-vault] POST /chat/submit (user=${user.id})`);

      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") {
        return json(400, { error: "invalid JSON body" });
      }

      const message = String(body.message || "").trim();
      if (!message) {
        return json(400, { error: "missing message" });
      }
      if (message.length > 4000) {
        return json(400, { error: "message too long (max 4000 chars)" });
      }

      // Use service role for inserts (bypasses RLS)
      const supabase = createClient(supabaseUrl, serviceRole, {
        auth: { persistSession: false },
      });

      // 1. Store the user message as a learning (for audit/display)
      const { data: learning, error: learningError } = await supabase
        .from("agent_learnings")
        .insert({
          learning: `User query: ${message}`,
          category: "chat_query",
          source: "chat_ui",
          kind: "chat_query",
          visibility: "private",
          confidence: 1.0,
          metadata: { 
            timestamp: new Date().toISOString(),
            raw_message: message,
            user_id: user.id,
          },
        })
        .select("id")
        .single();

      if (learningError) {
        console.error("[agent-vault] chat learning insert error:", learningError.message);
        return json(500, { error: "db_error", detail: learningError.message });
      }

      // 2. Create job for worker daemon
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .insert({
          type: "chat_query",
          payload: {
            text: message,
            source: "chat_ui",
            learning_id: learning?.id,
            user_id: user.id,
            timestamp: new Date().toISOString(),
          },
          status: "queued",
        })
        .select("id,type,status,created_at")
        .single();

      if (jobError) {
        console.error("[agent-vault] chat job insert error:", jobError.message);
        return json(500, { error: "db_error", detail: jobError.message });
      }

      console.log(`[agent-vault] Chat job created id=${job.id} learning_id=${learning?.id}`);
      return json(200, { job, learning_id: learning?.id });
    }

    // ---- Auth gate (shared secret) - for all other endpoints ----
    const expectedKey = Deno.env.get("AGENT_EDGE_KEY");
    const providedKey = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!providedKey || providedKey !== expectedKey) {
      console.log("[agent-vault] Unauthorized request attempt");
      return json(401, { error: "unauthorized" });
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

    // ---- GET /learnings/list?limit=50&since=<iso>&source=<src>&kind=<kind> ----
    if (req.method === "GET" && pathname.endsWith("/learnings/list")) {
      const limit = clampInt(url.searchParams.get("limit"), 50, 1, 200);
      const since = (url.searchParams.get("since") || "").trim();
      const source = (url.searchParams.get("source") || "").trim();
      const kind = (url.searchParams.get("kind") || "").trim();
      const domain = (url.searchParams.get("domain") || "").trim();

      let query = supabase
        .from("agent_learnings")
        .select("id,title,summary,learning,category,kind,visibility,source,domain,tags,confidence,created_at,subject_type,subject_name,status")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (since) {
        query = query.gte("created_at", since);
      }
      if (source) {
        query = query.eq("source", source);
      }
      if (kind) {
        query = query.eq("kind", kind);
      }
      if (domain) {
        query = query.eq("domain", domain);
      }

      const { data, error } = await query;

      if (error) {
        console.error("[agent-vault] learnings/list error:", error.message);
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

      // Valid values for kind, visibility, redaction_level, subject_type, status
      const VALID_KINDS = ['general', 'composio_trigger', 'chat_response', 'chat_query', 'research_summary', 'github_push_summary', 'email_summary', 'memory', 'decision', 'code_change', 'image_generation', 'db_query_result', 'person', 'project', 'runbook', 'incident', 'integration'];
      const VALID_VISIBILITY = ['private', 'family', 'public'];
      const VALID_REDACTION = ['public', 'internal', 'sensitive'];
      const VALID_SUBJECT_TYPES = ['person', 'repo', 'service', 'system'];
      const VALID_STATUS = ['draft', 'approved', 'rejected'];

      // Map from CGPT's proposed format to actual schema
      // Supports both formats:
      // - CGPT format: { repo, topic, learning, source, meta }
      // - Native format: { learning, category, source, tags, confidence, metadata, kind, visibility, ... }
      const rawKind = String(body.kind || "general").trim();
      const rawVisibility = String(body.visibility || "private").trim();
      const rawRedaction = String(body.redaction_level || "sensitive").trim();
      const rawSubjectType = body.subject_type ? String(body.subject_type).trim() : null;

      const payload: Record<string, unknown> = {
        learning: String(body.learning ?? "").trim(),
        category: String(body.category || body.topic || "general").trim(),
        source: String(body.source || "agent").trim(),
        kind: VALID_KINDS.includes(rawKind) ? rawKind : "general",
        visibility: VALID_VISIBILITY.includes(rawVisibility) ? rawVisibility : "private",
        redaction_level: VALID_REDACTION.includes(rawRedaction) ? rawRedaction : "sensitive",
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

      // Optional subject fields
      if (body.owner_id && typeof body.owner_id === "string") {
        payload.owner_id = body.owner_id.trim();
      }
      if (rawSubjectType && VALID_SUBJECT_TYPES.includes(rawSubjectType)) {
        payload.subject_type = rawSubjectType;
      }
      if (body.subject_id && typeof body.subject_id === "string") {
        payload.subject_id = body.subject_id.trim();
      }
      if (body.subject_name && typeof body.subject_name === "string") {
        payload.subject_name = body.subject_name.trim();
      }
      if (body.title && typeof body.title === "string") {
        payload.title = body.title.trim().slice(0, 500);
      }
      if (body.summary && typeof body.summary === "string") {
        payload.summary = body.summary.trim().slice(0, 2000);
      }
      // New expanded fields
      if (body.domain && typeof body.domain === "string") {
        payload.domain = body.domain.trim();
      }
      if (body.source_date && typeof body.source_date === "string") {
        payload.source_date = body.source_date.trim(); // YYYY-MM-DD
      }
      const rawStatus = String(body.status || "draft").trim();
      payload.status = VALID_STATUS.includes(rawStatus) ? rawStatus : "draft";
      if (Array.isArray(body.source_refs)) {
        payload.source_refs = body.source_refs.map((r: unknown) => String(r));
      }
      if (body.details_markdown && typeof body.details_markdown === "string") {
        payload.details_markdown = body.details_markdown;
      }

      // Validation
      if (!payload.learning) {
        return json(400, { error: "missing learning field" });
      }
      if ((payload.learning as string).length > 8000) {
        return json(400, { error: "learning too long (max 8000 chars)" });
      }
      if ((payload.category as string).length > 200) {
        return json(400, { error: "category/topic too long" });
      }
      if ((payload.source as string).length > 100) {
        return json(400, { error: "source too long" });
      }

      const { data, error } = await supabase
        .from("agent_learnings")
        .insert(payload)
        .select("id,learning,category,kind,visibility,source,tags,created_at,owner_id,subject_type,subject_id,subject_name,title,summary,redaction_level,domain,source_date,status,source_refs,details_markdown")
        .single();

      if (error) {
        console.error("[agent-vault] insert learning error:", error.message);
        return json(500, { error: "db_error", detail: error.message });
      }

      console.log(`[agent-vault] Inserted learning id=${data.id} kind=${payload.kind} source=${payload.source} subject=${payload.subject_name || "none"}`);
      return json(200, { data });
    }

    // ---- GET /learnings/feed (list with filtering/pagination) ----
    if (req.method === "GET" && pathname.endsWith("/learnings/feed")) {
      const kind = url.searchParams.get("kind");
      const visibility = url.searchParams.get("visibility");
      const search = url.searchParams.get("search");
      const limit = clampInt(url.searchParams.get("limit"), 20, 1, 100);
      const offset = clampInt(url.searchParams.get("offset"), 0, 0, 10000);

      // If search is provided, use full-text search RPC
      if (search && search.trim()) {
        const { data, error } = await supabase.rpc("search_agent_learnings", { 
          query: search.trim(), 
          limit_count: limit 
        });

        if (error) {
          console.error("[agent-vault] search_agent_learnings error:", error.message);
          return json(500, { error: "db_error", detail: error.message });
        }

        return json(200, { data: data || [], count: (data || []).length, search: search.trim() });
      }

      // Standard filtering query
      let query = supabase
        .from("agent_learnings")
        .select("id,learning,category,kind,visibility,source,tags,confidence,created_at,metadata", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (kind) query = query.eq("kind", kind);
      if (visibility) query = query.eq("visibility", visibility);

      const { data, error, count } = await query;

      if (error) {
        console.error("[agent-vault] learnings feed error:", error.message);
        return json(500, { error: "db_error", detail: error.message });
      }

      return json(200, { data: data || [], count: count ?? (data || []).length, offset, limit });
    }

    // ---- GET /learnings/get?id=<uuid> (query-param style) ----
    if (req.method === "GET" && pathname.endsWith("/learnings/get")) {
      const qid = (url.searchParams.get("id") || "").trim();
      if (!qid) {
        return json(400, { error: "missing id parameter" });
      }

      const { data, error } = await supabase
        .from("agent_learnings")
        .select("*")
        .eq("id", qid)
        .maybeSingle();

      if (error) {
        console.error("[agent-vault] learnings/get error:", error.message);
        return json(500, { error: "db_error", detail: error.message });
      }
      if (!data) {
        return json(404, { error: "not_found" });
      }
      return json(200, { data });
    }

    // ---- GET /learnings/:id (single learning detail) ----
    const learningIdMatch = pathname.match(/\/learnings\/([a-f0-9-]{36})$/);
    if (req.method === "GET" && learningIdMatch) {
      const id = learningIdMatch[1];

      const { data, error } = await supabase
        .from("agent_learnings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return json(404, { error: "not_found", id });
        }
        console.error("[agent-vault] get learning error:", error.message);
        return json(500, { error: "db_error", detail: error.message });
      }

      return json(200, { data });
    }


    // ============================================================
    // JOBS API (for worker daemon)
    // ============================================================

    // ---- POST /jobs/next (claim next queued job) ----
    if (req.method === "POST" && pathname.endsWith("/jobs/next")) {
      const body = await req.json().catch(() => ({}));
      const workerId = String(body.worker_id || "unknown-worker").trim();

      if (workerId.length > 100) {
        return json(400, { error: "worker_id too long" });
      }

      const { data, error } = await supabase.rpc("claim_next_job", { 
        p_worker_id: workerId 
      });

      if (error) {
        console.error("[agent-vault] claim_next_job error:", error.message);
        return json(500, { error: "db_error", detail: error.message });
      }

      // RPC returns array; if empty, no job available
      if (!data || data.length === 0) {
        return new Response(null, { 
          status: 204, 
          headers: corsHeaders 
        });
      }

      console.log(`[agent-vault] Job claimed: ${data[0].id} by ${workerId}`);
      return json(200, { job: data[0] });
    }

    // ---- POST /jobs/ack (complete a job) ----
    if (req.method === "POST" && pathname.endsWith("/jobs/ack")) {
      const body = await req.json().catch(() => null);

      if (!body || typeof body !== "object") {
        return json(400, { error: "invalid JSON body" });
      }

      const jobId = body.job_id;
      const status = body.status;
      const lastError = body.last_error || null;

      if (!jobId || typeof jobId !== "string") {
        return json(400, { error: "missing or invalid job_id" });
      }
      if (!status || !["done", "failed"].includes(status)) {
        return json(400, { error: "status must be 'done' or 'failed'" });
      }

      const { error } = await supabase.rpc("complete_job", {
        p_job_id: jobId,
        p_status: status,
        p_last_error: lastError,
      });

      if (error) {
        console.error("[agent-vault] complete_job error:", error.message);
        return json(500, { error: "db_error", detail: error.message });
      }

      console.log(`[agent-vault] Job ${jobId} marked as ${status}`);
      return json(200, { ok: true, job_id: jobId, status });
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
      
      // Normalize field names to snake_case (Composio v3 API requirement)
      // Accept both camelCase and snake_case from clients
      const executeBody: Record<string, unknown> = {
        // Prefer snake_case, fallback to camelCase
        connected_account_id: body.connected_account_id || body.connectedAccountId,
        user_id: body.user_id || body.entityId || body.userId,
        arguments: body.arguments,
        version: body.version,
        text: body.text,
        custom_auth_params: body.custom_auth_params || body.customAuthParams,
        allow_tracing: body.allow_tracing || body.allowTracing,
      };

      // Remove undefined values
      Object.keys(executeBody).forEach(key => {
        if (executeBody[key] === undefined) {
          delete executeBody[key];
        }
      });

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
