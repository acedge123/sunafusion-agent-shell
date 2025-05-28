
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
  // For list queries, we want to fetch all lists by default
  // Use a large limit and enable full pagination
  const searchParams: any = { 
    limit: params.limit || 5000,  // Increased default limit
    _fullSearch: true,            // Enable full search by default
    all_pages: true               // Fetch all pages by default
  };
  
  // Important: Pass through pagination parameters correctly
  if (params.page) {
    searchParams.page = params.page;
  }
  
  // Pass through all_pages parameter from frontend to trigger complete pagination
  if (params.all_pages === true || params._fullSearch === true) {
    searchParams._fullSearch = true;
    searchParams.all_pages = true;
    console.log("Enabling full pagination for lists query");
  }
  
  if (params.list_search_term) {
    searchParams.search = params.list_search_term;
    console.log(`Adding search parameter for list name: "${params.list_search_term}"`);
  }
  
  console.log(`List query parameters: ${JSON.stringify(searchParams)}`);
  return searchParams;
}

/**
 * Build payload for querying publishers in a list
 */
export function buildListPublishersQueryPayload(): any {
  return { limit: 50 };
}
