
// Handler for GET requests with pagination support
import { processResponseMetadata } from '../responseProcessor.ts';
import { createErrorResponse, extractPaginationInfo } from './utils.ts';
import { QueryResult, QueryOptions } from './types.ts';
import { processNestedResponse } from './index.ts';

/**
 * Fetch a single page of results
 */
async function fetchPage(url: string, queryParams: URLSearchParams, headers: Record<string, string>): Promise<any> {
  const fullUrl = `${url}?${queryParams.toString()}`;
  console.log(`Fetching from ${fullUrl}`);
  
  const response = await fetch(fullUrl, { headers });
  
  if (!response.ok) {
    const responseText = await response.text();
    console.error(`API error: ${response.status} ${response.statusText} - ${responseText}`);
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Determine which collection field name to use based on endpoint
 */
function determineCollectionField(endpoint: any): string | null {
  if (endpoint.route === '/lists') {
    return 'ListsCollection';
  } else if (endpoint.route === '/publishers') {
    return 'PublisherCollection';
  } else if (endpoint.route === '/campaigns') {
    return 'CampaignCollection';
  } else if (endpoint.route.includes('/publishers')) {
    return 'PublisherCollection';
  }
  return null;
}

/**
 * Add debug information about TestList items
 */
function debugListItems(allItems: any[]): void {
  const listNames = allItems
    .map(item => item.List?.Name)
    .filter(Boolean);
  
  const testListItems = listNames.filter(
    name => name.toLowerCase().includes('testlist')
  );
  
  if (testListItems.length > 0) {
    console.log(`Found TestList items in combined data:`, testListItems);
  } else {
    console.log(`TestList not found in combined data of ${listNames.length} lists`);
  }
}

/**
 * Process nested data structure in returned items
 * This normalizes items with multi-level nesting like List.List or Publisher.Publisher
 */
function normalizeNestedItems(items: any[], collectionField: string): any[] {
  return items.map(item => {
    // For lists with nested structure
    if (collectionField === 'ListsCollection' && item.List && item.List.List) {
      // Replace the doubly nested structure with the inner object
      item.List = item.List.List;
    }
    
    // For publishers with nested structure
    if ((collectionField === 'PublisherCollection' || collectionField === 'PublishersCollection') && 
        item.Publisher && item.Publisher.Publisher) {
      // Replace the doubly nested structure with the inner object
      item.Publisher = item.Publisher.Publisher;
    }
    
    // For campaigns with nested structure
    if (collectionField === 'CampaignCollection' && item.Campaign && item.Campaign.Campaign) {
      // Replace the doubly nested structure with the inner object
      item.Campaign = item.Campaign.Campaign;
    }
    
    return item;
  });
}

/**
 * Handle GET requests with pagination
 */
export async function handleGetRequest(
  endpoint: any, 
  payload: any, 
  apiKey: string,
  baseUrl: string
): Promise<QueryResult> {
  try {
    let url = `${baseUrl}${endpoint.route}`;
    
    // Set up headers for API request
    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    };
    
    console.log(`Querying endpoint ${endpoint.route} with payload:`, payload);
    
    // Extract pagination-related parameters
    const enableAllPages = payload._fullSearch === true || 
                         (payload.all_pages === true) || 
                         ('all_pages' in payload && payload.all_pages === 'true');
    
    // Deep clone the payload to avoid modifying the original
    const queryPayload = { ...payload };
    
    // Remove special parameters that shouldn't be sent as query params
    if ('_fullSearch' in queryPayload) delete queryPayload._fullSearch;
    
    // Define a function to fetch a single page
    const pageSize = queryPayload.limit || 50;
    
    // Start by fetching the first page to determine total pages
    const queryParams = new URLSearchParams();
      
    // Add all parameters from payload
    for (const [key, value] of Object.entries(queryPayload)) {
      if (key !== 'page' && key !== 'limit' && key !== 'all_pages' && key !== 'max_pages') { // Don't override our pagination params or internal params
        queryParams.append(key, String(value));
      }
    }
    
    // Add pagination parameters
    queryParams.append('page', "1");
    queryParams.append('limit', String(pageSize));
    
    const initialData = await fetchPage(url, queryParams, headers);
    
    // Check if we need to handle pagination and endpoint supports it
    const collectionField = determineCollectionField(endpoint);
    let shouldPaginate = enableAllPages && 
                     endpoint.route.match(/\/(lists|publishers|campaigns)(?:\/\d+\/publishers)?$/);
    
    if (shouldPaginate) {
      console.log("Pagination detected, checking if multiple pages exist");
      
      if (!collectionField || !initialData[collectionField]) {
        console.log(`No collection field '${collectionField}' found in response, pagination not possible`);
        shouldPaginate = false;
      }
    }
    
    // If we have multiple pages and should paginate, fetch all pages and combine results
    if (shouldPaginate && initialData.total_pages && initialData.total_pages > 1) {
      const totalPages = Math.min(initialData.total_pages, payload.max_pages || 100); // Respect max_pages limit
      const totalItems = initialData.total || 0;
      console.log(`Found ${totalPages} pages with ${totalItems} total items. Starting pagination...`);
      
      if (collectionField && initialData[collectionField]) {
        // Store all items from all pages in this array
        const allItems = [...initialData[collectionField]];
        
        // Normalize the nested structures in the initial items
        normalizeNestedItems(allItems, collectionField);
        
        // Fetch the remaining pages (starting from page 2)
        const pagePromises = [];
        for (let page = 2; page <= totalPages; page++) {
          const pageQueryParams = new URLSearchParams();
          
          // Add all parameters from payload (except pagination ones)
          for (const [key, value] of Object.entries(queryPayload)) {
            if (key !== 'page' && key !== 'limit' && key !== 'all_pages' && key !== 'max_pages') {
              pageQueryParams.append(key, String(value));
            }
          }
          
          pageQueryParams.append('page', String(page));
          pageQueryParams.append('limit', String(pageSize));
          
          pagePromises.push(fetchPage(url, pageQueryParams, headers));
        }
        
        console.log(`Fetching ${pagePromises.length} additional pages in parallel...`);
        const pageResults = await Promise.allSettled(pagePromises);
        
        // Process results, including those that failed
        let successCount = 0;
        let failCount = 0;
        
        for (const pageResult of pageResults) {
          if (pageResult.status === 'fulfilled') {
            const pageData = pageResult.value;
            if (pageData[collectionField] && Array.isArray(pageData[collectionField])) {
              // Normalize nested structures in page items
              const pageItems = normalizeNestedItems(pageData[collectionField], collectionField);
              allItems.push(...pageItems);
              successCount++;
            } else {
              console.warn(`Missing ${collectionField} in page response:`, pageData);
              failCount++;
            }
          } else {
            console.error(`Page fetch failed:`, pageResult.reason);
            failCount++;
          }
        }
        
        console.log(`Combined ${allItems.length} items from ${successCount} successful pages (${failCount} failed)`);
        
        if (collectionField === 'ListsCollection') {
          debugListItems(allItems);
        }
        
        // Replace the collection in the initial data with the combined collection
        initialData[collectionField] = allItems;
        
        // Update pagination metadata to reflect that we've fetched everything
        initialData.page = 1;
        initialData.pages_count = 1;
        initialData.is_paginated = false;
        initialData._all_pages_fetched = true;
        initialData._total_items_fetched = allItems.length;
      } else {
        console.warn(`Unable to determine collection field for endpoint ${endpoint.route}`);
      }
    }
    
    // Process results based on endpoint type
    processResponseMetadata(initialData, endpoint);
    
    // Process and normalize any nested structures in the response
    const processedData = processNestedResponse(initialData);
    
    return {
      endpoint: endpoint.route,
      method: endpoint.method,
      name: endpoint.name,
      data: processedData
    };
  } catch (error) {
    console.error(`Error during paginated request to ${endpoint.route}:`, error);
    return createErrorResponse(endpoint, error);
  }
}
