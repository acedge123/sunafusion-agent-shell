# Integration Graph



Generated: 2026-03-21T16:18:32.893Z



Strategic map showing relationships between repositories based on:

- **Shared Tables**: Repos that share database tables (coordination required for schema changes)

- **Shared APIs**: Repos using the same external APIs (CIQ, Shopify, BigCommerce, Slack, Gmail, etc.)

- **Shared Integrations**: Repos using the same infrastructure (Supabase, AWS, Redis, etc.)



## Graph Statistics



- **Nodes (Repos):** 66

- **Edges (Relationships):** 1457

- **Repos with Tables:** 28



## Relationships



### `ciq-automations` ↔ `influencer-iq-flow-analysis`
- **Shared Tables:** `agent_memories`, `agent_sessions`, `agent_tasks`, `agent_tool_executions`, `api_call_logs`, `api_patterns`, `brands`, `bulk_upload_progress`, `cached_lists`, `ciq_media_cache`, `creator_connect_profiles`, `developer_insights`, `ecommerce_clients`, `email_templates`, `knowledge_base`, `knowledge_extraction_jobs`, `landing_page_templates`, `meta_audience_memberships`, `meta_custom_audiences`, `meta_offline_conversions`, `webhook_publisher_preferences`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `creator-licensing-hub` ↔ `temp-creator-repo`
- **Shared Tables:** `analytics_events`, `analytics_sessions`, `analytics_visitors`, `bigcommerce_catalog_mappings`, `bigcommerce_webhooks`, `tracked_events`, `tracking_pixels`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `creator-licensing-hub` ↔ `four-visions-big-commerce`
- **Shared Tables:** `analytics_events`, `analytics_sessions`, `orders`, `tracked_events`, `tracking_pixels`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `ciq-automations` ↔ `onsite-affiliate`
- **Shared Tables:** `api_keys`, `audit_log`, `brands`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** openai, stripe
- **Shared Integrations:** aws, redis, supabase, webhook

### `four-visions-big-commerce` ↔ `temp-creator-repo`
- **Shared Tables:** `analytics_events`, `analytics_sessions`, `tracked_events`, `tracking_pixels`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `governance-hub` ↔ `onsite-affiliate`
- **Shared Tables:** `api_keys`, `profiles`, `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, vercel, webhook

### `ciq-automations` ↔ `sunafusion-agent-shell`
- **Shared Tables:** `agent_memories`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** creatoriq, openai, stripe
- **Shared Integrations:** aws, redis, supabase, webhook

### `mom-walk-connect` ↔ `onsite-affiliate`
- **Shared Tables:** `brands`, `profiles`, `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** aws, supabase, vercel, webhook

### `creator-licensing-hub` ↔ `onsite-affiliate`
- **Shared Tables:** `orders`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** openai
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `four-visions-big-commerce` ↔ `onsite-affiliate`
- **Shared Tables:** `orders`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `agentic-control-plane-kit` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq, stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `creator-licensing-hub` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `onsite-affiliate` ↔ `suna`
- **Shared APIs:** openai, stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `onsite-affiliate` ↔ `suna-kortix`
- **Shared APIs:** openai, stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `onsite-affiliate` ↔ `sunafusion-agent-shell`
- **Shared APIs:** openai, stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `suna` ↔ `suna-kortix`
- **Shared APIs:** openai, stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `suna` ↔ `sunafusion-agent-shell`
- **Shared APIs:** openai, stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `suna-kortix` ↔ `sunafusion-agent-shell`
- **Shared APIs:** openai, stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `governance-hub` ↔ `mom-walk-connect`
- **Shared Tables:** `profiles`, `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** aws, supabase, vercel, webhook

### `lovable-audit` ↔ `onsite-affiliate`
- **Shared Tables:** `brands`, `creators`, `profiles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase, vercel, webhook

### `echelon-control` ↔ `onsite-affiliate`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** openai, stripe
- **Shared Integrations:** aws, supabase, webhook

### `ciq-automations` ↔ `key-vault-executor`
- **Shared Tables:** `action_allowlist`, `cia_service_keys`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** creatoriq, stripe
- **Shared Integrations:** supabase, webhook

### `debt-freedom-pathway-landing` ↔ `sunafusion-agent-shell`
- **Shared Tables:** `leads`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `agentic-control-plane-kit` ↔ `ciq-automations`
- **Shared APIs:** creatoriq, stripe
- **Shared Integrations:** aws, redis, supabase, webhook

### `agentic-control-plane-kit` ↔ `creator-licensing-hub`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `ciq-automations` ↔ `creator-licensing-hub`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** aws, redis, supabase, webhook

### `creator-licensing-hub` ↔ `edge-bot`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** aws, supabase, vercel, webhook

### `creator-licensing-hub` ↔ `edge-bot-latest-review`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot` ↔ `edge-bot-latest-review`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot-latest-review` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** aws, supabase, vercel, webhook

### `agentic-control-plane-kit` ↔ `api-docs-template`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `agentic-control-plane-kit` ↔ `four-visions-big-commerce`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `agentic-control-plane-kit` ↔ `onsite-affiliate`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `agentic-control-plane-kit` ↔ `suna`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `agentic-control-plane-kit` ↔ `suna-kortix`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `api-docs-template` ↔ `four-visions-big-commerce`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `api-docs-template` ↔ `onsite-affiliate`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `api-docs-template` ↔ `suna`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `api-docs-template` ↔ `suna-kortix`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `api-docs-template` ↔ `sunafusion-agent-shell`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `ciq-automations` ↔ `suna`
- **Shared APIs:** openai, stripe
- **Shared Integrations:** aws, redis, supabase, webhook

### `ciq-automations` ↔ `suna-kortix`
- **Shared APIs:** openai, stripe
- **Shared Integrations:** aws, redis, supabase, webhook

### `four-visions-big-commerce` ↔ `suna`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `four-visions-big-commerce` ↔ `suna-kortix`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `four-visions-big-commerce` ↔ `sunafusion-agent-shell`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `creator-licensing-hub` ↔ `suna`
- **Shared APIs:** openai
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `creator-licensing-hub` ↔ `suna-kortix`
- **Shared APIs:** openai
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `lovable-audit` ↔ `mom-walk-connect`
- **Shared Tables:** `brands`, `profiles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase, vercel, webhook

### `echelon-control` ↔ `governance-hub`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, webhook

### `influencer-iq-flow-analysis` ↔ `sunafusion-agent-shell`
- **Shared Tables:** `agent_memories`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `ciq-automations` ↔ `governance-hub`
- **Shared Tables:** `api_keys`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, webhook

### `ciq-automations` ↔ `mom-walk-connect`
- **Shared Tables:** `brands`, `email_templates`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** aws, supabase, webhook

### `creator-licensing-hub` ↔ `echelon-control`
- **Shared Tables:** `analytics_events`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, webhook

### `echelon-control` ↔ `four-visions-big-commerce`
- **Shared Tables:** `analytics_events`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, webhook

### `four-visions-big-commerce` ↔ `mom-walk-connect`
- **Shared Tables:** `admin_notification_emails`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** aws, supabase, vercel, webhook

### `agentic-control-plane-kit` ↔ `creatorgift-backend`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, redis, vercel, webhook

### `agentic-control-plane-kit` ↔ `creatorgift-backend-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, redis, vercel, webhook

### `agentic-control-plane-kit` ↔ `edge-bot`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, supabase, vercel, webhook

### `agentic-control-plane-kit` ↔ `edge-bot-latest-review`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, supabase, vercel, webhook

### `ciq-automations` ↔ `edge-bot`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** aws, supabase, webhook

### `ciq-automations` ↔ `edge-bot-latest-review`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** aws, supabase, webhook

### `creator-licensing-hub` ↔ `creatorgift-backend`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, redis, vercel, webhook

### `creator-licensing-hub` ↔ `creatorgift-backend-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend` ↔ `creatorgift-backend-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend-analysis` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, redis, vercel, webhook

### `agentic-control-plane-kit` ↔ `governance-hub`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, vercel, webhook

### `api-docs-template` ↔ `ciq-automations`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, redis, supabase, webhook

### `api-docs-template` ↔ `governance-hub`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, vercel, webhook

### `ciq-automations` ↔ `echelon-control`
- **Shared APIs:** openai, stripe
- **Shared Integrations:** aws, supabase, webhook

### `ciq-automations` ↔ `four-visions-big-commerce`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, redis, supabase, webhook

### `echelon-control` ↔ `suna`
- **Shared APIs:** openai, stripe
- **Shared Integrations:** aws, supabase, webhook

### `echelon-control` ↔ `suna-kortix`
- **Shared APIs:** openai, stripe
- **Shared Integrations:** aws, supabase, webhook

### `echelon-control` ↔ `sunafusion-agent-shell`
- **Shared APIs:** openai, stripe
- **Shared Integrations:** aws, supabase, webhook

### `four-visions-big-commerce` ↔ `governance-hub`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, vercel, webhook

### `governance-hub` ↔ `suna`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, vercel, webhook

### `governance-hub` ↔ `suna-kortix`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, vercel, webhook

### `governance-hub` ↔ `sunafusion-agent-shell`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot` ↔ `onsite-affiliate`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot` ↔ `suna`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot` ↔ `suna-kortix`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot-latest-review` ↔ `onsite-affiliate`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot-latest-review` ↔ `suna`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot-latest-review` ↔ `suna-kortix`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, vercel, webhook

### `agentic-control-plane-kit` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `agentic-control-plane-kit` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `api-docs-template` ↔ `creator-licensing-hub`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `api-docs-template` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `api-docs-template` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `creator-licensing-hub` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `debt-freedom-pathway-landing` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `debt-freedom-pathway-landing` ↔ `onsite-affiliate`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `debt-freedom-pathway-landing` ↔ `suna`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `debt-freedom-pathway-landing` ↔ `suna-kortix`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `debt-freedom-pathway-landing` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `onsite-affiliate` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `suna` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `suna-kortix` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `sunafusion-agent-shell` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `forecast-flex-wizard` ↔ `onsite-affiliate`
- **Shared Tables:** `profiles`, `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** redis, supabase

### `governance-hub` ↔ `lovable-audit`
- **Shared Tables:** `profiles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase, vercel, webhook

### `echelon-control` ↔ `mom-walk-connect`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** aws, supabase, webhook

### `ciq-automations` ↔ `lovable-audit`
- **Shared Tables:** `brands`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `influencer-iq-flow-analysis` ↔ `lovable-audit`
- **Shared Tables:** `brands`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `influencer-iq-flow-analysis` ↔ `mom-walk-connect`
- **Shared Tables:** `brands`, `email_templates`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase, webhook

### `influencer-iq-flow-analysis` ↔ `onsite-affiliate`
- **Shared Tables:** `brands`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** openai
- **Shared Integrations:** supabase, webhook

### `creator-licensing-hub` ↔ `live-nation-demo`
- **Shared Tables:** `analytics_events`, `analytics_sessions`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `echelon-control` ↔ `temp-creator-repo`
- **Shared Tables:** `analytics_events`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** aws, supabase, webhook

### `four-visions-big-commerce` ↔ `lovable-audit`
- **Shared Tables:** `products`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase, vercel, webhook

### `agentic-control-plane-kit` ↔ `creator-sold-api-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, redis, vercel

### `agentic-control-plane-kit` ↔ `creatoriq-invoice-hub`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, supabase, vercel

### `agentic-control-plane-kit` ↔ `gig-whisperer-sheet`
- **Shared APIs:** creatoriq, stripe
- **Shared Integrations:** supabase, vercel

### `agentic-control-plane-kit` ↔ `key-vault-executor`
- **Shared APIs:** creatoriq, stripe
- **Shared Integrations:** supabase, webhook

### `agentic-control-plane-kit` ↔ `lovable-audit`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, vercel, webhook

### `ciq-automations` ↔ `creatorgift-backend`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, redis, webhook

### `ciq-automations` ↔ `creatorgift-backend-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, redis, webhook

### `ciq-automations` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `ciq-automations` ↔ `tga-crm`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `creator-licensing-hub` ↔ `creator-sold-api-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, redis, vercel

### `creator-licensing-hub` ↔ `creatoriq-invoice-hub`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, supabase, vercel

### `creator-licensing-hub` ↔ `influencer-iq-flow-analysis`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `creator-licensing-hub` ↔ `lovable-audit`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, vercel, webhook

### `creator-licensing-hub` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `creator-licensing-hub` ↔ `tga-crm`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `creator-sold-api-analysis` ↔ `creatorgift-backend`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, redis, vercel

### `creator-sold-api-analysis` ↔ `creatorgift-backend-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, redis, vercel

### `creator-sold-api-analysis` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, redis, vercel

### `creatorgift-backend` ↔ `edge-bot`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel, webhook

### `creatorgift-backend` ↔ `edge-bot-latest-review`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel, webhook

### `creatorgift-backend-analysis` ↔ `edge-bot`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel, webhook

### `creatorgift-backend-analysis` ↔ `edge-bot-latest-review`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel, webhook

### `creatoriq-invoice-hub` ↔ `edge-bot`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, supabase, vercel

### `creatoriq-invoice-hub` ↔ `edge-bot-latest-review`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, supabase, vercel

### `creatoriq-invoice-hub` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, supabase, vercel

### `edge-bot` ↔ `influencer-iq-flow-analysis`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `edge-bot` ↔ `lovable-audit`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, vercel, webhook

### `edge-bot` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `edge-bot` ↔ `tga-crm`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `edge-bot-latest-review` ↔ `influencer-iq-flow-analysis`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `edge-bot-latest-review` ↔ `lovable-audit`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, vercel, webhook

### `edge-bot-latest-review` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `edge-bot-latest-review` ↔ `tga-crm`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `gig-whisperer-sheet` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq, stripe
- **Shared Integrations:** supabase, vercel

### `influencer-iq-flow-analysis` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `influencer-iq-flow-analysis` ↔ `tga-crm`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `key-vault-executor` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq, stripe
- **Shared Integrations:** supabase, webhook

### `lovable-audit` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, vercel, webhook

### `sunafusion-agent-shell` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `sunafusion-agent-shell` ↔ `tga-crm`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `textweaver-gigcraft` ↔ `tga-crm`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `agentic-control-plane-kit` ↔ `echelon-control`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, webhook

### `Shopify_App` ↔ `agentic-control-plane-kit`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, webhook

### `api-docs-template` ↔ `echelon-control`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, webhook

### `Shopify_App` ↔ `api-docs-template`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, webhook

### `Shopify_App` ↔ `ciq-automations`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, webhook

### `Shopify_App` ↔ `echelon-control`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, webhook

### `Shopify_App` ↔ `four-visions-big-commerce`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, webhook

### `Shopify_App` ↔ `governance-hub`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, webhook

### `Shopify_App` ↔ `onsite-affiliate`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, webhook

### `Shopify_App` ↔ `suna`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, webhook

### `Shopify_App` ↔ `suna-kortix`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, webhook

### `Shopify_App` ↔ `sunafusion-agent-shell`
- **Shared APIs:** stripe
- **Shared Integrations:** aws, supabase, webhook

### `creator-licensing-hub` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, vercel

### `echelon-control` ↔ `edge-bot`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, webhook

### `echelon-control` ↔ `edge-bot-latest-review`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, webhook

### `edge-bot` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, vercel

### `edge-bot-latest-review` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, vercel

### `onsite-affiliate` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, vercel

### `suna` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, vercel

### `suna-kortix` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, vercel

### `sunafusion-agent-shell` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, vercel

### `agentic-control-plane-kit` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `api-docs-template` ↔ `edge-bot`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `api-docs-template` ↔ `edge-bot-latest-review`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `api-docs-template` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `ciq-automations` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, redis, supabase, webhook

### `ciq-automations` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, supabase, webhook

### `creator-licensing-hub` ↔ `governance-hub`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `creator-licensing-hub` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `debt-freedom-pathway-landing` ↔ `edge-bot`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `debt-freedom-pathway-landing` ↔ `edge-bot-latest-review`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `debt-freedom-pathway-landing` ↔ `governance-hub`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `debt-freedom-pathway-landing` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot` ↔ `governance-hub`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot-latest-review` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot-latest-review` ↔ `governance-hub`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot-latest-review` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `edge-bot-latest-review` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `governance-hub` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `mom-walk-connect` ↔ `suna`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `mom-walk-connect` ↔ `suna-kortix`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `mom-walk-connect` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `mom-walk-connect` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, supabase, vercel, webhook

### `api-docs-template` ↔ `creatorgift-backend`
- **Shared Integrations:** aws, redis, vercel, webhook

### `api-docs-template` ↔ `creatorgift-backend-analysis`
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend` ↔ `onsite-affiliate`
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend` ↔ `suna`
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend` ↔ `suna-kortix`
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend-analysis` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend-analysis` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend-analysis` ↔ `onsite-affiliate`
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend-analysis` ↔ `suna`
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend-analysis` ↔ `suna-kortix`
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend-analysis` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, vercel, webhook

### `api-ninja-gateway` ↔ `onsite-affiliate`
- **Shared Tables:** `profiles`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `governance-hub`
- **Shared Tables:** `profiles`, `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `mom-walk-connect`
- **Shared Tables:** `profiles`, `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `echelon-control` ↔ `live-nation-demo`
- **Shared Tables:** `analytics_events`, `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `text-safety-watchdog`
- **Shared Tables:** `clients`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `mom-walk-connect`
- **Shared Tables:** `surveys`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase, vercel

### `four-visions-big-commerce` ↔ `live-nation-demo`
- **Shared Tables:** `analytics_events`, `analytics_sessions`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `live-nation-demo` ↔ `temp-creator-repo`
- **Shared Tables:** `analytics_events`, `analytics_sessions`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `loan-chat-wizard-api` ↔ `sunafusion-agent-shell`
- **Shared Tables:** `leads`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `loan-chat-wizard-api` ↔ `mom-walk-connect`
- **Shared Tables:** `conversations`, `messages`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `agentic-control-plane-kit` ↔ `creatorgift-admin-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `agentic-control-plane-kit` ↔ `creatorgift-onboarding-app`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `agentic-control-plane-kit` ↔ `influencer-iq-flow-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `agentic-control-plane-kit` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `agentic-control-plane-kit` ↔ `tga-crm`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `ciq-automations` ↔ `creator-sold-api-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, redis

### `ciq-automations` ↔ `creatoriq-invoice-hub`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, supabase

### `ciq-automations` ↔ `gig-whisperer-sheet`
- **Shared APIs:** creatoriq, stripe
- **Shared Integrations:** supabase

### `creator-licensing-hub` ↔ `creatorgift-admin-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creator-licensing-hub` ↔ `creatorgift-onboarding-app`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creator-licensing-hub` ↔ `gig-whisperer-sheet`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, vercel

### `creator-licensing-hub` ↔ `key-vault-executor`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `creator-sold-api-analysis` ↔ `creatorgift-admin-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creator-sold-api-analysis` ↔ `creatorgift-onboarding-app`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creator-sold-api-analysis` ↔ `creatoriq-invoice-hub`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creator-sold-api-analysis` ↔ `edge-bot`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creator-sold-api-analysis` ↔ `edge-bot-latest-review`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `creatorgift-backend`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `creatorgift-backend-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `creatorgift-onboarding-app`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `creatoriq-invoice-hub`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `edge-bot`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `edge-bot-latest-review`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatorgift-backend` ↔ `creatorgift-onboarding-app`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatorgift-backend` ↔ `creatoriq-invoice-hub`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatorgift-backend` ↔ `lovable-audit`
- **Shared APIs:** creatoriq
- **Shared Integrations:** vercel, webhook

### `creatorgift-backend-analysis` ↔ `creatorgift-onboarding-app`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatorgift-backend-analysis` ↔ `creatoriq-invoice-hub`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatorgift-backend-analysis` ↔ `lovable-audit`
- **Shared APIs:** creatoriq
- **Shared Integrations:** vercel, webhook

### `creatorgift-onboarding-app` ↔ `creatoriq-invoice-hub`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `edge-bot`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `edge-bot-latest-review`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatoriq-invoice-hub` ↔ `gig-whisperer-sheet`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, vercel

### `creatoriq-invoice-hub` ↔ `lovable-audit`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, vercel

### `edge-bot` ↔ `gig-whisperer-sheet`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, vercel

### `edge-bot` ↔ `key-vault-executor`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `edge-bot-latest-review` ↔ `gig-whisperer-sheet`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, vercel

### `edge-bot-latest-review` ↔ `key-vault-executor`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `gig-whisperer-sheet` ↔ `key-vault-executor`
- **Shared APIs:** creatoriq, stripe
- **Shared Integrations:** supabase

### `gig-whisperer-sheet` ↔ `lovable-audit`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, vercel

### `influencer-iq-flow-analysis` ↔ `key-vault-executor`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `key-vault-executor` ↔ `lovable-audit`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `key-vault-executor` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `key-vault-executor` ↔ `tga-crm`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `lovable-audit` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `lovable-audit` ↔ `tga-crm`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `api-docs-template` ↔ `gig-whisperer-sheet`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, vercel

### `api-docs-template` ↔ `key-vault-executor`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, webhook

### `echelon-control` ↔ `key-vault-executor`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, webhook

### `four-visions-big-commerce` ↔ `gig-whisperer-sheet`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, vercel

### `four-visions-big-commerce` ↔ `key-vault-executor`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, webhook

### `gig-whisperer-sheet` ↔ `governance-hub`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, vercel

### `gig-whisperer-sheet` ↔ `onsite-affiliate`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, vercel

### `gig-whisperer-sheet` ↔ `suna`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, vercel

### `gig-whisperer-sheet` ↔ `suna-kortix`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, vercel

### `governance-hub` ↔ `key-vault-executor`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, webhook

### `key-vault-executor` ↔ `onsite-affiliate`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, webhook

### `Shopify_App` ↔ `key-vault-executor`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, webhook

### `key-vault-executor` ↔ `suna`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, webhook

### `key-vault-executor` ↔ `suna-kortix`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, webhook

### `ciq-automations` ↔ `html-to-visualize-food`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase

### `ciq-automations` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase

### `creator-licensing-hub` ↔ `html-to-visualize-food`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase

### `echelon-control` ↔ `html-to-visualize-food`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase

### `echelon-control` ↔ `influencer-iq-flow-analysis`
- **Shared APIs:** openai
- **Shared Integrations:** supabase, webhook

### `echelon-control` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase

### `echelon-control` ↔ `textweaver-gigcraft`
- **Shared APIs:** openai
- **Shared Integrations:** supabase, webhook

### `echelon-control` ↔ `tga-crm`
- **Shared APIs:** openai
- **Shared Integrations:** supabase, webhook

### `edge-bot` ↔ `html-to-visualize-food`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase

### `edge-bot-latest-review` ↔ `html-to-visualize-food`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase

### `html-to-visualize-food` ↔ `onsite-affiliate`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase

### `html-to-visualize-food` ↔ `suna`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase

### `html-to-visualize-food` ↔ `suna-kortix`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase

### `html-to-visualize-food` ↔ `sunafusion-agent-shell`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase

### `html-to-visualize-food` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase

### `influencer-iq-flow-analysis` ↔ `suna`
- **Shared APIs:** openai
- **Shared Integrations:** supabase, webhook

### `influencer-iq-flow-analysis` ↔ `suna-kortix`
- **Shared APIs:** openai
- **Shared Integrations:** supabase, webhook

### `onsite-affiliate` ↔ `textweaver-gigcraft`
- **Shared APIs:** openai
- **Shared Integrations:** supabase, webhook

### `onsite-affiliate` ↔ `tga-crm`
- **Shared APIs:** openai
- **Shared Integrations:** supabase, webhook

### `suna` ↔ `textweaver-gigcraft`
- **Shared APIs:** openai
- **Shared Integrations:** supabase, webhook

### `suna` ↔ `tga-crm`
- **Shared APIs:** openai
- **Shared Integrations:** supabase, webhook

### `suna-kortix` ↔ `textweaver-gigcraft`
- **Shared APIs:** openai
- **Shared Integrations:** supabase, webhook

### `suna-kortix` ↔ `tga-crm`
- **Shared APIs:** openai
- **Shared Integrations:** supabase, webhook

### `agentic-control-plane-kit` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, supabase, vercel

### `api-docs-template` ↔ `creatoriq-invoice-hub`
- **Shared Integrations:** aws, supabase, vercel

### `api-docs-template` ↔ `lovable-audit`
- **Shared Integrations:** supabase, vercel, webhook

### `api-docs-template` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, supabase, vercel

### `Shopify_App` ↔ `creator-licensing-hub`
- **Shared Integrations:** aws, supabase, webhook

### `creatoriq-invoice-hub` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, supabase, vercel

### `creatoriq-invoice-hub` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, supabase, vercel

### `creatoriq-invoice-hub` ↔ `governance-hub`
- **Shared Integrations:** aws, supabase, vercel

### `creatoriq-invoice-hub` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, supabase, vercel

### `creatoriq-invoice-hub` ↔ `onsite-affiliate`
- **Shared Integrations:** aws, supabase, vercel

### `creatoriq-invoice-hub` ↔ `suna`
- **Shared Integrations:** aws, supabase, vercel

### `creatoriq-invoice-hub` ↔ `suna-kortix`
- **Shared Integrations:** aws, supabase, vercel

### `creatoriq-invoice-hub` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, supabase, vercel

### `creatoriq-invoice-hub` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, supabase, vercel

### `debt-freedom-pathway-landing` ↔ `echelon-control`
- **Shared Integrations:** aws, supabase, webhook

### `debt-freedom-pathway-landing` ↔ `lovable-audit`
- **Shared Integrations:** supabase, vercel, webhook

### `Shopify_App` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, supabase, webhook

### `debt-freedom-pathway-landing` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, supabase, vercel

### `Shopify_App` ↔ `edge-bot`
- **Shared Integrations:** aws, supabase, webhook

### `Shopify_App` ↔ `edge-bot-latest-review`
- **Shared Integrations:** aws, supabase, webhook

### `four-visions-big-commerce` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, supabase, vercel

### `governance-hub` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, supabase, vercel

### `lovable-audit` ↔ `suna`
- **Shared Integrations:** supabase, vercel, webhook

### `lovable-audit` ↔ `suna-kortix`
- **Shared Integrations:** supabase, vercel, webhook

### `lovable-audit` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase, vercel, webhook

### `Shopify_App` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, supabase, webhook

### `mom-walk-connect` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, supabase, vercel

### `Shopify_App` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, supabase, webhook

### `temp-creator-repo` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, supabase, vercel

### `agentic-control-plane-kit` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `agentic-control-plane-kit` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, redis, vercel

### `agentic-control-plane-kit` ↔ `scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `api-docs-template` ↔ `creator-sold-api-analysis`
- **Shared Integrations:** aws, redis, vercel

### `api-docs-template` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `api-docs-template` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, redis, vercel

### `api-docs-template` ↔ `scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `creator-licensing-hub` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `creator-licensing-hub` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, redis, vercel

### `creator-licensing-hub` ↔ `scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `creator-sold-api-analysis` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, redis, vercel

### `creator-sold-api-analysis` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, redis, vercel

### `creator-sold-api-analysis` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `creator-sold-api-analysis` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, redis, vercel

### `creator-sold-api-analysis` ↔ `onsite-affiliate`
- **Shared Integrations:** aws, redis, vercel

### `creator-sold-api-analysis` ↔ `scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `creator-sold-api-analysis` ↔ `suna`
- **Shared Integrations:** aws, redis, vercel

### `creator-sold-api-analysis` ↔ `suna-kortix`
- **Shared Integrations:** aws, redis, vercel

### `creator-sold-api-analysis` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, vercel

### `creatorgift-backend` ↔ `governance-hub`
- **Shared Integrations:** aws, vercel, webhook

### `creatorgift-backend` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `creatorgift-backend` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, redis, vercel

### `creatorgift-backend` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, vercel, webhook

### `creatorgift-backend` ↔ `scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `creatorgift-backend-analysis` ↔ `governance-hub`
- **Shared Integrations:** aws, vercel, webhook

### `creatorgift-backend-analysis` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `creatorgift-backend-analysis` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, redis, vercel

### `creatorgift-backend-analysis` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, vercel, webhook

### `creatorgift-backend-analysis` ↔ `scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `debt-freedom-pathway-landing` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `debt-freedom-pathway-landing` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, redis, vercel

### `debt-freedom-pathway-landing` ↔ `scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `four-visions-big-commerce` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `four-visions-big-commerce` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, redis, vercel

### `four-visions-big-commerce` ↔ `scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `hfc-scoring-engine` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, redis, vercel

### `hfc-scoring-engine` ↔ `onsite-affiliate`
- **Shared Integrations:** aws, redis, vercel

### `hfc-scoring-engine` ↔ `scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `hfc-scoring-engine` ↔ `suna`
- **Shared Integrations:** aws, redis, vercel

### `hfc-scoring-engine` ↔ `suna-kortix`
- **Shared Integrations:** aws, redis, vercel

### `hfc-scoring-engine` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** aws, redis, vercel

### `hfc-scoring-engine` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, vercel

### `lead-scoring-documentation` ↔ `onsite-affiliate`
- **Shared Integrations:** aws, redis, vercel

### `lead-scoring-documentation` ↔ `scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `lead-scoring-documentation` ↔ `suna`
- **Shared Integrations:** aws, redis, vercel

### `lead-scoring-documentation` ↔ `suna-kortix`
- **Shared Integrations:** aws, redis, vercel

### `lead-scoring-documentation` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** aws, redis, vercel

### `lead-scoring-documentation` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, vercel

### `onsite-affiliate` ↔ `scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `scoring-engine` ↔ `suna`
- **Shared Integrations:** aws, redis, vercel

### `scoring-engine` ↔ `suna-kortix`
- **Shared Integrations:** aws, redis, vercel

### `scoring-engine` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** aws, redis, vercel

### `scoring-engine` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, vercel

### `api-ninja-gateway` ↔ `forecast-flex-wizard`
- **Shared Tables:** `profiles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `governance-hub`
- **Shared Tables:** `profiles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `lifetrack`
- **Shared Tables:** `profiles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `lovable-audit`
- **Shared Tables:** `profiles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `mom-walk-connect`
- **Shared Tables:** `profiles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `lifetrack`
- **Shared Tables:** `profiles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `lovable-audit`
- **Shared Tables:** `profiles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `governance-hub` ↔ `lifetrack`
- **Shared Tables:** `profiles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `lifetrack` ↔ `lovable-audit`
- **Shared Tables:** `profiles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `lifetrack` ↔ `mom-walk-connect`
- **Shared Tables:** `profiles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `lifetrack` ↔ `onsite-affiliate`
- **Shared Tables:** `profiles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `echelon-control`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `forecast-flex-wizard`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `governance-hub`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `guild-landing-system`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `live-nation-demo`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `mom-walk-connect`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `onsite-affiliate`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `echelon-control` ↔ `forecast-flex-wizard`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `echelon-control` ↔ `guild-landing-system`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `guild-landing-system`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `live-nation-demo`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `governance-hub` ↔ `guild-landing-system`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `governance-hub` ↔ `live-nation-demo`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `live-nation-demo`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `mom-walk-connect`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `onsite-affiliate`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `live-nation-demo` ↔ `mom-walk-connect`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `live-nation-demo` ↔ `onsite-affiliate`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `forecast-flex-wizard`
- **Shared Tables:** `clients`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `text-safety-watchdog`
- **Shared Tables:** `clients`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `creator-licensing-hub` ↔ `kitchen-capital-connect`
- **Shared Tables:** `analytics_events`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `echelon-control` ↔ `kitchen-capital-connect`
- **Shared Tables:** `analytics_events`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `four-visions-big-commerce` ↔ `kitchen-capital-connect`
- **Shared Tables:** `analytics_events`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `live-nation-demo`
- **Shared Tables:** `analytics_events`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `temp-creator-repo`
- **Shared Tables:** `analytics_events`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `debt-freedom-pathway-landing` ↔ `kitchen-capital-connect`
- **Shared Tables:** `leads`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `debt-freedom-pathway-landing` ↔ `loan-chat-wizard-api`
- **Shared Tables:** `leads`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `loan-chat-wizard-api`
- **Shared Tables:** `leads`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `sunafusion-agent-shell`
- **Shared Tables:** `leads`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `four-visions-big-commerce` ↔ `guild-landing-system`
- **Shared Tables:** `products`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `lovable-audit`
- **Shared Tables:** `products`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `agentic-control-plane-kit` ↔ `live-nation-demo`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `agentic-control-plane-kit` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `ciq-automations` ↔ `creatorgift-admin-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws

### `ciq-automations` ↔ `creatorgift-onboarding-app`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws

### `ciq-automations` ↔ `live-nation-demo`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `ciq-automations` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `creator-licensing-hub` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `creator-sold-api-analysis` ↔ `gig-whisperer-sheet`
- **Shared APIs:** creatoriq
- **Shared Integrations:** vercel

### `creator-sold-api-analysis` ↔ `lovable-audit`
- **Shared APIs:** creatoriq
- **Shared Integrations:** vercel

### `creatorgift-admin-analysis` ↔ `gig-whisperer-sheet`
- **Shared APIs:** creatoriq
- **Shared Integrations:** vercel

### `creatorgift-admin-analysis` ↔ `lovable-audit`
- **Shared APIs:** creatoriq
- **Shared Integrations:** vercel

### `creatorgift-backend` ↔ `gig-whisperer-sheet`
- **Shared APIs:** creatoriq
- **Shared Integrations:** vercel

### `creatorgift-backend` ↔ `influencer-iq-flow-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** webhook

### `creatorgift-backend` ↔ `key-vault-executor`
- **Shared APIs:** creatoriq
- **Shared Integrations:** webhook

### `creatorgift-backend` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq
- **Shared Integrations:** webhook

### `creatorgift-backend` ↔ `tga-crm`
- **Shared APIs:** creatoriq
- **Shared Integrations:** webhook

### `creatorgift-backend-analysis` ↔ `gig-whisperer-sheet`
- **Shared APIs:** creatoriq
- **Shared Integrations:** vercel

### `creatorgift-backend-analysis` ↔ `influencer-iq-flow-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** webhook

### `creatorgift-backend-analysis` ↔ `key-vault-executor`
- **Shared APIs:** creatoriq
- **Shared Integrations:** webhook

### `creatorgift-backend-analysis` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq
- **Shared Integrations:** webhook

### `creatorgift-backend-analysis` ↔ `tga-crm`
- **Shared APIs:** creatoriq
- **Shared Integrations:** webhook

### `creatorgift-onboarding-app` ↔ `gig-whisperer-sheet`
- **Shared APIs:** creatoriq
- **Shared Integrations:** vercel

### `creatorgift-onboarding-app` ↔ `lovable-audit`
- **Shared APIs:** creatoriq
- **Shared Integrations:** vercel

### `creatoriq-invoice-hub` ↔ `influencer-iq-flow-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `creatoriq-invoice-hub` ↔ `key-vault-executor`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `creatoriq-invoice-hub` ↔ `live-nation-demo`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `creatoriq-invoice-hub` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `creatoriq-invoice-hub` ↔ `tga-crm`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `creatoriq-invoice-hub` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `edge-bot` ↔ `live-nation-demo`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `edge-bot` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `edge-bot-latest-review` ↔ `live-nation-demo`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `edge-bot-latest-review` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `gig-whisperer-sheet` ↔ `influencer-iq-flow-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `gig-whisperer-sheet` ↔ `live-nation-demo`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `gig-whisperer-sheet` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `gig-whisperer-sheet` ↔ `tga-crm`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `gig-whisperer-sheet` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `influencer-iq-flow-analysis` ↔ `live-nation-demo`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `influencer-iq-flow-analysis` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `key-vault-executor` ↔ `live-nation-demo`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `key-vault-executor` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `live-nation-demo` ↔ `lovable-audit`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `live-nation-demo` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `live-nation-demo` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `live-nation-demo` ↔ `tga-crm`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `live-nation-demo` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `lovable-audit` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `sunafusion-agent-shell` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `textweaver-gigcraft` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `tga-crm` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `echelon-control` ↔ `gig-whisperer-sheet`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase

### `Shopify_App` ↔ `gig-whisperer-sheet`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `ciq-automations`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `ciq-feed-map`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `creator-licensing-hub`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `echelon-control`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `edge-bot`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `edge-bot-latest-review`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `html-to-visualize-food`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `influencer-iq-flow-analysis`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `loan-chat-wizard-api`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `new-api-project`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `suna`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `suna-kortix`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `sunafusion-agent-shell`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `textweaver-gigcraft`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `tga-crm`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-automations` ↔ `ciq-feed-map`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-automations` ↔ `loan-chat-wizard-api`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-automations` ↔ `new-api-project`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `NLWeb` ↔ `ciq-automations`
- **Shared APIs:** openai
- **Shared Integrations:** aws

### `ciq-feed-map` ↔ `creator-licensing-hub`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `echelon-control`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `edge-bot`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `edge-bot-latest-review`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `html-to-visualize-food`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `influencer-iq-flow-analysis`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `loan-chat-wizard-api`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `new-api-project`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `onsite-affiliate`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `suna`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `suna-kortix`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `sunafusion-agent-shell`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `textweaver-gigcraft`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `tga-crm`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `creator-licensing-hub` ↔ `loan-chat-wizard-api`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `creator-licensing-hub` ↔ `new-api-project`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `NLWeb` ↔ `creator-licensing-hub`
- **Shared APIs:** openai
- **Shared Integrations:** aws

### `echelon-control` ↔ `loan-chat-wizard-api`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `echelon-control` ↔ `new-api-project`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `NLWeb` ↔ `echelon-control`
- **Shared APIs:** openai
- **Shared Integrations:** aws

### `edge-bot` ↔ `loan-chat-wizard-api`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `edge-bot` ↔ `new-api-project`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `NLWeb` ↔ `edge-bot`
- **Shared APIs:** openai
- **Shared Integrations:** aws

### `edge-bot-latest-review` ↔ `loan-chat-wizard-api`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `edge-bot-latest-review` ↔ `new-api-project`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `NLWeb` ↔ `edge-bot-latest-review`
- **Shared APIs:** openai
- **Shared Integrations:** aws

### `html-to-visualize-food` ↔ `influencer-iq-flow-analysis`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `html-to-visualize-food` ↔ `loan-chat-wizard-api`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `html-to-visualize-food` ↔ `new-api-project`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `NLWeb` ↔ `html-to-visualize-food`
- **Shared APIs:** openai
- **Shared Integrations:** aws

### `html-to-visualize-food` ↔ `textweaver-gigcraft`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `html-to-visualize-food` ↔ `tga-crm`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `influencer-iq-flow-analysis` ↔ `loan-chat-wizard-api`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `influencer-iq-flow-analysis` ↔ `new-api-project`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `influencer-iq-flow-analysis` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `loan-chat-wizard-api` ↔ `new-api-project`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `loan-chat-wizard-api` ↔ `onsite-affiliate`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `loan-chat-wizard-api` ↔ `suna`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `loan-chat-wizard-api` ↔ `suna-kortix`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `loan-chat-wizard-api` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `loan-chat-wizard-api` ↔ `textweaver-gigcraft`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `loan-chat-wizard-api` ↔ `tga-crm`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `new-api-project` ↔ `onsite-affiliate`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `new-api-project` ↔ `suna`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `new-api-project` ↔ `suna-kortix`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `new-api-project` ↔ `sunafusion-agent-shell`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `new-api-project` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `new-api-project` ↔ `textweaver-gigcraft`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `new-api-project` ↔ `tga-crm`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `NLWeb` ↔ `onsite-affiliate`
- **Shared APIs:** openai
- **Shared Integrations:** aws

### `NLWeb` ↔ `suna`
- **Shared APIs:** openai
- **Shared Integrations:** aws

### `NLWeb` ↔ `suna-kortix`
- **Shared APIs:** openai
- **Shared Integrations:** aws

### `NLWeb` ↔ `sunafusion-agent-shell`
- **Shared APIs:** openai
- **Shared Integrations:** aws

### `NLWeb` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** aws

### `text-safety-watchdog` ↔ `textweaver-gigcraft`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `text-safety-watchdog` ↔ `tga-crm`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `agentic-control-plane-kit`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `api-docs-template`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `ciq-automations`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `creator-licensing-hub`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `creatoriq-invoice-hub`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `echelon-control`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `edge-bot`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `edge-bot-latest-review`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `governance-hub`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `onsite-affiliate`
- **Shared Integrations:** aws, supabase

### `Shopify_App` ↔ `ads-gpt-starter`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `suna`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `suna-kortix`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, supabase

### `agentic-control-plane-kit` ↔ `client-survey-hub`
- **Shared Integrations:** supabase, vercel

### `agentic-control-plane-kit` ↔ `forecast-flex-wizard`
- **Shared Integrations:** redis, supabase

### `agentic-control-plane-kit` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws, supabase

### `agentic-control-plane-kit` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `api-docs-template` ↔ `client-survey-hub`
- **Shared Integrations:** supabase, vercel

### `api-docs-template` ↔ `forecast-flex-wizard`
- **Shared Integrations:** redis, supabase

### `api-docs-template` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws, supabase

### `api-docs-template` ↔ `influencer-iq-flow-analysis`
- **Shared Integrations:** supabase, webhook

### `api-docs-template` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `api-docs-template` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase, webhook

### `api-docs-template` ↔ `tga-crm`
- **Shared Integrations:** supabase, webhook

### `ciq-automations` ↔ `forecast-flex-wizard`
- **Shared Integrations:** redis, supabase

### `ciq-automations` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `client-survey-hub` ↔ `creator-licensing-hub`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `creatoriq-invoice-hub`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `edge-bot`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `edge-bot-latest-review`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `four-visions-big-commerce`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `gig-whisperer-sheet`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `governance-hub`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `lovable-audit`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `onsite-affiliate`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `suna`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `suna-kortix`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase, vercel

### `creator-licensing-hub` ↔ `forecast-flex-wizard`
- **Shared Integrations:** redis, supabase

### `creator-licensing-hub` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `creatoriq-invoice-hub` ↔ `echelon-control`
- **Shared Integrations:** aws, supabase

### `creatoriq-invoice-hub` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws, supabase

### `Shopify_App` ↔ `creatoriq-invoice-hub`
- **Shared Integrations:** aws, supabase

### `debt-freedom-pathway-landing` ↔ `forecast-flex-wizard`
- **Shared Integrations:** redis, supabase

### `debt-freedom-pathway-landing` ↔ `gig-whisperer-sheet`
- **Shared Integrations:** supabase, vercel

### `debt-freedom-pathway-landing` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws, supabase

### `debt-freedom-pathway-landing` ↔ `influencer-iq-flow-analysis`
- **Shared Integrations:** supabase, webhook

### `debt-freedom-pathway-landing` ↔ `key-vault-executor`
- **Shared Integrations:** supabase, webhook

### `debt-freedom-pathway-landing` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `debt-freedom-pathway-landing` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase, webhook

### `debt-freedom-pathway-landing` ↔ `tga-crm`
- **Shared Integrations:** supabase, webhook

### `echelon-control` ↔ `lovable-audit`
- **Shared Integrations:** supabase, webhook

### `echelon-control` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `edge-bot` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `edge-bot-latest-review` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `forecast-flex-wizard` ↔ `four-visions-big-commerce`
- **Shared Integrations:** redis, supabase

### `forecast-flex-wizard` ↔ `suna`
- **Shared Integrations:** redis, supabase

### `forecast-flex-wizard` ↔ `suna-kortix`
- **Shared Integrations:** redis, supabase

### `forecast-flex-wizard` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** redis, supabase

### `forecast-flex-wizard` ↔ `temp-creator-repo`
- **Shared Integrations:** redis, supabase

### `four-visions-big-commerce` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws, supabase

### `four-visions-big-commerce` ↔ `influencer-iq-flow-analysis`
- **Shared Integrations:** supabase, webhook

### `four-visions-big-commerce` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `four-visions-big-commerce` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase, webhook

### `four-visions-big-commerce` ↔ `tga-crm`
- **Shared Integrations:** supabase, webhook

### `gig-whisperer-sheet` ↔ `mom-walk-connect`
- **Shared Integrations:** supabase, vercel

### `gig-whisperer-sheet` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase, vercel

### `gig-whisperer-sheet` ↔ `text-safety-watchdog`
- **Shared Integrations:** supabase, vercel

### `governance-hub` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws, supabase

### `governance-hub` ↔ `influencer-iq-flow-analysis`
- **Shared Integrations:** supabase, webhook

### `governance-hub` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `governance-hub` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase, webhook

### `governance-hub` ↔ `tga-crm`
- **Shared Integrations:** supabase, webhook

### `html-to-visualize-food` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, supabase

### `Shopify_App` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws, supabase

### `html-to-visualize-food` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, supabase

### `influencer-iq-flow-analysis` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `Shopify_App` ↔ `influencer-iq-flow-analysis`
- **Shared Integrations:** supabase, webhook

### `influencer-iq-flow-analysis` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase, webhook

### `key-vault-executor` ↔ `mom-walk-connect`
- **Shared Integrations:** supabase, webhook

### `key-vault-executor` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `key-vault-executor` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase, webhook

### `lovable-audit` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `Shopify_App` ↔ `lovable-audit`
- **Shared Integrations:** supabase, webhook

### `lovable-audit` ↔ `text-safety-watchdog`
- **Shared Integrations:** supabase, vercel

### `mom-walk-connect` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `mom-walk-connect` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase, webhook

### `mom-walk-connect` ↔ `tga-crm`
- **Shared Integrations:** supabase, webhook

### `onsite-affiliate` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `Shopify_App` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `pathfinder-financial-insights` ↔ `suna`
- **Shared Integrations:** supabase, webhook

### `pathfinder-financial-insights` ↔ `suna-kortix`
- **Shared Integrations:** supabase, webhook

### `pathfinder-financial-insights` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** supabase, webhook

### `pathfinder-financial-insights` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase, webhook

### `pathfinder-financial-insights` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase, webhook

### `pathfinder-financial-insights` ↔ `tga-crm`
- **Shared Integrations:** supabase, webhook

### `Shopify_App` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, supabase

### `Shopify_App` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase, webhook

### `Shopify_App` ↔ `tga-crm`
- **Shared Integrations:** supabase, webhook

### `temp-creator-repo` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase, webhook

### `temp-creator-repo` ↔ `tga-crm`
- **Shared Integrations:** supabase, webhook

### `agentic-control-plane-kit` ↔ `candd-adserver`
- **Shared Integrations:** aws, redis

### `agentic-control-plane-kit` ↔ `creator-sold-analysis`
- **Shared Integrations:** aws, vercel

### `agentic-control-plane-kit` ↔ `creatorgift-admin`
- **Shared Integrations:** aws, vercel

### `agentic-control-plane-kit` ↔ `engineering-hubcast`
- **Shared Integrations:** aws, redis

### `api-docs-template` ↔ `candd-adserver`
- **Shared Integrations:** aws, redis

### `api-docs-template` ↔ `creator-sold-analysis`
- **Shared Integrations:** aws, vercel

### `api-docs-template` ↔ `creatorgift-admin`
- **Shared Integrations:** aws, vercel

### `api-docs-template` ↔ `creatorgift-admin-analysis`
- **Shared Integrations:** aws, vercel

### `api-docs-template` ↔ `creatorgift-onboarding-app`
- **Shared Integrations:** aws, vercel

### `api-docs-template` ↔ `engineering-hubcast`
- **Shared Integrations:** aws, redis

### `candd-adserver` ↔ `ciq-automations`
- **Shared Integrations:** aws, redis

### `candd-adserver` ↔ `creator-licensing-hub`
- **Shared Integrations:** aws, redis

### `candd-adserver` ↔ `creator-sold-api-analysis`
- **Shared Integrations:** aws, redis

### `candd-adserver` ↔ `creatorgift-backend`
- **Shared Integrations:** aws, redis

### `candd-adserver` ↔ `creatorgift-backend-analysis`
- **Shared Integrations:** aws, redis

### `candd-adserver` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, redis

### `candd-adserver` ↔ `engineering-hubcast`
- **Shared Integrations:** aws, redis

### `candd-adserver` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, redis

### `candd-adserver` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, redis

### `candd-adserver` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, redis

### `candd-adserver` ↔ `onsite-affiliate`
- **Shared Integrations:** aws, redis

### `candd-adserver` ↔ `scoring-engine`
- **Shared Integrations:** aws, redis

### `candd-adserver` ↔ `suna`
- **Shared Integrations:** aws, redis

### `candd-adserver` ↔ `suna-kortix`
- **Shared Integrations:** aws, redis

### `candd-adserver` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** aws, redis

### `candd-adserver` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis

### `ciq-automations` ↔ `engineering-hubcast`
- **Shared Integrations:** aws, redis

### `ciq-automations` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, redis

### `ciq-automations` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, redis

### `ciq-automations` ↔ `scoring-engine`
- **Shared Integrations:** aws, redis

### `creator-licensing-hub` ↔ `creator-sold-analysis`
- **Shared Integrations:** aws, vercel

### `creator-licensing-hub` ↔ `creatorgift-admin`
- **Shared Integrations:** aws, vercel

### `creator-licensing-hub` ↔ `engineering-hubcast`
- **Shared Integrations:** aws, redis

### `creator-sold-analysis` ↔ `creator-sold-api-analysis`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `creatorgift-admin`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `creatorgift-admin-analysis`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `creatorgift-backend`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `creatorgift-backend-analysis`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `creatorgift-onboarding-app`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `creatoriq-invoice-hub`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `edge-bot`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `edge-bot-latest-review`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `governance-hub`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `onsite-affiliate`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `scoring-engine`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `suna`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `suna-kortix`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, vercel

### `creator-sold-api-analysis` ↔ `creatorgift-admin`
- **Shared Integrations:** aws, vercel

### `creator-sold-api-analysis` ↔ `engineering-hubcast`
- **Shared Integrations:** aws, redis

### `creator-sold-api-analysis` ↔ `governance-hub`
- **Shared Integrations:** aws, vercel

### `creator-sold-api-analysis` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, vercel

### `creator-sold-api-analysis` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `creatorgift-admin-analysis`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `creatorgift-backend`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `creatorgift-backend-analysis`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `creatorgift-onboarding-app`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `creatoriq-invoice-hub`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `edge-bot`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `edge-bot-latest-review`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `governance-hub`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `onsite-affiliate`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `scoring-engine`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `suna`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `suna-kortix`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `governance-hub`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `onsite-affiliate`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `scoring-engine`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `suna`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `suna-kortix`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, vercel

### `creatorgift-backend` ↔ `echelon-control`
- **Shared Integrations:** aws, webhook

### `creatorgift-backend` ↔ `engineering-hubcast`
- **Shared Integrations:** aws, redis

### `Shopify_App` ↔ `creatorgift-backend`
- **Shared Integrations:** aws, webhook

### `creatorgift-backend` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, vercel

### `creatorgift-backend-analysis` ↔ `echelon-control`
- **Shared Integrations:** aws, webhook

### `creatorgift-backend-analysis` ↔ `engineering-hubcast`
- **Shared Integrations:** aws, redis

### `Shopify_App` ↔ `creatorgift-backend-analysis`
- **Shared Integrations:** aws, webhook

### `creatorgift-backend-analysis` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `governance-hub`
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `onsite-affiliate`
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `scoring-engine`
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `suna`
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `suna-kortix`
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, vercel

### `creatoriq-invoice-hub` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, vercel

### `creatoriq-invoice-hub` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, vercel

### `creatoriq-invoice-hub` ↔ `scoring-engine`
- **Shared Integrations:** aws, vercel

### `debt-freedom-pathway-landing` ↔ `engineering-hubcast`
- **Shared Integrations:** aws, redis

### `edge-bot` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, vercel

### `edge-bot` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, vercel

### `edge-bot` ↔ `scoring-engine`
- **Shared Integrations:** aws, vercel

### `edge-bot-latest-review` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, vercel

### `edge-bot-latest-review` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, vercel

### `edge-bot-latest-review` ↔ `scoring-engine`
- **Shared Integrations:** aws, vercel

### `engineering-hubcast` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, redis

### `engineering-hubcast` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, redis

### `engineering-hubcast` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, redis

### `engineering-hubcast` ↔ `onsite-affiliate`
- **Shared Integrations:** aws, redis

### `engineering-hubcast` ↔ `scoring-engine`
- **Shared Integrations:** aws, redis

### `engineering-hubcast` ↔ `suna`
- **Shared Integrations:** aws, redis

### `engineering-hubcast` ↔ `suna-kortix`
- **Shared Integrations:** aws, redis

### `engineering-hubcast` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** aws, redis

### `engineering-hubcast` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis

### `governance-hub` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, vercel

### `governance-hub` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, vercel

### `governance-hub` ↔ `scoring-engine`
- **Shared Integrations:** aws, vercel

### `hfc-scoring-engine` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, vercel

### `hfc-scoring-engine` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, vercel

### `lead-scoring-documentation` ↔ `mom-walk-connect`
- **Shared Integrations:** aws, vercel

### `lead-scoring-documentation` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, vercel

### `mom-walk-connect` ↔ `scoring-engine`
- **Shared Integrations:** aws, vercel

### `scoring-engine` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, vercel

### `agentic-control-plane-kit` ↔ `github-app`
- **Shared Integrations:** redis, webhook

### `api-docs-template` ↔ `github-app`
- **Shared Integrations:** redis, webhook

### `ciq-automations` ↔ `github-app`
- **Shared Integrations:** redis, webhook

### `creator-licensing-hub` ↔ `github-app`
- **Shared Integrations:** redis, webhook

### `creatorgift-backend` ↔ `github-app`
- **Shared Integrations:** redis, webhook

### `creatorgift-backend-analysis` ↔ `github-app`
- **Shared Integrations:** redis, webhook

### `debt-freedom-pathway-landing` ↔ `github-app`
- **Shared Integrations:** redis, webhook

### `four-visions-big-commerce` ↔ `github-app`
- **Shared Integrations:** redis, webhook

### `github-app` ↔ `onsite-affiliate`
- **Shared Integrations:** redis, webhook

### `github-app` ↔ `suna`
- **Shared Integrations:** redis, webhook

### `github-app` ↔ `suna-kortix`
- **Shared Integrations:** redis, webhook

### `github-app` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** redis, webhook

### `github-app` ↔ `temp-creator-repo`
- **Shared Integrations:** redis, webhook

### `creator-sold-api-analysis` ↔ `influencer-iq-flow-analysis`
- **Shared APIs:** creatoriq

### `creator-sold-api-analysis` ↔ `key-vault-executor`
- **Shared APIs:** creatoriq

### `creator-sold-api-analysis` ↔ `live-nation-demo`
- **Shared APIs:** creatoriq

### `creator-sold-api-analysis` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq

### `creator-sold-api-analysis` ↔ `tga-crm`
- **Shared APIs:** creatoriq

### `creator-sold-api-analysis` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq

### `creatorgift-admin-analysis` ↔ `influencer-iq-flow-analysis`
- **Shared APIs:** creatoriq

### `creatorgift-admin-analysis` ↔ `key-vault-executor`
- **Shared APIs:** creatoriq

### `creatorgift-admin-analysis` ↔ `live-nation-demo`
- **Shared APIs:** creatoriq

### `creatorgift-admin-analysis` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq

### `creatorgift-admin-analysis` ↔ `tga-crm`
- **Shared APIs:** creatoriq

### `creatorgift-admin-analysis` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq

### `creatorgift-backend` ↔ `live-nation-demo`
- **Shared APIs:** creatoriq

### `creatorgift-backend` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq

### `creatorgift-backend-analysis` ↔ `live-nation-demo`
- **Shared APIs:** creatoriq

### `creatorgift-backend-analysis` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq

### `creatorgift-onboarding-app` ↔ `influencer-iq-flow-analysis`
- **Shared APIs:** creatoriq

### `creatorgift-onboarding-app` ↔ `key-vault-executor`
- **Shared APIs:** creatoriq

### `creatorgift-onboarding-app` ↔ `live-nation-demo`
- **Shared APIs:** creatoriq

### `creatorgift-onboarding-app` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq

### `creatorgift-onboarding-app` ↔ `tga-crm`
- **Shared APIs:** creatoriq

### `creatorgift-onboarding-app` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq

### `agentic-control-plane-kit` ↔ `temp-wp-repo`
- **Shared APIs:** stripe

### `api-docs-template` ↔ `temp-wp-repo`
- **Shared APIs:** stripe

### `ciq-automations` ↔ `temp-wp-repo`
- **Shared APIs:** stripe

### `echelon-control` ↔ `temp-wp-repo`
- **Shared APIs:** stripe

### `four-visions-big-commerce` ↔ `temp-wp-repo`
- **Shared APIs:** stripe

### `gig-whisperer-sheet` ↔ `temp-wp-repo`
- **Shared APIs:** stripe

### `governance-hub` ↔ `temp-wp-repo`
- **Shared APIs:** stripe

### `key-vault-executor` ↔ `temp-wp-repo`
- **Shared APIs:** stripe

### `onsite-affiliate` ↔ `temp-wp-repo`
- **Shared APIs:** stripe

### `Shopify_App` ↔ `temp-wp-repo`
- **Shared APIs:** stripe

### `suna` ↔ `temp-wp-repo`
- **Shared APIs:** stripe

### `suna-kortix` ↔ `temp-wp-repo`
- **Shared APIs:** stripe

### `sunafusion-agent-shell` ↔ `temp-wp-repo`
- **Shared APIs:** stripe

### `NLWeb` ↔ `api-ninja-gateway`
- **Shared APIs:** openai

### `NLWeb` ↔ `ciq-feed-map`
- **Shared APIs:** openai

### `NLWeb` ↔ `influencer-iq-flow-analysis`
- **Shared APIs:** openai

### `NLWeb` ↔ `loan-chat-wizard-api`
- **Shared APIs:** openai

### `NLWeb` ↔ `new-api-project`
- **Shared APIs:** openai

### `NLWeb` ↔ `textweaver-gigcraft`
- **Shared APIs:** openai

### `NLWeb` ↔ `tga-crm`
- **Shared APIs:** openai

### `ads-gpt-starter` ↔ `api-ninja-gateway`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `brand-connect-hub`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `ciq-feed-map`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `client-survey-hub`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `creator-licensing-harmony`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `forecast-flex-wizard`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `gig-whisperer-sheet`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `guild-landing-system`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `influencer-iq-flow-analysis`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `key-vault-executor`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `live-nation-demo`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `lovable-audit`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `tga-crm`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `agentic-control-plane-kit` ↔ `api-ninja-gateway`
- **Shared Integrations:** supabase

### `agentic-control-plane-kit` ↔ `brand-connect-hub`
- **Shared Integrations:** supabase

### `agentic-control-plane-kit` ↔ `ciq-feed-map`
- **Shared Integrations:** supabase

### `agentic-control-plane-kit` ↔ `creator-licensing-harmony`
- **Shared Integrations:** supabase

### `agentic-control-plane-kit` ↔ `guild-landing-system`
- **Shared Integrations:** supabase

### `agentic-control-plane-kit` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `agentic-control-plane-kit` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `agentic-control-plane-kit` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `agentic-control-plane-kit` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `agentic-control-plane-kit` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `agentic-control-plane-kit` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `api-docs-template` ↔ `api-ninja-gateway`
- **Shared Integrations:** supabase

### `api-docs-template` ↔ `brand-connect-hub`
- **Shared Integrations:** supabase

### `api-docs-template` ↔ `ciq-feed-map`
- **Shared Integrations:** supabase

### `api-docs-template` ↔ `creator-licensing-harmony`
- **Shared Integrations:** supabase

### `api-docs-template` ↔ `guild-landing-system`
- **Shared Integrations:** supabase

### `api-docs-template` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `api-docs-template` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `api-docs-template` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `api-docs-template` ↔ `live-nation-demo`
- **Shared Integrations:** supabase

### `api-docs-template` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `api-docs-template` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `api-docs-template` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `api-docs-template` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `brand-connect-hub`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `client-survey-hub`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `creator-licensing-harmony`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `creatoriq-invoice-hub`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `four-visions-big-commerce`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `gig-whisperer-sheet`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `guild-landing-system`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `key-vault-executor`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `live-nation-demo`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `Shopify_App` ↔ `api-ninja-gateway`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `ciq-automations`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `ciq-feed-map`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `client-survey-hub`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `creator-licensing-harmony`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `creator-licensing-hub`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `creatoriq-invoice-hub`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `edge-bot`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `edge-bot-latest-review`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `four-visions-big-commerce`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `gig-whisperer-sheet`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `html-to-visualize-food`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `influencer-iq-flow-analysis`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `key-vault-executor`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `lovable-audit`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `Shopify_App` ↔ `brand-connect-hub`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `suna`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `suna-kortix`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `text-safety-watchdog`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `tga-crm`
- **Shared Integrations:** supabase

### `brand-connect-hub` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `ciq-automations` ↔ `client-survey-hub`
- **Shared Integrations:** supabase

### `ciq-automations` ↔ `creator-licensing-harmony`
- **Shared Integrations:** supabase

### `ciq-automations` ↔ `guild-landing-system`
- **Shared Integrations:** supabase

### `ciq-automations` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `ciq-automations` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `ciq-automations` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `ciq-automations` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `client-survey-hub`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `creator-licensing-harmony`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `creatoriq-invoice-hub`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `forecast-flex-wizard`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `four-visions-big-commerce`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `gig-whisperer-sheet`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `governance-hub`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `guild-landing-system`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `key-vault-executor`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `live-nation-demo`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `lovable-audit`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `mom-walk-connect`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `Shopify_App` ↔ `ciq-feed-map`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `creator-licensing-harmony`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `echelon-control`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `guild-landing-system`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `html-to-visualize-food`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `influencer-iq-flow-analysis`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `key-vault-executor`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `live-nation-demo`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `Shopify_App` ↔ `client-survey-hub`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `tga-crm`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `creator-licensing-hub`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `creatoriq-invoice-hub`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `echelon-control`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `edge-bot`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `edge-bot-latest-review`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `forecast-flex-wizard`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `four-visions-big-commerce`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `gig-whisperer-sheet`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `governance-hub`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `guild-landing-system`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `html-to-visualize-food`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `influencer-iq-flow-analysis`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `key-vault-executor`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `live-nation-demo`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `lovable-audit`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `mom-walk-connect`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `onsite-affiliate`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `Shopify_App` ↔ `creator-licensing-harmony`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `suna`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `suna-kortix`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `text-safety-watchdog`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `tga-crm`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `creator-licensing-hub` ↔ `guild-landing-system`
- **Shared Integrations:** supabase

### `creator-licensing-hub` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `creator-licensing-hub` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `creator-licensing-hub` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `creatoriq-invoice-hub` ↔ `forecast-flex-wizard`
- **Shared Integrations:** supabase

### `creatoriq-invoice-hub` ↔ `guild-landing-system`
- **Shared Integrations:** supabase

### `creatoriq-invoice-hub` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `creatoriq-invoice-hub` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `creatoriq-invoice-hub` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `creatoriq-invoice-hub` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `creatoriq-invoice-hub` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `creatoriq-invoice-hub` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `creatoriq-invoice-hub` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `debt-freedom-pathway-landing` ↔ `guild-landing-system`
- **Shared Integrations:** supabase

### `debt-freedom-pathway-landing` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `debt-freedom-pathway-landing` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `debt-freedom-pathway-landing` ↔ `live-nation-demo`
- **Shared Integrations:** supabase

### `debt-freedom-pathway-landing` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `debt-freedom-pathway-landing` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `debt-freedom-pathway-landing` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `echelon-control` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `echelon-control` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `echelon-control` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `echelon-control` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `edge-bot` ↔ `forecast-flex-wizard`
- **Shared Integrations:** supabase

### `edge-bot` ↔ `guild-landing-system`
- **Shared Integrations:** supabase

### `edge-bot` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `edge-bot` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `edge-bot` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `edge-bot` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `edge-bot-latest-review` ↔ `forecast-flex-wizard`
- **Shared Integrations:** supabase

### `edge-bot-latest-review` ↔ `guild-landing-system`
- **Shared Integrations:** supabase

### `edge-bot-latest-review` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `edge-bot-latest-review` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `edge-bot-latest-review` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `edge-bot-latest-review` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `gig-whisperer-sheet`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `html-to-visualize-food`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `influencer-iq-flow-analysis`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `key-vault-executor`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `Shopify_App` ↔ `forecast-flex-wizard`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `tga-crm`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `four-visions-big-commerce` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `four-visions-big-commerce` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `four-visions-big-commerce` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `four-visions-big-commerce` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `four-visions-big-commerce` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `four-visions-big-commerce` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `gig-whisperer-sheet` ↔ `guild-landing-system`
- **Shared Integrations:** supabase

### `gig-whisperer-sheet` ↔ `html-to-visualize-food`
- **Shared Integrations:** supabase

### `gig-whisperer-sheet` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `gig-whisperer-sheet` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `gig-whisperer-sheet` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `gig-whisperer-sheet` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `gig-whisperer-sheet` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `gig-whisperer-sheet` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `gig-whisperer-sheet` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `governance-hub` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `governance-hub` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `governance-hub` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `governance-hub` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `governance-hub` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `governance-hub` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `html-to-visualize-food`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `influencer-iq-flow-analysis`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `key-vault-executor`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `Shopify_App` ↔ `guild-landing-system`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `suna`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `suna-kortix`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `text-safety-watchdog`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `tga-crm`
- **Shared Integrations:** supabase

### `guild-landing-system` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `html-to-visualize-food` ↔ `key-vault-executor`
- **Shared Integrations:** supabase

### `html-to-visualize-food` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `html-to-visualize-food` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `html-to-visualize-food` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `html-to-visualize-food` ↔ `live-nation-demo`
- **Shared Integrations:** supabase

### `html-to-visualize-food` ↔ `lovable-audit`
- **Shared Integrations:** supabase

### `html-to-visualize-food` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `html-to-visualize-food` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `html-to-visualize-food` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `influencer-iq-flow-analysis` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `influencer-iq-flow-analysis` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `influencer-iq-flow-analysis` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `influencer-iq-flow-analysis` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `key-vault-executor` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `key-vault-executor` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `key-vault-executor` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `key-vault-executor` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `key-vault-executor` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `key-vault-executor` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `key-vault-executor` ↔ `text-safety-watchdog`
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `lovable-audit`
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `mom-walk-connect`
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `onsite-affiliate`
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `Shopify_App` ↔ `kitchen-capital-connect`
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `suna`
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `suna-kortix`
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `text-safety-watchdog`
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `tga-crm`
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `lifetrack` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `lifetrack` ↔ `live-nation-demo`
- **Shared Integrations:** supabase

### `lifetrack` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `lifetrack` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `lifetrack` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `lifetrack` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `Shopify_App` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `lifetrack` ↔ `suna`
- **Shared Integrations:** supabase

### `lifetrack` ↔ `suna-kortix`
- **Shared Integrations:** supabase

### `lifetrack` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** supabase

### `lifetrack` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase

### `lifetrack` ↔ `text-safety-watchdog`
- **Shared Integrations:** supabase

### `lifetrack` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase

### `lifetrack` ↔ `tga-crm`
- **Shared Integrations:** supabase

### `lifetrack` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `live-nation-demo`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `lovable-audit`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `mom-walk-connect`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `onsite-affiliate`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `Shopify_App` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `suna`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `suna-kortix`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `text-safety-watchdog`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `tga-crm`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `live-nation-demo` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `live-nation-demo` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `live-nation-demo` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `live-nation-demo` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `Shopify_App` ↔ `live-nation-demo`
- **Shared Integrations:** supabase

### `live-nation-demo` ↔ `suna`
- **Shared Integrations:** supabase

### `live-nation-demo` ↔ `suna-kortix`
- **Shared Integrations:** supabase

### `live-nation-demo` ↔ `text-safety-watchdog`
- **Shared Integrations:** supabase

### `loan-chat-wizard-api` ↔ `lovable-audit`
- **Shared Integrations:** supabase

### `loan-chat-wizard-api` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `loan-chat-wizard-api` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `Shopify_App` ↔ `loan-chat-wizard-api`
- **Shared Integrations:** supabase

### `loan-chat-wizard-api` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase

### `loan-chat-wizard-api` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `lovable-audit` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `lovable-audit` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `mom-walk-connect` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `mom-walk-connect` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `mom-walk-connect` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `new-api-project` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `new-api-project` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `Shopify_App` ↔ `new-api-project`
- **Shared Integrations:** supabase

### `new-api-project` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase

### `new-api-project` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `onsite-affiliate` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `onsite-affiliate` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `pathfinder-financial-insights` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `pathfinder-financial-insights` ↔ `text-safety-watchdog`
- **Shared Integrations:** supabase

### `pathfinder-financial-insights` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `Shopify_App` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `quiz-product-tinker` ↔ `suna`
- **Shared Integrations:** supabase

### `quiz-product-tinker` ↔ `suna-kortix`
- **Shared Integrations:** supabase

### `quiz-product-tinker` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** supabase

### `quiz-product-tinker` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase

### `quiz-product-tinker` ↔ `text-safety-watchdog`
- **Shared Integrations:** supabase

### `quiz-product-tinker` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase

### `quiz-product-tinker` ↔ `tga-crm`
- **Shared Integrations:** supabase

### `quiz-product-tinker` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `Shopify_App` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `suna` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `suna-kortix` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `temp-creator-repo` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `text-safety-watchdog` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `ads-gpt-starter` ↔ `candd-adserver`
- **Shared Integrations:** aws

### `ads-gpt-starter` ↔ `creator-sold-analysis`
- **Shared Integrations:** aws

### `ads-gpt-starter` ↔ `creator-sold-api-analysis`
- **Shared Integrations:** aws

### `ads-gpt-starter` ↔ `creator-storefront-compass`
- **Shared Integrations:** aws

### `ads-gpt-starter` ↔ `creatorgift-admin`
- **Shared Integrations:** aws

### `ads-gpt-starter` ↔ `creatorgift-admin-analysis`
- **Shared Integrations:** aws

### `ads-gpt-starter` ↔ `creatorgift-backend`
- **Shared Integrations:** aws

### `ads-gpt-starter` ↔ `creatorgift-backend-analysis`
- **Shared Integrations:** aws

### `ads-gpt-starter` ↔ `creatorgift-onboarding-app`
- **Shared Integrations:** aws

### `ads-gpt-starter` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `ads-gpt-starter` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws

### `ads-gpt-starter` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws

### `NLWeb` ↔ `ads-gpt-starter`
- **Shared Integrations:** aws

### `ads-gpt-starter` ↔ `scoring-engine`
- **Shared Integrations:** aws

### `agentic-control-plane-kit` ↔ `creator-storefront-compass`
- **Shared Integrations:** aws

### `NLWeb` ↔ `agentic-control-plane-kit`
- **Shared Integrations:** aws

### `api-docs-template` ↔ `creator-storefront-compass`
- **Shared Integrations:** aws

### `NLWeb` ↔ `api-docs-template`
- **Shared Integrations:** aws

### `candd-adserver` ↔ `creator-sold-analysis`
- **Shared Integrations:** aws

### `candd-adserver` ↔ `creator-storefront-compass`
- **Shared Integrations:** aws

### `candd-adserver` ↔ `creatorgift-admin`
- **Shared Integrations:** aws

### `candd-adserver` ↔ `creatorgift-admin-analysis`
- **Shared Integrations:** aws

### `candd-adserver` ↔ `creatorgift-onboarding-app`
- **Shared Integrations:** aws

### `candd-adserver` ↔ `creatoriq-invoice-hub`
- **Shared Integrations:** aws

### `candd-adserver` ↔ `echelon-control`
- **Shared Integrations:** aws

### `candd-adserver` ↔ `edge-bot`
- **Shared Integrations:** aws

### `candd-adserver` ↔ `edge-bot-latest-review`
- **Shared Integrations:** aws

### `candd-adserver` ↔ `governance-hub`
- **Shared Integrations:** aws

### `candd-adserver` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `candd-adserver` ↔ `mom-walk-connect`
- **Shared Integrations:** aws

### `NLWeb` ↔ `candd-adserver`
- **Shared Integrations:** aws

### `Shopify_App` ↔ `candd-adserver`
- **Shared Integrations:** aws

### `candd-adserver` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws

### `ciq-automations` ↔ `creator-sold-analysis`
- **Shared Integrations:** aws

### `ciq-automations` ↔ `creator-storefront-compass`
- **Shared Integrations:** aws

### `ciq-automations` ↔ `creatorgift-admin`
- **Shared Integrations:** aws

### `creator-licensing-hub` ↔ `creator-storefront-compass`
- **Shared Integrations:** aws

### `creator-sold-analysis` ↔ `creator-storefront-compass`
- **Shared Integrations:** aws

### `creator-sold-analysis` ↔ `echelon-control`
- **Shared Integrations:** aws

### `creator-sold-analysis` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `creator-sold-analysis` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creator-sold-analysis`
- **Shared Integrations:** aws

### `Shopify_App` ↔ `creator-sold-analysis`
- **Shared Integrations:** aws

### `creator-sold-api-analysis` ↔ `creator-storefront-compass`
- **Shared Integrations:** aws

### `creator-sold-api-analysis` ↔ `echelon-control`
- **Shared Integrations:** aws

### `creator-sold-api-analysis` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creator-sold-api-analysis`
- **Shared Integrations:** aws

### `Shopify_App` ↔ `creator-sold-api-analysis`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `creatorgift-admin`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `creatorgift-admin-analysis`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `creatorgift-backend`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `creatorgift-backend-analysis`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `creatorgift-onboarding-app`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `creatoriq-invoice-hub`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `echelon-control`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `edge-bot`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `edge-bot-latest-review`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `governance-hub`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `mom-walk-connect`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creator-storefront-compass`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `onsite-affiliate`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `scoring-engine`
- **Shared Integrations:** aws

### `Shopify_App` ↔ `creator-storefront-compass`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `suna`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `suna-kortix`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `temp-creator-repo`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws

### `creatorgift-admin` ↔ `echelon-control`
- **Shared Integrations:** aws

### `creatorgift-admin` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `creatorgift-admin` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creatorgift-admin`
- **Shared Integrations:** aws

### `Shopify_App` ↔ `creatorgift-admin`
- **Shared Integrations:** aws

### `creatorgift-admin-analysis` ↔ `echelon-control`
- **Shared Integrations:** aws

### `creatorgift-admin-analysis` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `creatorgift-admin-analysis` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creatorgift-admin-analysis`
- **Shared Integrations:** aws

### `Shopify_App` ↔ `creatorgift-admin-analysis`
- **Shared Integrations:** aws

### `creatorgift-backend` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creatorgift-backend`
- **Shared Integrations:** aws

### `creatorgift-backend-analysis` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creatorgift-backend-analysis`
- **Shared Integrations:** aws

### `creatorgift-onboarding-app` ↔ `echelon-control`
- **Shared Integrations:** aws

### `creatorgift-onboarding-app` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `creatorgift-onboarding-app` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creatorgift-onboarding-app`
- **Shared Integrations:** aws

### `Shopify_App` ↔ `creatorgift-onboarding-app`
- **Shared Integrations:** aws

### `creatoriq-invoice-hub` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creatoriq-invoice-hub`
- **Shared Integrations:** aws

### `NLWeb` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws

### `echelon-control` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `echelon-control` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws

### `echelon-control` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws

### `echelon-control` ↔ `scoring-engine`
- **Shared Integrations:** aws

### `edge-bot` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `edge-bot-latest-review` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `engineering-hubcast` ↔ `governance-hub`
- **Shared Integrations:** aws

### `engineering-hubcast` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `engineering-hubcast` ↔ `mom-walk-connect`
- **Shared Integrations:** aws

### `NLWeb` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `Shopify_App` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `engineering-hubcast` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws

### `NLWeb` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws

### `NLWeb` ↔ `governance-hub`
- **Shared Integrations:** aws

### `hfc-scoring-engine` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws

### `Shopify_App` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws

### `html-to-visualize-food` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws

### `html-to-visualize-food` ↔ `scoring-engine`
- **Shared Integrations:** aws

### `NLWeb` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws

### `Shopify_App` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws

### `NLWeb` ↔ `mom-walk-connect`
- **Shared Integrations:** aws

### `NLWeb` ↔ `scoring-engine`
- **Shared Integrations:** aws

### `NLWeb` ↔ `Shopify_App`
- **Shared Integrations:** aws

### `NLWeb` ↔ `temp-creator-repo`
- **Shared Integrations:** aws

### `Shopify_App` ↔ `scoring-engine`
- **Shared Integrations:** aws

### `agentic-control-plane-kit` ↔ `alan_test`
- **Shared Integrations:** redis

### `alan_test` ↔ `api-docs-template`
- **Shared Integrations:** redis

### `alan_test` ↔ `candd-adserver`
- **Shared Integrations:** redis

### `alan_test` ↔ `ciq-automations`
- **Shared Integrations:** redis

### `alan_test` ↔ `creator-licensing-hub`
- **Shared Integrations:** redis

### `alan_test` ↔ `creator-sold-api-analysis`
- **Shared Integrations:** redis

### `alan_test` ↔ `creatorgift-backend`
- **Shared Integrations:** redis

### `alan_test` ↔ `creatorgift-backend-analysis`
- **Shared Integrations:** redis

### `alan_test` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** redis

### `alan_test` ↔ `engineering-hubcast`
- **Shared Integrations:** redis

### `alan_test` ↔ `forecast-flex-wizard`
- **Shared Integrations:** redis

### `alan_test` ↔ `four-visions-big-commerce`
- **Shared Integrations:** redis

### `alan_test` ↔ `github-app`
- **Shared Integrations:** redis

### `alan_test` ↔ `hfc-scoring-engine`
- **Shared Integrations:** redis

### `alan_test` ↔ `lead-scoring-documentation`
- **Shared Integrations:** redis

### `alan_test` ↔ `onsite-affiliate`
- **Shared Integrations:** redis

### `alan_test` ↔ `scoring-engine`
- **Shared Integrations:** redis

### `alan_test` ↔ `suna`
- **Shared Integrations:** redis

### `alan_test` ↔ `suna-kortix`
- **Shared Integrations:** redis

### `alan_test` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** redis

### `alan_test` ↔ `temp-creator-repo`
- **Shared Integrations:** redis

### `candd-adserver` ↔ `forecast-flex-wizard`
- **Shared Integrations:** redis

### `candd-adserver` ↔ `github-app`
- **Shared Integrations:** redis

### `creator-sold-api-analysis` ↔ `forecast-flex-wizard`
- **Shared Integrations:** redis

### `creator-sold-api-analysis` ↔ `github-app`
- **Shared Integrations:** redis

### `creatorgift-backend` ↔ `forecast-flex-wizard`
- **Shared Integrations:** redis

### `creatorgift-backend-analysis` ↔ `forecast-flex-wizard`
- **Shared Integrations:** redis

### `engineering-hubcast` ↔ `forecast-flex-wizard`
- **Shared Integrations:** redis

### `engineering-hubcast` ↔ `github-app`
- **Shared Integrations:** redis

### `forecast-flex-wizard` ↔ `github-app`
- **Shared Integrations:** redis

### `forecast-flex-wizard` ↔ `hfc-scoring-engine`
- **Shared Integrations:** redis

### `forecast-flex-wizard` ↔ `lead-scoring-documentation`
- **Shared Integrations:** redis

### `forecast-flex-wizard` ↔ `scoring-engine`
- **Shared Integrations:** redis

### `github-app` ↔ `hfc-scoring-engine`
- **Shared Integrations:** redis

### `github-app` ↔ `lead-scoring-documentation`
- **Shared Integrations:** redis

### `github-app` ↔ `scoring-engine`
- **Shared Integrations:** redis

### `client-survey-hub` ↔ `creator-sold-analysis`
- **Shared Integrations:** vercel

### `client-survey-hub` ↔ `creator-sold-api-analysis`
- **Shared Integrations:** vercel

### `client-survey-hub` ↔ `creatorgift-admin`
- **Shared Integrations:** vercel

### `client-survey-hub` ↔ `creatorgift-admin-analysis`
- **Shared Integrations:** vercel

### `client-survey-hub` ↔ `creatorgift-backend`
- **Shared Integrations:** vercel

### `client-survey-hub` ↔ `creatorgift-backend-analysis`
- **Shared Integrations:** vercel

### `client-survey-hub` ↔ `creatorgift-onboarding-app`
- **Shared Integrations:** vercel

### `client-survey-hub` ↔ `hfc-scoring-engine`
- **Shared Integrations:** vercel

### `client-survey-hub` ↔ `lead-scoring-documentation`
- **Shared Integrations:** vercel

### `client-survey-hub` ↔ `scoring-engine`
- **Shared Integrations:** vercel

### `creator-sold-analysis` ↔ `gig-whisperer-sheet`
- **Shared Integrations:** vercel

### `creator-sold-analysis` ↔ `lovable-audit`
- **Shared Integrations:** vercel

### `creatorgift-admin` ↔ `gig-whisperer-sheet`
- **Shared Integrations:** vercel

### `creatorgift-admin` ↔ `lovable-audit`
- **Shared Integrations:** vercel

### `gig-whisperer-sheet` ↔ `hfc-scoring-engine`
- **Shared Integrations:** vercel

### `gig-whisperer-sheet` ↔ `lead-scoring-documentation`
- **Shared Integrations:** vercel

### `gig-whisperer-sheet` ↔ `scoring-engine`
- **Shared Integrations:** vercel

### `hfc-scoring-engine` ↔ `lovable-audit`
- **Shared Integrations:** vercel

### `lead-scoring-documentation` ↔ `lovable-audit`
- **Shared Integrations:** vercel

### `lovable-audit` ↔ `scoring-engine`
- **Shared Integrations:** vercel

### `agentic-control-plane-kit` ↔ `convo-sparkle-magic`
- **Shared Integrations:** webhook

### `api-docs-template` ↔ `convo-sparkle-magic`
- **Shared Integrations:** webhook

### `ciq-automations` ↔ `convo-sparkle-magic`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `creator-licensing-hub`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `creatorgift-backend`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `creatorgift-backend-analysis`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `echelon-control`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `edge-bot`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `edge-bot-latest-review`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `four-visions-big-commerce`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `github-app`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `governance-hub`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `influencer-iq-flow-analysis`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `key-vault-executor`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `lovable-audit`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `mom-walk-connect`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `onsite-affiliate`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** webhook

### `Shopify_App` ↔ `convo-sparkle-magic`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `suna`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `suna-kortix`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `temp-creator-repo`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `textweaver-gigcraft`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `tga-crm`
- **Shared Integrations:** webhook

### `creatorgift-backend` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** webhook

### `creatorgift-backend-analysis` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** webhook

### `echelon-control` ↔ `github-app`
- **Shared Integrations:** webhook

### `edge-bot` ↔ `github-app`
- **Shared Integrations:** webhook

### `edge-bot-latest-review` ↔ `github-app`
- **Shared Integrations:** webhook

### `github-app` ↔ `governance-hub`
- **Shared Integrations:** webhook

### `github-app` ↔ `influencer-iq-flow-analysis`
- **Shared Integrations:** webhook

### `github-app` ↔ `key-vault-executor`
- **Shared Integrations:** webhook

### `github-app` ↔ `lovable-audit`
- **Shared Integrations:** webhook

### `github-app` ↔ `mom-walk-connect`
- **Shared Integrations:** webhook

### `github-app` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** webhook

### `Shopify_App` ↔ `github-app`
- **Shared Integrations:** webhook

### `github-app` ↔ `textweaver-gigcraft`
- **Shared Integrations:** webhook

### `github-app` ↔ `tga-crm`
- **Shared Integrations:** webhook



## Repositories



### `ads-gpt-starter`
- **Connections:** 56
- **Has database tables**
- **Integrations:** aws, supabase

### `agentic-control-plane-kit`
- **Connections:** 60
- **Integrations:** aws, creatoriq, redis, stripe, supabase, vercel, webhook

### `alan_test`
- **Connections:** 21
- **Integrations:** redis

### `api-docs-template`
- **Connections:** 60
- **Integrations:** aws, redis, stripe, supabase, vercel, webhook

### `api-ninja-gateway`
- **Connections:** 43
- **Has database tables**
- **Integrations:** openai, supabase

### `brand-connect-hub`
- **Connections:** 42
- **Has database tables**
- **Integrations:** supabase

### `candd-adserver`
- **Connections:** 37
- **Integrations:** aws, redis

### `ciq-automations`
- **Connections:** 60
- **Has database tables**
- **Integrations:** aws, creatoriq, openai, redis, stripe, supabase, webhook

### `ciq-feed-map`
- **Connections:** 43
- **Has database tables**
- **Integrations:** openai, supabase

### `CIQ-landing-pages`
- **Connections:** 0

### `client-survey-hub`
- **Connections:** 52
- **Has database tables**
- **Integrations:** supabase, vercel

### `content4brand`
- **Connections:** 0

### `convo-sparkle-magic`
- **Connections:** 26
- **Integrations:** webhook

### `creator-licensing-harmony`
- **Connections:** 42
- **Integrations:** supabase

### `creator-licensing-hub`
- **Connections:** 59
- **Has database tables**
- **Integrations:** aws, creatoriq, openai, redis, supabase, vercel, webhook

### `creator-licensing-marketplace`
- **Connections:** 0

### `creator-sold-analysis`
- **Connections:** 37
- **Integrations:** aws, vercel

### `creator-sold-api-analysis`
- **Connections:** 46
- **Integrations:** aws, creatoriq, redis, vercel

### `creator-storefront-compass`
- **Connections:** 34
- **Integrations:** aws

### `creatorgift-admin`
- **Connections:** 37
- **Integrations:** aws, vercel

### `creatorgift-admin-analysis`
- **Connections:** 43
- **Integrations:** aws, creatoriq, vercel

### `creatorgift-backend`
- **Connections:** 48
- **Integrations:** aws, creatoriq, redis, vercel, webhook

### `creatorgift-backend-analysis`
- **Connections:** 48
- **Integrations:** aws, creatoriq, redis, vercel, webhook

### `creatorgift-onboarding-app`
- **Connections:** 43
- **Integrations:** aws, creatoriq, vercel

### `creatoriq-invoice-hub`
- **Connections:** 56
- **Integrations:** aws, creatoriq, supabase, vercel

### `debt-freedom-pathway-landing`
- **Connections:** 59
- **Has database tables**
- **Integrations:** aws, redis, supabase, vercel, webhook

### `echelon-control`
- **Connections:** 59
- **Has database tables**
- **Integrations:** aws, openai, stripe, supabase, webhook

### `edge-bot`
- **Connections:** 58
- **Integrations:** aws, creatoriq, openai, pgvector, supabase, vercel, webhook

### `edge-bot-latest-review`
- **Connections:** 58
- **Integrations:** aws, creatoriq, openai, pgvector, supabase, vercel, webhook

### `engineering-hubcast`
- **Connections:** 37
- **Integrations:** aws, redis

### `forecast-flex-wizard`
- **Connections:** 52
- **Has database tables**
- **Integrations:** redis, supabase

### `four-visions-big-commerce`
- **Connections:** 60
- **Has database tables**
- **Integrations:** aws, redis, stripe, supabase, upstash, vercel, webhook

### `gig-whisperer-sheet`
- **Connections:** 53
- **Integrations:** creatoriq, stripe, supabase, vercel

### `github-app`
- **Connections:** 34
- **Integrations:** redis, webhook

### `governance-hub`
- **Connections:** 59
- **Has database tables**
- **Integrations:** aws, stripe, supabase, vercel, webhook

### `guild-landing-system`
- **Connections:** 42
- **Has database tables**
- **Integrations:** supabase

### `hfc-scoring-engine`
- **Connections:** 40
- **Integrations:** aws, redis, vercel

### `html-to-visualize-food`
- **Connections:** 56
- **Has database tables**
- **Integrations:** aws, openai, supabase

### `influencer-iq-flow-analysis`
- **Connections:** 50
- **Has database tables**
- **Integrations:** creatoriq, openai, supabase, webhook

### `key-vault-executor`
- **Connections:** 50
- **Has database tables**
- **Integrations:** creatoriq, stripe, supabase, webhook

### `kitchen-capital-connect`
- **Connections:** 42
- **Has database tables**
- **Integrations:** supabase

### `lead-scoring-documentation`
- **Connections:** 40
- **Integrations:** aws, redis, vercel

### `lifetrack`
- **Connections:** 42
- **Has database tables**
- **Integrations:** supabase

### `linkcreator-magic`
- **Connections:** 42
- **Integrations:** supabase

### `live-nation-demo`
- **Connections:** 47
- **Has database tables**
- **Integrations:** creatoriq, supabase

### `loan-chat-wizard-api`
- **Connections:** 43
- **Has database tables**
- **Integrations:** openai, supabase

### `lovable-audit`
- **Connections:** 54
- **Has database tables**
- **Integrations:** creatoriq, supabase, vercel, webhook

### `mom-walk-connect`
- **Connections:** 58
- **Has database tables**
- **Integrations:** aws, supabase, vercel, webhook

### `new-api-project`
- **Connections:** 43
- **Integrations:** openai, supabase

### `new-test-al`
- **Connections:** 0

### `NLWeb`
- **Connections:** 41
- **Integrations:** aws, openai

### `onsite-affiliate`
- **Connections:** 60
- **Has database tables**
- **Integrations:** aws, openai, redis, stripe, supabase, upstash, vercel, webhook

### `pathfinder-financial-insights`
- **Connections:** 46
- **Integrations:** supabase, webhook

### `perception-love-website`
- **Connections:** 0

### `quiz-product-tinker`
- **Connections:** 42
- **Integrations:** supabase

### `scoring-engine`
- **Connections:** 40
- **Integrations:** aws, redis, vercel

### `Shopify_App`
- **Connections:** 59
- **Integrations:** aws, stripe, supabase, webhook

### `suna`
- **Connections:** 60
- **Integrations:** aws, openai, redis, stripe, supabase, upstash, vercel, webhook

### `suna-kortix`
- **Connections:** 60
- **Integrations:** aws, openai, redis, stripe, supabase, upstash, vercel, webhook

### `sunafusion-agent-shell`
- **Connections:** 60
- **Has database tables**
- **Integrations:** aws, creatoriq, openai, redis, stripe, supabase, upstash, vercel, webhook

### `temp-creator-repo`
- **Connections:** 59
- **Has database tables**
- **Integrations:** aws, redis, supabase, vercel, webhook

### `temp-wp-repo`
- **Connections:** 13
- **Integrations:** stripe

### `text-safety-watchdog`
- **Connections:** 56
- **Has database tables**
- **Integrations:** aws, openai, supabase, vercel

### `textweaver-gigcraft`
- **Connections:** 50
- **Has database tables**
- **Integrations:** creatoriq, openai, supabase, webhook

### `tga-crm`
- **Connections:** 50
- **Has database tables**
- **Integrations:** creatoriq, openai, supabase, webhook

### `voice-agent-ciq-agent`
- **Connections:** 47
- **Integrations:** creatoriq, supabase