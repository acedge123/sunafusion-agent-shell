# Shared Components & Similarities Analysis

**Generated:** 2026-01-25  
**Purpose:** Identify repos with similarities and opportunities for shared components

---

## Executive Summary

After analyzing all 54 repositories, here are the key findings:

### High-Priority Shared Component Opportunities

1. **Supabase + React + TypeScript + Tailwind Stack** (30+ repos)
2. **CreatorIQ API Integration** (10+ repos)
3. **E-commerce Integrations** (BigCommerce, Shopify - 5+ repos)
4. **Authentication & User Management** (Supabase Auth - 25+ repos)
5. **Webhook Handling Patterns** (15+ repos)
6. **Analytics & Tracking** (shared tables across 4 repos)

---

## 1. Frontend Stack Similarities

### React + TypeScript + Vite + Tailwind + shadcn/ui (30+ repos)

**Repos using this stack:**
- `sunafusion-agent-shell`
- `ciq-automations`
- `creator-licensing-hub`
- `temp-creator-repo` (duplicate of creator-licensing-hub)
- `four-visions-big-commerce`
- `client-survey-hub`
- `debt-freedom-pathway-landing`
- `forecast-flex-wizard`
- `html-to-visualize-food`
- `mom-walk-connect`
- `text-safety-watchdog`
- `linkcreator-magic`
- `loan-chat-wizard-api`
- `pathfinder-financial-insights`
- `quiz-product-tinker`
- `lovable-audit`
- `tga-crm`
- `textweaver-gigcraft`
- `voice-agent-ciq-agent`
- `creator-licensing-harmony`
- `influencer-iq-flow-analysis`
- `kitchen-capital-connect`
- `lifetrack`
- `live-nation-demo`
- `new-api-project`
- `api-ninja-gateway`
- `ciq-feed-map`
- `creator-storefront-compass`
- `creatorgift-admin`
- `creatorgift-onboarding-app`

**Shared Component Opportunities:**
- ✅ **UI Component Library** (Button, Input, Card, Modal, etc.)
- ✅ **Form Components** (React Hook Form + Zod validation)
- ✅ **Auth Components** (Login, Signup, Profile)
- ✅ **Layout Components** (Header, Sidebar, Footer)
- ✅ **Data Table Components** (with sorting, filtering, pagination)
- ✅ **Loading States** (Skeleton, Spinner)
- ✅ **Error Boundaries** (Error handling UI)
- ✅ **Toast/Notification System**

**Recommendation:** Create a shared `@tga/ui-components` package or monorepo workspace.

---

## 2. CreatorIQ Integration Patterns

### Repos with CreatorIQ Integration (10+ repos)

**Repos:**
- `ciq-automations` (keystone - authoritative)
- `influencer-iq-flow-analysis` (analysis copy)
- `creator-licensing-hub`
- `creatorgift-backend`
- `creatorgift-admin`
- `creatorgift-onboarding-app`
- `creatoriq-invoice-hub`
- `creator-sold-api-analysis`
- `gig-whisperer-sheet`
- `live-nation-demo`
- `lovable-audit`
- `tga-crm`
- `textweaver-gigcraft`
- `voice-agent-ciq-agent`
- `sunafusion-agent-shell` (via unified-agent)

**Shared Patterns Found:**
- API authentication (x-api-key headers)
- GraphQL Content API integration
- REST CRM API integration
- Publisher ID handling (Id vs NetworkPublisherId vs PublisherId)
- Rate limiting and caching
- Webhook processing
- Media fetching and caching

**Shared Component Opportunities:**
- ✅ **CreatorIQ SDK/Client** (unified API wrapper)
- ✅ **Publisher ID Utilities** (normalize ID types)
- ✅ **Rate Limiting Middleware** (Redis-based)
- ✅ **Webhook Handler Base Class**
- ✅ **Media Cache Service**
- ✅ **Campaign Management Utilities**
- ✅ **List Operations Utilities**

**Recommendation:** Extract `ciq-automations` API patterns into `@tga/creatoriq-sdk` package.

**Current State:** `ciq-automations` has `CREATOR_IQ_INTEGRATION_GUIDE.md` that should be the source of truth.

---

## 3. E-commerce Integration Patterns

### BigCommerce Integration (3 repos)

**Repos:**
- `creator-licensing-hub` (authoritative)
- `four-visions-big-commerce` (authoritative for Four Visions)
- `temp-creator-repo` (duplicate)

**Shared Patterns:**
- GraphQL Storefront API (cart creation)
- REST Management API (checkout URLs)
- Product sync
- Order management
- Customer sync
- Webhook handling

**Shared Component Opportunities:**
- ✅ **BigCommerce SDK** (already exists in `four-visions-big-commerce`)
- ✅ **Cart Management** (create, update, checkout)
- ✅ **Product Sync Utilities**
- ✅ **Order Processing Pipeline**
- ✅ **Webhook Handler Base**

**Recommendation:** Extract BigCommerce SDK from `four-visions-big-commerce` to shared package.

### Shopify Integration (2 repos)

**Repos:**
- `creatorgift-backend` (authoritative)
- `ciq-automations` (draft orders, product sync)

**Shared Patterns:**
- Draft order creation
- Product management
- Customer sync
- Webhook processing

**Shared Component Opportunities:**
- ✅ **Shopify SDK** (unified client)
- ✅ **Draft Order Utilities**
- ✅ **Product Sync Service**
- ✅ **Webhook Handler**

**Recommendation:** Create shared `@tga/shopify-sdk` package.

---

## 4. Supabase Patterns

### Supabase Integration (35+ repos)

**Common Patterns:**
- Authentication (Supabase Auth)
- Database (PostgreSQL via Supabase)
- Edge Functions (Deno runtime)
- Storage (file uploads)
- Real-time subscriptions
- Row Level Security (RLS)

**Shared Component Opportunities:**
- ✅ **Supabase Client Factory** (with error handling)
- ✅ **Auth Context/Hook** (React)
- ✅ **Database Type Generators** (TypeScript types from schema)
- ✅ **Edge Function Templates** (with auth, CORS, error handling)
- ✅ **Storage Upload Utilities** (with progress tracking)
- ✅ **RLS Policy Helpers** (common patterns)
- ✅ **Real-time Subscription Hooks**

**Recommendation:** Create `@tga/supabase-utils` package with common patterns.

---

## 5. Webhook Handling Patterns

### Repos with Webhook Integration (15+ repos)

**Repos:**
- `ciq-automations` (keystone)
- `creator-licensing-hub`
- `creatorgift-backend`
- `four-visions-big-commerce`
- `debt-freedom-pathway-landing`
- `mom-walk-connect`
- `tga-crm`
- `textweaver-gigcraft`
- `pathfinder-financial-insights`
- `convo-sparkle-magic`
- `lovable-audit`
- `temp-creator-repo`

**Shared Patterns:**
- Webhook signature verification
- Event routing
- Retry logic
- Event logging
- Idempotency handling

**Shared Component Opportunities:**
- ✅ **Webhook Handler Base Class** (signature verification, routing)
- ✅ **Event Router** (route events to handlers)
- ✅ **Retry Service** (exponential backoff)
- ✅ **Webhook Logger** (audit trail)
- ✅ **Idempotency Middleware**

**Recommendation:** Create `@tga/webhook-handler` package.

---

## 6. Analytics & Tracking

### Shared Analytics Tables (4 repos)

**Repos sharing analytics tables:**
- `creator-licensing-hub`
- `temp-creator-repo` (duplicate)
- `four-visions-big-commerce`

**Shared Tables:**
- `analytics_events`
- `analytics_sessions`
- `analytics_visitors`
- `tracked_events`
- `tracking_pixels`

**Shared Component Opportunities:**
- ✅ **Analytics SDK** (event tracking, session management)
- ✅ **Pixel Tracking Service**
- ✅ **Conversion Tracking Utilities**
- ✅ **Analytics Dashboard Components**

**Recommendation:** Create `@tga/analytics` package with shared schema ownership.

---

## 7. Authentication & User Management

### Supabase Auth (25+ repos)

**Common Patterns:**
- Email/password auth
- OAuth providers (Google, GitHub, etc.)
- User profiles
- Role-based access control (RBAC)
- Session management

**Shared Component Opportunities:**
- ✅ **Auth Context Provider** (React)
- ✅ **Protected Route Component**
- ✅ **Role-based Access Hooks**
- ✅ **User Profile Components**
- ✅ **Auth Utilities** (token refresh, logout)

**Recommendation:** Extract auth patterns into `@tga/auth` package.

---

## 8. Form Handling Patterns

### React Hook Form + Zod (20+ repos)

**Common Patterns:**
- Form validation with Zod schemas
- Error handling
- Field components
- Form submission with loading states

**Shared Component Opportunities:**
- ✅ **Form Field Components** (Input, Select, Textarea with validation)
- ✅ **Form Error Display**
- ✅ **Form Submission Handler** (with loading/error states)
- ✅ **Common Validation Schemas** (email, phone, etc.)

---

## 9. API Client Patterns

### Supabase Edge Functions as API Proxy (25+ repos)

**Common Patterns:**
- Edge function as secure proxy
- CORS handling
- Authentication middleware
- Error handling
- Request/response logging

**Shared Component Opportunities:**
- ✅ **Edge Function Base Template** (CORS, auth, error handling)
- ✅ **API Client SDK** (typed client for edge functions)
- ✅ **Request/Response Interceptors**
- ✅ **Error Handling Utilities**

---

## 10. Data Visualization

### Chart Libraries (3 repos)

**Repos:**
- `four-visions-big-commerce` (Recharts)
- `client-survey-hub` (likely Recharts)
- `forecast-flex-wizard` (likely charts)

**Shared Component Opportunities:**
- ✅ **Chart Components** (Line, Bar, Pie with consistent styling)
- ✅ **Dashboard Layout Components**
- ✅ **Metric Cards**

---

## Recommendations by Priority

### 🔴 High Priority (Immediate ROI)

1. **CreatorIQ SDK** - Extract from `ciq-automations`
   - **Impact:** 10+ repos would benefit
   - **Effort:** Medium (extract existing patterns)
   - **Owner:** `ciq-automations` (keystone)

2. **Supabase Utilities** - Common patterns
   - **Impact:** 35+ repos would benefit
   - **Effort:** Low (extract existing patterns)
   - **Owner:** `sunafusion-agent-shell` or new `tga-shared` repo

3. **UI Component Library** - shadcn/ui components
   - **Impact:** 30+ repos would benefit
   - **Effort:** Medium (consolidate existing components)
   - **Owner:** New `@tga/ui-components` package

### 🟡 Medium Priority (Next Quarter)

4. **BigCommerce SDK** - Extract from `four-visions-big-commerce`
   - **Impact:** 3 repos currently, potential for more
   - **Effort:** Low (already exists, just extract)

5. **Webhook Handler Base** - Common webhook patterns
   - **Impact:** 15+ repos would benefit
   - **Effort:** Medium (create base class)

6. **Analytics SDK** - Shared analytics tables
   - **Impact:** 4 repos currently share tables
   - **Effort:** Medium (create SDK for shared schema)

### 🟢 Low Priority (Future)

7. **Shopify SDK** - Only 2 repos currently
8. **Chart Components** - Only 3 repos currently
9. **Form Components** - Can be part of UI library

---

## Implementation Strategy

### Option 1: Monorepo (Recommended)
Create a `tga-shared` monorepo with packages:
```
tga-shared/
├── packages/
│   ├── ui-components/      # React components
│   ├── creatoriq-sdk/       # CreatorIQ integration
│   ├── supabase-utils/      # Supabase patterns
│   ├── webhook-handler/     # Webhook base
│   ├── analytics/           # Analytics SDK
│   └── bigcommerce-sdk/     # BigCommerce SDK
```

### Option 2: NPM Packages
Publish individual packages to private NPM registry:
- `@tga/ui-components`
- `@tga/creatoriq-sdk`
- `@tga/supabase-utils`
- etc.

### Option 3: Git Submodules
Keep shared code in separate repos, use as git submodules (not recommended).

---

## Duplicate Repos to Consolidate

1. **`temp-creator-repo`** → `creator-licensing-hub` (already marked as duplicate)
2. **`influencer-iq-flow-analysis`** → `ciq-automations` (analysis copy, no production logic)
3. **`creatorgift-admin-analysis`** → `creatorgift-admin` (analysis copy)
4. **`creatorgift-backend-analysis`** → `creatorgift-backend` (analysis copy)

**Action:** These should reference shared components from their source repos, not duplicate code.

---

## Repos with Unique Patterns (Keep Separate)

These repos have unique requirements and shouldn't share components:
- `ads-gpt-starter` (experimental template)
- `alan_test` (test repo)
- `candd-adserver` (Python-based, different stack)
- `scoring-engine` (Python backend)
- `hfc-scoring-engine` (Python backend)
- `NLWeb` (different stack)
- `suna` / `suna-kortix` (different architecture)

---

## Next Steps

1. **Audit existing code** - Identify exact duplicate code patterns
2. **Create shared package structure** - Set up monorepo or NPM packages
3. **Extract high-priority components** - Start with CreatorIQ SDK and Supabase utils
4. **Update repos** - Migrate repos to use shared components
5. **Documentation** - Create usage guides for each shared package
6. **CI/CD** - Set up automated testing and publishing for shared packages

---

## Notes

- **Shared tables** require coordination (see `OWNERSHIP_RULES.md`)
- **Analysis repos** should not duplicate production logic
- **Keystone repos** (`ciq-automations`, `sunafusion-agent-shell`) should be sources of truth
- **System Roles** (from `MASTER_DOMAIN_SUMMARY.md`) determine ownership
