# Heavy Mode Production Setup

## Backend Deployment

**Current Setup:** Backend is deployed on **Fly.io** (`backend-production-ogog`)

### Environment Variables

Set in your frontend (Vite):
```bash
VITE_BACKEND_API_URL=https://backend-production-ogog.fly.dev
```

Or for local development:
```bash
VITE_BACKEND_API_URL=http://localhost:8000
```

### CORS Configuration

Backend CORS is configured in `backend/api.py`:
- **Allowed Origins:** `https://www.suna.so`, `https://suna.so`, `https://staging.suna.so`, `http://localhost:3000`
- **SSE Headers:** `Cache-Control`, `Connection`, `X-Accel-Buffering` are exposed
- **Methods:** `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- **Credentials:** Enabled

### SSE (Server-Sent Events) Configuration

**Reverse Proxy Requirements:**
- **Nginx:** `proxy_buffering off;` (if using Nginx)
- **Cloudflare:** May buffer by default - configure to allow streaming
- **Fly.io:** Should work out of the box, but verify no buffering

**Common Issues:**
- Streams cutting off → Usually buffering/timeouts
- Check proxy timeout settings (should be > 5 minutes for long tasks)

### Quick Test

```bash
curl -i "$VITE_BACKEND_API_URL/health"
```

Should return 200 OK.

---

## Safety Rails

### 1. Iteration Limits
- **Default:** 30 iterations for UI-triggered runs
- **Max:** 150 iterations (only via explicit override)
- **Location:** `backend/agent/api.py:1170`

### 2. Runtime Limits
- **Max Runtime:** 5 minutes (300 seconds) for UI-triggered runs
- **Action on Exceed:** Agent run fails with error message
- **Location:** `backend/agent/api.py:773-808`

### 3. Billing Checks
- Billing status checked before starting agent run
- Returns 402 if billing is insufficient
- **Location:** `backend/agent/api.py:984-990`

---

## Authentication

### Required
Heavy Mode **requires** user authentication:
- JWT token from Supabase must be present
- Token forwarded in `Authorization: Bearer <token>` header
- Backend verifies token signature (if `SUPABASE_JWT_SECRET` is set)

### Testing
- **Logged-in user:** Should work normally
- **Logged-out user:** Should get 401 Unauthorized

---

## UI Features

### Stop Button
- Appears in Heavy Mode when agent is running
- Calls `POST /api/agent-run/{agent_run_id}/stop`
- Stops the agent run gracefully

### Repo-Map Integration
- Heavy Mode automatically searches repo-map before starting
- Same keyword detection as unified-agent
- Results prepended to prompt as context
- **Location:** `src/services/api/backendAgentService.ts:searchRepoMapBeforeAgent()`

---

## Production Checklist

- [ ] Set `VITE_BACKEND_API_URL` in production environment
- [ ] Verify CORS allows your production UI domain
- [ ] Test SSE streaming works (no buffering)
- [ ] Verify auth works (logged-in vs logged-out)
- [ ] Test Stop button functionality
- [ ] Verify safety rails (30 iterations, 5min runtime)
- [ ] Monitor billing/usage after deployment

---

## Troubleshooting

### Streams Cut Off
1. Check reverse proxy buffering settings
2. Verify timeout settings are sufficient
3. Check Fly.io logs for connection issues

### CORS Errors
1. Verify your UI domain is in `allow_origins` list
2. Check that `allow_credentials=True`
3. Verify SSE headers are exposed

### Auth Failures
1. Check `SUPABASE_JWT_SECRET` is set in backend
2. Verify token is being forwarded correctly
3. Check backend logs for JWT verification errors

### High Billing
1. Safety rails should prevent this (30 iterations, 5min limit)
2. Monitor agent runs in database
3. Check for runaway tasks
