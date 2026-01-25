# Domain Summaries

**Purpose**: High-level "WHY" and "HOW" summaries for each repository. These help the agent understand system purpose, flows, and dependencies without reading raw code.

**Format**: 5-8 bullets per repo covering:
- Why the repo exists
- Primary flows
- Upstream/downstream dependencies
- Change impact warnings

Generated: 2026-01-25T01:45:59.160Z

---

## ciq-automations

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

**Downstream dependencies:**
- `creator-licensing-hub` (shares webhook_publisher_preferences table)
- `sunafusion-agent-shell` (uses knowledge base for agent context)
- `creatorgift-backend` (receives webhook events)
- Meta/Facebook Ads (custom audiences, offline conversions)
- Shopify (draft orders, product sync)

**If you change X, watch out for Y:**
- Changing `webhook_publisher_preferences` table → breaks `creator-licensing-hub` and `influencer-iq-flow-analysis`
- Modifying workflow triggers → may break downstream webhook consumers
- Changing CreatorIQ API patterns → affects all 70+ edge functions
- Updating knowledge base schema → impacts agent memory system

---

## creator-licensing-hub

**This repo exists to:** Manage creator content licensing, watermarking, and distribution across e-commerce platforms.

**Primary flows:**
- Content Upload & Watermarking: Apply watermarks to licensed creator content
- BigCommerce Integration: Sync products, orders, and customer data
- Invoice Generation: Create invoices for licensed content usage
- Analytics & Metrics: Track content performance and licensing revenue

**Upstream dependencies:**
- `ciq-automations` (shares webhook_publisher_preferences, receives creator data)
- BigCommerce API (product sync, order management)
- Supabase (database, storage)

**Downstream dependencies:**
- BigCommerce stores (product listings, order fulfillment)
- CreatorIQ (creator data source)

**If you change X, watch out for Y:**
- Changing watermark logic → affects all licensed content
- Modifying BigCommerce sync → may create duplicate products or orders
- Updating invoice schema → breaks existing invoice records

---

## ciq-feed-map

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

**Downstream dependencies:**
- Shopify stores (receives products, customers, reviews)
- BigCommerce stores (receives products, customers, reviews)

**If you change X, watch out for Y:**
- Changing review deduplication logic → may create duplicate reviews
- Modifying product sync → can cause inventory mismatches
- Updating customer export → may break customer matching in e-commerce platforms

---

## creator-sold-api-analysis

**This repo exists to:** Analyze and process CreatorIQ CreatorSold API data for campaign performance tracking.

**Primary flows:**
- API Data Fetching: Pull campaign and publisher data from CreatorIQ CreatorSold API
- Data Processing: Transform and analyze campaign performance metrics
- Redis Caching: Cache API responses to reduce rate limits

**Upstream dependencies:**
- CreatorIQ CreatorSold API (data source)
- Redis (caching layer)
- AWS (deployment)

**Downstream dependencies:**
- Analysis tools (receives processed campaign data)

**If you change X, watch out for Y:**
- Changing API rate limiting → may hit CreatorIQ limits
- Modifying cache keys → invalidates existing cached data
- Updating data transformation → breaks downstream consumers

---

## creatorgift-backend

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

**Downstream dependencies:**
- `creatorgift-admin` (admin UI)
- `creatorgift-onboarding-app` (onboarding flow)
- Shopify stores (receives draft orders)

**If you change X, watch out for Y:**
- Changing order limit logic → affects all active campaigns
- Modifying Shopify draft order format → breaks order creation
- Updating subdomain routing → breaks tenant isolation

---

## creatoriq-invoice-hub

**This repo exists to:** Generate and manage invoices for CreatorIQ campaigns, tracking creator payments and campaign costs.

**Primary flows:**
- Invoice Generation: Create invoices from CreatorIQ campaign data
- Payment Tracking: Track creator payments and campaign expenses
- Reporting: Generate financial reports for campaigns
- Webhook Processing: Process CreatorIQ webhooks for invoice updates

**Upstream dependencies:**
- CreatorIQ API (campaign and payment data)
- Supabase (database, edge functions)

**Downstream dependencies:**
- Financial reporting tools
- Payment processing systems

**If you change X, watch out for Y:**
- Changing invoice schema → breaks existing invoice records
- Modifying webhook processing → may miss invoice updates
- Updating payment tracking → affects financial reporting accuracy

---

## api-ninja-gateway

**This repo exists to:** Provide a unified API gateway for OpenAI API calls with translation and proxy capabilities.

**Primary flows:**
- API Proxy: Route OpenAI API calls through gateway
- API Translation: Translate API calls between different formats
- Documentation Analysis: Analyze API documentation patterns

**Upstream dependencies:**
- OpenAI API (target service)
- Supabase (database, edge functions)

**Downstream dependencies:**
- Applications using OpenAI API (via gateway)

**If you change X, watch out for Y:**
- Changing proxy logic → breaks all API calls through gateway
- Modifying translation rules → may break client applications
- Updating API credentials → affects all downstream consumers

---

## sunafusion-agent-shell

**This repo exists to:** Provide an AI agent platform with memory, tool access, and codebase understanding for personal assistant use cases.

**Primary flows:**
- Quick Mode (Edge): Fast responses using unified-agent with repo-map, memory, and integrations
- Heavy Mode (Backend): Full agent with sandbox, tool loops, and long-running tasks
- Memory System: Store and recall durable facts/preferences
- Repo-Map Integration: Answer questions about codebase structure and ownership

**Upstream dependencies:**
- Supabase (database, edge functions, auth)
- OpenAI/Anthropic (LLM providers)
- CreatorIQ (via unified-agent)
- Google Drive (via unified-agent)
- Slack (via unified-agent)

**Downstream dependencies:**
- Users (via chat interface)
- Other repos (via repo-map queries)

**If you change X, watch out for Y:**
- Changing memory schema → invalidates existing memories
- Modifying repo-map structure → breaks codebase queries
- Updating agent routing → affects all user interactions

---

## client-survey-hub

**This repo exists to:** Collect and manage client surveys with Supabase backend and Vercel frontend.

**Primary flows:**
- Survey Creation: Create and configure surveys
- Response Collection: Collect and store survey responses
- Analytics: Generate survey analytics and reports

**Upstream dependencies:**
- Supabase (database, auth)
- Vercel (frontend deployment)

**Downstream dependencies:**
- Survey respondents (via frontend)

**If you change X, watch out for Y:**
- Changing survey schema → breaks existing survey data
- Modifying response format → affects analytics accuracy

---

## four-visions-big-commerce

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

**Downstream dependencies:**
- BigCommerce store (receives products, orders, customers)
- Customers (via frontend)

**If you change X, watch out for Y:**
- Changing OrderGroove sync → may create duplicate subscriptions
- Modifying order processing → can break order fulfillment
- Updating customer auth → affects all user logins
- Changing review import → may create duplicate reviews

---

## debt-freedom-pathway-landing

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

**Downstream dependencies:**
- Meta/Facebook Ads (receives conversion events)
- CRM systems (via webhooks)

**If you change X, watch out for Y:**
- Changing credit scoring logic → affects lead qualification
- Modifying conversion tracking → breaks Meta ad optimization
- Updating webhook format → breaks downstream integrations

---

## forecast-flex-wizard

**This repo exists to:** Sync and manage Meta/Facebook ad campaigns, accounts, and geo-breakdown data.

**Primary flows:**
- Ad Account Sync: Sync Meta ad accounts and campaigns
- Campaign Management: List and manage Meta ad campaigns
- Geo Breakdown: Fetch and analyze geo-based campaign performance
- Brand Sync: Sync brand data with Meta

**Upstream dependencies:**
- Meta/Facebook Marketing API (ad data)
- Supabase (database, edge functions)

**Downstream dependencies:**
- Ad management tools (receives campaign data)

**If you change X, watch out for Y:**
- Changing API sync logic → may miss campaign updates
- Modifying geo breakdown → affects reporting accuracy

---

## html-to-visualize-food

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

**Downstream dependencies:**
- Users (receives generated reports)

**If you change X, watch out for Y:**
- Changing chunking logic → may break transcription
- Modifying report format → breaks downstream consumers
- Updating transcription service → affects all audio processing

---

## mom-walk-connect

**This repo exists to:** Community platform for moms with goals, conversations, and user management.

**Primary flows:**
- User Management: Handle user accounts, roles, and permissions
- Goal Tracking: Track user goals and progress
- Conversations: Manage user conversations and messages
- Deletion Management: Handle user conversation deletions

**Upstream dependencies:**
- Supabase (database, auth)

**Downstream dependencies:**
- Users (via frontend)

**If you change X, watch out for Y:**
- Changing user schema → breaks existing user data
- Modifying goal tracking → affects user progress
- Updating conversation format → breaks message history

---

## text-safety-watchdog

**This repo exists to:** Monitor and moderate text content for safety, with user permissions and role management.

**Primary flows:**
- Text Analysis: Analyze text content for safety issues
- User Permissions: Manage user permissions and roles
- Content Moderation: Moderate unsafe content

**Upstream dependencies:**
- Supabase (database, auth)

**Downstream dependencies:**
- Content platforms (receives moderation decisions)

**If you change X, watch out for Y:**
- Changing moderation rules → affects all content decisions
- Modifying permission schema → breaks user access

---

## ads-gpt-starter

**This repo exists to:** Starter template for GPT-powered ad generation with dataset management.

**Primary flows:**
- Dataset Management: Manage ad generation datasets
- Ad Generation: Generate ads using GPT models

**Upstream dependencies:**
- OpenAI (GPT models)
- Supabase (database)
- AWS (deployment)

**Downstream dependencies:**
- Ad generation tools (receives datasets)

**If you change X, watch out for Y:**
- Changing dataset schema → breaks existing datasets
- Modifying ad generation → affects output quality

---

## candd-adserver

**This repo exists to:** Ad serving platform with Redis caching and AWS deployment.

**Primary flows:**
- Ad Serving: Serve ads to clients
- Caching: Cache ad data in Redis

**Upstream dependencies:**
- Redis (caching)
- AWS (deployment)

**Downstream dependencies:**
- Ad clients (receives ads)

**If you change X, watch out for Y:**
- Changing cache keys → invalidates all cached ads
- Modifying ad serving logic → affects all ad requests

---

## content4brand

**This repo exists to:** Content management platform for brands.

**Primary flows:**
- Content Management: Manage brand content

**Upstream dependencies:**
- Node.js runtime

**Downstream dependencies:**
- Brand content consumers

**If you change X, watch out for Y:**
- Changing content schema → breaks existing content

---

## convo-sparkle-magic

**This repo exists to:** Conversation enhancement tool with webhook integration.

**Primary flows:**
- Conversation Processing: Process and enhance conversations
- Webhook Integration: Handle webhook events

**Upstream dependencies:**
- Webhook sources

**Downstream dependencies:**
- Conversation consumers

**If you change X, watch out for Y:**
- Changing webhook format → breaks integrations

---

## creator-licensing-harmony

**This repo exists to:** Content licensing management with Supabase backend.

**Primary flows:**
- License Management: Manage content licenses

**Upstream dependencies:**
- Supabase (database)

**Downstream dependencies:**
- License consumers

**If you change X, watch out for Y:**
- Changing license schema → breaks existing licenses

---

## creator-licensing-marketplace

**This repo exists to:** Marketplace for creator content licensing.

**Primary flows:**
- Marketplace Operations: Manage marketplace listings and transactions

**Upstream dependencies:**
- Node.js runtime

**Downstream dependencies:**
- Marketplace users

**If you change X, watch out for Y:**
- Changing marketplace schema → breaks listings

---

## creator-storefront-compass

**This repo exists to:** Storefront management for creators with AWS integration.

**Primary flows:**
- Storefront Management: Manage creator storefronts

**Upstream dependencies:**
- AWS (deployment)

**Downstream dependencies:**
- Storefront users

**If you change X, watch out for Y:**
- Changing storefront schema → breaks existing storefronts

---

## creatorgift-admin

**This repo exists to:** Admin interface for Creator Gift platform with AWS and Vercel deployment.

**Primary flows:**
- Campaign Management: Admin interface for managing gifting campaigns
- Analytics: View campaign analytics and metrics

**Upstream dependencies:**
- `creatorgift-backend` (API)
- AWS (deployment)
- Vercel (frontend)
- CreatorIQ (creator data)

**Downstream dependencies:**
- Admin users (via frontend)

**If you change X, watch out for Y:**
- Changing API contract → breaks admin interface
- Modifying campaign schema → affects all campaigns

---

## creatorgift-admin-analysis

**This repo exists to:** Analysis and documentation of Creator Gift admin platform.

**Primary flows:**
- Documentation: Generate documentation for admin platform
- Analysis: Analyze admin platform structure

**Upstream dependencies:**
- `creatorgift-admin` (source code)

**Downstream dependencies:**
- Documentation consumers

**If you change X, watch out for Y:**
- Changing analysis format → breaks documentation

---

## creatorgift-backend-analysis

**This repo exists to:** Analysis and documentation of Creator Gift backend.

**Primary flows:**
- Documentation: Generate documentation for backend
- Analysis: Analyze backend structure

**Upstream dependencies:**
- `creatorgift-backend` (source code)

**Downstream dependencies:**
- Documentation consumers

**If you change X, watch out for Y:**
- Changing analysis format → breaks documentation

---

## creator-sold-analysis

**This repo exists to:** Analysis and API for Creator Sold platform with Next.js and Docker.

**Primary flows:**
- API Endpoints: Provide API endpoints for Creator Sold data
- Analysis: Analyze Creator Sold platform structure

**Upstream dependencies:**
- Next.js (framework)
- Docker (deployment)
- AWS (deployment)
- Vercel (deployment)

**Downstream dependencies:**
- API consumers

**If you change X, watch out for Y:**
- Changing API endpoints → breaks consumers
- Modifying analysis → affects documentation

---

## CIQ-landing-pages

**This repo exists to:** Landing pages for CreatorIQ-related projects.

**Primary flows:**
- Landing Page Management: Manage landing pages

**Upstream dependencies:**
- Unknown

**Downstream dependencies:**
- Landing page visitors

**If you change X, watch out for Y:**
- Changing page structure → breaks existing pages

---

## influencer-iq-flow-analysis

**This repo exists to:** Analysis copy of ciq-automations for flow analysis and documentation.

**Primary flows:**
- Flow Analysis: Analyze workflows and processes from ciq-automations
- Documentation: Generate documentation based on analysis

**Upstream dependencies:**
- `ciq-automations` (source - this is an analysis copy)

**Downstream dependencies:**
- Documentation consumers

**If you change X, watch out for Y:**
- This is a read-only analysis copy - changes should be made in `ciq-automations`

---

## alan_test

**This repo exists to:** Test repository with Node.js and Python.

**Primary flows:**
- Testing: Various test scenarios

**Upstream dependencies:**
- Redis (caching)

**Downstream dependencies:**
- Test consumers

**If you change X, watch out for Y:**
- This is a test repo - changes may not affect production

---
