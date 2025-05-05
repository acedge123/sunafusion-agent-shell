
// Specialized handlers for list-related payloads
import { extractListNameFromQuery } from '../textExtractors.ts';
import { BuildPayloadOptions, CreatorIQEndpoint } from './types.ts';

/**
 * Build payload for list creation endpoint
 */
export function buildListCreationPayload({ query, params }: BuildPayloadOptions): any {
  console.log("Building payload for list creation");
  const listName = params.list_name || extractListNameFromQuery(query);
  
  // Create list payload
  return {
    Name: listName || `New List ${new Date().toISOString().split('T')[0]}`,
    Description: params.list_description || ""
  };
}

/**
 * Build payload for list query endpoint
 */
export function buildListQueryPayload({ params }: BuildPayloadOptions): any {
  const searchParams: any = { limit: 50 };
  
  if (params.list_search_term) {
    searchParams.search = params.list_search_term;
    console.log(`Adding search parameter for list name: "${params.list_search_term}"`);
    
    // Enable search across all pages
    searchParams._fullSearch = true;
    console.log("Enabling full search across all pages");
  }
  
  return searchParams;
}

/**
 * Build payload for querying publishers in a list
 */
export function buildListPublishersQueryPayload(): any {
  return { limit: 50 };
}
