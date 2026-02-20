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

// Shared validation constants
const VALID_KINDS = ['general', 'composio_trigger', 'chat_response', 'chat_query', 'research_summary', 'github_push_summary', 'email_summary', 'memory', 'decision', 'code_change', 'image_generation', 'db_query_result', 'person', 'project', 'runbook', 'incident', 'integration'];
const VALID_VISIBILITY = ['private', 'family', 'public'];
const VALID_REDACTION = ['public', 'internal', 'sensitive'];
const VALID_SUBJECT_TYPES = ['person', 'repo', 'service', 'system'];
const VALID_STATUS = ['draft', 'approved', 'rejected'];
const VALID_TASK_STATUS = ['todo', 'in_progress', 'done', 'cancelled'];
const VALID_TASK_PRIORITY = ['low', 'medium', 'high', 'urgent'];

// Immutable fields that cannot be changed via PATCH
const IMMUTABLE_LEARNING_FIELDS = new Set(['id', 'created_at', 'source']);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname.replace(/\/+$/, "");

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

      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (!supabaseUrl || !serviceRole) {
        console.error("[agent-vault] Webhook: Missing Supabase config");
        return json(500, { error: "server_config_error" });
      }

      const supabase = createClient(supabaseUrl, serviceRole, {
        auth: { persistSession: false },
      });

      const triggerName = body.type || body.trigger_name || body.triggerName || "unknown";
      const triggerData = {
        learning: `Composio trigger: ${triggerName} - ${JSON.stringify(body.data || body.payload || {}).slice(0, 1000)}`,
        category: "composio_trigger",
        kind: "composio_trigger",
        visibility: "private",
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
      } else {
        console.log(`[agent-vault] Job queued for learning id=${data.id}`);
      }

      return json(200, { ok: true, learning_id: data.id, job_queued: !jobError });
    }

    // ============================================================
    // COMPOSIO WEBHOOK REGISTRATION
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
          body: JSON.stringify({ url: webhookUrl, version: "v2" }),
        });

        const data = await response.text();
        console.log(`[agent-vault] Webhook setup response (${response.status}): ${data}`);

        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = { raw: data }; }

        if (!response.ok) {
          return json(response.status, { error: "composio_webhook_registration_failed", detail: parsed, status: response.status });
        }

        return json(200, { ok: true, message: "Webhook registered successfully with Composio", webhook_url: webhookUrl, composio_response: parsed });
      } catch (fetchError) {
        console.error("[agent-vault] Webhook setup failed:", fetchError);
        return json(500, { error: "fetch_error", detail: String(fetchError) });
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
      const userClient = createClient(supabaseUrl, anonKey || serviceRole, {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } },
      });

      const { data: { user }, error: authError } = await userClient.auth.getUser();
      if (authError || !user) {
        console.log("[agent-vault] /chat/submit: Unauthorized - no valid user JWT");
        return json(401, { error: "unauthorized" });
      }

      console.log(`[agent-vault] POST /chat/submit (user=${user.id})`);

      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") return json(400, { error: "invalid JSON body" });

      const message = String(body.message || "").trim();
      if (!message) return json(400, { error: "missing message" });
      if (message.length > 4000) return json(400, { error: "message too long (max 4000 chars)" });

      const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

      const { data: learning, error: learningError } = await supabase
        .from("agent_learnings")
        .insert({
          learning: `User query: ${message}`,
          category: "chat_query",
          source: "chat_ui",
          kind: "chat_query",
          visibility: "private",
          confidence: 1.0,
          metadata: { timestamp: new Date().toISOString(), raw_message: message, user_id: user.id },
        })
        .select("id")
        .single();

      if (learningError) {
        console.error("[agent-vault] chat learning insert error:", learningError.message);
        return json(500, { error: "db_error", detail: learningError.message });
      }

      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .insert({
          type: "chat_query",
          payload: { text: message, source: "chat_ui", learning_id: learning?.id, user_id: user.id, timestamp: new Date().toISOString() },
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

    // ---- Auth gate (shared secret) ----
    const expectedKey = Deno.env.get("AGENT_EDGE_KEY");
    const providedKey = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!providedKey || providedKey !== expectedKey) {
      console.log("[agent-vault] Unauthorized request attempt");
      return json(401, { error: "unauthorized" });
    }

    const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

    console.log(`[agent-vault] ${req.method} ${pathname}`);

    // ---- Health ----
    if (req.method === "GET" && pathname.endsWith("/health")) {
      return json(200, { ok: true, ts: new Date().toISOString() });
    }

    // ============================================================
    // REPO MAP
    // ============================================================

    if (req.method === "GET" && pathname.endsWith("/repo_map/count")) {
      const { data, error } = await supabase.rpc("count_repo_map");
      if (error) return json(500, { error: "db_error", detail: error.message });
      return json(200, { count: data });
    }

    if (req.method === "GET" && pathname.endsWith("/repo_map/get")) {
      const name = (url.searchParams.get("name") || "").trim();
      if (!name) return json(400, { error: "missing name parameter" });
      if (name.length > 200) return json(400, { error: "name too long" });

      const { data, error } = await supabase
        .from("repo_map")
        .select("repo_name,origin,domain_summary,tables,integrations,supabase_functions,stack,shared_tables,metadata")
        .eq("repo_name", name)
        .maybeSingle();

      if (error) return json(500, { error: "db_error", detail: error.message });
      return json(200, { data: data ?? null });
    }

    if (req.method === "GET" && pathname.endsWith("/repo_map/search")) {
      const q = (url.searchParams.get("q") || "").trim();
      const limit = clampInt(url.searchParams.get("limit"), 10, 1, 50);
      if (!q) return json(400, { error: "missing q parameter" });
      if (q.length > 200) return json(400, { error: "q too long" });

      const { data, error } = await supabase.rpc("search_repo_map", { query: q });
      if (error) return json(500, { error: "db_error", detail: error.message });

      const results = (data || []).slice(0, limit);
      return json(200, { data: results, count: results.length });
    }

    // ============================================================
    // LEARNINGS
    // ============================================================

    // ---- GET /learnings/stats ----
    if (req.method === "GET" && pathname.endsWith("/learnings/stats")) {
      const since = (url.searchParams.get("since") || "").trim();

      let query = supabase.from("agent_learnings").select("kind,domain,source,status");
      if (since) query = query.gte("created_at", since);

      const { data, error } = await query;
      if (error) return json(500, { error: "db_error", detail: error.message });

      const rows = data || [];
      const byKind: Record<string, number> = {};
      const byDomain: Record<string, number> = {};
      const bySource: Record<string, number> = {};
      const byStatus: Record<string, number> = {};

      for (const r of rows) {
        const k = r.kind || "unknown"; byKind[k] = (byKind[k] || 0) + 1;
        const d = r.domain || "unknown"; byDomain[d] = (byDomain[d] || 0) + 1;
        const s = r.source || "unknown"; bySource[s] = (bySource[s] || 0) + 1;
        const st = r.status || "unknown"; byStatus[st] = (byStatus[st] || 0) + 1;
      }

      return json(200, { total: rows.length, by_kind: byKind, by_domain: byDomain, by_source: bySource, by_status: byStatus });
    }

    // ---- GET /learnings/search ----
    if (req.method === "GET" && pathname.endsWith("/learnings/search")) {
      const q = (url.searchParams.get("q") || "").trim();
      const limit = clampInt(url.searchParams.get("limit"), 10, 1, 50);
      if (!q) return json(400, { error: "missing q parameter" });
      if (q.length > 200) return json(400, { error: "q too long" });

      const { data, error } = await supabase.rpc("search_agent_learnings", { query: q, limit_count: limit });
      if (error) return json(500, { error: "db_error", detail: error.message });
      return json(200, { data: data || [], count: (data || []).length });
    }

    // ---- GET /learnings/list ----
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

      if (since) query = query.gte("created_at", since);
      if (source) query = query.eq("source", source);
      if (kind) query = query.eq("kind", kind);
      if (domain) query = query.eq("domain", domain);

      const { data, error } = await query;
      if (error) return json(500, { error: "db_error", detail: error.message });
      return json(200, { data: data || [], count: (data || []).length });
    }

    // ---- GET /learnings/feed ----
    if (req.method === "GET" && pathname.endsWith("/learnings/feed")) {
      const kind = url.searchParams.get("kind");
      const visibility = url.searchParams.get("visibility");
      const search = url.searchParams.get("search");
      const limit = clampInt(url.searchParams.get("limit"), 20, 1, 100);
      const offset = clampInt(url.searchParams.get("offset"), 0, 0, 10000);

      if (search && search.trim()) {
        const { data, error } = await supabase.rpc("search_agent_learnings", { query: search.trim(), limit_count: limit });
        if (error) return json(500, { error: "db_error", detail: error.message });
        return json(200, { data: data || [], count: (data || []).length, search: search.trim() });
      }

      let query = supabase
        .from("agent_learnings")
        .select("id,learning,category,kind,visibility,source,tags,confidence,created_at,metadata", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (kind) query = query.eq("kind", kind);
      if (visibility) query = query.eq("visibility", visibility);

      const { data, error, count } = await query;
      if (error) return json(500, { error: "db_error", detail: error.message });
      return json(200, { data: data || [], count: count ?? (data || []).length, offset, limit });
    }

    // ---- GET /learnings/get?id=<uuid> ----
    if (req.method === "GET" && pathname.endsWith("/learnings/get")) {
      const qid = (url.searchParams.get("id") || "").trim();
      if (!qid) return json(400, { error: "missing id parameter" });

      const { data, error } = await supabase.from("agent_learnings").select("*").eq("id", qid).maybeSingle();
      if (error) return json(500, { error: "db_error", detail: error.message });
      if (!data) return json(404, { error: "not_found" });
      return json(200, { data });
    }

    // ---- POST /learnings/bulk ----
    if (req.method === "POST" && pathname.endsWith("/learnings/bulk")) {
      const body = await req.json().catch(() => null);
      if (!body || !Array.isArray(body.items)) {
        return json(400, { error: "body must contain an 'items' array" });
      }
      if (body.items.length > 50) {
        return json(400, { error: "max 50 items per bulk insert" });
      }
      if (body.items.length === 0) {
        return json(400, { error: "items array is empty" });
      }

      const results: { index: number; id?: string; error?: string }[] = [];
      const validRows: Record<string, unknown>[] = [];
      const indexMap: number[] = [];

      for (let i = 0; i < body.items.length; i++) {
        const item = body.items[i];
        if (!item || typeof item !== "object") {
          results.push({ index: i, error: "invalid item" });
          continue;
        }
        const learning = String(item.learning ?? "").trim();
        if (!learning) {
          results.push({ index: i, error: "missing learning field" });
          continue;
        }
        if (learning.length > 8000) {
          results.push({ index: i, error: "learning too long (max 8000 chars)" });
          continue;
        }

        const rawKind = String(item.kind || "general").trim();
        const rawVisibility = String(item.visibility || "private").trim();
        const rawStatus = String(item.status || "draft").trim();

        const row: Record<string, unknown> = {
          learning,
          category: String(item.category || item.topic || "general").trim().slice(0, 200),
          source: String(item.source || "agent").trim().slice(0, 100),
          kind: VALID_KINDS.includes(rawKind) ? rawKind : "general",
          visibility: VALID_VISIBILITY.includes(rawVisibility) ? rawVisibility : "private",
          status: VALID_STATUS.includes(rawStatus) ? rawStatus : "draft",
          tags: Array.isArray(item.tags) ? item.tags.map((t: unknown) => String(t)) : null,
          confidence: typeof item.confidence === "number" ? Math.max(0, Math.min(1, item.confidence)) : 0.5,
          metadata: (item.metadata && typeof item.metadata === "object") ? item.metadata : {},
        };

        if (item.title) row.title = String(item.title).trim().slice(0, 500);
        if (item.summary) row.summary = String(item.summary).trim().slice(0, 2000);
        if (item.domain) row.domain = String(item.domain).trim();
        if (item.owner_id) row.owner_id = String(item.owner_id).trim();
        if (item.subject_type && VALID_SUBJECT_TYPES.includes(String(item.subject_type).trim())) {
          row.subject_type = String(item.subject_type).trim();
        }
        if (item.subject_name) row.subject_name = String(item.subject_name).trim();
        if (item.subject_id) row.subject_id = String(item.subject_id).trim();
        if (item.details_markdown) row.details_markdown = String(item.details_markdown);
        if (Array.isArray(item.source_refs)) row.source_refs = item.source_refs.map((r: unknown) => String(r));

        validRows.push(row);
        indexMap.push(i);
      }

      if (validRows.length > 0) {
        const { data, error } = await supabase
          .from("agent_learnings")
          .insert(validRows)
          .select("id");

        if (error) {
          console.error("[agent-vault] bulk insert error:", error.message);
          // Mark all valid rows as failed
          for (const idx of indexMap) {
            results.push({ index: idx, error: error.message });
          }
        } else {
          for (let j = 0; j < (data || []).length; j++) {
            results.push({ index: indexMap[j], id: data[j].id });
          }
        }
      }

      // Sort by index
      results.sort((a, b) => a.index - b.index);
      const inserted = results.filter(r => r.id).length;
      const failed = results.filter(r => r.error).length;

      console.log(`[agent-vault] Bulk insert: ${inserted} inserted, ${failed} failed`);
      return json(200, { inserted, failed, results });
    }

    // ---- POST /learnings (insert single) ----
    if (req.method === "POST" && pathname.endsWith("/learnings") && !pathname.endsWith("/learnings/bulk")) {
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") return json(400, { error: "invalid JSON body" });

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
        tags: Array.isArray(body.tags) ? body.tags.map((t: unknown) => String(t)) : (body.repo ? [String(body.repo)] : null),
        confidence: typeof body.confidence === "number" ? Math.max(0, Math.min(1, body.confidence)) : 0.5,
        metadata: (body.meta && typeof body.meta === "object") ? body.meta : (body.metadata && typeof body.metadata === "object") ? body.metadata : {},
      };

      if (body.owner_id && typeof body.owner_id === "string") payload.owner_id = body.owner_id.trim();
      if (rawSubjectType && VALID_SUBJECT_TYPES.includes(rawSubjectType)) payload.subject_type = rawSubjectType;
      if (body.subject_id && typeof body.subject_id === "string") payload.subject_id = body.subject_id.trim();
      if (body.subject_name && typeof body.subject_name === "string") payload.subject_name = body.subject_name.trim();
      if (body.title && typeof body.title === "string") payload.title = body.title.trim().slice(0, 500);
      if (body.summary && typeof body.summary === "string") payload.summary = body.summary.trim().slice(0, 2000);
      if (body.domain && typeof body.domain === "string") payload.domain = body.domain.trim();
      if (body.source_date && typeof body.source_date === "string") payload.source_date = body.source_date.trim();
      const rawStatus = String(body.status || "draft").trim();
      payload.status = VALID_STATUS.includes(rawStatus) ? rawStatus : "draft";
      if (Array.isArray(body.source_refs)) payload.source_refs = body.source_refs.map((r: unknown) => String(r));
      if (body.details_markdown && typeof body.details_markdown === "string") payload.details_markdown = body.details_markdown;

      if (!payload.learning) return json(400, { error: "missing learning field" });
      if ((payload.learning as string).length > 8000) return json(400, { error: "learning too long (max 8000 chars)" });
      if ((payload.category as string).length > 200) return json(400, { error: "category/topic too long" });
      if ((payload.source as string).length > 100) return json(400, { error: "source too long" });

      const { data, error } = await supabase
        .from("agent_learnings")
        .insert(payload)
        .select("id,learning,category,kind,visibility,source,tags,created_at,owner_id,subject_type,subject_id,subject_name,title,summary,redaction_level,domain,source_date,status,source_refs,details_markdown")
        .single();

      if (error) return json(500, { error: "db_error", detail: error.message });
      console.log(`[agent-vault] Inserted learning id=${data.id} kind=${payload.kind} source=${payload.source}`);
      return json(200, { data });
    }

    // ---- PATCH /learnings/:id ----
    const learningPatchMatch = pathname.match(/\/learnings\/([a-f0-9-]{36})$/);
    if (req.method === "PATCH" && learningPatchMatch) {
      const id = learningPatchMatch[1];
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") return json(400, { error: "invalid JSON body" });

      // Build update payload, rejecting immutable fields
      const update: Record<string, unknown> = {};
      const rejected: string[] = [];

      for (const [key, value] of Object.entries(body)) {
        if (IMMUTABLE_LEARNING_FIELDS.has(key)) {
          rejected.push(key);
          continue;
        }
        // Validate specific fields
        if (key === "kind") {
          const v = String(value).trim();
          if (VALID_KINDS.includes(v)) update.kind = v;
          continue;
        }
        if (key === "visibility") {
          const v = String(value).trim();
          if (VALID_VISIBILITY.includes(v)) update.visibility = v;
          continue;
        }
        if (key === "status") {
          const v = String(value).trim();
          if (VALID_STATUS.includes(v)) update.status = v;
          continue;
        }
        if (key === "redaction_level") {
          const v = String(value).trim();
          if (VALID_REDACTION.includes(v)) update.redaction_level = v;
          continue;
        }
        if (key === "subject_type") {
          const v = String(value).trim();
          if (VALID_SUBJECT_TYPES.includes(v)) update.subject_type = v;
          else if (value === null) update.subject_type = null;
          continue;
        }
        if (key === "confidence") {
          if (typeof value === "number") update.confidence = Math.max(0, Math.min(1, value));
          continue;
        }
        if (key === "tags") {
          if (Array.isArray(value)) update.tags = value.map((t: unknown) => String(t));
          else if (value === null) update.tags = null;
          continue;
        }
        if (key === "metadata") {
          if (value && typeof value === "object") update.metadata = value;
          continue;
        }
        if (key === "source_refs") {
          if (Array.isArray(value)) update.source_refs = value.map((r: unknown) => String(r));
          else if (value === null) update.source_refs = null;
          continue;
        }
        // String fields
        if (["title", "summary", "learning", "category", "domain", "details_markdown", "subject_name", "subject_id", "source_date", "owner_id"].includes(key)) {
          update[key] = value === null ? null : String(value).trim();
          continue;
        }
      }

      if (Object.keys(update).length === 0) {
        return json(400, { error: "no valid fields to update", rejected_immutable: rejected });
      }

      const { data, error } = await supabase
        .from("agent_learnings")
        .update(update)
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) return json(500, { error: "db_error", detail: error.message });
      if (!data) return json(404, { error: "not_found", id });

      console.log(`[agent-vault] Updated learning id=${id} fields=${Object.keys(update).join(",")}`);
      return json(200, { data, rejected_immutable: rejected.length > 0 ? rejected : undefined });
    }

    // ---- DELETE /learnings/:id ----
    const learningDeleteMatch = pathname.match(/\/learnings\/([a-f0-9-]{36})$/);
    if (req.method === "DELETE" && learningDeleteMatch) {
      const id = learningDeleteMatch[1];
      const soft = url.searchParams.get("soft") === "true";

      if (soft) {
        const { data, error } = await supabase
          .from("agent_learnings")
          .update({ status: "rejected" })
          .eq("id", id)
          .select("id,status")
          .maybeSingle();

        if (error) return json(500, { error: "db_error", detail: error.message });
        if (!data) return json(404, { error: "not_found", id });

        console.log(`[agent-vault] Soft-deleted learning id=${id}`);
        return json(200, { data, soft_delete: true });
      }

      // Hard delete - fetch first for confirmation
      const { data: existing } = await supabase.from("agent_learnings").select("id,title,learning").eq("id", id).maybeSingle();
      if (!existing) return json(404, { error: "not_found", id });

      const { error } = await supabase.from("agent_learnings").delete().eq("id", id);
      if (error) return json(500, { error: "db_error", detail: error.message });

      console.log(`[agent-vault] Hard-deleted learning id=${id}`);
      return json(200, { deleted: existing });
    }

    // ---- GET /learnings/:id ----
    const learningIdMatch = pathname.match(/\/learnings\/([a-f0-9-]{36})$/);
    if (req.method === "GET" && learningIdMatch) {
      const id = learningIdMatch[1];
      const { data, error } = await supabase.from("agent_learnings").select("*").eq("id", id).single();

      if (error) {
        if (error.code === "PGRST116") return json(404, { error: "not_found", id });
        return json(500, { error: "db_error", detail: error.message });
      }
      return json(200, { data });
    }

    // ============================================================
    // JOBS API
    // ============================================================

    // ---- GET /jobs/list ----
    if (req.method === "GET" && pathname.endsWith("/jobs/list")) {
      const limit = clampInt(url.searchParams.get("limit"), 20, 1, 100);
      const status = (url.searchParams.get("status") || "").trim();
      const since = (url.searchParams.get("since") || "").trim();
      const type = (url.searchParams.get("type") || "").trim();

      let query = supabase
        .from("jobs")
        .select("id,type,status,payload,created_at,updated_at,locked_by,locked_at,last_error,attempts")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (status) query = query.eq("status", status);
      if (since) query = query.gte("created_at", since);
      if (type) query = query.eq("type", type);

      const { data, error } = await query;
      if (error) return json(500, { error: "db_error", detail: error.message });
      return json(200, { data: data || [], count: (data || []).length });
    }

    // ---- POST /jobs/next ----
    if (req.method === "POST" && pathname.endsWith("/jobs/next")) {
      const body = await req.json().catch(() => ({}));
      const workerId = String(body.worker_id || "unknown-worker").trim();
      if (workerId.length > 100) return json(400, { error: "worker_id too long" });

      const { data, error } = await supabase.rpc("claim_next_job", { p_worker_id: workerId });
      if (error) return json(500, { error: "db_error", detail: error.message });

      if (!data || data.length === 0) {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      console.log(`[agent-vault] Job claimed: ${data[0].id} by ${workerId}`);
      return json(200, { job: data[0] });
    }

    // ---- POST /jobs/ack ----
    if (req.method === "POST" && pathname.endsWith("/jobs/ack")) {
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") return json(400, { error: "invalid JSON body" });

      const jobId = body.job_id;
      const status = body.status;
      const lastError = body.last_error || null;

      if (!jobId || typeof jobId !== "string") return json(400, { error: "missing or invalid job_id" });
      if (!status || !["done", "failed"].includes(status)) return json(400, { error: "status must be 'done' or 'failed'" });

      const { error } = await supabase.rpc("complete_job", { p_job_id: jobId, p_status: status, p_last_error: lastError });
      if (error) return json(500, { error: "db_error", detail: error.message });

      console.log(`[agent-vault] Job ${jobId} marked as ${status}`);
      return json(200, { ok: true, job_id: jobId, status });
    }

    // ============================================================
    // CONTACTS API
    // ============================================================

    // ---- GET /contacts/list ----
    if (req.method === "GET" && pathname.endsWith("/contacts/list")) {
      const limit = clampInt(url.searchParams.get("limit"), 50, 1, 200);
      const role = (url.searchParams.get("role") || "").trim();
      const company = (url.searchParams.get("company") || "").trim();

      let query = supabase
        .from("agent_contacts")
        .select("*")
        .order("name", { ascending: true })
        .limit(limit);

      if (role) query = query.eq("role", role);
      if (company) query = query.ilike("company", `%${company}%`);

      const { data, error } = await query;
      if (error) return json(500, { error: "db_error", detail: error.message });
      return json(200, { data: data || [], count: (data || []).length });
    }

    // ---- GET /contacts/search?q=<query> ----
    if (req.method === "GET" && pathname.endsWith("/contacts/search")) {
      const q = (url.searchParams.get("q") || "").trim();
      const limit = clampInt(url.searchParams.get("limit"), 20, 1, 50);
      if (!q) return json(400, { error: "missing q parameter" });
      if (q.length > 200) return json(400, { error: "q too long" });

      const { data, error } = await supabase
        .from("agent_contacts")
        .select("*")
        .or(`name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%,notes.ilike.%${q}%`)
        .order("name", { ascending: true })
        .limit(limit);

      if (error) return json(500, { error: "db_error", detail: error.message });
      return json(200, { data: data || [], count: (data || []).length });
    }

    // ---- POST /contacts (upsert by email) ----
    if (req.method === "POST" && pathname.endsWith("/contacts") && !pathname.includes("/contacts/")) {
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") return json(400, { error: "invalid JSON body" });

      const name = String(body.name ?? "").trim();
      if (!name) return json(400, { error: "missing name field" });
      if (name.length > 500) return json(400, { error: "name too long (max 500 chars)" });

      const payload: Record<string, unknown> = { name };
      if (body.email) payload.email = String(body.email).trim();
      if (body.phone) payload.phone = String(body.phone).trim();
      if (body.company) payload.company = String(body.company).trim();
      if (body.role) payload.role = String(body.role).trim();
      if (body.notes) payload.notes = String(body.notes).trim();
      if (Array.isArray(body.tags)) payload.tags = body.tags.map((t: unknown) => String(t));
      if (body.metadata && typeof body.metadata === "object") payload.metadata = body.metadata;
      if (body.owner_id) payload.owner_id = String(body.owner_id).trim();

      // Upsert by email if email provided
      if (payload.email) {
        const { data, error } = await supabase
          .from("agent_contacts")
          .upsert(payload, { onConflict: "email", ignoreDuplicates: false })
          .select("*")
          .single();

        // If upsert fails due to no unique constraint on email, fall back to insert
        if (error && error.message.includes("unique")) {
          const { data: inserted, error: insertErr } = await supabase.from("agent_contacts").insert(payload).select("*").single();
          if (insertErr) return json(500, { error: "db_error", detail: insertErr.message });
          return json(200, { data: inserted });
        }
        if (error) return json(500, { error: "db_error", detail: error.message });
        return json(200, { data });
      }

      const { data, error } = await supabase.from("agent_contacts").insert(payload).select("*").single();
      if (error) return json(500, { error: "db_error", detail: error.message });
      console.log(`[agent-vault] Created contact id=${data.id} name=${name}`);
      return json(200, { data });
    }

    // ---- PATCH /contacts/:id ----
    const contactPatchMatch = pathname.match(/\/contacts\/([a-f0-9-]{36})$/);
    if (req.method === "PATCH" && contactPatchMatch) {
      const id = contactPatchMatch[1];
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") return json(400, { error: "invalid JSON body" });

      const update: Record<string, unknown> = {};
      for (const key of ["name", "email", "phone", "company", "role", "notes", "owner_id"]) {
        if (key in body) update[key] = body[key] === null ? null : String(body[key]).trim();
      }
      if ("tags" in body) update.tags = Array.isArray(body.tags) ? body.tags.map((t: unknown) => String(t)) : null;
      if ("metadata" in body && body.metadata && typeof body.metadata === "object") update.metadata = body.metadata;

      if (Object.keys(update).length === 0) return json(400, { error: "no valid fields to update" });

      const { data, error } = await supabase.from("agent_contacts").update(update).eq("id", id).select("*").maybeSingle();
      if (error) return json(500, { error: "db_error", detail: error.message });
      if (!data) return json(404, { error: "not_found", id });
      return json(200, { data });
    }

    // ---- DELETE /contacts/:id ----
    const contactDeleteMatch = pathname.match(/\/contacts\/([a-f0-9-]{36})$/);
    if (req.method === "DELETE" && contactDeleteMatch) {
      const id = contactDeleteMatch[1];
      const { data: existing } = await supabase.from("agent_contacts").select("id,name").eq("id", id).maybeSingle();
      if (!existing) return json(404, { error: "not_found", id });

      const { error } = await supabase.from("agent_contacts").delete().eq("id", id);
      if (error) return json(500, { error: "db_error", detail: error.message });
      console.log(`[agent-vault] Deleted contact id=${id}`);
      return json(200, { deleted: existing });
    }

    // ============================================================
    // TASKS API
    // ============================================================

    // ---- GET /tasks/list ----
    if (req.method === "GET" && pathname.endsWith("/tasks/list")) {
      const limit = clampInt(url.searchParams.get("limit"), 50, 1, 200);
      const status = (url.searchParams.get("status") || "").trim();
      const domain = (url.searchParams.get("domain") || "").trim();
      const priority = (url.searchParams.get("priority") || "").trim();

      let query = supabase
        .from("agent_tasks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (status) query = query.eq("status", status);
      if (domain) query = query.eq("domain", domain);
      if (priority) query = query.eq("priority", priority);

      const { data, error } = await query;
      if (error) return json(500, { error: "db_error", detail: error.message });
      return json(200, { data: data || [], count: (data || []).length });
    }

    // ---- POST /tasks ----
    if (req.method === "POST" && pathname.endsWith("/tasks") && !pathname.includes("/tasks/")) {
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") return json(400, { error: "invalid JSON body" });

      const title = String(body.title ?? "").trim();
      if (!title) return json(400, { error: "missing title field" });
      if (title.length > 500) return json(400, { error: "title too long (max 500 chars)" });

      const rawStatus = String(body.status || "todo").trim();
      const rawPriority = String(body.priority || "medium").trim();

      const payload: Record<string, unknown> = {
        title,
        status: VALID_TASK_STATUS.includes(rawStatus) ? rawStatus : "todo",
        priority: VALID_TASK_PRIORITY.includes(rawPriority) ? rawPriority : "medium",
      };

      if (body.description) payload.description = String(body.description).trim();
      if (body.due_date) payload.due_date = String(body.due_date).trim();
      if (body.domain) payload.domain = String(body.domain).trim();
      if (body.source) payload.source = String(body.source).trim();
      if (body.owner_id) payload.owner_id = String(body.owner_id).trim();
      if (body.related_learning_id) payload.related_learning_id = String(body.related_learning_id).trim();
      if (Array.isArray(body.tags)) payload.tags = body.tags.map((t: unknown) => String(t));
      if (body.metadata && typeof body.metadata === "object") payload.metadata = body.metadata;

      const { data, error } = await supabase.from("agent_tasks").insert(payload).select("*").single();
      if (error) return json(500, { error: "db_error", detail: error.message });
      console.log(`[agent-vault] Created task id=${data.id} title=${title}`);
      return json(200, { data });
    }

    // ---- PATCH /tasks/:id ----
    const taskPatchMatch = pathname.match(/\/tasks\/([a-f0-9-]{36})$/);
    if (req.method === "PATCH" && taskPatchMatch) {
      const id = taskPatchMatch[1];
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") return json(400, { error: "invalid JSON body" });

      const update: Record<string, unknown> = {};
      for (const key of ["title", "description", "domain", "source", "owner_id", "related_learning_id"]) {
        if (key in body) update[key] = body[key] === null ? null : String(body[key]).trim();
      }
      if ("status" in body) {
        const v = String(body.status).trim();
        if (VALID_TASK_STATUS.includes(v)) {
          update.status = v;
          if (v === "done") update.completed_at = new Date().toISOString();
          if (v === "todo" || v === "in_progress") update.completed_at = null;
        }
      }
      if ("priority" in body) {
        const v = String(body.priority).trim();
        if (VALID_TASK_PRIORITY.includes(v)) update.priority = v;
      }
      if ("due_date" in body) update.due_date = body.due_date === null ? null : String(body.due_date).trim();
      if ("tags" in body) update.tags = Array.isArray(body.tags) ? body.tags.map((t: unknown) => String(t)) : null;
      if ("metadata" in body && body.metadata && typeof body.metadata === "object") update.metadata = body.metadata;

      if (Object.keys(update).length === 0) return json(400, { error: "no valid fields to update" });

      const { data, error } = await supabase.from("agent_tasks").update(update).eq("id", id).select("*").maybeSingle();
      if (error) return json(500, { error: "db_error", detail: error.message });
      if (!data) return json(404, { error: "not_found", id });
      return json(200, { data });
    }

    // ---- DELETE /tasks/:id ----
    const taskDeleteMatch = pathname.match(/\/tasks\/([a-f0-9-]{36})$/);
    if (req.method === "DELETE" && taskDeleteMatch) {
      const id = taskDeleteMatch[1];
      const { data: existing } = await supabase.from("agent_tasks").select("id,title").eq("id", id).maybeSingle();
      if (!existing) return json(404, { error: "not_found", id });

      const { error } = await supabase.from("agent_tasks").delete().eq("id", id);
      if (error) return json(500, { error: "db_error", detail: error.message });
      console.log(`[agent-vault] Deleted task id=${id}`);
      return json(200, { deleted: existing });
    }

    // ============================================================
    // COMPOSIO PROXY
    // ============================================================

    const COMPOSIO_BASE_URL = "https://backend.composio.dev/api/v3";

    async function composioFetch(path: string, options: RequestInit = {}): Promise<Response> {
      const composioKey = Deno.env.get("COMPOSIO_API_KEY");
      if (!composioKey) {
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
        const response = await fetch(`${COMPOSIO_BASE_URL}${path}`, { ...options, headers });
        const rawText = await response.text();
        console.log(`[agent-vault] Composio response status: ${response.status}`);

        if (!response.ok) console.error(`[agent-vault] Composio error: ${rawText.slice(0, 1000)}`);

        let data: unknown;
        try { data = JSON.parse(rawText); } catch {
          return new Response(JSON.stringify({ error: "composio_error", detail: response.ok ? "Invalid response format" : rawText.slice(0, 500), status: response.status }), {
            status: response.ok ? 500 : response.status,
            headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
          });
        }

        return new Response(JSON.stringify(data), { status: response.status, headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" } });
      } catch (fetchError) {
        console.error(`[agent-vault] Composio fetch failed:`, fetchError);
        return new Response(JSON.stringify({ error: "composio_fetch_error", detail: String(fetchError) }), {
          status: 500, headers: { ...corsHeaders, "content-type": "application/json; charset=utf-8" },
        });
      }
    }

    if (req.method === "GET" && pathname.endsWith("/composio/toolkits")) {
      const params = new URLSearchParams();
      const search = url.searchParams.get("search");
      const limit = url.searchParams.get("limit");
      if (search) params.set("search", search);
      if (limit) params.set("limit", limit);
      const queryString = params.toString();
      return composioFetch(`/toolkits${queryString ? `?${queryString}` : ""}`);
    }

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

    if (req.method === "POST" && pathname.endsWith("/composio/tools/execute")) {
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object") return json(400, { error: "invalid JSON body" });
      if (!body.toolSlug || typeof body.toolSlug !== "string") return json(400, { error: "missing or invalid toolSlug" });

      const toolSlug = body.toolSlug;
      const executeBody: Record<string, unknown> = {
        connected_account_id: body.connected_account_id || body.connectedAccountId,
        user_id: body.user_id || body.entityId || body.userId,
        arguments: body.arguments,
        version: body.version,
        text: body.text,
        custom_auth_params: body.custom_auth_params || body.customAuthParams,
        allow_tracing: body.allow_tracing || body.allowTracing,
      };

      Object.keys(executeBody).forEach(key => { if (executeBody[key] === undefined) delete executeBody[key]; });

      console.log(`[agent-vault] Composio execute: ${toolSlug}`);
      return composioFetch(`/tools/execute/${encodeURIComponent(toolSlug)}`, {
        method: "POST",
        body: JSON.stringify(executeBody),
      });
    }

    const composioToolMatch = pathname.match(/\/composio\/tools\/([A-Za-z0-9_-]+)$/);
    if (req.method === "GET" && composioToolMatch) {
      const slug = composioToolMatch[1];
      if (!slug || slug.length > 100) return json(400, { error: "invalid tool slug" });
      return composioFetch(`/tools/${encodeURIComponent(slug)}`);
    }

    // ---- 404 fallback ----
    return json(404, { error: "not_found", path: pathname });

  } catch (e) {
    console.error("[agent-vault] Unexpected error:", e);
    return json(500, { error: "server_error", detail: String(e?.message || e) });
  }
});
