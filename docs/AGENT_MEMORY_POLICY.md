# Agent Memory Policy

## What to store where

### `agent_learnings`
- Durable observations, preferences, decisions
- Summaries and incident notes
- Runbook/playbook documentation
- Project knowledge and reference material
- Research notes (exploratory, may age out)

### `entities` — create when:
- A named person, org, project, repo, system, or ticket appears
- It is likely to be referenced again
- Use `external_key` for stable identifiers (E.164 for people, repo slug for repos)

### `entity_relationships` — create when:
- The relationship is explicit and reasonably durable
- Examples: person works_at org, person owns project, repo related_to project
- Use lower confidence (0.5–0.7) for inferred relationships

### `commitments` — create when:
- There is an explicit promise, follow-up, TODO, or open loop
- Always set `due_at` if a date is mentioned or parseable
- Link to relevant entities via assigned/counterparty/project fields

## Confidence guidelines
- **1.0**: Explicitly stated fact
- **0.8**: Strong inference from context
- **0.5–0.7**: Reasonable guess, may need verification
- **< 0.5**: Weak signal, store as learning only

## Do NOT create structured rows for:
- Weak guesses or speculative connections
- Temporary or ephemeral information
- When uncertain, store as a learning with lower confidence
