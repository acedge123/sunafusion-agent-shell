import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(msg: string, status = 400) {
  return json({ error: msg }, status);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Authenticate via AGENT_EDGE_KEY bearer token OR valid Supabase JWT */
function normalizeSecret(value: string | null): string {
  let v = (value ?? "").trim();
  v = v.replace(/^Bearer\s+/i, "").trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

async function authenticate(req: Request): Promise<{ ok: boolean; userId?: string }> {
  const auth = req.headers.get("authorization") ?? "";
  const token = normalizeSecret(auth);
  const apikey = normalizeSecret(req.headers.get("apikey"));

  // Only the dedicated agent bearer token is accepted as a static credential.
  // Anon and service-role keys must NOT grant access (anon is public; service-role
  // is reserved for server-side use and would bypass the wiki ownership boundary).
  const expected = normalizeSecret(Deno.env.get("AGENT_EDGE_KEY"));
  if (expected) {
    if (token && token === expected) return { ok: true };
    if (apikey && apikey === expected) return { ok: true };
  }

  // Try Supabase JWT via getClaims (supported under signing-keys system)
  if (token) {
    try {
      const sb = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!
      );
      const { data, error } = await sb.auth.getClaims(token);
      if (!error && data?.claims?.sub) return { ok: true, userId: data.claims.sub as string };
    } catch (e) {
      console.error("getClaims failed:", e);
    }
  }

  console.warn("wiki-engine auth rejected", {
    hasBearer: Boolean(token),
    bearerLength: token.length,
    hasApiKey: Boolean(apikey),
    apiKeyLength: apikey.length,
    hasAgentKey: Boolean(expected),
    agentKeyLength: expected.length,
  });
  return { ok: false };
}

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );
}

// ─── Route parser ───────────────────────────────────────────
function parseRoute(url: URL): { segments: string[]; method: string } {
  const base = "/wiki-engine";
  let path = url.pathname;
  if (path.startsWith(base)) path = path.slice(base.length);
  if (path.startsWith("/")) path = path.slice(1);
  const segments = path.split("/").filter(Boolean);
  return { segments, method: "" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const { segments } = parseRoute(url);
  const method = req.method;

  // Health check doesn't require auth
  if (method === "GET" && segments[0] === "health") {
    return json({ status: "ok", system: "wiki-engine", ts: new Date().toISOString() });
  }

  const authResult = await authenticate(req);
  if (!authResult.ok) {
    return err("Unauthorized", 401);
  }

  const sb = getServiceClient();

  try {
    // ─── SOURCES ─────────────────────────────────────────────
    if (segments[0] === "sources") {
      if (method === "POST" && segments.length === 2 && segments[1] === "batch") return handleBatchCreateSources(req, sb);
      if (method === "POST" && segments.length === 1) return handleCreateSource(req, sb);
      if (method === "POST" && segments.length === 1) return handleCreateSource(req, sb);
      if (method === "GET" && segments.length === 1) return handleListSources(url, sb);
    }

    // ─── COMPILE ─────────────────────────────────────────────
    if (segments[0] === "compile") {
      if (method === "POST" && segments[1] === "source") return handleCompileSource(req, sb);
      if (method === "POST" && segments[1] === "topic") return handleCompileTopic(req, sb);
    }

    // ─── REINDEX ─────────────────────────────────────────────
    if (method === "POST" && segments[0] === "reindex") return handleReindex(req, sb);

    // ─── LINT ────────────────────────────────────────────────
    if (method === "POST" && segments[0] === "lint") return handleLint(req, sb);

    // ─── ANSWER ──────────────────────────────────────────────
    if (method === "POST" && segments[0] === "answer") return handleAnswer(req, sb);

    // ─── PAGES ───────────────────────────────────────────────
    if (segments[0] === "pages") {
      if (method === "GET" && segments.length === 1) return handleListPages(url, sb);
      if (method === "GET" && segments.length === 2) return handleGetPage(segments[1], sb);
      if (method === "GET" && segments.length === 3 && segments[2] === "sources")
        return handleGetPageSources(segments[1], sb);
    }

    // ─── ARTIFACTS ───────────────────────────────────────────
    if (method === "GET" && segments[0] === "artifacts") return handleListArtifacts(url, sb);

    return err("Not found", 404);
  } catch (e) {
    console.error("wiki-engine error:", e);
    return err(e instanceof Error ? e.message : "Internal error", 500);
  }
});

// ═══════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleCreateSource(req: Request, sb: ReturnType<typeof createClient>) {
  const body = await req.json();
  const { owner_id, source_type, title, source_url, external_id, raw_text, raw_markdown, raw_json, source_date, tags, metadata } = body;
  if (!owner_id || !source_type) return err("owner_id and source_type required");

  const validTypes = ["url", "tweet", "note", "article", "paper", "chat", "manual"];
  if (!validTypes.includes(source_type)) return err(`Invalid source_type. Must be one of: ${validTypes.join(", ")}`);

  const { data: source, error: srcErr } = await sb.from("wiki_sources").insert({
    owner_id, source_type, title: title ?? null, source_url: source_url ?? null,
    external_id: external_id ?? null, raw_text: raw_text ?? null,
    raw_markdown: raw_markdown ?? null, raw_json: raw_json ?? {},
    source_date: source_date ?? null, tags: tags ?? [], metadata: metadata ?? {},
  }).select().single();
  if (srcErr) return err(srcErr.message, 500);

  // Create ingest run
  const { data: run } = await sb.from("wiki_runs").insert({
    owner_id, run_type: "ingest", status: "done",
    input: { source_id: source.id },
    output: { source_type, title: title ?? source_type },
  }).select().single();

  return json({ source, run }, 201);
}

async function handleBatchCreateSources(req: Request, sb: ReturnType<typeof createClient>) {
  const body = await req.json();
  const sources = Array.isArray(body) ? body : body.sources;
  if (!Array.isArray(sources) || sources.length === 0) return err("Expected array of sources");
  if (sources.length > 200) return err("Max 200 sources per batch");

  const validTypes = ["url", "tweet", "note", "article", "paper", "chat", "manual"];
  const rows = sources.map((s: any) => ({
    owner_id: s.owner_id,
    source_type: s.source_type,
    title: s.title ?? null,
    source_url: s.source_url ?? null,
    external_id: s.external_id ?? null,
    raw_text: s.raw_text ?? null,
    raw_markdown: s.raw_markdown ?? null,
    raw_json: s.raw_json ?? {},
    source_date: s.source_date ?? null,
    tags: s.tags ?? [],
    metadata: s.metadata ?? {},
  }));

  // Validate
  for (const r of rows) {
    if (!r.owner_id || !r.source_type) return err("Each source needs owner_id and source_type");
    if (!validTypes.includes(r.source_type)) return err(`Invalid source_type: ${r.source_type}`);
  }

  const { data, error: insertErr } = await sb.from("wiki_sources").upsert(rows, { onConflict: "id", ignoreDuplicates: true }).select("id");
  if (insertErr) return err(insertErr.message, 500);

  // Create a single ingest run for the batch
  const owner_id = rows[0].owner_id;
  await sb.from("wiki_runs").insert({
    owner_id, run_type: "ingest", status: "done",
    input: { batch: true, count: rows.length },
    output: { inserted: data?.length ?? 0 },
  });

  return json({ inserted: data?.length ?? 0, total: rows.length }, 201);
}

async function handleListSources(url: URL, sb: ReturnType<typeof createClient>) {
  const status = url.searchParams.get("status");
  const source_type = url.searchParams.get("source_type");
  const tag = url.searchParams.get("tag");
  const owner_id = url.searchParams.get("owner_id");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 200);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");

  let q = sb.from("wiki_sources").select("*").order("ingested_at", { ascending: false }).range(offset, offset + limit - 1);
  if (owner_id) q = q.eq("owner_id", owner_id);
  if (status) q = q.eq("status", status);
  if (source_type) q = q.eq("source_type", source_type);
  if (tag) q = q.contains("tags", [tag]);

  const { data, error: qErr } = await q;
  if (qErr) return err(qErr.message, 500);
  return json({ sources: data, count: data?.length ?? 0 });
}

async function handleCompileSource(req: Request, sb: ReturnType<typeof createClient>) {
  const { owner_id, source_id } = await req.json();
  if (!owner_id || !source_id) return err("owner_id and source_id required");

  const { data: source, error: srcErr } = await sb.from("wiki_sources").select("*").eq("id", source_id).single();
  if (srcErr || !source) return err("Source not found", 404);

  const slug = `source-note-${source_id.slice(0, 8)}`;
  const title = source.title || `Source: ${source.source_type}`;
  const bodyParts: string[] = [];
  bodyParts.push(`# ${title}\n`);
  bodyParts.push(`**Type:** ${source.source_type}`);
  if (source.source_url) bodyParts.push(`**URL:** ${source.source_url}`);
  if (source.source_date) bodyParts.push(`**Date:** ${source.source_date}`);
  bodyParts.push("");
  if (source.raw_markdown) bodyParts.push(source.raw_markdown);
  else if (source.raw_text) bodyParts.push(source.raw_text);
  else if (source.raw_json && Object.keys(source.raw_json).length > 0) bodyParts.push("```json\n" + JSON.stringify(source.raw_json, null, 2) + "\n```");
  const body_markdown = bodyParts.join("\n");

  // Upsert page
  const { data: page, error: pgErr } = await sb.from("wiki_pages")
    .upsert({ owner_id, slug, page_type: "source_note", title, summary: title, body_markdown, source_count: 1, metadata: {} }, { onConflict: "owner_id,slug" })
    .select().single();
  if (pgErr) return err(pgErr.message, 500);

  // Link source to page
  await sb.from("wiki_page_sources").upsert(
    { owner_id, page_id: page.id, source_id: source.id, role: "primary_source" },
    { onConflict: "page_id,source_id" } // close enough with index
  );

  // Mark source as compiled
  await sb.from("wiki_sources").update({ status: "compiled" }).eq("id", source_id);

  // Record run
  const { data: run } = await sb.from("wiki_runs").insert({
    owner_id, run_type: "compile_source", status: "done",
    input: { source_id }, output: { page_id: page.id, slug },
  }).select().single();

  await sb.from("wiki_pages").update({ updated_from_run_id: run?.id }).eq("id", page.id);

  return json({ page, run });
}

async function handleCompileTopic(req: Request, sb: ReturnType<typeof createClient>) {
  const { owner_id, topic, source_ids, instructions } = await req.json();
  if (!owner_id || !topic) return err("owner_id and topic required");

  const slug = `topic-${slugify(topic)}`;

  // Gather sources
  let sources: any[] = [];
  if (source_ids?.length) {
    const { data } = await sb.from("wiki_sources").select("*").in("id", source_ids);
    sources = data ?? [];
  } else {
    // Search sources by topic keyword
    const { data } = await sb.from("wiki_sources").select("*").eq("owner_id", owner_id)
      .or(`title.ilike.%${topic}%,raw_text.ilike.%${topic}%`).limit(20);
    sources = data ?? [];
  }

  // Build page content (deterministic assembly — TODO: LLM synthesis)
  const bodyParts: string[] = [`# ${topic}\n`];
  if (instructions) bodyParts.push(`> ${instructions}\n`);
  bodyParts.push(`*Compiled from ${sources.length} source(s)*\n`);
  for (const s of sources) {
    bodyParts.push(`## ${s.title || s.source_type}`);
    if (s.source_url) bodyParts.push(`[Source](${s.source_url})`);
    const content = s.raw_markdown || s.raw_text || "";
    if (content) bodyParts.push(content.slice(0, 2000));
    bodyParts.push("");
  }
  const body_markdown = bodyParts.join("\n");

  const { data: page, error: pgErr } = await sb.from("wiki_pages")
    .upsert({ owner_id, slug, page_type: "topic", title: topic, summary: `Topic page: ${topic}`, body_markdown, source_count: sources.length, metadata: {} }, { onConflict: "owner_id,slug" })
    .select().single();
  if (pgErr) return err(pgErr.message, 500);

  // Link sources
  for (const s of sources) {
    await sb.from("wiki_page_sources").upsert(
      { owner_id, page_id: page.id, source_id: s.id, role: "supporting_source" },
      { onConflict: "page_id,source_id" }
    );
  }

  const { data: run } = await sb.from("wiki_runs").insert({
    owner_id, run_type: "compile_topic", status: "done",
    input: { topic, source_count: sources.length },
    output: { page_id: page.id, slug },
  }).select().single();

  await sb.from("wiki_pages").update({ updated_from_run_id: run?.id }).eq("id", page.id);

  return json({ page, run });
}

async function handleReindex(req: Request, sb: ReturnType<typeof createClient>) {
  const { owner_id } = await req.json();
  if (!owner_id) return err("owner_id required");

  // Fetch all pages
  const { data: pages } = await sb.from("wiki_pages").select("id, slug, page_type, title, summary, source_count, updated_at")
    .eq("owner_id", owner_id).neq("page_type", "index").neq("page_type", "overview").order("updated_at", { ascending: false });
  const allPages = pages ?? [];

  // Build INDEX page
  const grouped: Record<string, typeof allPages> = {};
  for (const p of allPages) {
    const t = p.page_type;
    if (!grouped[t]) grouped[t] = [];
    grouped[t].push(p);
  }
  let indexMd = "# Wiki Index\n\n";
  for (const [type, items] of Object.entries(grouped)) {
    indexMd += `## ${type}\n\n`;
    for (const p of items) indexMd += `- **${p.title}** (\`${p.slug}\`) — ${p.summary || "No summary"} (${p.source_count} sources)\n`;
    indexMd += "\n";
  }

  await sb.from("wiki_pages").upsert(
    { owner_id, slug: "index", page_type: "index", title: "Wiki Index", summary: `${allPages.length} pages indexed`, body_markdown: indexMd, source_count: 0, metadata: {} },
    { onConflict: "owner_id,slug" }
  );

  // Build OVERVIEW page
  const overviewMd = `# Wiki Overview\n\n` +
    `Total pages: ${allPages.length}\n\n` +
    Object.entries(grouped).map(([t, items]) => `- **${t}**: ${items.length} pages`).join("\n") +
    `\n\nLast updated: ${new Date().toISOString()}`;

  await sb.from("wiki_pages").upsert(
    { owner_id, slug: "overview", page_type: "overview", title: "Wiki Overview", summary: `Overview of ${allPages.length} pages`, body_markdown: overviewMd, source_count: 0, metadata: {} },
    { onConflict: "owner_id,slug" }
  );

  // Build LOG page (recent runs)
  const { data: runs } = await sb.from("wiki_runs").select("*").eq("owner_id", owner_id).order("created_at", { ascending: false }).limit(50);
  let logMd = "# Wiki Log\n\n";
  for (const r of (runs ?? [])) {
    logMd += `- **${r.run_type}** [${r.status}] — ${r.created_at}\n`;
  }

  await sb.from("wiki_pages").upsert(
    { owner_id, slug: "log", page_type: "index", title: "Wiki Log", summary: "Chronological run history", body_markdown: logMd, source_count: 0, metadata: {} },
    { onConflict: "owner_id,slug" }
  );

  const { data: run } = await sb.from("wiki_runs").insert({
    owner_id, run_type: "reindex", status: "done",
    input: {}, output: { pages_indexed: allPages.length },
  }).select().single();

  return json({ message: "Reindex complete", pages_indexed: allPages.length, run });
}

async function handleLint(req: Request, sb: ReturnType<typeof createClient>) {
  const { owner_id, page_id } = await req.json();
  if (!owner_id) return err("owner_id required");

  const findings: string[] = [];

  // Find pages with no sources
  let pagesQ = sb.from("wiki_pages").select("id, slug, title, source_count, page_type").eq("owner_id", owner_id);
  if (page_id) pagesQ = pagesQ.eq("id", page_id);
  const { data: pages } = await pagesQ;

  for (const p of (pages ?? [])) {
    if (p.source_count === 0 && !["index", "overview"].includes(p.page_type)) {
      findings.push(`Orphan page: "${p.title}" (${p.slug}) has 0 sources`);
    }
  }

  // Find sources not linked to any page
  const { data: sources } = await sb.from("wiki_sources").select("id, title, source_type, status").eq("owner_id", owner_id).eq("status", "raw");
  if ((sources?.length ?? 0) > 0) {
    findings.push(`${sources!.length} uncompiled source(s) found`);
  }

  // Check for missing special pages
  for (const slug of ["index", "log", "overview"]) {
    const { data } = await sb.from("wiki_pages").select("id").eq("owner_id", owner_id).eq("slug", slug).maybeSingle();
    if (!data) findings.push(`Missing special page: ${slug}`);
  }

  const { data: run } = await sb.from("wiki_runs").insert({
    owner_id, run_type: "lint", status: "done",
    input: { page_id: page_id ?? null },
    output: { findings, finding_count: findings.length },
  }).select().single();

  return json({ findings, finding_count: findings.length, run });
}

async function handleAnswer(req: Request, sb: ReturnType<typeof createClient>) {
  const { owner_id, question, save_artifact } = await req.json();
  if (!owner_id || !question) return err("owner_id and question required");

  // Search pages by keyword
  const keywords = question.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2).slice(0, 5);
  let matchedPages: any[] = [];

  for (const kw of keywords) {
    const { data } = await sb.from("wiki_pages").select("id, slug, title, summary, body_markdown, page_type")
      .eq("owner_id", owner_id)
      .or(`title.ilike.%${kw}%,body_markdown.ilike.%${kw}%`)
      .limit(5);
    if (data) matchedPages.push(...data);
  }

  // Deduplicate
  const seen = new Set<string>();
  matchedPages = matchedPages.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });

  // Build answer (deterministic — TODO: LLM synthesis)
  let answerMd = `# Answer: ${question}\n\n`;
  if (matchedPages.length === 0) {
    answerMd += "No relevant wiki pages found for this question.\n";
  } else {
    answerMd += `Found ${matchedPages.length} relevant page(s):\n\n`;
    for (const p of matchedPages.slice(0, 5)) {
      answerMd += `## ${p.title}\n`;
      if (p.summary) answerMd += `${p.summary}\n\n`;
      const excerpt = (p.body_markdown || "").slice(0, 500);
      if (excerpt) answerMd += `${excerpt}...\n\n`;
    }
  }

  let artifact = null;
  if (save_artifact) {
    const { data: run } = await sb.from("wiki_runs").insert({
      owner_id, run_type: "answer", status: "done",
      input: { question }, output: { pages_matched: matchedPages.length },
    }).select().single();

    const { data } = await sb.from("wiki_artifacts").insert({
      owner_id, artifact_type: "answer", title: `Answer: ${question.slice(0, 100)}`,
      body_markdown: answerMd, source_run_id: run?.id, metadata: {},
    }).select().single();
    artifact = data;
  }

  return json({ answer: answerMd, pages_matched: matchedPages.length, artifact });
}

async function handleListPages(url: URL, sb: ReturnType<typeof createClient>) {
  const owner_id = url.searchParams.get("owner_id");
  const page_type = url.searchParams.get("page_type");
  const slug = url.searchParams.get("slug");
  const search = url.searchParams.get("search");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 200);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");

  let q = sb.from("wiki_pages").select("*").order("updated_at", { ascending: false }).range(offset, offset + limit - 1);
  if (owner_id) q = q.eq("owner_id", owner_id);
  if (page_type) q = q.eq("page_type", page_type);
  if (slug) q = q.eq("slug", slug);
  if (search) q = q.or(`title.ilike.%${search}%,body_markdown.ilike.%${search}%`);

  const { data, error: qErr } = await q;
  if (qErr) return err(qErr.message, 500);
  return json({ pages: data, count: data?.length ?? 0 });
}

async function handleGetPage(pageId: string, sb: ReturnType<typeof createClient>) {
  const { data: page, error: pgErr } = await sb.from("wiki_pages").select("*").eq("id", pageId).single();
  if (pgErr || !page) return err("Page not found", 404);

  const { data: sources } = await sb.from("wiki_page_sources").select("*, wiki_sources(*)").eq("page_id", pageId);

  return json({ page, sources: sources ?? [] });
}

async function handleGetPageSources(pageId: string, sb: ReturnType<typeof createClient>) {
  const { data, error: qErr } = await sb.from("wiki_page_sources").select("*, wiki_sources(*)").eq("page_id", pageId);
  if (qErr) return err(qErr.message, 500);
  return json({ sources: data ?? [] });
}

async function handleListArtifacts(url: URL, sb: ReturnType<typeof createClient>) {
  const owner_id = url.searchParams.get("owner_id");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 200);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");

  let q = sb.from("wiki_artifacts").select("*").order("created_at", { ascending: false }).range(offset, offset + limit - 1);
  if (owner_id) q = q.eq("owner_id", owner_id);

  const { data, error: qErr } = await q;
  if (qErr) return err(qErr.message, 500);
  return json({ artifacts: data, count: data?.length ?? 0 });
}
