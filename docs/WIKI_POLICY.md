# Wiki Policy

## System Boundary

- **agent-vault** = structured memory (learnings, entities, relationships, commitments)
- **wiki** = compiled knowledge base (sources, pages, traceability, synthesis)

These systems are **separate**. Do not store wiki page content in `agent_learnings`. Do not store entity/relationship data in wiki tables.

## Core Principles

1. **Sources are immutable inputs** — raw material is never rewritten
2. **Pages are compiled artifacts** — synthesized from sources, editable by agents
3. **Traceability** — every wiki claim should trace back to source material via `wiki_page_sources`
4. **Special pages** (`index`, `log`, `overview`) are first-class and auto-maintained via reindex

## Agent Guidelines

- When the user provides a URL, tweet, or note → create a `wiki_source`
- When compiling → create/update `wiki_pages` and link via `wiki_page_sources`
- Do **not** confuse topic pages with entity/relationship memory
- Use `agent-vault` for facts about people, orgs, and projects
- Use `wiki` for long-form knowledge synthesis and source tracking

## Integration

Optional cross-references via metadata:
- `wiki_sources.metadata.agent_learning_id` → link to a learning
- `wiki_pages.metadata.entity_ids` → reference entities

No structural foreign keys between wiki and agent-vault tables.

## Security

- All tables are owner-scoped via RLS
- External access requires `AGENT_EDGE_KEY` bearer token
- Never log or expose the edge key
