

# Wiki Subsystem Implementation Plan

## Overview
Build a personal-interest wiki system as a sibling to `agent-vault` in the same Supabase project. The wiki handles raw source ingestion, compiled wiki pages, source-to-page traceability, and answer/lint workflows. It lives in its own edge function (`wiki-engine`) with its own tables, completely separate from agent learnings and relational memory.

## Deliverables

### 1. Database Migration
Create 5 new tables with owner-scoped RLS and an `updated_at` trigger:

- **`wiki_sources`** -- immutable source registry (URLs, tweets, notes, articles)
- **`wiki_pages`** -- compiled wiki pages with slug uniqueness per owner, `page_type` enum (topic, source_note, entity, index, brief, overview)
- **`wiki_page_sources`** -- join table linking pages to sources with role
- **`wiki_runs`** -- tracks ingest/compile/lint/answer jobs
- **`wiki_artifacts`** -- generated outputs (answers, briefs, reports)

All tables get:
- `authenticated` RLS: `owner_id = auth.uid()` for SELECT/INSERT/UPDATE/DELETE
- `service_role` RLS: full access
- Foreign keys: `wiki_page_sources.page_id → wiki_pages`, `wiki_page_sources.source_id → wiki_sources`, `wiki_artifacts.source_run_id → wiki_runs`
- Unique constraints: `(owner_id, slug)` on wiki_pages, `(page_id, source_id, coalesce(role, ''))` on wiki_page_sources

### 2. Edge Function: `wiki-engine`
New file: `supabase/functions/wiki-engine/index.ts`

Add to `supabase/config.toml`:
```toml
[functions.wiki-engine]
verify_jwt = false
```

Auth: Bearer `AGENT_EDGE_KEY` (same pattern as agent-vault).

**Endpoints:**

| Method | Path | Purpose |
|--------|------|---------|
| POST | /sources | Create source entry + ingest run |
| GET | /sources | List/filter sources |
| POST | /compile/source | Compile one source into source_note page |
| POST | /compile/topic | Compile/refresh a topic page from sources |
| POST | /reindex | Rebuild index/log/overview pages |
| POST | /lint | Find stale/orphan/contradictory pages |
| POST | /answer | Search wiki, generate answer, optionally save artifact |
| GET | /pages | List pages (filter by type/slug/search) |
| GET | /pages/:id | Single page + linked sources |
| GET | /pages/:id/sources | Sources linked to a page |
| GET | /artifacts | List artifacts |
| GET | /health | Health check |

For v1, compile/topic and answer endpoints will do deterministic text assembly (no LLM calls) -- stub the synthesis logic with clear TODO markers for future LLM integration. The compile/source endpoint will create a `source_note` page from the raw source content. Reindex will rebuild index/log/overview pages by querying existing pages.

### 3. UI: Wiki Page (`src/pages/Wiki.tsx`)
New route: `/wiki` (admin-protected like `/learnings`)

Minimal functional UI with 4 tabs:
- **Pages** -- list wiki pages, click to view full page + linked sources
- **Sources** -- list source entries with type/status filters
- **Artifacts** -- list generated artifacts
- **Actions** -- buttons for Compile All, Reindex, Lint with status feedback

Components:
- `src/components/wiki/WikiPageList.tsx` -- page listing with search/filter
- `src/components/wiki/WikiPageDetail.tsx` -- single page view with markdown rendering and source links
- `src/components/wiki/WikiSourceList.tsx` -- source listing
- `src/components/wiki/WikiArtifactList.tsx` -- artifact listing
- `src/components/wiki/WikiActions.tsx` -- action buttons
- `src/hooks/useWiki.ts` -- data fetching hook calling wiki-engine endpoints

### 4. Navigation
Add "Wiki" link to `Navigation.tsx` alongside existing links.

### 5. Documentation
- **`docs/WIKI_SYSTEM_OVERVIEW.md`** -- architecture, boundary with agent-vault, endpoint reference
- **`docs/WIKI_SCHEMA.md`** -- table definitions, constraints, RLS
- **`docs/WIKI_POLICY.md`** -- usage policy (sources immutable, pages compiled, agent-vault = memory vs wiki = knowledge)

### 6. Integration Hooks
- `wiki_sources.metadata` may contain `{ "agent_learning_id": "..." }` for optional cross-reference
- `wiki_pages.metadata` may contain `{ "entity_ids": [...] }` for optional entity links
- No structural coupling -- both systems remain independent

## Files Created/Modified

| File | Action |
|------|--------|
| `supabase/migrations/2026XXXX_wiki_schema.sql` | Create (via migration tool) |
| `supabase/functions/wiki-engine/index.ts` | Create |
| `supabase/config.toml` | Add wiki-engine function config |
| `src/pages/Wiki.tsx` | Create |
| `src/components/wiki/*.tsx` (5 files) | Create |
| `src/hooks/useWiki.ts` | Create |
| `src/App.tsx` | Add /wiki route |
| `src/components/Navigation.tsx` | Add Wiki nav link |
| `src/integrations/supabase/types.ts` | Auto-updated after migration |
| `docs/WIKI_SYSTEM_OVERVIEW.md` | Create |
| `docs/WIKI_SCHEMA.md` | Create |
| `docs/WIKI_POLICY.md` | Create |

## What's NOT in v1
- No vector search or embeddings
- No LLM-powered synthesis (stubs only)
- No autonomous crawling
- No graph visualization
- No multi-agent orchestration

