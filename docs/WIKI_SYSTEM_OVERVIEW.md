# Wiki System Overview

## Architecture

The wiki subsystem is a **parallel knowledge system** that lives alongside `agent-vault` in the same Supabase project.

| System | Purpose |
|--------|---------|
| **agent-vault** | Structured memory: learnings, entities, relationships, commitments |
| **wiki-engine** | Compiled knowledge: sources, pages, traceability, synthesis |

Both systems share the same Supabase project but **do not merge**. They may lightly reference each other via metadata fields.

## Base URL

```
https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/wiki-engine
```

## Authentication

Bearer token: `AGENT_EDGE_KEY` (same as agent-vault).

## Tables

- `wiki_sources` — immutable raw source registry
- `wiki_pages` — compiled wiki pages (unique per owner+slug)
- `wiki_page_sources` — join table linking pages ↔ sources
- `wiki_runs` — job log (ingest, compile, lint, answer)
- `wiki_artifacts` — generated outputs (answers, briefs, reports)

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | /health | Health check |
| POST | /sources | Create source + ingest run |
| GET | /sources | List sources (filter: status, source_type, tag) |
| POST | /compile/source | Compile one source → source_note page |
| POST | /compile/topic | Compile/refresh a topic page |
| POST | /reindex | Rebuild index/log/overview pages |
| POST | /lint | Find orphan/stale/missing pages |
| POST | /answer | Search wiki + generate answer |
| GET | /pages | List pages (filter: page_type, slug, search) |
| GET | /pages/:id | Single page + linked sources |
| GET | /pages/:id/sources | Sources linked to a page |
| GET | /artifacts | List artifacts |

## Integration with agent-vault

- `wiki_sources.metadata` may contain `{ "agent_learning_id": "..." }`
- `wiki_pages.metadata` may contain `{ "entity_ids": [...] }`
- No structural coupling — both systems remain independent

## Special Pages

| Slug | Type | Purpose |
|------|------|---------|
| `index` | index | Catalog of all wiki pages |
| `log` | index | Chronological run history |
| `overview` | overview | High-level summary |
