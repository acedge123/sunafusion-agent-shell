# Relational Memory Model

## Overview

The relational memory system extends `agent_learnings` with first-class entities, relationships, and commitments. It enables the agent to answer questions like "What do I know about Sarah?", "What's open for Acme?", and "What commitments are outstanding?"

## Schema

### `entities`
Canonical records for people, orgs, projects, repos, systems, and tickets.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| owner_id | uuid | Tenant scope |
| entity_type | text | person, org, project, repo, system, ticket |
| external_key | text | Optional unique identifier (e.g., E.164 phone) |
| name | text | Display name |
| aliases | text[] | Alternative names |
| status | text | active, archived |
| summary | text | Brief description |
| metadata | jsonb | Additional data |

### `learning_entities`
Join table linking learnings to entities.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| owner_id | uuid | Tenant scope |
| learning_id | uuid | FK → agent_learnings |
| entity_id | uuid | FK → entities |
| role | text | subject, mentioned_person, project_context, etc. |
| confidence | real | 0.0–1.0, default 1.0 |

### `entity_relationships`
Typed edges between entities.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| owner_id | uuid | Tenant scope |
| from_entity_id | uuid | FK → entities |
| relationship_type | text | works_at, owns, member_of, related_to, depends_on, blocked_by, contact_at, responsible_for, about, mentioned_with |
| to_entity_id | uuid | FK → entities |
| confidence | real | Default 0.8 |
| source_learning_id | uuid | Optional FK → agent_learnings |
| metadata | jsonb | Additional context |

### `commitments`
Promises, follow-ups, tasks, and open loops.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| owner_id | uuid | Tenant scope |
| title | text | What needs to happen |
| description | text | Details |
| status | text | open, in_progress, done, cancelled |
| priority | text | low, medium, high, urgent |
| due_at | timestamptz | Optional deadline |
| assigned_entity_id | uuid | Who's responsible |
| counterparty_entity_id | uuid | Who it's for/with |
| project_entity_id | uuid | Related project |
| source_learning_id | uuid | Where it originated |

## API Endpoints (agent-vault)

### Entities
- `POST /entities/upsert` — Create or update an entity
- `GET /entities/search?q=&entity_type=&owner_id=&limit=&offset=`
- `GET /entities/:id` — Get single entity
- `GET /entities/:id/context` — Full context (learnings, relationships, commitments)

### Learning Links
- `POST /learnings/link` — Link learning to entities
- `GET /learnings/:id/entities` — Get entities linked to a learning

### Relationships
- `POST /relationships` — Create/upsert relationship
- `GET /relationships?entity_id=&relationship_type=`

### Commitments
- `POST /commitments` — Create commitment
- `PATCH /commitments/:id` — Update commitment
- `GET /commitments?status=&assigned_entity_id=&due_before=&limit=&offset=`

## RPC Helpers
- `search_entities(owner_uuid, query_text, limit_count, offset_count)` — Text search across entities
- `get_entity_context(entity_uuid)` — Returns entity + learnings + relationships + commitments
- `get_learning_context(learning_uuid)` — Returns learning + linked entities
- `get_briefing(owner_uuid, entity_uuid)` — Convenience summary: entity + recent learnings + relationships + open commitments

## UI
The Knowledge Base page (`/learnings`) includes four tabs:
- **Learnings** — with entity chips on cards showing linked entities
- **Entities** — searchable/filterable list of people, orgs, projects, repos, systems, tickets
- **Commitments** — filterable list of open loops, follow-ups, and promises
- **Files** — agent-uploaded files
