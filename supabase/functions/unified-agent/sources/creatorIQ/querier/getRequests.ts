
import { QueryResult, PaginationInfo } from './types.ts';
import { createErrorResponse, buildUrl } from './utils.ts';
import { processNestedResponse } from './index.ts';

/**
 * Handle GET requests with pagination support
 */
export async function handleGetRequest(endpoint: any, payload: any, apiKey: string, baseUrl: string): Promise<QueryResult> {
  try {
    const shouldFetchAllPages = payload.fetch_all_pages === true;
    
    if (shouldFetchAllPages) {
      return await fetchAllPages(endpoint, payload, apiKey, baseUrl);
    } else {
      return await fetchSinglePage(endpoint, payload, apiKey, baseUrl);
    }
  } catch (error) {
    return createErrorResponse(endpoint, error);
  }
}

/**
 * Fetch all pages of data
 */
async function fetchAllPages(endpoint: any, payload: any, apiKey: string, baseUrl: string): Promise<QueryResult> {
  const allItems: any[] = [];
  let currentPage = 1;
  let totalPages = 1;
  let totalItems = 0;
  
  console.log(`Fetching all pages for endpoint ${endpoint.route}`);
  
  do {
    const pagePayload = { ...payload, page: currentPage };
    delete pagePayload.fetch_all_pages; // Remove this from the actual API request
    
    const result = await fetchSinglePage(endpoint, pagePayload, apiKey, baseUrl);
    
    if (result.error) {
      return result;
    }
    
    // Extract items from this page
    const pageData = result.data;
    if (pageData) {
      // Handle different collection types
      let pageItems: any[] = [];
      
      if (pageData.CampaignCollection) {
        pageItems = pageData.CampaignCollection;
        totalItems = pageData.total || 0;
        totalPages = pageData.total_pages || 1;
      } else if (pageData.ListsCollection) {
        pageItems = pageData.ListsCollection;
        totalItems = pageData.total || 0;
        totalPages = pageData.total_pages || 1;
      } else if (pageData.PublisherCollection) {
        pageItems = pageData.PublisherCollection;
        totalItems = pageData.total || 0;
        totalPages = pageData.total_pages || 1;
      }
      
      allItems.push(...pageItems);
      console.log(`Fetched page ${currentPage}/${totalPages}, got ${pageItems.length} items, total so far: ${allItems.length}`);
    }
    
    currentPage++;
  } while (currentPage <= totalPages);
  
  console.log(`Finished fetching all pages. Total items: ${allItems.length}`);
  
  // Build the final result
  const finalData = {
    ...payload,
    count: allItems.length,
    total: totalItems,
    page: 1,
    total_pages: totalPages,
    _all_pages_fetched: true
  };
  
  // Set the appropriate collection
  if (allItems.length > 0) {
    if (endpoint.route.includes('/campaigns')) {
      finalData.CampaignCollection = allItems;
      finalData.type = 'CampaignCollection';
    } else if (endpoint.route.includes('/lists')) {
      finalData.ListsCollection = allItems;
      finalData.type = 'ListsCollection';
    } else if (endpoint.route.includes('/publishers')) {
      finalData.PublisherCollection = allItems;
      finalData.type = 'PublisherCollection';
    }
  }
  
  return {
    endpoint: endpoint.route,
    method: endpoint.method,
    name: endpoint.name,
    data: finalData
  };
}

/**
 * Fetch a single page of data
 */
async function fetchSinglePage(endpoint: any, payload: any, apiKey: string, baseUrl: string): Promise<QueryResult> {
  const url = buildUrl(baseUrl, endpoint, payload);
  
  console.log(`Fetching from ${url}`);
  
  const headers = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const response = await fetch(url, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  
  // Log pagination info
  if (data.total && data.page) {
    console.log(`API returned: ${data.total} items across ${data.total_pages || 'unknown'} pages (currently showing page ${data.page})`);
  }
  
  const processedData = processNestedResponse(data);
  
  return {
    endpoint: endpoint.route,
    method: endpoint.method,
    name: endpoint.name,
    data: processedData
  };
}
