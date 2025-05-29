
// Specialized handlers for campaign-related payloads
import { BuildPayloadOptions } from './types.ts';

/**
 * Build payload for campaign query endpoint
 */
export function buildCampaignQueryPayload({ params }: BuildPayloadOptions): any {
  const searchParams: any = { limit: 50 };
  
  if (params.campaign_search_term) {
    searchParams.search = params.campaign_search_term;
    console.log(`Adding campaign search term: "${params.campaign_search_term}"`);
  }
  
  return searchParams;
}

/**
 * Build payload for querying publishers in a campaign
 */
export function buildCampaignPublishersQueryPayload(): any {
  return { limit: 50 };
}
