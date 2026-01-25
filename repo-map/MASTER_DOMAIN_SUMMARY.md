# Master Domain Summary - All Repositories

**Purpose**: Comprehensive "WHY" and "HOW" summaries for all repositories in the codebase. This document is designed for:
- Review and editing with AI assistants (ChatGPT, Claude, etc.)
- Onboarding new team members
- System architecture documentation
- Strategic planning and refactoring decisions

**Format**: Each repo has 5-8 bullets covering:
- **Why it exists** (purpose/value proposition)
- **Primary flows** (main user journeys/workflows)
- **Upstream dependencies** (what it depends on)
- **Downstream dependencies** (what depends on it)
- **Change impact warnings** (what breaks if you change X)

**Last Updated**: 2026-01-25

---

## How to Use This Document (Canonical Rules)

**This document is the authoritative semantic map of the codebase.**

- If code behavior conflicts with this document, **update this document first**.
- AI assistants should treat **"System Role"** and **"Change Warnings"** as hard constraints.
- **"Do NOT Put Here"** bullets are guardrails—violate only with explicit approval.
- **"Refactor Risk"** levels guide planning and AI suggestions.
- Shared tables require coordination—see `OWNERSHIP_RULES.md` for governance.

**System Roles:**
- **Authoritative**: Source of truth, primary implementation
- **Consumer**: Uses authoritative repos, should not duplicate logic
- **Analysis-only**: Read-only documentation/analysis, no production logic
- **Deprecated**: Being phased out, avoid new development
- **Experimental**: Testing new approaches, may be removed

**Refactor Risk Levels:**
- **Low-risk**: Marketing sites, analysis repos, standalone tools
- **Medium-risk**: Single-domain services, isolated functionality
- **High-risk**: Shared infrastructure, core systems, repos with shared tables/webhooks

---

---

## Table of Contents

1. [Core Infrastructure](#core-infrastructure)
2. [CreatorIQ & Automation](#creatoriq--automation)
3. [E-commerce & Licensing](#e-commerce--licensing)
4. [Analytics & Reporting](#analytics--reporting)
5. [Landing Pages & Marketing](#landing-pages--marketing)
6. [Utilities & Tools](#utilities--tools)
7. [Analysis & Documentation](#analysis--documentation)

---

## Core Infrastructure

### sunafusion-agent-shell

**System Role:** Authoritative (source of truth for agent platform, repo-map, and memory system)

**This repo exists to:** Provide an AI agent platform with memory, tool access, and codebase understanding for personal assistant use cases. **Not a product-specific agent**—this is the general-purpose agent infrastructure.

**Primary flows:**
- Quick Mode (Edge): Fast responses using unified-agent with repo-map, memory, and integrations
- Heavy Mode (Backend): Full agent with sandbox, tool loops, and long-running tasks
- Memory System: Store and recall durable facts/preferences
- Repo-Map Integration: Answer questions about codebase structure and ownership (repo-map is canonical, not inferred)

**Upstream dependencies:**
- Supabase (database, edge functions, auth)
- OpenAI/Anthropic (LLM providers)
- CreatorIQ (via unified-agent)
- Google Drive (via unified-agent)
- Slack (via unified-agent)

**Downstream dependencies (systems):**
- Other repos (via repo-map queries)
- Supabase database (agent_memories table shared with ciq-automations)

**Primary consumers:** Internal ops, agents, admin users (via chat interface)

**Shared tables:** `agent_memories` (see `OWNERSHIP_RULES.md` for coordination requirements)

**This repo should NOT contain:** Product-specific business logic, billing rules, UI components (use product repos instead)

**If you change X, watch out for Y:**
- Changing memory schema → invalidates existing memories, breaks `ciq-automations` if shared table changes
- Modifying repo-map structure → breaks codebase queries across all repos
- Updating agent routing → affects all user interactions

**Refactor Risk:** High (core infrastructure, shared tables, used by multiple systems)

---

## CreatorIQ & Automation

### ciq-automations

**System Role:** Keystone / Authoritative (source of truth for CreatorIQ automation, most CreatorIQ-related changes should start here unless explicitly delegated)

**This repo exists to:** Automate CreatorIQ operations at scale, replacing manual UI work with programmatic APIs and agentic workflows.

**Primary flows:**
- Campaign & Publisher Management: Create campaigns, add/remove publishers, update status programmatically
- Lists & Onesheets: Segment creators into groups for outreach, sales, or reporting
- Media & Reporting: Fetch creator content and performance data from CreatorIQ
- Workflows & Automation: Event-driven "when X happens, do Y" across CIQ + your stack
- Outbound Actions: Turn creators into revenue channels (Meta audiences, Shopify orders, affiliate links)
- Knowledge & Agent Memory: Populate knowledge base so agents don't re-discover everything each time

**Upstream dependencies:**
- CreatorIQ API (primary data source)
- Supabase (database, edge functions, auth)
- OpenAI (agent analysis, knowledge extraction)

**Downstream dependencies (systems):**
- `creator-licensing-hub` (shares webhook_publisher_preferences table)
- `sunafusion-agent-shell` (uses knowledge base for agent context, shares agent_memories table)
- `creatorgift-backend` (receives webhook events)
- Meta/Facebook Ads (custom audiences, offline conversions)
- Shopify (draft orders, product sync)

**Shared tables:** `webhook_publisher_preferences` (see `OWNERSHIP_RULES.md` for coordination requirements), `agent_memories` (shared with sunafusion-agent-shell)

**This repo should NOT contain:** UI logic, business-specific copy, billing rules (delegate to product repos)

**If you change X, watch out for Y:**
- Changing `webhook_publisher_preferences` table → breaks `creator-licensing-hub` and `influencer-iq-flow-analysis` (coordinate via OWNERSHIP_RULES.md)
- Modifying workflow triggers → may break downstream webhook consumers (10+ repos depend on webhooks)
- Changing CreatorIQ API patterns → affects all 70+ edge functions
- Updating knowledge base schema → impacts agent memory system

**Refactor Risk:** High (used by 10+ repos, shared tables, webhook fan-out, keystone system)

### ciq-feed-map

**System Role:** Authoritative (source of truth for review/feed mapping and e-commerce sync)

**This repo exists to:** Map and sync product reviews/feed data between external sources and e-commerce platforms (Shopify, BigCommerce).

**Primary flows:**
- Review Import: Fetch reviews from external feeds, deduplicate, process images
- Product Sync: Sync products between Shopify and BigCommerce
- Customer Push: Export customer data to e-commerce platforms
- AI Enhancement: Use OpenAI to enhance review content and metadata

**Upstream dependencies:**
- External review feeds (source data)
- Shopify API (product/customer sync)
- BigCommerce API (product/customer sync)
- OpenAI (content enhancement)

**Downstream dependencies (systems):**
- Shopify stores (receives products, customers, reviews)
- BigCommerce stores (receives products, customers, reviews)

**If you change X, watch out for Y:**
- Changing review deduplication logic → may create duplicate reviews
- Modifying product sync → can cause inventory mismatches
- Updating customer export → may break customer matching in e-commerce platforms

**Refactor Risk:** Medium (single-domain service, but affects e-commerce data integrity)

### creator-sold-api-analysis

**System Role:** Consumer (processes CreatorIQ data, not authoritative for CreatorIQ operations)

**This repo exists to:** Analyze and process CreatorIQ CreatorSold API data for campaign performance tracking.

**Primary flows:**
- API Data Fetching: Pull campaign and publisher data from CreatorIQ CreatorSold API
- Data Processing: Transform and analyze campaign performance metrics
- Redis Caching: Cache API responses to reduce rate limits

**Upstream dependencies:**
- CreatorIQ CreatorSold API (data source)
- Redis (caching layer)
- AWS (deployment)

**Downstream dependencies (systems):**
- Analysis tools (receives processed campaign data)

**If you change X, watch out for Y:**
- Changing API rate limiting → may hit CreatorIQ limits
- Modifying cache keys → invalidates existing cached data
- Updating data transformation → breaks downstream consumers

**Refactor Risk:** Medium (single-domain service, but affects data pipeline)

### creatoriq-invoice-hub

**System Role:** Authoritative (source of truth for CreatorIQ invoicing and payment tracking)

**This repo exists to:** Generate and manage invoices for CreatorIQ campaigns, tracking creator payments and campaign costs.

**Primary flows:**
- Invoice Generation: Create invoices from CreatorIQ campaign data
- Payment Tracking: Track creator payments and campaign expenses
- Reporting: Generate financial reports for campaigns
- Webhook Processing: Process CreatorIQ webhooks for invoice updates

**Upstream dependencies:**
- CreatorIQ API (campaign and payment data)
- Supabase (database, edge functions)

**Downstream dependencies (systems):**
- Financial reporting tools
- Payment processing systems

**If you change X, watch out for Y:**
- Changing invoice schema → breaks existing invoice records
- Modifying webhook processing → may miss invoice updates
- Updating payment tracking → affects financial reporting accuracy

**Refactor Risk:** Medium (financial data, but isolated domain)

---

## E-commerce & Licensing

### creator-licensing-hub

**System Role:** Authoritative (source of truth for creator licensing and watermarking)

**This repo exists to:** Manage creator content licensing, watermarking, and distribution across e-commerce platforms.

**Primary flows:**
- Content Upload & Watermarking: Apply watermarks to licensed creator content
- BigCommerce Integration: Sync products, orders, and customer data
- Invoice Generation: Create invoices for licensed content usage
- Analytics & Metrics: Track content performance and licensing revenue

**Upstream dependencies:**
- `ciq-automations` (shares webhook_publisher_preferences table, receives creator data)
- BigCommerce API (product sync, order management)
- Supabase (database, storage)

**Downstream dependencies (systems):**
- BigCommerce stores (product listings, order fulfillment)
- CreatorIQ (creator data source)

**Shared tables:** `webhook_publisher_preferences` (see `OWNERSHIP_RULES.md` for coordination requirements)

**If you change X, watch out for Y:**
- Changing watermark logic → affects all licensed content
- Modifying BigCommerce sync → may create duplicate products or orders
- Updating invoice schema → breaks existing invoice records
- Changing `webhook_publisher_preferences` table → must coordinate with `ciq-automations` (see OWNERSHIP_RULES.md)

**Refactor Risk:** Medium (single-domain service, but shares table with ciq-automations)

### creatorgift-backend

**System Role:** Authoritative (source of truth for Creator Gift platform backend)

**This repo exists to:** Backend API for multi-tenant influencer gifting campaigns with Shopify integration.

**Primary flows:**
- Campaign Management: Create and manage gifting campaigns with product selections
- Order Processing: Convert influencer orders to Shopify draft orders
- Limit Enforcement: Enforce price, quantity, and order limits per influencer
- Subdomain Routing: Route requests to branded subdomains per tenant

**Upstream dependencies:**
- Shopify API (product management, draft orders)
- CreatorIQ (influencer verification)
- Redis (session/cache management)
- AWS (deployment)

**Downstream dependencies (systems):**
- `creatorgift-admin` (admin UI)
- `creatorgift-onboarding-app` (onboarding flow)
- Shopify stores (receives draft orders)

**Primary consumers:** Admin users, influencers (via frontend apps)

**If you change X, watch out for Y:**
- Changing order limit logic → affects all active campaigns
- Modifying Shopify draft order format → breaks order creation
- Updating subdomain routing → breaks tenant isolation

**Refactor Risk:** Medium (multi-tenant system, but isolated domain)

### four-visions-big-commerce

**System Role:** Authoritative (source of truth for Four Visions e-commerce platform)

**This repo exists to:** Full e-commerce platform for Four Visions brand with BigCommerce integration, OrderGroove subscriptions, and review management.

**Primary flows:**
- Product Sync: Sync products between systems and BigCommerce
- Order Management: Process orders, subscriptions, and promotions
- Customer Management: Handle customer accounts, authentication, and profiles
- Review Import: Import and manage product reviews
- Subscription Management: Handle OrderGroove subscription lifecycle

**Upstream dependencies:**
- BigCommerce API (products, orders, customers)
- OrderGroove API (subscriptions)
- Supabase (database, edge functions)

**Downstream dependencies (systems):**
- BigCommerce store (receives products, orders, customers)

**Primary consumers:** Customers (via frontend), internal ops

**If you change X, watch out for Y:**
- Changing OrderGroove sync → may create duplicate subscriptions
- Modifying order processing → can break order fulfillment
- Updating customer auth → affects all user logins
- Changing review import → may create duplicate reviews

**Refactor Risk:** Medium (single-brand platform, but complex integrations)

---

## Analytics & Reporting

### forecast-flex-wizard

**System Role:** Authoritative (source of truth for Meta/Facebook ad campaign sync)

**This repo exists to:** Sync and manage Meta/Facebook ad campaigns, accounts, and geo-breakdown data.

**Primary flows:**
- Ad Account Sync: Sync Meta ad accounts and campaigns
- Campaign Management: List and manage Meta ad campaigns
- Geo Breakdown: Fetch and analyze geo-based campaign performance
- Brand Sync: Sync brand data with Meta

**Upstream dependencies:**
- Meta/Facebook Marketing API (ad data)
- Supabase (database, edge functions)

**Downstream dependencies (systems):**
- Ad management tools (receives campaign data)

**If you change X, watch out for Y:**
- Changing API sync logic → may miss campaign updates
- Modifying geo breakdown → affects reporting accuracy

**Refactor Risk:** Medium (single-domain service, but affects ad data integrity)

---

## Landing Pages & Marketing

### debt-freedom-pathway-landing

**System Role:** Authoritative (source of truth for debt freedom pathway lead generation)

**This repo exists to:** Lead generation landing page with credit scoring, lead qualification, and Meta/Facebook conversion tracking.

**Primary flows:**
- Lead Capture: Collect lead information from landing page
- Credit Scoring: Score leads based on credit data
- Lead Qualification: Qualify leads for different programs
- Conversion Tracking: Send conversions to Meta/Facebook Ads
- Webhook Integration: Process leads via Zapier and other webhooks

**Upstream dependencies:**
- Supabase (database, edge functions)
- Meta/Facebook Conversions API (conversion tracking)
- Credit check APIs (lead scoring)

**Downstream dependencies (systems):**
- Meta/Facebook Ads (receives conversion events)
- CRM systems (via webhooks)

**If you change X, watch out for Y:**
- Changing credit scoring logic → affects lead qualification
- Modifying conversion tracking → breaks Meta ad optimization
- Updating webhook format → breaks downstream integrations

**Refactor Risk:** Low (marketing site, but affects lead pipeline)

---

## Utilities & Tools

### api-ninja-gateway

**System Role:** Authoritative (source of truth for OpenAI API gateway)

**This repo exists to:** Provide a unified API gateway for OpenAI API calls with translation and proxy capabilities.

**Primary flows:**
- API Proxy: Route OpenAI API calls through gateway
- API Translation: Translate API calls between different formats
- Documentation Analysis: Analyze API documentation patterns

**Upstream dependencies:**
- OpenAI API (target service)
- Supabase (database, edge functions)

**Downstream dependencies (systems):**
- Applications using OpenAI API (via gateway)

**If you change X, watch out for Y:**
- Changing proxy logic → breaks all API calls through gateway
- Modifying translation rules → may break client applications
- Updating API credentials → affects all downstream consumers

**Refactor Risk:** Medium (infrastructure component, but isolated functionality)

### client-survey-hub

**System Role:** Authoritative (source of truth for client survey management)

**This repo exists to:** Collect and manage client surveys with Supabase backend and Vercel frontend.

**Primary flows:**
- Survey Creation: Create and configure surveys
- Response Collection: Collect and store survey responses
- Analytics: Generate survey analytics and reports

**Upstream dependencies:**
- Supabase (database, auth)
- Vercel (frontend deployment)

**Downstream dependencies (systems):**
- Survey infrastructure (via frontend)

**Primary consumers:** Survey respondents, internal ops

**If you change X, watch out for Y:**
- Changing survey schema → breaks existing survey data
- Modifying response format → affects analytics accuracy

**Refactor Risk:** Low (standalone service, limited dependencies)

### html-to-visualize-food

**System Role:** Authoritative (source of truth for audio transcription and report generation)

**This repo exists to:** Process audio transcripts and generate visual reports using AI, with chunking and transcription capabilities.

**Primary flows:**
- Audio Upload: Upload and chunk audio files
- Transcription: Transcribe audio chunks using AssemblyAI
- Report Generation: Generate final reports from transcripts using AI
- Content Synthesis: Synthesize report content with AI

**Upstream dependencies:**
- AssemblyAI (transcription service)
- OpenAI (report generation, content synthesis)
- Supabase (database, storage, edge functions)

**Downstream dependencies (systems):**
- Report delivery infrastructure

**Primary consumers:** Users (receives generated reports)

**If you change X, watch out for Y:**
- Changing chunking logic → may break transcription
- Modifying report format → breaks downstream consumers
- Updating transcription service → affects all audio processing

**Refactor Risk:** Low (standalone service, limited dependencies)

### mom-walk-connect

**System Role:** Authoritative (source of truth for mom community platform)

**This repo exists to:** Community platform for moms with goals, conversations, and user management.

**Primary flows:**
- User Management: Handle user accounts, roles, and permissions
- Goal Tracking: Track user goals and progress
- Conversations: Manage user conversations and messages
- Deletion Management: Handle user conversation deletions

**Upstream dependencies:**
- Supabase (database, auth)

**Downstream dependencies (systems):**
- Frontend infrastructure

**Primary consumers:** Users (via frontend)

**If you change X, watch out for Y:**
- Changing user schema → breaks existing user data
- Modifying goal tracking → affects user progress
- Updating conversation format → breaks message history

**Refactor Risk:** Low (standalone community platform)

### text-safety-watchdog

**System Role:** Authoritative (source of truth for text content moderation)

**This repo exists to:** Monitor and moderate text content for safety, with user permissions and role management.

**Primary flows:**
- Text Analysis: Analyze text content for safety issues
- User Permissions: Manage user permissions and roles
- Content Moderation: Moderate unsafe content

**Upstream dependencies:**
- Supabase (database, auth)

**Downstream dependencies (systems):**
- Content platforms (receives moderation decisions)

**If you change X, watch out for Y:**
- Changing moderation rules → affects all content decisions
- Modifying permission schema → breaks user access

**Refactor Risk:** Medium (safety-critical, but isolated domain)

---

## Analysis & Documentation

### influencer-iq-flow-analysis

**System Role:** Analysis-only (read-only documentation/analysis, no production logic)

**This repo exists to:** Analysis copy of ciq-automations for flow analysis and documentation.

**Primary flows:**
- Flow Analysis: Analyze workflows and processes from ciq-automations
- Documentation: Generate documentation based on analysis

**Upstream dependencies:**
- `ciq-automations` (source - this is an analysis copy)

**Downstream dependencies (systems):**
- Documentation consumers

**Edit Policy:** No production logic. Changes must be upstreamed to source repo (`ciq-automations`).

**If you change X, watch out for Y:**
- This is a read-only analysis copy - changes should be made in `ciq-automations`
- Adding production logic here → violates analysis-only policy

**Refactor Risk:** Low (analysis-only, no production impact)

### creatorgift-admin-analysis

**System Role:** Analysis-only (read-only documentation/analysis, no production logic)

**This repo exists to:** Analysis and documentation of Creator Gift admin platform.

**Primary flows:**
- Documentation: Generate documentation for admin platform
- Analysis: Analyze admin platform structure

**Upstream dependencies:**
- `creatorgift-admin` (source code)

**Downstream dependencies (systems):**
- Documentation consumers

**Edit Policy:** No production logic. Changes must be upstreamed to source repo (`creatorgift-admin`).

**If you change X, watch out for Y:**
- Changing analysis format → breaks documentation
- Adding production logic here → violates analysis-only policy

**Refactor Risk:** Low (analysis-only, no production impact)

### creatorgift-backend-analysis

**System Role:** Analysis-only (read-only documentation/analysis, no production logic)

**This repo exists to:** Analysis and documentation of Creator Gift backend.

**Primary flows:**
- Documentation: Generate documentation for backend
- Analysis: Analyze backend structure

**Upstream dependencies:**
- `creatorgift-backend` (source code)

**Downstream dependencies (systems):**
- Documentation consumers

**Edit Policy:** No production logic. Changes must be upstreamed to source repo (`creatorgift-backend`).

**If you change X, watch out for Y:**
- Changing analysis format → breaks documentation
- Adding production logic here → violates analysis-only policy

**Refactor Risk:** Low (analysis-only, no production impact)

### creator-sold-analysis

**System Role:** Analysis-only (read-only documentation/analysis, no production logic)

**Confidence Level:** Medium (limited documentation / legacy)

**This repo exists to:** Analysis and API for Creator Sold platform with Next.js and Docker.

**Primary flows:**
- API Endpoints: Provide API endpoints for Creator Sold data
- Analysis: Analyze Creator Sold platform structure

**Upstream dependencies:**
- Next.js (framework)
- Docker (deployment)
- AWS (deployment)
- Vercel (deployment)

**Downstream dependencies (systems):**
- API consumers

**Edit Policy:** No production logic. Changes must be upstreamed to source repo if applicable.

**If you change X, watch out for Y:**
- Changing API endpoints → breaks consumers
- Modifying analysis → affects documentation

**Refactor Risk:** Low (analysis-only, no production impact)

---

## Other Repositories

### ads-gpt-starter

**System Role:** Experimental (starter template, may be removed or evolved)

**This repo exists to:** Starter template for GPT-powered ad generation with dataset management.

**Primary flows:**
- Dataset Management: Manage ad generation datasets
- Ad Generation: Generate ads using GPT models

**Upstream dependencies:**
- OpenAI (GPT models)
- Supabase (database)
- AWS (deployment)

**Downstream dependencies (systems):**
- Ad generation tools (receives datasets)

**If you change X, watch out for Y:**
- Changing dataset schema → breaks existing datasets
- Modifying ad generation → affects output quality

**Refactor Risk:** Low (experimental template, limited dependencies)

### candd-adserver

**System Role:** Authoritative (source of truth for ad serving platform)

**This repo exists to:** Ad serving platform with Redis caching and AWS deployment.

**Primary flows:**
- Ad Serving: Serve ads to clients
- Caching: Cache ad data in Redis

**Upstream dependencies:**
- Redis (caching)
- AWS (deployment)

**Downstream dependencies (systems):**
- Ad clients (receives ads)

**If you change X, watch out for Y:**
- Changing cache keys → invalidates all cached ads
- Modifying ad serving logic → affects all ad requests

**Refactor Risk:** Medium (infrastructure component, affects ad delivery)

### content4brand

**System Role:** Consumer (uses other systems, limited documentation)

**Confidence Level:** Medium (limited documentation / legacy)

**This repo exists to:** Content management platform for brands.

**Primary flows:**
- Content Management: Manage brand content

**Upstream dependencies:**
- Node.js runtime

**Downstream dependencies (systems):**
- Brand content consumers

**If you change X, watch out for Y:**
- Changing content schema → breaks existing content

**Refactor Risk:** Low (standalone tool, limited dependencies)

### convo-sparkle-magic

**System Role:** Consumer (uses webhook sources, limited documentation)

**Confidence Level:** Medium (limited documentation / legacy)

**This repo exists to:** Conversation enhancement tool with webhook integration.

**Primary flows:**
- Conversation Processing: Process and enhance conversations
- Webhook Integration: Handle webhook events

**Upstream dependencies:**
- Webhook sources

**Downstream dependencies (systems):**
- Conversation consumers

**If you change X, watch out for Y:**
- Changing webhook format → breaks integrations

**Refactor Risk:** Low (standalone tool, limited dependencies)

### creator-licensing-harmony

**System Role:** Consumer (uses Supabase, limited documentation)

**Confidence Level:** Medium (limited documentation / legacy)

**This repo exists to:** Content licensing management with Supabase backend.

**Primary flows:**
- License Management: Manage content licenses

**Upstream dependencies:**
- Supabase (database)

**Downstream dependencies (systems):**
- License consumers

**If you change X, watch out for Y:**
- Changing license schema → breaks existing licenses

**Refactor Risk:** Low (standalone tool, limited dependencies)

### creator-licensing-marketplace

**System Role:** Consumer (limited documentation)

**Confidence Level:** Medium (limited documentation / legacy)

**This repo exists to:** Marketplace for creator content licensing.

**Primary flows:**
- Marketplace Operations: Manage marketplace listings and transactions

**Upstream dependencies:**
- Node.js runtime

**Downstream dependencies (systems):**
- Marketplace infrastructure

**Primary consumers:** Marketplace users

**If you change X, watch out for Y:**
- Changing marketplace schema → breaks listings

**Refactor Risk:** Low (standalone tool, limited dependencies)

### creator-storefront-compass

**System Role:** Consumer (limited documentation)

**Confidence Level:** Medium (limited documentation / legacy)

**This repo exists to:** Storefront management for creators with AWS integration.

**Primary flows:**
- Storefront Management: Manage creator storefronts

**Upstream dependencies:**
- AWS (deployment)

**Downstream dependencies (systems):**
- Storefront infrastructure

**Primary consumers:** Storefront users

**If you change X, watch out for Y:**
- Changing storefront schema → breaks existing storefronts

**Refactor Risk:** Low (standalone tool, limited dependencies)

### creatorgift-admin

**System Role:** Consumer (frontend for creatorgift-backend)

**This repo exists to:** Admin interface for Creator Gift platform with AWS and Vercel deployment.

**Primary flows:**
- Campaign Management: Admin interface for managing gifting campaigns
- Analytics: View campaign analytics and metrics

**Upstream dependencies:**
- `creatorgift-backend` (API)
- AWS (deployment)
- Vercel (frontend)
- CreatorIQ (creator data)

**Downstream dependencies (systems):**
- Frontend infrastructure

**Primary consumers:** Admin users (via frontend)

**If you change X, watch out for Y:**
- Changing API contract → breaks admin interface
- Modifying campaign schema → affects all campaigns

**Refactor Risk:** Low (frontend only, depends on backend)

### CIQ-landing-pages

**System Role:** Consumer (limited documentation)

**Confidence Level:** Medium (limited documentation / legacy)

**This repo exists to:** Landing pages for CreatorIQ-related projects.

**Primary flows:**
- Landing Page Management: Manage landing pages

**Upstream dependencies:**
- Unknown

**Downstream dependencies (systems):**
- Landing page hosting infrastructure

**Primary consumers:** Landing page visitors

**If you change X, watch out for Y:**
- Changing page structure → breaks existing pages

**Refactor Risk:** Low (marketing site, limited dependencies)

### alan_test

**System Role:** Experimental (test repository, may be removed)

**This repo exists to:** Test repository with Node.js and Python.

**Primary flows:**
- Testing: Various test scenarios

**Upstream dependencies:**
- Redis (caching)

**Downstream dependencies (systems):**
- Test infrastructure

**If you change X, watch out for Y:**
- This is a test repo - changes may not affect production

**Refactor Risk:** Low (test repo, no production impact)

---

## Summary Statistics

- **Total Repositories**: 54
- **Repos with Database Tables**: 22
- **Repos with Supabase Edge Functions**: 20
- **Repos with API Routes**: 5
- **Primary Integration**: CreatorIQ (used by 15+ repos)
- **Primary Infrastructure**: Supabase (used by 30+ repos)

---

## Notes for AI Assistants

When reviewing or editing this document:

1. **Consistency**: Ensure all summaries follow the same format (Why → Flows → Dependencies → Warnings)
2. **Accuracy**: Verify technical details match actual codebase structure
3. **Completeness**: Check that all 54 repos are documented
4. **Clarity**: Use plain language, avoid jargon unless necessary
5. **Actionability**: "Change impact warnings" should be specific and actionable

**Common Patterns to Watch For:**
- Shared tables between repos (coordination required)
- Webhook dependencies (breaking changes affect multiple systems)
- API rate limits (CreatorIQ, Shopify, Meta)
- Multi-tenant architectures (subdomain routing, tenant isolation)

---

**End of Document**
