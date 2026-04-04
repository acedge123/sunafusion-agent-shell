# Wiki Schema Reference

## Tables

### wiki_sources

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | No | gen_random_uuid() |
| owner_id | uuid | No | — |
| source_type | text | No | — |
| title | text | Yes | null |
| source_url | text | Yes | null |
| external_id | text | Yes | null |
| raw_text | text | Yes | null |
| raw_markdown | text | Yes | null |
| raw_json | jsonb | No | '{}' |
| ingested_at | timestamptz | No | now() |
| source_date | timestamptz | Yes | null |
| status | text | No | 'raw' |
| tags | text[] | No | '{}' |
| metadata | jsonb | No | '{}' |

Valid `source_type`: url, tweet, note, article, paper, chat, manual

Valid `status`: raw, normalized, compiled, rejected

### wiki_pages

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | No | gen_random_uuid() |
| owner_id | uuid | No | — |
| slug | text | No | — |
| page_type | text | No | — |
| title | text | No | — |
| summary | text | Yes | null |
| body_markdown | text | No | '' |
| status | text | No | 'active' |
| source_count | integer | No | 0 |
| updated_from_run_id | uuid | Yes | null |
| created_at | timestamptz | No | now() |
| updated_at | timestamptz | No | now() |
| metadata | jsonb | No | '{}' |

Unique: `(owner_id, slug)`

Valid `page_type`: topic, source_note, entity, index, brief, overview

### wiki_page_sources

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | No | gen_random_uuid() |
| owner_id | uuid | No | — |
| page_id | uuid | No | FK → wiki_pages |
| source_id | uuid | No | FK → wiki_sources |
| role | text | Yes | null |
| created_at | timestamptz | No | now() |

Unique index: `(page_id, source_id, COALESCE(role, ''))`

### wiki_runs

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | No | gen_random_uuid() |
| owner_id | uuid | No | — |
| run_type | text | No | — |
| status | text | No | 'queued' |
| input | jsonb | No | '{}' |
| output | jsonb | No | '{}' |
| error | text | Yes | null |
| created_at | timestamptz | No | now() |
| updated_at | timestamptz | No | now() |

Valid `run_type`: ingest, compile_source, compile_topic, reindex, lint, answer

Valid `status`: queued, processing, done, failed

### wiki_artifacts

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | No | gen_random_uuid() |
| owner_id | uuid | No | — |
| artifact_type | text | No | — |
| title | text | No | — |
| body_markdown | text | Yes | null |
| body_json | jsonb | No | '{}' |
| source_run_id | uuid | Yes | FK → wiki_runs |
| created_at | timestamptz | No | now() |
| metadata | jsonb | No | '{}' |

Valid `artifact_type`: answer, brief, report, comparison, slides, outline

## RLS

All tables: owner-scoped for `authenticated`, full access for `service_role`.
