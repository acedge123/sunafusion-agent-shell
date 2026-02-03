

## Plan: Create Agent Vault API Documentation

### Overview
Create a new documentation file `docs/AGENT_VAULT_API.md` that provides complete instructions for external AI agents (Codex, OpenClaw) to use the agent-vault edge function.

### File to Create

**`docs/AGENT_VAULT_API.md`**

The documentation will include:

1. **Overview** - What agent-vault is and its purpose
2. **Authentication** - How to authenticate using Bearer token
3. **Base URL** - The endpoint URL
4. **API Reference** - All endpoints with:
   - Method and path
   - Query parameters
   - Request body (where applicable)
   - Response format
   - Example curl commands
5. **Repo Map Endpoints** - Search and retrieve repository information
6. **Agent Learnings Endpoints** - Search and insert learnings
7. **Composio Proxy Endpoints** - Tool listing and execution
8. **Error Handling** - Common error responses
9. **Rate Limiting Notes** - Production considerations

### Documentation Structure

```markdown
# Agent Vault API

## Overview
Secure API for external AI agents to access institutional memory.

## Authentication
Bearer token: AGENT_EDGE_KEY

## Base URL
https://nljlsqgldgmxlbylqazg.supabase.co/functions/v1/agent-vault

## Endpoints

### Health Check
GET /health

### Repo Map
- GET /repo_map/count
- GET /repo_map/get?name=<name>
- GET /repo_map/search?q=<query>&limit=<n>

### Agent Learnings
- GET /learnings/search?q=<query>&limit=<n>
- POST /learnings

### Composio Proxy
- GET /composio/toolkits
- GET /composio/tools
- GET /composio/tools/:slug
- POST /composio/tools/execute

## Error Responses
- 400: Bad request (validation errors)
- 401: Unauthorized
- 404: Not found
- 500: Server error
```

### Implementation Details

The documentation will be comprehensive, including:

- Full curl examples for every endpoint
- Request/response JSON schemas
- Field descriptions and validation rules
- Notes on payload format compatibility (CGPT format vs native format for learnings)
- Composio-specific fields for tool execution

