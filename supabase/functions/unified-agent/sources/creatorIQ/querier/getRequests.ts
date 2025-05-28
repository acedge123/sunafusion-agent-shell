
// Handle GET requests with pagination support
import { logRequest, createErrorResult, createSuccessResult } from './utils.ts';
import { QueryResult, PaginationInfo } from './types.ts';
import { processNestedResponse } from './index.ts';

/**
 * Handle GET requests with automatic pagination
 */
export async function handleGetRequest(endpoint: any, payload: any, apiKey: string, baseUrl: string): Promise<QueryResult> {
  logRequest(endpoint, payload);
  
  try {
    let url = `${baseUrl}${endpoint.route}`;
    
    // Add query parameters if payload exists
    if (payload && Object.keys(payload).length > 0) {
      const params = new URLSearchParams();
      
      // Handle pagination parameters
      if (payload.page) params.append('page', payload.page.toString());
      if (payload.size || payload.limit) {
        params.append('size', (payload.size || payload.limit).toString());
      }
      
      // Handle search/filter parameters
      if (payload.search) params.append('filter', `Name=${payload.search}`);
      if (payload.list_search_term) params.append('filter', `Name=${payload.list_search_term}`);
      if (payload.publisher_search) params.append('filter', `PublisherName=${payload.publisher_search}`);
      if (payload.campaign_search_term) params.append('filter', `CampaignName=${payload.campaign_search_term}`);
      
      // Handle ordering
      if (payload.order) params.append('order', payload.order);
      
      // Handle fields selection
      if (payload.fields) params.append('fields', payload.fields);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    console.log(`Making GET request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`GET request successful for ${endpoint.name}`);
    
    // Process nested response structures
    const processedData = processNestedResponse(data);
    
    // Add pagination metadata
    const paginationInfo = extractPaginationInfo(processedData);
    if (paginationInfo) {
      processedData.is_paginated = true;
      processedData.pagination_info = paginationInfo;
      
      // Check if we should fetch all pages
      if (payload._fullSearch || payload.all_pages) {
        console.log("Full search requested, attempting to fetch all pages...");
        return await fetchAllPages(endpoint, payload, apiKey, baseUrl, processedData);
      }
    }
    
    return createSuccessResult(endpoint, processedData);
    
  } catch (error) {
    console.error(`Error in GET request for ${endpoint.name}:`, error);
    return createErrorResult(endpoint, error);
  }
}

/**
 * Extract pagination information from response
 */
function extractPaginationInfo(data: any): PaginationInfo | null {
  if (!data) return null;
  
  const page = data.page || 1;
  const limit = data.size || data.limit || 50;
  const total = data.total || 0;
  const totalPages = data.total_pages || Math.ceil(total / limit) || 1;
  
  return {
    page,
    limit,
    totalItems: total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}

/**
 * Fetch all pages for complete data retrieval
 */
async function fetchAllPages(endpoint: any, payload: any, apiKey: string, baseUrl: string, firstPageData: any): Promise<QueryResult> {
  const allData = { ...firstPageData };
  const collectionKey = getCollectionKey(allData);
  
  if (!collectionKey || !allData[collectionKey]) {
    console.log("No collection found, returning first page data");
    return createSuccessResult(endpoint, allData);
  }
  
  let allItems = [...allData[collectionKey]];
  const totalPages = allData.total_pages || 1;
  
  console.log(`Fetching remaining ${totalPages - 1} pages...`);
  
  // Fetch remaining pages
  for (let page = 2; page <= totalPages; page++) {
    try {
      const pagePayload = { ...payload, page };
      const pageResult = await handleGetRequest(endpoint, pagePayload, apiKey, baseUrl);
      
      if (pageResult.data && pageResult.data[collectionKey]) {
        allItems = allItems.concat(pageResult.data[collectionKey]);
        console.log(`Fetched page ${page}, total items: ${allItems.length}`);
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      // Continue with what we have
      break;
    }
  }
  
  // Update the data with all items
  allData[collectionKey] = allItems;
  allData.page = 1;
  allData.total = allItems.length;
  allData.total_pages = 1;
  allData._all_pages_fetched = true;
  
  console.log(`Successfully fetched all pages. Total items: ${allItems.length}`);
  return createSuccessResult(endpoint, allData);
}

/**
 * Determine the collection key from the response data
 */
function getCollectionKey(data: any): string | null {
  const possibleKeys = ['ListsCollection', 'PublisherCollection', 'PublishersCollection', 'CampaignCollection'];
  
  for (const key of possibleKeys) {
    if (data[key] && Array.isArray(data[key])) {
      return key;
    }
  }
  
  return null;
}
