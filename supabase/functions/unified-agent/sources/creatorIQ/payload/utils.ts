
// Utility functions for payload builders
import { extractListNameFromQuery, extractStatusFromQuery, extractMessageFromQuery } from '../textExtractors.ts';
import { PayloadParams } from './types.ts';

/**
 * Get source publishers based on endpoint configuration and previous state
 */
export function getSourcePublishers(endpoint: any, previousState: any): string[] {
  if (!previousState || !previousState.publishers || previousState.publishers.length === 0) {
    return [];
  }

  let publisherIds: string[] = [];

  // Check for source list publishers
  if (endpoint.sourceType === 'list' && endpoint.sourceId) {
    const sourceListPublishers = previousState.publishers.filter((p: any) => p.listId === endpoint.sourceId);
    if (sourceListPublishers.length > 0) {
      publisherIds = sourceListPublishers.map((p: any) => p.id);
      console.log(`Using ${publisherIds.length} publisher IDs from source list ${endpoint.sourceId}`);
    }
  }
  
  // Check for source campaign publishers
  else if (endpoint.sourceType === 'campaign' && endpoint.sourceId) {
    const sourceCampaignPublishers = previousState.publishers.filter((p: any) => p.campaignId === endpoint.sourceId);
    if (sourceCampaignPublishers.length > 0) {
      publisherIds = sourceCampaignPublishers.map((p: any) => p.id);
      console.log(`Using ${publisherIds.length} publisher IDs from source campaign ${endpoint.sourceId}`);
    }
  }

  return publisherIds;
}

/**
 * Extract publisher ID from params or previous state
 */
export function extractPublisherId(params: PayloadParams, endpoint: any, previousState: any): string | null {
  // First try to get from params
  if (params.publisher_id) {
    return params.publisher_id;
  }
  
  // Then try from endpoint
  if (endpoint.publisherId) {
    return endpoint.publisherId;
  }
  
  // Try to extract from route if not a placeholder
  if (endpoint.route && !endpoint.route.includes("{publisher_id}")) {
    const idMatch = endpoint.route.match(/\/publishers\/(\d+)/);
    if (idMatch && idMatch[1]) {
      return idMatch[1];
    }
  }

  // As a last resort, try to get from previous state
  if (previousState && previousState.publishers && previousState.publishers.length > 0) {
    return previousState.publishers[0].id;
  }

  return null;
}

/**
 * Helper function to extract search parameters
 */
export function buildSearchParams(params: any, baseParams: any = { limit: 50 }): any {
  const searchParams = { ...baseParams };
  
  if (params.search_term) {
    searchParams.search = params.search_term;
    console.log(`Adding search parameter: "${params.search_term}"`);
    
    // Enable search across all pages for list searches
    searchParams._fullSearch = true;
  }
  
  return searchParams;
}

/**
 * Process and handle deeply nested API responses
 * This helps extract data from nested structures like in the example
 */
export function processNestedResponse(response: any): any {
  if (!response) return null;
  
  // Check for deeply nested list data
  if (response.type === 'List' && response.List && response.List.List) {
    return response.List.List;
  }
  
  // Check for deeply nested publisher data
  if (response.type === 'Publisher' && response.Publisher && response.Publisher.Publisher) {
    return response.Publisher.Publisher;
  }
  
  // Check for deeply nested campaign data
  if (response.type === 'Campaign' && response.Campaign && response.Campaign.Campaign) {
    return response.Campaign.Campaign;
  }
  
  // For standard list data
  if (response.List) {
    return response.List;
  }
  
  // For standard publisher data
  if (response.Publisher) {
    return response.Publisher;
  }
  
  // For standard campaign data
  if (response.Campaign) {
    return response.Campaign;
  }
  
  return response;
}
