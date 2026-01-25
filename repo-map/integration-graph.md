# Integration Graph



Generated: 2026-01-25T01:45:59.166Z



Strategic map showing relationships between repositories based on:

- **Shared Tables**: Repos that share database tables (coordination required for schema changes)

- **Shared APIs**: Repos using the same external APIs (CIQ, Shopify, BigCommerce, Slack, Gmail, etc.)

- **Shared Integrations**: Repos using the same infrastructure (Supabase, AWS, Redis, etc.)



## Graph Statistics



- **Nodes (Repos):** 54

- **Edges (Relationships):** 865

- **Repos with Tables:** 22



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

### `four-visions-big-commerce` ↔ `temp-creator-repo`
- **Shared Tables:** `analytics_events`, `analytics_sessions`, `tracked_events`, `tracking_pixels`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `creator-licensing-hub` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq, openai
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

### `ciq-automations` ↔ `sunafusion-agent-shell`
- **Shared Tables:** `agent_memories`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** aws, supabase, webhook

### `debt-freedom-pathway-landing` ↔ `sunafusion-agent-shell`
- **Shared Tables:** `leads`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

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

### `influencer-iq-flow-analysis` ↔ `sunafusion-agent-shell`
- **Shared Tables:** `agent_memories`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `ciq-automations` ↔ `creator-licensing-hub`
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

### `creator-licensing-hub` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `debt-freedom-pathway-landing` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `debt-freedom-pathway-landing` ↔ `suna`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `debt-freedom-pathway-landing` ↔ `suna-kortix`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `debt-freedom-pathway-landing` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `suna` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `suna-kortix` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `sunafusion-agent-shell` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, supabase, vercel, webhook

### `ciq-automations` ↔ `lovable-audit`
- **Shared Tables:** `brands`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `ciq-automations` ↔ `mom-walk-connect`
- **Shared Tables:** `brands`, `email_templates`
  - ⚠️  Schema changes require coordination
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

### `creator-licensing-hub` ↔ `live-nation-demo`
- **Shared Tables:** `analytics_events`, `analytics_sessions`
  - ⚠️  Schema changes require coordination
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

### `four-visions-big-commerce` ↔ `mom-walk-connect`
- **Shared Tables:** `admin_notification_emails`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase, vercel, webhook

### `four-visions-big-commerce` ↔ `lovable-audit`
- **Shared Tables:** `products`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase, vercel, webhook

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

### `creatoriq-invoice-hub` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, supabase, vercel

### `gig-whisperer-sheet` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq, stripe
- **Shared Integrations:** supabase, vercel

### `influencer-iq-flow-analysis` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq, openai
- **Shared Integrations:** supabase, webhook

### `influencer-iq-flow-analysis` ↔ `tga-crm`
- **Shared APIs:** creatoriq, openai
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

### `ciq-automations` ↔ `suna`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, webhook

### `ciq-automations` ↔ `suna-kortix`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase, webhook

### `creator-licensing-hub` ↔ `text-safety-watchdog`
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

### `creatorgift-backend` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend` ↔ `four-visions-big-commerce`
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

### `creatorgift-backend-analysis` ↔ `suna`
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend-analysis` ↔ `suna-kortix`
- **Shared Integrations:** aws, redis, vercel, webhook

### `creatorgift-backend-analysis` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, vercel, webhook

### `forecast-flex-wizard` ↔ `mom-walk-connect`
- **Shared Tables:** `profiles`, `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `text-safety-watchdog`
- **Shared Tables:** `clients`
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

### `ciq-automations` ↔ `creatorgift-backend`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, webhook

### `ciq-automations` ↔ `creatorgift-backend-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, webhook

### `ciq-automations` ↔ `creatoriq-invoice-hub`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, supabase

### `creator-licensing-hub` ↔ `creatorgift-admin-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creator-licensing-hub` ↔ `creatorgift-onboarding-app`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creator-licensing-hub` ↔ `gig-whisperer-sheet`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, vercel

### `creator-sold-api-analysis` ↔ `creatorgift-admin-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creator-sold-api-analysis` ↔ `creatorgift-onboarding-app`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creator-sold-api-analysis` ↔ `creatoriq-invoice-hub`
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

### `creatorgift-onboarding-app` ↔ `sunafusion-agent-shell`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws, vercel

### `creatoriq-invoice-hub` ↔ `gig-whisperer-sheet`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, vercel

### `creatoriq-invoice-hub` ↔ `lovable-audit`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, vercel

### `gig-whisperer-sheet` ↔ `lovable-audit`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, vercel

### `lovable-audit` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `lovable-audit` ↔ `tga-crm`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase, webhook

### `four-visions-big-commerce` ↔ `gig-whisperer-sheet`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, vercel

### `gig-whisperer-sheet` ↔ `suna`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, vercel

### `gig-whisperer-sheet` ↔ `suna-kortix`
- **Shared APIs:** stripe
- **Shared Integrations:** supabase, vercel

### `ciq-automations` ↔ `html-to-visualize-food`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase

### `ciq-automations` ↔ `text-safety-watchdog`
- **Shared APIs:** openai
- **Shared Integrations:** aws, supabase

### `creator-licensing-hub` ↔ `html-to-visualize-food`
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

### `ciq-automations` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, supabase, webhook

### `ciq-automations` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, supabase, webhook

### `ciq-automations` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, supabase, webhook

### `creator-licensing-hub` ↔ `mom-walk-connect`
- **Shared Integrations:** supabase, vercel, webhook

### `creatoriq-invoice-hub` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, supabase, vercel

### `creatoriq-invoice-hub` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, supabase, vercel

### `creatoriq-invoice-hub` ↔ `suna`
- **Shared Integrations:** aws, supabase, vercel

### `creatoriq-invoice-hub` ↔ `suna-kortix`
- **Shared Integrations:** aws, supabase, vercel

### `creatoriq-invoice-hub` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, supabase, vercel

### `creatoriq-invoice-hub` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, supabase, vercel

### `debt-freedom-pathway-landing` ↔ `lovable-audit`
- **Shared Integrations:** supabase, vercel, webhook

### `debt-freedom-pathway-landing` ↔ `mom-walk-connect`
- **Shared Integrations:** supabase, vercel, webhook

### `debt-freedom-pathway-landing` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, supabase, vercel

### `four-visions-big-commerce` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, supabase, vercel

### `lovable-audit` ↔ `suna`
- **Shared Integrations:** supabase, vercel, webhook

### `lovable-audit` ↔ `suna-kortix`
- **Shared Integrations:** supabase, vercel, webhook

### `lovable-audit` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase, vercel, webhook

### `mom-walk-connect` ↔ `suna`
- **Shared Integrations:** supabase, vercel, webhook

### `mom-walk-connect` ↔ `suna-kortix`
- **Shared Integrations:** supabase, vercel, webhook

### `mom-walk-connect` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** supabase, vercel, webhook

### `mom-walk-connect` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase, vercel, webhook

### `temp-creator-repo` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, supabase, vercel

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

### `creator-sold-api-analysis` ↔ `scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `creator-sold-api-analysis` ↔ `suna`
- **Shared Integrations:** aws, redis, vercel

### `creator-sold-api-analysis` ↔ `suna-kortix`
- **Shared Integrations:** aws, redis, vercel

### `creator-sold-api-analysis` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, redis, vercel

### `creatorgift-backend` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `creatorgift-backend` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, redis, vercel

### `creatorgift-backend` ↔ `scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `creatorgift-backend-analysis` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, redis, vercel

### `creatorgift-backend-analysis` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws, redis, vercel

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

### `lifetrack` ↔ `lovable-audit`
- **Shared Tables:** `profiles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `lifetrack` ↔ `mom-walk-connect`
- **Shared Tables:** `profiles`
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

### `forecast-flex-wizard` ↔ `live-nation-demo`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `live-nation-demo` ↔ `mom-walk-connect`
- **Shared Tables:** `user_roles`
  - ⚠️  Schema changes require coordination
- **Shared Integrations:** supabase

### `ciq-automations` ↔ `creator-sold-api-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws

### `ciq-automations` ↔ `creatorgift-admin-analysis`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws

### `ciq-automations` ↔ `creatorgift-onboarding-app`
- **Shared APIs:** creatoriq
- **Shared Integrations:** aws

### `ciq-automations` ↔ `gig-whisperer-sheet`
- **Shared APIs:** creatoriq
- **Shared Integrations:** supabase

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

### `api-ninja-gateway` ↔ `ciq-automations`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `ciq-feed-map`
- **Shared APIs:** openai
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `creator-licensing-hub`
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

### `ads-gpt-starter` ↔ `ciq-automations`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `creator-licensing-hub`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `creatoriq-invoice-hub`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, supabase

### `ads-gpt-starter` ↔ `html-to-visualize-food`
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

### `ciq-automations` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `client-survey-hub` ↔ `creator-licensing-hub`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `creatoriq-invoice-hub`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `four-visions-big-commerce`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `gig-whisperer-sheet`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `lovable-audit`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `mom-walk-connect`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `suna`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `suna-kortix`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** supabase, vercel

### `client-survey-hub` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase, vercel

### `creator-licensing-hub` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `creatoriq-invoice-hub` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws, supabase

### `creatoriq-invoice-hub` ↔ `mom-walk-connect`
- **Shared Integrations:** supabase, vercel

### `debt-freedom-pathway-landing` ↔ `gig-whisperer-sheet`
- **Shared Integrations:** supabase, vercel

### `debt-freedom-pathway-landing` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws, supabase

### `debt-freedom-pathway-landing` ↔ `influencer-iq-flow-analysis`
- **Shared Integrations:** supabase, webhook

### `debt-freedom-pathway-landing` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `debt-freedom-pathway-landing` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase, webhook

### `debt-freedom-pathway-landing` ↔ `tga-crm`
- **Shared Integrations:** supabase, webhook

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

### `html-to-visualize-food` ↔ `temp-creator-repo`
- **Shared Integrations:** aws, supabase

### `influencer-iq-flow-analysis` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `influencer-iq-flow-analysis` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase, webhook

### `lovable-audit` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `lovable-audit` ↔ `text-safety-watchdog`
- **Shared Integrations:** supabase, vercel

### `mom-walk-connect` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase, webhook

### `mom-walk-connect` ↔ `text-safety-watchdog`
- **Shared Integrations:** supabase, vercel

### `mom-walk-connect` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase, webhook

### `mom-walk-connect` ↔ `tga-crm`
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

### `temp-creator-repo` ↔ `textweaver-gigcraft`
- **Shared Integrations:** supabase, webhook

### `temp-creator-repo` ↔ `tga-crm`
- **Shared Integrations:** supabase, webhook

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

### `creator-sold-analysis` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, vercel

### `creator-sold-analysis` ↔ `lead-scoring-documentation`
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

### `creatorgift-admin` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin` ↔ `lead-scoring-documentation`
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

### `creatorgift-admin-analysis` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, vercel

### `creatorgift-admin-analysis` ↔ `lead-scoring-documentation`
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

### `creatorgift-backend` ↔ `engineering-hubcast`
- **Shared Integrations:** aws, redis

### `creatorgift-backend` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, vercel

### `creatorgift-backend-analysis` ↔ `engineering-hubcast`
- **Shared Integrations:** aws, redis

### `creatorgift-backend-analysis` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, vercel

### `creatorgift-onboarding-app` ↔ `lead-scoring-documentation`
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

### `engineering-hubcast` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws, redis

### `engineering-hubcast` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws, redis

### `engineering-hubcast` ↔ `lead-scoring-documentation`
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

### `hfc-scoring-engine` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, vercel

### `lead-scoring-documentation` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, vercel

### `scoring-engine` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws, vercel

### `creatorgift-backend` ↔ `mom-walk-connect`
- **Shared Integrations:** vercel, webhook

### `creatorgift-backend-analysis` ↔ `mom-walk-connect`
- **Shared Integrations:** vercel, webhook

### `creator-sold-api-analysis` ↔ `influencer-iq-flow-analysis`
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

### `creatorgift-onboarding-app` ↔ `live-nation-demo`
- **Shared APIs:** creatoriq

### `creatorgift-onboarding-app` ↔ `textweaver-gigcraft`
- **Shared APIs:** creatoriq

### `creatorgift-onboarding-app` ↔ `tga-crm`
- **Shared APIs:** creatoriq

### `creatorgift-onboarding-app` ↔ `voice-agent-ciq-agent`
- **Shared APIs:** creatoriq

### `four-visions-big-commerce` ↔ `temp-wp-repo`
- **Shared APIs:** stripe

### `gig-whisperer-sheet` ↔ `temp-wp-repo`
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

### `ads-gpt-starter` ↔ `influencer-iq-flow-analysis`
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

### `ads-gpt-starter` ↔ `mom-walk-connect`
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

### `api-ninja-gateway` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase

### `api-ninja-gateway` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `ciq-automations` ↔ `client-survey-hub`
- **Shared Integrations:** supabase

### `ciq-automations` ↔ `creator-licensing-harmony`
- **Shared Integrations:** supabase

### `ciq-automations` ↔ `forecast-flex-wizard`
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

### `ciq-feed-map` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase

### `ciq-feed-map` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `creator-licensing-harmony`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `html-to-visualize-food`
- **Shared Integrations:** supabase

### `client-survey-hub` ↔ `influencer-iq-flow-analysis`
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

### `creator-licensing-harmony` ↔ `forecast-flex-wizard`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `four-visions-big-commerce`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `gig-whisperer-sheet`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `html-to-visualize-food`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `influencer-iq-flow-analysis`
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

### `creator-licensing-harmony` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `creator-licensing-harmony` ↔ `quiz-product-tinker`
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

### `creator-licensing-hub` ↔ `forecast-flex-wizard`
- **Shared Integrations:** supabase

### `creator-licensing-hub` ↔ `lifetrack`
- **Shared Integrations:** supabase

### `creator-licensing-hub` ↔ `linkcreator-magic`
- **Shared Integrations:** supabase

### `creator-licensing-hub` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `creatoriq-invoice-hub` ↔ `forecast-flex-wizard`
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

### `debt-freedom-pathway-landing` ↔ `forecast-flex-wizard`
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

### `forecast-flex-wizard` ↔ `four-visions-big-commerce`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `gig-whisperer-sheet`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `html-to-visualize-food`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `influencer-iq-flow-analysis`
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

### `forecast-flex-wizard` ↔ `suna`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `suna-kortix`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `sunafusion-agent-shell`
- **Shared Integrations:** supabase

### `forecast-flex-wizard` ↔ `temp-creator-repo`
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

### `html-to-visualize-food` ↔ `mom-walk-connect`
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

### `kitchen-capital-connect` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `kitchen-capital-connect` ↔ `quiz-product-tinker`
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

### `linkcreator-magic` ↔ `pathfinder-financial-insights`
- **Shared Integrations:** supabase

### `linkcreator-magic` ↔ `quiz-product-tinker`
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

### `new-api-project` ↔ `temp-creator-repo`
- **Shared Integrations:** supabase

### `new-api-project` ↔ `voice-agent-ciq-agent`
- **Shared Integrations:** supabase

### `pathfinder-financial-insights` ↔ `quiz-product-tinker`
- **Shared Integrations:** supabase

### `pathfinder-financial-insights` ↔ `text-safety-watchdog`
- **Shared Integrations:** supabase

### `pathfinder-financial-insights` ↔ `voice-agent-ciq-agent`
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

### `candd-adserver` ↔ `ciq-automations`
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

### `candd-adserver` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `candd-adserver`
- **Shared Integrations:** aws

### `candd-adserver` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws

### `ciq-automations` ↔ `creator-sold-analysis`
- **Shared Integrations:** aws

### `ciq-automations` ↔ `creator-storefront-compass`
- **Shared Integrations:** aws

### `ciq-automations` ↔ `creatorgift-admin`
- **Shared Integrations:** aws

### `ciq-automations` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `ciq-automations` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws

### `ciq-automations` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws

### `ciq-automations` ↔ `scoring-engine`
- **Shared Integrations:** aws

### `creator-licensing-hub` ↔ `creator-storefront-compass`
- **Shared Integrations:** aws

### `creator-sold-analysis` ↔ `creator-storefront-compass`
- **Shared Integrations:** aws

### `creator-sold-analysis` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `creator-sold-analysis` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creator-sold-analysis`
- **Shared Integrations:** aws

### `creator-sold-api-analysis` ↔ `creator-storefront-compass`
- **Shared Integrations:** aws

### `creator-sold-api-analysis` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creator-sold-api-analysis`
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

### `creator-storefront-compass` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creator-storefront-compass`
- **Shared Integrations:** aws

### `creator-storefront-compass` ↔ `scoring-engine`
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

### `creatorgift-admin` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `creatorgift-admin` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creatorgift-admin`
- **Shared Integrations:** aws

### `creatorgift-admin-analysis` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `creatorgift-admin-analysis` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creatorgift-admin-analysis`
- **Shared Integrations:** aws

### `creatorgift-backend` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creatorgift-backend`
- **Shared Integrations:** aws

### `creatorgift-backend-analysis` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creatorgift-backend-analysis`
- **Shared Integrations:** aws

### `creatorgift-onboarding-app` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `creatorgift-onboarding-app` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creatorgift-onboarding-app`
- **Shared Integrations:** aws

### `creatoriq-invoice-hub` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `NLWeb` ↔ `creatoriq-invoice-hub`
- **Shared Integrations:** aws

### `NLWeb` ↔ `debt-freedom-pathway-landing`
- **Shared Integrations:** aws

### `engineering-hubcast` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `engineering-hubcast`
- **Shared Integrations:** aws

### `engineering-hubcast` ↔ `text-safety-watchdog`
- **Shared Integrations:** aws

### `NLWeb` ↔ `four-visions-big-commerce`
- **Shared Integrations:** aws

### `hfc-scoring-engine` ↔ `html-to-visualize-food`
- **Shared Integrations:** aws

### `NLWeb` ↔ `hfc-scoring-engine`
- **Shared Integrations:** aws

### `html-to-visualize-food` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws

### `html-to-visualize-food` ↔ `scoring-engine`
- **Shared Integrations:** aws

### `NLWeb` ↔ `lead-scoring-documentation`
- **Shared Integrations:** aws

### `NLWeb` ↔ `scoring-engine`
- **Shared Integrations:** aws

### `NLWeb` ↔ `temp-creator-repo`
- **Shared Integrations:** aws

### `alan_test` ↔ `candd-adserver`
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

### `alan_test` ↔ `four-visions-big-commerce`
- **Shared Integrations:** redis

### `alan_test` ↔ `hfc-scoring-engine`
- **Shared Integrations:** redis

### `alan_test` ↔ `lead-scoring-documentation`
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

### `creator-sold-analysis` ↔ `mom-walk-connect`
- **Shared Integrations:** vercel

### `creator-sold-api-analysis` ↔ `mom-walk-connect`
- **Shared Integrations:** vercel

### `creatorgift-admin` ↔ `gig-whisperer-sheet`
- **Shared Integrations:** vercel

### `creatorgift-admin` ↔ `lovable-audit`
- **Shared Integrations:** vercel

### `creatorgift-admin` ↔ `mom-walk-connect`
- **Shared Integrations:** vercel

### `creatorgift-admin-analysis` ↔ `mom-walk-connect`
- **Shared Integrations:** vercel

### `creatorgift-onboarding-app` ↔ `mom-walk-connect`
- **Shared Integrations:** vercel

### `gig-whisperer-sheet` ↔ `hfc-scoring-engine`
- **Shared Integrations:** vercel

### `gig-whisperer-sheet` ↔ `lead-scoring-documentation`
- **Shared Integrations:** vercel

### `gig-whisperer-sheet` ↔ `scoring-engine`
- **Shared Integrations:** vercel

### `hfc-scoring-engine` ↔ `lovable-audit`
- **Shared Integrations:** vercel

### `hfc-scoring-engine` ↔ `mom-walk-connect`
- **Shared Integrations:** vercel

### `lead-scoring-documentation` ↔ `lovable-audit`
- **Shared Integrations:** vercel

### `lead-scoring-documentation` ↔ `mom-walk-connect`
- **Shared Integrations:** vercel

### `lovable-audit` ↔ `scoring-engine`
- **Shared Integrations:** vercel

### `mom-walk-connect` ↔ `scoring-engine`
- **Shared Integrations:** vercel

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

### `convo-sparkle-magic` ↔ `four-visions-big-commerce`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `influencer-iq-flow-analysis`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `lovable-audit`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `mom-walk-connect`
- **Shared Integrations:** webhook

### `convo-sparkle-magic` ↔ `pathfinder-financial-insights`
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



## Repositories



### `ads-gpt-starter`
- **Connections:** 45
- **Has database tables**
- **Integrations:** aws, supabase

### `alan_test`
- **Connections:** 15
- **Integrations:** redis

### `api-ninja-gateway`
- **Connections:** 32
- **Has database tables**
- **Integrations:** openai, supabase

### `candd-adserver`
- **Connections:** 26
- **Integrations:** aws, redis

### `ciq-automations`
- **Connections:** 46
- **Has database tables**
- **Integrations:** aws, creatoriq, openai, supabase, webhook

### `ciq-feed-map`
- **Connections:** 32
- **Has database tables**
- **Integrations:** openai, supabase

### `CIQ-landing-pages`
- **Connections:** 0

### `client-survey-hub`
- **Connections:** 41
- **Has database tables**
- **Integrations:** supabase, vercel

### `content4brand`
- **Connections:** 0

### `convo-sparkle-magic`
- **Connections:** 16
- **Integrations:** webhook

### `creator-licensing-harmony`
- **Connections:** 31
- **Integrations:** supabase

### `creator-licensing-hub`
- **Connections:** 47
- **Has database tables**
- **Integrations:** aws, creatoriq, openai, redis, supabase, vercel, webhook

### `creator-licensing-marketplace`
- **Connections:** 0

### `creator-sold-analysis`
- **Connections:** 29
- **Integrations:** aws, vercel

### `creator-sold-api-analysis`
- **Connections:** 35
- **Integrations:** aws, creatoriq, redis, vercel

### `creator-storefront-compass`
- **Connections:** 25
- **Integrations:** aws

### `creatorgift-admin`
- **Connections:** 29
- **Integrations:** aws, vercel

### `creatorgift-admin-analysis`
- **Connections:** 34
- **Integrations:** aws, creatoriq, vercel

### `creatorgift-backend`
- **Connections:** 37
- **Integrations:** aws, creatoriq, redis, vercel, webhook

### `creatorgift-backend-analysis`
- **Connections:** 37
- **Integrations:** aws, creatoriq, redis, vercel, webhook

### `creatorgift-onboarding-app`
- **Connections:** 34
- **Integrations:** aws, creatoriq, vercel

### `creatoriq-invoice-hub`
- **Connections:** 45
- **Integrations:** aws, creatoriq, supabase, vercel

### `debt-freedom-pathway-landing`
- **Connections:** 47
- **Has database tables**
- **Integrations:** aws, redis, supabase, vercel, webhook

### `engineering-hubcast`
- **Connections:** 26
- **Integrations:** aws, redis

### `forecast-flex-wizard`
- **Connections:** 31
- **Has database tables**
- **Integrations:** supabase

### `four-visions-big-commerce`
- **Connections:** 48
- **Has database tables**
- **Integrations:** aws, redis, stripe, supabase, upstash, vercel, webhook

### `gig-whisperer-sheet`
- **Connections:** 42
- **Integrations:** creatoriq, stripe, supabase, vercel

### `hfc-scoring-engine`
- **Connections:** 30
- **Integrations:** aws, redis, vercel

### `html-to-visualize-food`
- **Connections:** 45
- **Has database tables**
- **Integrations:** aws, openai, supabase

### `influencer-iq-flow-analysis`
- **Connections:** 38
- **Has database tables**
- **Integrations:** creatoriq, openai, supabase, webhook

### `kitchen-capital-connect`
- **Connections:** 31
- **Has database tables**
- **Integrations:** supabase

### `lead-scoring-documentation`
- **Connections:** 30
- **Integrations:** aws, redis, vercel

### `lifetrack`
- **Connections:** 31
- **Has database tables**
- **Integrations:** supabase

### `linkcreator-magic`
- **Connections:** 31
- **Integrations:** supabase

### `live-nation-demo`
- **Connections:** 36
- **Has database tables**
- **Integrations:** creatoriq, supabase

### `loan-chat-wizard-api`
- **Connections:** 32
- **Has database tables**
- **Integrations:** openai, supabase

### `lovable-audit`
- **Connections:** 42
- **Has database tables**
- **Integrations:** creatoriq, supabase, vercel, webhook

### `mom-walk-connect`
- **Connections:** 42
- **Has database tables**
- **Integrations:** supabase, vercel, webhook

### `new-api-project`
- **Connections:** 32
- **Integrations:** openai, supabase

### `new-test-al`
- **Connections:** 0

### `NLWeb`
- **Connections:** 32
- **Integrations:** aws, openai

### `pathfinder-financial-insights`
- **Connections:** 34
- **Integrations:** supabase, webhook

### `perception-love-website`
- **Connections:** 0

### `quiz-product-tinker`
- **Connections:** 31
- **Integrations:** supabase

### `scoring-engine`
- **Connections:** 30
- **Integrations:** aws, redis, vercel

### `suna`
- **Connections:** 48
- **Integrations:** aws, openai, redis, stripe, supabase, upstash, vercel, webhook

### `suna-kortix`
- **Connections:** 48
- **Integrations:** aws, openai, redis, stripe, supabase, upstash, vercel, webhook

### `sunafusion-agent-shell`
- **Connections:** 48
- **Has database tables**
- **Integrations:** aws, creatoriq, openai, redis, stripe, supabase, upstash, vercel, webhook

### `temp-creator-repo`
- **Connections:** 47
- **Has database tables**
- **Integrations:** aws, redis, supabase, vercel, webhook

### `temp-wp-repo`
- **Connections:** 5
- **Integrations:** stripe

### `text-safety-watchdog`
- **Connections:** 45
- **Has database tables**
- **Integrations:** aws, openai, supabase, vercel

### `textweaver-gigcraft`
- **Connections:** 38
- **Has database tables**
- **Integrations:** creatoriq, openai, supabase, webhook

### `tga-crm`
- **Connections:** 38
- **Has database tables**
- **Integrations:** creatoriq, openai, supabase, webhook

### `voice-agent-ciq-agent`
- **Connections:** 36
- **Integrations:** creatoriq, supabase