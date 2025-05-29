
// Specialized handlers for campaign-related payloads
import { BuildPayloadOptions } from './types.ts';

/**
 * Build payload for campaign query endpoint
 */
export function buildCampaignQueryPayload({ params, query }: BuildPayloadOptions): any {
  const searchParams: any = { limit: 50 };
  
  // If the query is asking for a count or total, we should fetch all campaigns
  const isCountQuery = query && (
    query.includes('how many') || 
    query.includes('count') || 
    query.includes('total') ||
    query.includes('number of')
  );
  
  if (isCountQuery) {
    console.log('Detected count query, will fetch all campaigns across all pages');
    searchParams.fetch_all_pages = true;
    searchParams.limit = 100; // Use larger page size for efficiency
  }
  
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
