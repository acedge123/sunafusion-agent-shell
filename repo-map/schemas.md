# Database Schema Ownership



Generated: 2026-03-21T16:18:32.880Z



This document maps database tables to their owning repositories.

**Ownership** = the repo where the migration that creates the table lives.



## Table Ownership



### `achievements`
- **Owner:** `lifetrack`

### `action_allowlist`
- **Owner:** `ciq-automations`
- **Also used by:** `key-vault-executor`
- ⚠️  **Shared table** - changes should be coordinated

### `activities`
- **Owner:** `mom-walk-connect`

### `activity_types`
- **Owner:** `brand-connect-hub`

### `actual_metrics`
- **Owner:** `forecast-flex-wizard`

### `admin_notification_emails`
- **Owner:** `four-visions-big-commerce`
- **Also used by:** `mom-walk-connect`
- ⚠️  **Shared table** - changes should be coordinated

### `admin_notifications`
- **Owner:** `mom-walk-connect`

### `admin_roles`
- **Owner:** `four-visions-big-commerce`

### `admin_tickets`
- **Owner:** `four-visions-big-commerce`

### `admin_users`
- **Owner:** `client-survey-hub`

### `agent_jobs`
- **Owner:** `echelon-control`

### `agent_join_idempotency`
- **Owner:** `governance-hub`

### `agent_learnings`
- **Owner:** `sunafusion-agent-shell`

### `agent_memories`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`, `sunafusion-agent-shell`
- ⚠️  **Shared table** - changes should be coordinated

### `agent_sessions`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `agent_tasks`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `agent_tenant_memberships`
- **Owner:** `governance-hub`

### `agent_tool_executions`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `agent_verification_tokens`
- **Owner:** `governance-hub`

### `agents`
- **Owner:** `governance-hub`

### `ai_conversations`
- **Owner:** `html-to-visualize-food`

### `ai_messages`
- **Owner:** `html-to-visualize-food`

### `ambassador_assignments`
- **Owner:** `mom-walk-connect`

### `analysis_projects`
- **Owner:** `html-to-visualize-food`

### `analytics_events`
- **Owner:** `creator-licensing-hub`
- **Also used by:** `echelon-control`, `four-visions-big-commerce`, `kitchen-capital-connect`, `live-nation-demo`, `temp-creator-repo`
- ⚠️  **Shared table** - changes should be coordinated

### `analytics_page_views`
- **Owner:** `live-nation-demo`

### `analytics_sessions`
- **Owner:** `creator-licensing-hub`
- **Also used by:** `four-visions-big-commerce`, `live-nation-demo`, `temp-creator-repo`
- ⚠️  **Shared table** - changes should be coordinated

### `analytics_visitors`
- **Owner:** `creator-licensing-hub`
- **Also used by:** `temp-creator-repo`
- ⚠️  **Shared table** - changes should be coordinated

### `answers`
- **Owner:** `client-survey-hub`

### `api_call_logs`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `api_credentials`
- **Owner:** `api-ninja-gateway`

### `api_key_access`
- **Owner:** `text-safety-watchdog`

### `api_keys`
- **Owner:** `ciq-automations`
- **Also used by:** `governance-hub`, `onsite-affiliate`
- ⚠️  **Shared table** - changes should be coordinated

### `api_patterns`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `approvals`
- **Owner:** `governance-hub`

### `asset_performance`
- **Owner:** `onsite-affiliate`

### `assets`
- **Owner:** `onsite-affiliate`

### `attributions`
- **Owner:** `onsite-affiliate`

### `audio_chunks`
- **Owner:** `html-to-visualize-food`

### `audit_blobs`
- **Owner:** `governance-hub`

### `audit_log`
- **Owner:** `ciq-automations`
- **Also used by:** `onsite-affiliate`
- ⚠️  **Shared table** - changes should be coordinated

### `audit_logs`
- **Owner:** `governance-hub`

### `auth_audit_log`
- **Owner:** `four-visions-big-commerce`

### `badge_assessments`
- **Owner:** `echelon-control`

### `bigcommerce_catalog_mappings`
- **Owner:** `creator-licensing-hub`
- **Also used by:** `temp-creator-repo`
- ⚠️  **Shared table** - changes should be coordinated

### `bigcommerce_credentials`
- **Owner:** `ciq-feed-map`

### `bigcommerce_products`
- **Owner:** `ciq-feed-map`

### `bigcommerce_webhooks`
- **Owner:** `creator-licensing-hub`
- **Also used by:** `temp-creator-repo`
- ⚠️  **Shared table** - changes should be coordinated

### `billable_units_snapshot`
- **Owner:** `brand-connect-hub`

### `billing_periods`
- **Owner:** `governance-hub`

### `billing_records`
- **Owner:** `brand-connect-hub`

### `billing_status_history`
- **Owner:** `brand-connect-hub`

### `blog_articles`
- **Owner:** `four-visions-big-commerce`

### `brand_accounts`
- **Owner:** `brand-connect-hub`

### `brand_contacts`
- **Owner:** `brand-connect-hub`

### `brand_employees`
- **Owner:** `mom-walk-connect`

### `brand_metrics`
- **Owner:** `forecast-flex-wizard`

### `brand_notes`
- **Owner:** `brand-connect-hub`

### `brand_pack_entitlements`
- **Owner:** `ciq-automations`

### `brand_portal_profiles`
- **Owner:** `brand-connect-hub`

### `brand_settings`
- **Owner:** `onsite-affiliate`

### `brand_users`
- **Owner:** `lovable-audit`

### `brands`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`, `lovable-audit`, `mom-walk-connect`, `onsite-affiliate`
- ⚠️  **Shared table** - changes should be coordinated

### `bulk_upload_progress`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `cached_lists`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `campaign_completion_summary`
- **Owner:** `brand-connect-hub`

### `campaign_draft_activities`
- **Owner:** `brand-connect-hub`

### `campaign_draft_communities`
- **Owner:** `brand-connect-hub`

### `campaign_drafts`
- **Owner:** `brand-connect-hub`

### `campaign_metrics`
- **Owner:** `live-nation-demo`

### `campaign_metrics_google`
- **Owner:** `live-nation-demo`

### `campaign_pricing`
- **Owner:** `mom-walk-connect`

### `campaign_request_actuals`
- **Owner:** `brand-connect-hub`

### `campaign_request_feedback`
- **Owner:** `brand-connect-hub`

### `campaign_request_status_history`
- **Owner:** `brand-connect-hub`

### `campaign_request_versions`
- **Owner:** `brand-connect-hub`

### `campaign_requests`
- **Owner:** `mom-walk-connect`

### `campaigns_activity`
- **Owner:** `live-nation-demo`

### `cart_sessions`
- **Owner:** `four-visions-big-commerce`

### `categories`
- **Owner:** `four-visions-big-commerce`

### `channels`
- **Owner:** `guild-landing-system`

### `chat_messages`
- **Owner:** `sunafusion-agent-shell`

### `checkout_identity_bridges`
- **Owner:** `onsite-affiliate`

### `cia_service_keys`
- **Owner:** `ciq-automations`
- **Also used by:** `key-vault-executor`
- ⚠️  **Shared table** - changes should be coordinated

### `ciq_media_cache`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `clients`
- **Owner:** `client-survey-hub`
- **Also used by:** `forecast-flex-wizard`, `text-safety-watchdog`
- ⚠️  **Shared table** - changes should be coordinated

### `communities`
- **Owner:** `mom-walk-connect`

### `community_members`
- **Owner:** `mom-walk-connect`

### `community_profiles`
- **Owner:** `mom-walk-connect`

### `connectors`
- **Owner:** `governance-hub`

### `contacts`
- **Owner:** `tga-crm`

### `content`
- **Owner:** `lovable-audit`

### `content_usage`
- **Owner:** `lovable-audit`

### `content_variations`
- **Owner:** `textweaver-gigcraft`

### `conversation_participants`
- **Owner:** `mom-walk-connect`

### `conversations`
- **Owner:** `loan-chat-wizard-api`
- **Also used by:** `mom-walk-connect`
- ⚠️  **Shared table** - changes should be coordinated

### `creator_brands`
- **Owner:** `onsite-affiliate`

### `creator_connect_profiles`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `creator_iq_state`
- **Owner:** `sunafusion-agent-shell`

### `creator_performance`
- **Owner:** `onsite-affiliate`

### `creators`
- **Owner:** `lovable-audit`
- **Also used by:** `onsite-affiliate`
- ⚠️  **Shared table** - changes should be coordinated

### `credential_deletions`
- **Owner:** `governance-hub`

### `customer_exports`
- **Owner:** `ciq-feed-map`

### `customer_uploads`
- **Owner:** `ciq-feed-map`

### `customers`
- **Owner:** `ciq-feed-map`

### `data_sources`
- **Owner:** `live-nation-demo`

### `dataset_manifest`
- **Owner:** `ads-gpt-starter`

### `day_entries`
- **Owner:** `lifetrack`

### `day_media`
- **Owner:** `lifetrack`

### `deals`
- **Owner:** `mom-walk-connect`

### `developer_insights`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `directory_submissions`
- **Owner:** `echelon-control`

### `early_access_signups`
- **Owner:** `echelon-control`

### `ecommerce_clients`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `email_logs`
- **Owner:** `mom-walk-connect`

### `email_templates`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`, `mom-walk-connect`
- ⚠️  **Shared table** - changes should be coordinated

### `enrollment_requests`
- **Owner:** `echelon-control`

### `event_rsvps`
- **Owner:** `mom-walk-connect`

### `events`
- **Owner:** `mom-walk-connect`

### `exports`
- **Owner:** `ciq-feed-map`

### `exposure_events`
- **Owner:** `onsite-affiliate`

### `exposures`
- **Owner:** `onsite-affiliate`

### `feature_flags`
- **Owner:** `four-visions-big-commerce`

### `feedback_submissions`
- **Owner:** `mom-walk-connect`

### `forecast_geographies`
- **Owner:** `forecast-flex-wizard`

### `forecast_geography_monthly_data`
- **Owner:** `forecast-flex-wizard`

### `forecast_geography_product_monthly_data`
- **Owner:** `forecast-flex-wizard`

### `forecast_geography_seasonality`
- **Owner:** `forecast-flex-wizard`

### `forecast_monthly_data`
- **Owner:** `forecast-flex-wizard`

### `forecast_product_monthly_data`
- **Owner:** `forecast-flex-wizard`

### `forecast_product_seasonality`
- **Owner:** `forecast-flex-wizard`

### `forecast_products`
- **Owner:** `forecast-flex-wizard`

### `forecast_scenarios`
- **Owner:** `forecast-flex-wizard`

### `forms`
- **Owner:** `guild-landing-system`

### `generated_reports`
- **Owner:** `html-to-visualize-food`

### `google_drive_sync_log`
- **Owner:** `ciq-automations`

### `homepage_heroes`
- **Owner:** `four-visions-big-commerce`

### `homepage_merchandising`
- **Owner:** `four-visions-big-commerce`

### `idempotency_cache`
- **Owner:** `ciq-automations`

### `idempotency_keys`
- **Owner:** `onsite-affiliate`

### `images`
- **Owner:** `ciq-feed-map`

### `invoice_items`
- **Owner:** `creator-licensing-hub`

### `invoices`
- **Owner:** `creator-licensing-hub`

### `kernels`
- **Owner:** `governance-hub`

### `knowledge_base`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `knowledge_extraction_jobs`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `landing_page_templates`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `landing_pages`
- **Owner:** `four-visions-big-commerce`

### `landing_variants`
- **Owner:** `guild-landing-system`

### `lead_submissions`
- **Owner:** `guild-landing-system`

### `leads`
- **Owner:** `debt-freedom-pathway-landing`
- **Also used by:** `kitchen-capital-connect`, `loan-chat-wizard-api`, `sunafusion-agent-shell`
- ⚠️  **Shared table** - changes should be coordinated

### `legal_documents`
- **Owner:** `echelon-control`

### `license_agreements`
- **Owner:** `lovable-audit`

### `lift_metrics`
- **Owner:** `onsite-affiliate`

### `line_item_allocations`
- **Owner:** `forecast-flex-wizard`

### `line_items`
- **Owner:** `forecast-flex-wizard`

### `link_clicks`
- **Owner:** `mom-walk-connect`

### `lucky_winner_tokens`
- **Owner:** `four-visions-big-commerce`

### `media_plan_allocations`
- **Owner:** `forecast-flex-wizard`

### `media_plan_channels`
- **Owner:** `forecast-flex-wizard`

### `media_plans`
- **Owner:** `forecast-flex-wizard`

### `member_invitations`
- **Owner:** `mom-walk-connect`

### `messages`
- **Owner:** `loan-chat-wizard-api`
- **Also used by:** `mom-walk-connect`
- ⚠️  **Shared table** - changes should be coordinated

### `meta_audience_memberships`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `meta_custom_audiences`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `meta_offline_conversions`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `order_line_items`
- **Owner:** `onsite-affiliate`

### `ordergroove_orders`
- **Owner:** `four-visions-big-commerce`

### `ordergroove_product_offers`
- **Owner:** `four-visions-big-commerce`

### `ordergroove_subscriptions`
- **Owner:** `four-visions-big-commerce`

### `ordergroove_webhooks`
- **Owner:** `four-visions-big-commerce`

### `orders`
- **Owner:** `creator-licensing-hub`
- **Also used by:** `four-visions-big-commerce`, `onsite-affiliate`
- ⚠️  **Shared table** - changes should be coordinated

### `organizations`
- **Owner:** `governance-hub`

### `page_views`
- **Owner:** `echelon-control`

### `password_reset_tokens`
- **Owner:** `four-visions-big-commerce`

### `payout_ledger`
- **Owner:** `onsite-affiliate`

### `pending_ambassador_assignments`
- **Owner:** `mom-walk-connect`

### `placement_performance`
- **Owner:** `onsite-affiliate`

### `policies`
- **Owner:** `governance-hub`

### `policy_change_events`
- **Owner:** `governance-hub`

### `policy_proposals`
- **Owner:** `governance-hub`

### `policy_versions`
- **Owner:** `governance-hub`

### `post_comments`
- **Owner:** `mom-walk-connect`

### `post_likes`
- **Owner:** `mom-walk-connect`

### `post_purchase_survey_questions`
- **Owner:** `four-visions-big-commerce`

### `post_purchase_survey_responses`
- **Owner:** `four-visions-big-commerce`

### `posts`
- **Owner:** `mom-walk-connect`

### `pricing_tiers`
- **Owner:** `brand-connect-hub`

### `processed_kajabi_enrollments`
- **Owner:** `four-visions-big-commerce`

### `product_categories`
- **Owner:** `four-visions-big-commerce`

### `product_feed_sync_log`
- **Owner:** `lovable-audit`

### `product_feeds`
- **Owner:** `lovable-audit`

### `product_images`
- **Owner:** `four-visions-big-commerce`

### `product_relationships`
- **Owner:** `four-visions-big-commerce`

### `product_reviews`
- **Owner:** `four-visions-big-commerce`

### `product_updates`
- **Owner:** `ciq-feed-map`

### `product_variants`
- **Owner:** `four-visions-big-commerce`

### `product_videos`
- **Owner:** `four-visions-big-commerce`

### `products`
- **Owner:** `four-visions-big-commerce`
- **Also used by:** `guild-landing-system`, `lovable-audit`
- ⚠️  **Shared table** - changes should be coordinated

### `profanity_words`
- **Owner:** `text-safety-watchdog`

### `profiles`
- **Owner:** `api-ninja-gateway`
- **Also used by:** `forecast-flex-wizard`, `governance-hub`, `lifetrack`, `lovable-audit`, `mom-walk-connect`, `onsite-affiliate`
- ⚠️  **Shared table** - changes should be coordinated

### `project_documents`
- **Owner:** `html-to-visualize-food`

### `promotion_coupon_codes`
- **Owner:** `four-visions-big-commerce`

### `promotions`
- **Owner:** `four-visions-big-commerce`

### `publisher_accounts`
- **Owner:** `live-nation-demo`

### `questions`
- **Owner:** `client-survey-hub`

### `ranking_config`
- **Owner:** `onsite-affiliate`

### `rate_limit_counters`
- **Owner:** `onsite-affiliate`

### `rate_limit_violations`
- **Owner:** `key-vault-executor`

### `rate_limits`
- **Owner:** `four-visions-big-commerce`

### `recharge_plans`
- **Owner:** `four-visions-big-commerce`

### `recharge_product_mappings`
- **Owner:** `four-visions-big-commerce`

### `refersion_conversions`
- **Owner:** `four-visions-big-commerce`

### `repo_map`
- **Owner:** `sunafusion-agent-shell`

### `response_sessions`
- **Owner:** `client-survey-hub`

### `review_import_items`
- **Owner:** `ciq-feed-map`

### `review_imports`
- **Owner:** `ciq-feed-map`

### `reviews`
- **Owner:** `ciq-feed-map`

### `reviews_backup`
- **Owner:** `ciq-feed-map`

### `reviews_summary`
- **Owner:** `four-visions-big-commerce`

### `revocations`
- **Owner:** `governance-hub`

### `search_analytics`
- **Owner:** `four-visions-big-commerce`

### `self_hosted_audit`
- **Owner:** `governance-hub`

### `shared_links`
- **Owner:** `lifetrack`

### `shopify_products`
- **Owner:** `ciq-feed-map`

### `shopify_pushed_products`
- **Owner:** `ciq-feed-map`

### `short_links`
- **Owner:** `mom-walk-connect`

### `signup_idempotency`
- **Owner:** `governance-hub`

### `signup_rate_limits`
- **Owner:** `governance-hub`

### `skip_rules`
- **Owner:** `client-survey-hub`

### `slack_access`
- **Owner:** `sunafusion-agent-shell`

### `slack_users`
- **Owner:** `tga-crm`

### `sms_messages`
- **Owner:** `echelon-control`

### `subscription_modal_utm_config`
- **Owner:** `four-visions-big-commerce`

### `survey_responses`
- **Owner:** `mom-walk-connect`

### `surveys`
- **Owner:** `client-survey-hub`
- **Also used by:** `mom-walk-connect`
- ⚠️  **Shared table** - changes should be coordinated

### `sync_status`
- **Owner:** `four-visions-big-commerce`

### `system_admins`
- **Owner:** `lovable-audit`

### `team_invites`
- **Owner:** `onsite-affiliate`

### `template_flavors`
- **Owner:** `guild-landing-system`

### `template_versions`
- **Owner:** `guild-landing-system`

### `templates`
- **Owner:** `guild-landing-system`

### `tenant_credentials`
- **Owner:** `key-vault-executor`

### `tenant_directory`
- **Owner:** `governance-hub`

### `tenant_integrations`
- **Owner:** `key-vault-executor`

### `tenant_mcp_servers`
- **Owner:** `governance-hub`

### `tenant_phone_identities`
- **Owner:** `echelon-control`

### `tenant_pricing`
- **Owner:** `echelon-control`

### `tenant_quotas`
- **Owner:** `key-vault-executor`

### `tenant_sms_channels`
- **Owner:** `echelon-control`

### `tenants`
- **Owner:** `governance-hub`

### `tracked_events`
- **Owner:** `creator-licensing-hub`
- **Also used by:** `four-visions-big-commerce`, `temp-creator-repo`
- ⚠️  **Shared table** - changes should be coordinated

### `tracking_events`
- **Owner:** `guild-landing-system`

### `tracking_pixels`
- **Owner:** `creator-licensing-hub`
- **Also used by:** `four-visions-big-commerce`, `temp-creator-repo`
- ⚠️  **Shared table** - changes should be coordinated

### `transformations`
- **Owner:** `ciq-feed-map`

### `transformed_datasets`
- **Owner:** `ciq-feed-map`

### `upsell_config`
- **Owner:** `four-visions-big-commerce`

### `user_achievements`
- **Owner:** `lifetrack`

### `user_clients`
- **Owner:** `forecast-flex-wizard`

### `user_conversation_deletions`
- **Owner:** `mom-walk-connect`

### `user_goals`
- **Owner:** `mom-walk-connect`

### `user_permissions`
- **Owner:** `text-safety-watchdog`

### `user_roles`
- **Owner:** `brand-connect-hub`
- **Also used by:** `echelon-control`, `forecast-flex-wizard`, `governance-hub`, `guild-landing-system`, `live-nation-demo`, `mom-walk-connect`, `onsite-affiliate`
- ⚠️  **Shared table** - changes should be coordinated

### `user_tenant_memberships`
- **Owner:** `echelon-control`

### `users`
- **Owner:** `live-nation-demo`

### `verification_tokens`
- **Owner:** `governance-hub`

### `video_scans`
- **Owner:** `onsite-affiliate`

### `vip_upgrade_attempts`
- **Owner:** `four-visions-big-commerce`

### `vip_upgrade_rules`
- **Owner:** `four-visions-big-commerce`

### `waiver_acceptances`
- **Owner:** `mom-walk-connect`

### `webhook_deliveries`
- **Owner:** `onsite-affiliate`

### `webhook_events`
- **Owner:** `four-visions-big-commerce`

### `webhook_publisher_preferences`
- **Owner:** `ciq-automations`
- **Also used by:** `influencer-iq-flow-analysis`
- ⚠️  **Shared table** - changes should be coordinated

### `webhook_registrations`
- **Owner:** `onsite-affiliate`



## Repositories and Their Tables



## ads-gpt-starter
- Origin: git@github.com:acedge123/ads-gpt-starter.git
- **Owns 1 table(s):** `dataset_manifest`

## api-ninja-gateway
- Origin: git@github.com:acedge123/api-ninja-gateway.git
- **Owns 2 table(s):** `api_credentials`, `profiles`

## brand-connect-hub
- Origin: https://github.com/The-Gig-Agency/brand-connect-hub.git
- **Owns 18 table(s):** `activity_types`, `billable_units_snapshot`, `billing_records`, `billing_status_history`, `brand_accounts`, `brand_contacts`, `brand_notes`, `brand_portal_profiles`, `campaign_completion_summary`, `campaign_draft_activities`, `campaign_draft_communities`, `campaign_drafts`, `campaign_request_actuals`, `campaign_request_feedback`, `campaign_request_status_history`, `campaign_request_versions`, `pricing_tiers`, `user_roles`

## ciq-automations
- Origin: https://github.com/acedge123/ciq-automations.git
- **Owns 28 table(s):** `action_allowlist`, `agent_memories`, `agent_sessions`, `agent_tasks`, `agent_tool_executions`, `api_call_logs`, `api_keys`, `api_patterns`, `audit_log`, `brand_pack_entitlements`, `brands`, `bulk_upload_progress`, `cached_lists`, `cia_service_keys`, `ciq_media_cache`, `creator_connect_profiles`, `developer_insights`, `ecommerce_clients`, `email_templates`, `google_drive_sync_log`, `idempotency_cache`, `knowledge_base`, `knowledge_extraction_jobs`, `landing_page_templates`, `meta_audience_memberships`, `meta_custom_audiences`, `meta_offline_conversions`, `webhook_publisher_preferences`

## ciq-feed-map
- Origin: git@github.com:acedge123/ciq-feed-map.git
- **Owns 16 table(s):** `bigcommerce_credentials`, `bigcommerce_products`, `customer_exports`, `customer_uploads`, `customers`, `exports`, `images`, `product_updates`, `review_import_items`, `review_imports`, `reviews`, `reviews_backup`, `shopify_products`, `shopify_pushed_products`, `transformations`, `transformed_datasets`

## client-survey-hub
- Origin: git@github.com:acedge123/client-survey-hub.git
- **Owns 7 table(s):** `admin_users`, `answers`, `clients`, `questions`, `response_sessions`, `skip_rules`, `surveys`

## creator-licensing-hub
- Origin: git@github.com:acedge123/creator-licensing-hub.git
- **Owns 10 table(s):** `analytics_events`, `analytics_sessions`, `analytics_visitors`, `bigcommerce_catalog_mappings`, `bigcommerce_webhooks`, `invoice_items`, `invoices`, `orders`, `tracked_events`, `tracking_pixels`

## debt-freedom-pathway-landing
- Origin: git@github.com:acedge123/debt-freedom-pathway-landing.git
- **Owns 1 table(s):** `leads`

## echelon-control
- Origin: https://github.com/The-Gig-Agency/echelon-control.git
- **Owns 14 table(s):** `agent_jobs`, `analytics_events`, `badge_assessments`, `directory_submissions`, `early_access_signups`, `enrollment_requests`, `legal_documents`, `page_views`, `sms_messages`, `tenant_phone_identities`, `tenant_pricing`, `tenant_sms_channels`, `user_roles`, `user_tenant_memberships`

## forecast-flex-wizard
- Origin: git@github.com:acedge123/forecast-flex-wizard.git
- **Owns 20 table(s):** `actual_metrics`, `brand_metrics`, `clients`, `forecast_geographies`, `forecast_geography_monthly_data`, `forecast_geography_product_monthly_data`, `forecast_geography_seasonality`, `forecast_monthly_data`, `forecast_product_monthly_data`, `forecast_product_seasonality`, `forecast_products`, `forecast_scenarios`, `line_item_allocations`, `line_items`, `media_plan_allocations`, `media_plan_channels`, `media_plans`, `profiles`, `user_clients`, `user_roles`

## four-visions-big-commerce
- Origin: https://github.com/The-Gig-Agency/four-visions-big-commerce.git
- **Owns 46 table(s):** `admin_notification_emails`, `admin_roles`, `admin_tickets`, `analytics_events`, `analytics_sessions`, `auth_audit_log`, `blog_articles`, `cart_sessions`, `categories`, `feature_flags`, `homepage_heroes`, `homepage_merchandising`, `landing_pages`, `lucky_winner_tokens`, `ordergroove_orders`, `ordergroove_product_offers`, `ordergroove_subscriptions`, `ordergroove_webhooks`, `orders`, `password_reset_tokens`, `post_purchase_survey_questions`, `post_purchase_survey_responses`, `processed_kajabi_enrollments`, `product_categories`, `product_images`, `product_relationships`, `product_reviews`, `product_variants`, `product_videos`, `products`, `promotion_coupon_codes`, `promotions`, `rate_limits`, `recharge_plans`, `recharge_product_mappings`, `refersion_conversions`, `reviews_summary`, `search_analytics`, `subscription_modal_utm_config`, `sync_status`, `tracked_events`, `tracking_pixels`, `upsell_config`, `vip_upgrade_attempts`, `vip_upgrade_rules`, `webhook_events`

## governance-hub
- Origin: https://github.com/The-Gig-Agency/governance-hub.git
- **Owns 27 table(s):** `agent_join_idempotency`, `agent_tenant_memberships`, `agent_verification_tokens`, `agents`, `api_keys`, `approvals`, `audit_blobs`, `audit_logs`, `billing_periods`, `connectors`, `credential_deletions`, `kernels`, `organizations`, `policies`, `policy_change_events`, `policy_proposals`, `policy_versions`, `profiles`, `revocations`, `self_hosted_audit`, `signup_idempotency`, `signup_rate_limits`, `tenant_directory`, `tenant_mcp_servers`, `tenants`, `user_roles`, `verification_tokens`

## guild-landing-system
- Origin: https://github.com/The-Gig-Agency/guild-landing-system.git
- **Owns 10 table(s):** `channels`, `forms`, `landing_variants`, `lead_submissions`, `products`, `template_flavors`, `template_versions`, `templates`, `tracking_events`, `user_roles`

## html-to-visualize-food
- Origin: git@github.com:acedge123/html-to-visualize-food.git
- **Owns 6 table(s):** `ai_conversations`, `ai_messages`, `analysis_projects`, `audio_chunks`, `generated_reports`, `project_documents`

## influencer-iq-flow-analysis
- Origin: git@github.com:acedge123/influencer-iq-flow.git
- ⚠️  Alias of: `ciq-automations`
- Status: `analysis-copy`
- **Owns 21 table(s):** `agent_memories`, `agent_sessions`, `agent_tasks`, `agent_tool_executions`, `api_call_logs`, `api_patterns`, `brands`, `bulk_upload_progress`, `cached_lists`, `ciq_media_cache`, `creator_connect_profiles`, `developer_insights`, `ecommerce_clients`, `email_templates`, `knowledge_base`, `knowledge_extraction_jobs`, `landing_page_templates`, `meta_audience_memberships`, `meta_custom_audiences`, `meta_offline_conversions`, `webhook_publisher_preferences`

## key-vault-executor
- Origin: https://github.com/The-Gig-Agency/key-vault-executor.git
- **Owns 6 table(s):** `action_allowlist`, `cia_service_keys`, `rate_limit_violations`, `tenant_credentials`, `tenant_integrations`, `tenant_quotas`

## kitchen-capital-connect
- Origin: git@github.com:acedge123/kitchen-capital-connect.git
- **Owns 2 table(s):** `analytics_events`, `leads`

## lifetrack
- Origin: git@github.com:acedge123/lifetrack.git
- **Owns 6 table(s):** `achievements`, `day_entries`, `day_media`, `profiles`, `shared_links`, `user_achievements`

## live-nation-demo
- Origin: https://github.com/acedge123/live-nation-demo
- **Owns 10 table(s):** `analytics_events`, `analytics_page_views`, `analytics_sessions`, `campaign_metrics`, `campaign_metrics_google`, `campaigns_activity`, `data_sources`, `publisher_accounts`, `user_roles`, `users`

## loan-chat-wizard-api
- Origin: git@github.com:acedge123/loan-chat-wizard-api.git
- **Owns 3 table(s):** `conversations`, `leads`, `messages`

## lovable-audit
- Origin: https://github.com/acedge123/content-licensing-hub.git
- **Owns 11 table(s):** `brand_users`, `brands`, `content`, `content_usage`, `creators`, `license_agreements`, `product_feed_sync_log`, `product_feeds`, `products`, `profiles`, `system_admins`

## mom-walk-connect
- Origin: git@github.com:The-Gig-Agency/mom-walk-connect.git
- **Owns 34 table(s):** `activities`, `admin_notification_emails`, `admin_notifications`, `ambassador_assignments`, `brand_employees`, `brands`, `campaign_pricing`, `campaign_requests`, `communities`, `community_members`, `community_profiles`, `conversation_participants`, `conversations`, `deals`, `email_logs`, `email_templates`, `event_rsvps`, `events`, `feedback_submissions`, `link_clicks`, `member_invitations`, `messages`, `pending_ambassador_assignments`, `post_comments`, `post_likes`, `posts`, `profiles`, `short_links`, `survey_responses`, `surveys`, `user_conversation_deletions`, `user_goals`, `user_roles`, `waiver_acceptances`

## onsite-affiliate
- Origin: https://github.com/The-Gig-Agency/onsite-affiliate.git
- **Owns 27 table(s):** `api_keys`, `asset_performance`, `assets`, `attributions`, `audit_log`, `brand_settings`, `brands`, `checkout_identity_bridges`, `creator_brands`, `creator_performance`, `creators`, `exposure_events`, `exposures`, `idempotency_keys`, `lift_metrics`, `order_line_items`, `orders`, `payout_ledger`, `placement_performance`, `profiles`, `ranking_config`, `rate_limit_counters`, `team_invites`, `user_roles`, `video_scans`, `webhook_deliveries`, `webhook_registrations`

## sunafusion-agent-shell
- Origin: git@github.com:acedge123/sunafusion-agent-shell.git
- **Owns 7 table(s):** `agent_learnings`, `agent_memories`, `chat_messages`, `creator_iq_state`, `leads`, `repo_map`, `slack_access`

## temp-creator-repo
- Origin: https://github.com/acedge123/creator-licensing-hub.git
- ⚠️  Alias of: `creator-licensing-hub`
- Status: `duplicate`
- **Owns 7 table(s):** `analytics_events`, `analytics_sessions`, `analytics_visitors`, `bigcommerce_catalog_mappings`, `bigcommerce_webhooks`, `tracked_events`, `tracking_pixels`

## text-safety-watchdog
- Origin: https://github.com/acedge123/text-safety-watchdog
- **Owns 4 table(s):** `api_key_access`, `clients`, `profanity_words`, `user_permissions`

## textweaver-gigcraft
- Origin: https://github.com/acedge123/textweaver-gigcraft.git
- **Owns 1 table(s):** `content_variations`

## tga-crm
- Origin: git@github.com:acedge123/tga-crm.git
- **Owns 2 table(s):** `contacts`, `slack_users`