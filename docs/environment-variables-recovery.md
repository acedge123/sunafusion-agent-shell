# Environment Variable Recovery Guide

> **Security Note**: This document contains only variable **names and descriptions** — no secret values.

> Store actual values in a password manager (1Password, Bitwarden, etc.) accessible to authorized team members only.

---

## 1. Frontend Variables (`.env` / Vite)

These are bundled into the client-side app. Public by nature. Never store private secrets with public build prefixes.

| Variable | Purpose | Public or Secret | Where to Find / Recover Value |
|----------|---------|-----------------|-------------------------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Public | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Public | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project reference ID | Public | Supabase Dashboard → Settings → General |
| `VITE_BACKEND_API_URL` | Backend API base URL | Public | Deployment URL of the backend server |
| `VITE_ENABLE_HEAVY_MODE` | Enables heavy-mode task processing (optional) | Public | Set to `true` or `false` |

---

## 2. Auto-Injected Platform Variables

These are automatically injected by the platform/runtime and normally are not set manually.

| Variable | Purpose | Public or Secret | Platform |
|----------|---------|-----------------|----------|
| `SUPABASE_URL` | Project URL for Edge Functions | Secret | Supabase (auto-injected into Edge Functions) |
| `SUPABASE_ANON_KEY` | Anon key for Edge Functions | Secret | Supabase (auto-injected into Edge Functions) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for Edge Functions | Secret | Supabase (auto-injected into Edge Functions) |

---

## 3. Project-Managed Secrets

These are manually configured secrets required for the app/runtime/integrations.

### AI Providers

| Variable | Purpose | Used By | Public or Secret | Where to Find / Recover Value | Recommended Storage Location |
|----------|---------|---------|-----------------|-------------------------------|------------------------------|
| `ANTHROPIC_API_KEY` | Anthropic Claude API access | Backend server | Secret | Anthropic Console → API Keys | Password manager |
| `OPENROUTER_API_KEY` | OpenRouter LLM routing | Backend server | Secret | OpenRouter Dashboard → API Keys | Password manager |
| `OPENAI_API_KEY` | OpenAI API access | Supabase Edge Functions (`unified-agent`) | Secret | OpenAI Platform → API Keys | Supabase Edge Function secrets |
| `GEMINI_API_KEY` | Google Gemini / Imagen API | Supabase Edge Functions (`imagen-generator`) | Secret | Google AI Studio → API Keys | Supabase Edge Function secrets |
| `TAVILY_API_KEY` | Web search API | Backend server, Supabase Edge Functions (`unified-agent`) | Secret | Tavily Dashboard → API Keys | Password manager |

### Sandbox / Container Provider

| Variable | Purpose | Used By | Public or Secret | Where to Find / Recover Value | Recommended Storage Location |
|----------|---------|---------|-----------------|-------------------------------|------------------------------|
| `DAYTONA_API_KEY` | Daytona sandbox authentication | Backend server | Secret | Daytona Dashboard → API Keys | Password manager |
| `DAYTONA_SERVER_URL` | Daytona server endpoint | Backend server | Secret | Daytona Dashboard → Settings | Password manager |
| `DAYTONA_TARGET` | Daytona deployment target | Backend server | Secret | Daytona Dashboard → Targets | Password manager |

### AWS Bedrock

| Variable | Purpose | Used By | Public or Secret | Where to Find / Recover Value | Recommended Storage Location |
|----------|---------|---------|-----------------|-------------------------------|------------------------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | Backend server | Secret | AWS IAM Console → Security Credentials | Password manager |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | Backend server | Secret | AWS IAM Console → Security Credentials | Password manager |
| `AWS_REGION_NAME` | AWS region for Bedrock | Backend server | Public | AWS region identifier (e.g. `us-east-1`) | Password manager |

### Redis

| Variable | Purpose | Used By | Public or Secret | Where to Find / Recover Value | Recommended Storage Location |
|----------|---------|---------|-----------------|-------------------------------|------------------------------|
| `REDIS_HOST` | Redis server hostname | Backend server | Secret | Redis provider dashboard | Password manager |
| `REDIS_PORT` | Redis server port | Backend server | Public | Redis provider dashboard | Password manager |
| `REDIS_PASSWORD` | Redis authentication | Backend server | Secret | Redis provider dashboard | Password manager |
| `REDIS_SSL` | Enable Redis SSL | Backend server | Public | Set to `true` or `false` | Password manager |

### Supabase (Backend Server)

| Variable | Purpose | Used By | Public or Secret | Where to Find / Recover Value | Recommended Storage Location |
|----------|---------|---------|-----------------|-------------------------------|------------------------------|
| `SUPABASE_URL` | Supabase project URL | Backend server | Public | Supabase Dashboard → Settings → API |  Password manager |
| `SUPABASE_ANON_KEY` | Supabase anon key | Backend server | Public | Supabase Dashboard → Settings → API | Password manager |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Backend server | Secret | Supabase Dashboard → Settings → API | Password manager |
| `SUPABASE_JWT_SECRET` | JWT verification secret | Backend server | Secret | Supabase Dashboard → Settings → API | Password manager |

### Internal APIs

| Variable | Purpose | Used By | Public or Secret | Where to Find / Recover Value | Recommended Storage Location |
|----------|---------|---------|-----------------|-------------------------------|------------------------------|
| `AGENT_EDGE_KEY` | Bearer token for agent-vault / wiki-engine auth | Supabase Edge Functions | Secret | Self-generated; shared with worker daemon | Supabase Edge Function secrets |
| `LOVABLE_API_KEY` | Lovable platform API access | Supabase Edge Functions (`unified-agent`) | Secret | Lovable Dashboard | Supabase Edge Function secrets |

### Third-Party Data APIs

| Variable | Purpose | Used By | Public or Secret | Where to Find / Recover Value | Recommended Storage Location |
|----------|---------|---------|-----------------|-------------------------------|------------------------------|
| `CREATOR_IQ_API_KEY` | CreatorIQ CRM API | Backend server, Supabase Edge Functions (`unified-agent`) | Secret | CreatorIQ account settings | Supabase Edge Function secrets |
| `RAPID_API_KEY` | RapidAPI data providers | Backend server | Secret | RapidAPI Dashboard → Apps → Keys | Password manager |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API (deployment/DNS) | Backend server | Secret | Cloudflare Dashboard → API Tokens | Password manager |
| `COMPOSIO_API_KEY` | Composio webhook/proxy (optional) | Supabase Edge Functions (`agent-vault`) | Secret | Composio Dashboard | Supabase Edge Function secrets |

### OAuth / Social APIs

| Variable | Purpose | Used By | Public or Secret | Where to Find / Recover Value | Recommended Storage Location |
|----------|---------|---------|-----------------|-------------------------------|------------------------------|
| `SLACK_CLIENT_SECRET` | Slack OAuth client secret | Supabase Edge Functions (`slack-data`) | Secret | Slack App Dashboard → OAuth & Permissions | Supabase Edge Function secrets |

### Payments

| Variable | Purpose | Used By | Public or Secret | Where to Find / Recover Value | Recommended Storage Location |
|----------|---------|---------|-----------------|-------------------------------|------------------------------|
| `STRIPE_API_KEY` | Stripe secret key | Supabase Edge Functions (`billing-functions`, `billing-webhooks`) | Secret | Stripe Dashboard → Developers → API Keys | Supabase Edge Function secrets |
| `STRIPE_WEBHOOK_SIGNING_SECRET` | Stripe webhook signature verification | Supabase Edge Functions (`billing-webhooks`) | Secret | Stripe Dashboard → Developers → Webhooks | Supabase Edge Function secrets |
| `STRIPE_DEFAULT_PLAN_ID` | Default Stripe price/plan ID | Supabase Edge Functions (`billing-functions`) | Secret | Stripe Dashboard → Products | Supabase Edge Function secrets |
| `STRIPE_DEFAULT_TRIAL_DAYS` | Trial period length in days | Supabase Edge Functions (`billing-functions`) | Public | Business decision (e.g. `14`) | Supabase Edge Function secrets |
| `ALLOWED_HOST` | Allowed return URL hostname for Stripe billing portal | Supabase Edge Functions (`billing-functions`) | Public | Your app's public URL | Supabase Edge Function secrets |

### CI/CD

| Variable | Purpose | Used By | Public or Secret | Where to Find / Recover Value | Recommended Storage Location |
|----------|---------|---------|-----------------|-------------------------------|------------------------------|
| `PYPI_TOKEN` | PyPI publishing token for backend package | GitHub Actions (`publish.yml`) | Secret | PyPI Account → API Tokens | GitHub Actions secrets |

---

## 4. Variable Mapping by Runtime Surface

| Runtime Surface | Variables Used |
|----------------|---------------|
| Frontend app (Vite) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `VITE_BACKEND_API_URL`, `VITE_ENABLE_HEAVY_MODE` |
| Backend server (Python/FastAPI) | `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`, `TAVILY_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_SSL`, `DAYTONA_API_KEY`, `DAYTONA_SERVER_URL`, `DAYTONA_TARGET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION_NAME`, `CREATOR_IQ_API_KEY`, `RAPID_API_KEY`, `CLOUDFLARE_API_TOKEN` |
| Supabase Edge Functions | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AGENT_EDGE_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `TAVILY_API_KEY`, `CREATOR_IQ_API_KEY`, `LOVABLE_API_KEY`, `SLACK_CLIENT_SECRET`, `COMPOSIO_API_KEY`, `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SIGNING_SECRET`, `STRIPE_DEFAULT_PLAN_ID`, `STRIPE_DEFAULT_TRIAL_DAYS`, `ALLOWED_HOST` |
| CI/CD (GitHub Actions) | `PYPI_TOKEN` |

---

## 5. Disaster Recovery Checklist

1. **Recreate Supabase project** — provision a new project if the original is lost; note the new URL and keys.
2. **Run database migrations** — apply all migrations from `backend/supabase/migrations/` in order using `supabase db push` or `supabase migration up`.
3. **Deploy Supabase Edge Functions** — run `supabase functions deploy` for all functions listed in `supabase/config.toml` (`agent-vault`, `wiki-engine`, `unified-agent`, `imagen-generator`, `drive-ai-assistant`, `slack-data`) and `backend/supabase/functions/` (`billing-functions`, `billing-webhooks`).
4. **Set Edge Function secrets** — re-enter all secrets listed in Section 3 under Supabase Edge Function secrets via `supabase secrets set` or the Supabase Dashboard.
5. **Deploy backend server** — deploy the Python/FastAPI backend (e.g. to Railway or Fly.io using `backend/fly.production.toml` or `backend/docker/Dockerfile`) with all backend environment variables configured.
6. **Configure Redis** — provision or reconnect Redis instance; set `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_SSL`.
7. **Reconnect Daytona** — provision or reconnect sandbox container provider; set `DAYTONA_API_KEY`, `DAYTONA_SERVER_URL`, `DAYTONA_TARGET`.
8. **Reconnect third-party APIs** — re-enter keys for Stripe, CreatorIQ, Slack, Tavily, OpenAI, Anthropic, Gemini, RapidAPI, Cloudflare, and Composio.
9. **Deploy frontend** — publish via Lovable or deploy to Vercel (see `vercel.json`); ensure `VITE_*` variables are set.
10. **Verify application health** — confirm Edge Function endpoints respond (`/health` on `agent-vault`), backend API is reachable, frontend loads and authenticates, Stripe webhooks fire correctly.

---

## 6. Where Secret Values Should Live

| Storage Location | What Should Be Stored There | Who Should Have Access |
|-----------------|---------------------------|----------------------|
| Password manager | All secret values as canonical source of truth | Project leads, DevOps |
| Supabase Edge Function secrets | `AGENT_EDGE_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `TAVILY_API_KEY`, `CREATOR_IQ_API_KEY`, `LOVABLE_API_KEY`, `SLACK_CLIENT_SECRET`, `COMPOSIO_API_KEY`, `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SIGNING_SECRET`, `STRIPE_DEFAULT_PLAN_ID`, `STRIPE_DEFAULT_TRIAL_DAYS`, `ALLOWED_HOST` | Supabase project admins |
| Backend deployment platform (Railway / Fly.io) | All backend server variables (AI keys, Redis, Daytona, Supabase, data API keys) | DevOps, backend engineers |
| GitHub Actions secrets | `PYPI_TOKEN` | Repo admins |
| Lovable project secrets | `VITE_BACKEND_API_URL` (if overriding default) | Project editors |

---

## 7. Notes and Risks

- **`SUPABASE_SERVICE_ROLE_KEY`** is the most sensitive variable — it bypasses RLS. Used by both backend server and Edge Functions. Rotation requires updating both surfaces simultaneously.
- **`AGENT_EDGE_KEY`** is self-generated and shared between the worker daemon and Edge Functions. If lost, generate a new value and update both the worker config and Supabase secrets.
- **`TAVILY_API_KEY`** and **`CREATOR_IQ_API_KEY`** are duplicated across backend server and Supabase Edge Functions — ensure both are updated during rotation.
- **`STRIPE_WEBHOOK_SIGNING_SECRET`** is tied to a specific webhook endpoint in the Stripe dashboard. If the endpoint URL changes, a new signing secret must be created.
- **`SUPABASE_JWT_SECRET`** recovery depends on Supabase project access — it cannot be regenerated without project admin rights.
- **`OPENROUTER_API_KEY`** and `OPENROUTER_API_BASE` are used by the backend; `OPENROUTER_API_BASE` has a hardcoded fallback and may not require explicit configuration.
- **`PYPI_TOKEN`** is only needed for publishing the backend as a Python package; not required for application operation.

---

*Last updated: 2026-04-06*
